import bcrypt from "bcryptjs";
import crypto from "crypto";
import { existsSync, mkdirSync, writeFileSync, readFileSync } from "fs";
// @ts-ignore
import CryptoFN from "./CryptoFN";
import path from "path";
import DB from "./DB";

export default class Utils {
	// Default: 3190.
	static portAPI: number = 3190;
	
	// Default: 86400 (24 hours).
	static marketRefetchTime: number = 86400;

	static db: DB | undefined;
	static dataFolder: string = "./data/";
	static dbFile: string = path.join(this.dataFolder, "data.db");
	static adminFile: string = path.join(this.dataFolder, "adminSettings.txt");
	static publicKeyFile: string = path.join(this.dataFolder, "public.key");
	static privateKeyFile: string = path.join(this.dataFolder, "private.key");

	static defaultAdminSettings: any = {
		stockAPIType: "internal",
		userRegistration: "enabled"
	};

	// Returns host's local IP address.
	static getIP() {
		try {
			const { networkInterfaces } = require("os");

			let interfaces: any = networkInterfaces();
			let ips: any = {};

			for(let networkInterface of Object.keys(interfaces)) {
				for(let net of interfaces[networkInterface]) {
					if(net.family === "IPv4" && !net.internal && !networkInterface.toLowerCase().match("(vethernet|vmware|vm|area)")) {
						if(!ips[networkInterface]) {
							ips[networkInterface] = [];
						}
						ips[networkInterface].push(net.address);
					}
				}
			}

			let ip = ips[Object.keys(ips)[0]][0];

			if(Utils.empty(ip)) {
				ip = "localhost";
			}

			return ip;
		} catch(error) {
			return "localhost";
		}
	}

	// Verifies a login token.
	static async verifyToken(userID: number, token: string) {
		return new Promise((resolve, reject) => {
			if(!this.verifyTokenTime(token)) {
				this.db?.runQuery("DELETE FROM Login WHERE userID = ? AND loginToken = ?", [userID, token]);
				reject("Expired token.");
				return;
			}

			this.db?.db?.get("SELECT * FROM Login WHERE userID = ? AND loginToken = ?", [userID, token], (error, row) => {
				if(error) {
					console.log(error);
					reject();
				} else {
					if(row === undefined) {
						reject("Invalid token.");
						return;
					}

					this.db?.db?.get("SELECT * FROM User WHERE userID = ?", [userID], async (error, user) => {
						if(error) {
							console.log(error);
							reject();
						} else {
							if(user === undefined) {
								reject("User not found.");
								return;
							}

							try {
								await this.db?.asyncDBGet("SELECT * FROM Budget WHERE userID = ?", [row.userID]);
							} catch(error: any) {
								if(error.toString().includes("not found")) {
									this.db?.runQuery("INSERT INTO Budget (userID, budgetData) VALUES (?, ?)", [row.userID, ""]);
								} else {
									console.log(error);
								}
							}
							
							let settings;

							try {
								settings = await this.db?.asyncDBGet("SELECT * FROM Setting WHERE userID = ?", [row.userID]);
							} catch(error: any) {
								if(error.toString().includes("not found")) {
									this.db?.runQuery("INSERT INTO Setting (userID, userSettings) VALUES (?, ?)", [row.userID, ""]);
									settings = "";
								} else {
									console.log(error);
								}
							}

							resolve(JSON.stringify({
								userID: user.userID,
								username: user.username,
								key: user.key,
								token: token,
								settings: settings
							}));
						}
					});
				}
			});
		});
	}

	// Changes a user's password.
	static async changePassword(userID: number, token: string, key: string, currentPassword: string, newPassword: string) {
		return new Promise(async (resolve, reject) => {
			try {
				if(await this.verifyToken(userID, token)) {
					this.db?.db?.get("SELECT * FROM User WHERE userID = ?", [userID], async (error, row) => {
						if(error) {
							console.log(error);
							reject();
						} else {
							if(row === undefined) {
								reject("User not found.");
								return;
							}

							let valid = await bcrypt.compare(currentPassword, row.password);

							if(valid) {
								let hashedPassword = bcrypt.hashSync(newPassword, 10);
								
								this.db?.runQuery("UPDATE User SET password = ?, key = ? WHERE userID = ?", [hashedPassword, key, userID]);

								resolve(JSON.stringify({
									userID: row.userID,
									username: row.username,
									key: key,
									token: token
								}));
							} else {
								reject("Incorrect password.");
							}
						}
					});
				} else {
					reject("Invalid token.");
				}
			} catch(error) {
				reject(error);
			}
		});
	}

	// Verifies that a token isn't expired.
	static verifyTokenTime(token: string) {
		let now = Math.floor(new Date().getTime() / 1000);
		let time = parseInt(token.split("-")[0]);

		// Tokens last 30 days.
		if(now - time > 2629746) {
			return false;
		}
		return true;
	}

	// Verifies if the user owns the data they're trying to modify.
	static verifyDataOwnership(userID: number, table: string, column: string, rowID: number) {
		return new Promise((resolve, reject) => {
			this.db?.db?.get(`SELECT * FROM ${table} WHERE ${column} = ?`, [rowID], (error, row) => {
				if(error) {
					console.log(error);
					reject(false);
				} else {
					if(row === undefined) {
						reject(false);
						return;
					}

					if(row.userID === userID) {
						resolve(true);
					} else {
						reject(false);
					}
				}
			});
		});
	}

	// Logs the user in.
	static async login(username: string, password: string) {
		return new Promise(async (resolve, reject) => {
			this.db?.db?.get("SELECT * FROM User WHERE username = ? COLLATE NOCASE", [username], async (error, row) => {
				if(error) {
					console.log(error);
					reject();
				} else {
					if(row === undefined) {
						reject("!User not found.!");
						return;
					}

					let valid = await bcrypt.compare(password, row.password);

					if(valid) {
						let token = await this.generateToken();
						this.db?.runQuery("INSERT INTO Login (userID, loginToken, loginDate) VALUES (?, ?, TIME())", [row.userID, token]);

						try {
							await this.db?.asyncDBGet("SELECT * FROM Budget WHERE userID = ?", [row.userID]);
						} catch(error: any) {
							if(error.toString().includes("not found")) {
								this.db?.runQuery("INSERT INTO Budget (userID, budgetData) VALUES (?, ?)", [row.userID, ""]);
							} else {
								console.log(error);
							}
						}

						let settings;

						try {
							settings = await this.db?.asyncDBGet("SELECT * FROM Setting WHERE userID = ?", [row.userID]);
						} catch(error: any) {
							if(error.toString().includes("not found")) {
								this.db?.runQuery("INSERT INTO Setting (userID, userSettings) VALUES (?, ?)", [row.userID, ""]);
								settings = "";
							} else {
								console.log(error);
							}
						}

						resolve(JSON.stringify({
							userID: row.userID,
							username: row.username,
							key: row.key,
							token: token,
							settings: settings
						}));
					} else {
						reject("!Incorrect password.!");
					}
				}
			});
		});
	}

	// Logs the user out.
	static async logout(userID: number, token: string) {
		return new Promise(async (resolve, reject) => {
			try {
				if(!this.verifyTokenTime(token) || await this.verifyToken(userID, token)) {
					this.db?.runQuery("DELETE FROM Login WHERE userID = ? AND loginToken = ?", [userID, token]);
					resolve("Done");
					return;
				}
			} catch(error) {
				reject(error);
			}
		});
	}

	// Logs the user out on all devices.
	static async logoutEverywhere(userID: number, token: string) {
		return new Promise(async (resolve, reject) => {
			try {
				if(!this.verifyTokenTime(token) || await this.verifyToken(userID, token)) {
					this.db?.runQuery("DELETE FROM Login WHERE userID = ?", [userID]);
					resolve("Done");
					return;
				}
			} catch(error) {
				reject(error);
			}
		});
	}

	// Performs an admin-only action.
	static async processAdminAction(userID: number, username: string, token: string, action: string) {
		return new Promise(async (resolve, reject) => {
			try {
				let valid: any = await this.verifyToken(userID, token);

				if(valid && JSON.parse(valid).username.toLowerCase() === "admin" && username.toLowerCase() === "admin") {
					let current: any;

					switch(action) {
						case "getSettings":
							current = await this.getAdminSettings();
							resolve(current);
							break;
						case "internalStockAPI":
							current = await this.getAdminSettings();
							current.stockAPIType = "internal";
							writeFileSync(this.adminFile, JSON.stringify(current));
							resolve(current);
							break;
						case "externalStockAPI":
							current = await this.getAdminSettings();
							current.stockAPIType = "external";
							writeFileSync(this.adminFile, JSON.stringify(current));
							resolve(current);
							break;
						case "enableRegistration":
							current = await this.getAdminSettings();
							current.userRegistration = "enabled";
							writeFileSync(this.adminFile, JSON.stringify(current));
							resolve(current);
							break;
						case "disableRegistration":
							current = await this.getAdminSettings();
							current.userRegistration = "disabled";
							writeFileSync(this.adminFile, JSON.stringify(current));
							resolve(current);
							break;
					}
				}
			} catch(error) {
				reject(error);
			}
		});
	}

	// Returns admin settings.
	static async getAdminSettings() {
		try {
			let current = readFileSync(this.adminFile, { encoding:"utf-8" });
			let parsed = JSON.parse(current);
			return parsed;
		} catch(error) {
			return this.defaultAdminSettings;
		}
	}

	// Generates a cryptographically random string.
	static async generateToken() {
		return new Promise((resolve, reject) => {
			crypto.randomBytes(32, (error, buffer) => {
				if(error) {
					reject(error);
				} else {
					resolve(Math.floor(new Date().getTime() / 1000) + "-" + buffer.toString("hex"));
				}
			});
		});
	}

	// Validates a username.
	static validUsername(username: string) {
		try {
			if(username.length > 16) {
				return false;
			}
			
			return (/^[A-Za-z0-9]+$/.test(username));
		} catch(error) {
			console.log(error);
			return false;
		}
	}

	// Determines if a UNIX timestamp is older than a predefined number of seconds.
	static refetchRequired(time: string) {
		let refetchTime = this.marketRefetchTime;
		return (Math.floor(new Date().getTime() / 1000)) - refetchTime > parseInt(time);
	}

	// Determines if a string is valid JSON.
	static validJSON(json: string) {
		try {
			let object = JSON.parse(json);
			if(object && typeof object === "object") {
				return true;
			}
		}
		catch(e) { }
		return false;
	}

	// Splits an array into smaller arrays.
	static chunkArray(array: any, size: number) {
		let chunks = [];
		for(let i = 0; i < array.length; i += size) {
			chunks.push(array.slice(i, i + size));
		}
		return chunks;
	}

	// Returns whether or not a string contains HTML tags.
	static xssValid(string: string) {
		try {
			if(string.includes("<") || string.includes(">")) {
				return false;
			}
			return true;
		} catch(error) {
			return false;
		}
	}

	// Ensures required API folders and files exist.
	static checkFiles() {
		if(!existsSync(this.dataFolder)) {
			mkdirSync(this.dataFolder);
		}

		if(!existsSync(this.dbFile)) {
			writeFileSync(this.dbFile, "");
		}

		if(!existsSync(this.adminFile)) {
			writeFileSync(this.adminFile, JSON.stringify(this.defaultAdminSettings));
		}

		if(!existsSync(this.publicKeyFile)) {
			writeFileSync(this.publicKeyFile, "");
		}

		if(!existsSync(this.privateKeyFile)) {
			writeFileSync(this.privateKeyFile, "");
		}
	}

	// Ensures the API has a public and private RSA key pair.
	static checkKeys() {
		return new Promise(async (resolve, reject) => {
			try {
				if(this.empty(readFileSync(this.publicKeyFile, { encoding:"utf-8" })) || this.empty(readFileSync(this.privateKeyFile, { encoding:"utf-8" }))) {
					let keys = await CryptoFN.generateRSAKeys();
					writeFileSync(this.publicKeyFile, keys.publicKey);
					writeFileSync(this.privateKeyFile, keys.privateKey);
					resolve(keys);
				} else {
					let publicKey = readFileSync(this.publicKeyFile, { encoding:"utf-8" });
					let privateKey = readFileSync(this.privateKeyFile, { encoding:"utf-8" });
					resolve({ publicKey:publicKey, privateKey:privateKey });
				}
			} catch(error) {
				console.log(error);
				reject(error);
			}
		});
	}

	// Returns the GraphQL API schema.
	static getSchema() {
		return readFileSync(path.join(__dirname, "../graphql/schema.graphql"), { encoding:"utf-8" });
	}

	// Simplifies making an HTTP request.
	static request(method: string, url: string, body: any, headers: any) {
		console.log(new Date().toLocaleTimeString(), "Request", url);

		return new Promise((resolve, reject) => {
			try {
				let XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
				let xhr = new XMLHttpRequest();

				xhr.addEventListener("readystatechange", () => {
					if(xhr.readyState === xhr.DONE) {
						if(Utils.validJSON(xhr.responseText)) {
							let response = JSON.parse(xhr.responseText);
							resolve(response);
						} else {
							if(Utils.empty(xhr.responseText)) {
								reject("Server error.");
							} else {
								reject("Invalid JSON.");
							}
						}
					}
				});

				xhr.addEventListener("error", (error: any) => {
					reject(error);
				});

				xhr.open(method, url, true);
				xhr.setRequestHeader("Content-Type", "application/json");

				if(!Utils.empty(headers)) {
					headers.map((header: any) => {
						let key = header[0];
						let value = header[1];
						xhr.setRequestHeader(key, value);
					});
				}

				xhr.send(JSON.stringify(body));
			} catch(error) {
				console.log(error);
				reject(error);
			}
		});
	}

	// Returns the date a year before a given date.
	static previousYear(date: Date) {
		let day = date.getDate();
		let month = date.getMonth() + 1;
		let year = date.getFullYear() - 1;
		return new Date(Date.parse(year + "-" + month + "-" + day));
	}

	// Capitalizes the first letter of a string.
	static capitalizeFirstLetter(string: string) {
		return string.charAt(0).toUpperCase() + string.slice(1);
	}

	// Determines if a variable is empty.
	static empty(value: any) {
		if(typeof value === "object" && value !== null && Object.keys(value).length === 0) {
			return true;
		}
		
		if(value === null || typeof value === "undefined" || value.toString().trim() === "") {
			return true;
		}

		return false;
	}

	// Waits for a set duration.
	static wait(duration: number) {
		return new Promise((resolve: any) => {
			setTimeout(() => {
				resolve();
			}, duration);
		});
	}

	// Console styling.
	static console = {
		underline: `\x1b[4m`,
		reset: `\x1b[0m`,
		orange: `\x1b[33m`,
		blue: `\x1b[34m`,
		magenta: `\x1b[35m`,
		red: `\x1b[36m`
	};
}