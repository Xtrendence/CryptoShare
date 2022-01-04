import bcrypt from "bcrypt";
import crypto from "crypto";
import { existsSync, mkdirSync, writeFileSync, readFileSync } from "fs";
import path from "path";
import DB from "./DB";

export default class Utils {
	static db: DB | undefined;
	static dataFolder: string = "./data/";
	static dbFile: string = path.join(this.dataFolder, "data.db");

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

	static async changePassword(userID: number, token: string, currentPassword: string, newPassword: string) {
		return new Promise(async (resolve, reject) => {
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
							
							this.db?.runQuery("UPDATE User SET password = ? WHERE userID = ?", [hashedPassword, userID]);

							resolve(JSON.stringify({
								userID: row.userID,
								username: row.username,
								key: row.key,
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
		});
	}

	static verifyTokenTime(token: string) {
		let now = Math.floor(new Date().getTime() / 1000);
		let time = parseInt(token.split("-")[0]);
		if(now - time > 2629746) {
			return false;
		}
		return true;
	}

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

	static async login(username: string, password: string) {
		return new Promise(async (resolve, reject) => {
			this.db?.db?.get("SELECT * FROM User WHERE username = ?", [username], async (error, row) => {
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

	static async logout(userID: number, token: string) {
		return new Promise(async (resolve, reject) => {
			if(!this.verifyTokenTime(token) || await this.verifyToken(userID, token)) {
				this.db?.runQuery("DELETE FROM Login WHERE userID = ? AND loginToken = ?", [userID, token]);
				resolve("Done");
				return;
			}
		});
	}

	static async logoutEverywhere(userID: number, token: string) {
		return new Promise(async (resolve, reject) => {
			if(!this.verifyTokenTime(token) || await this.verifyToken(userID, token)) {
				this.db?.runQuery("DELETE FROM Login WHERE userID = ?", [userID]);
				resolve("Done");
				return;
			}
		});
	}

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

	static checkFiles() {
		if(!existsSync(this.dataFolder)) {
			mkdirSync(this.dataFolder);
		}

		if(!existsSync(this.dbFile)) {
			writeFileSync(this.dbFile, "");
		}
	}

	static getSchema() {
		return readFileSync(path.join(__dirname, "../graphql/schema.graphql"), { encoding:"utf-8" });
	}

	static capitalizeFirstLetter(string: string) {
		return string.charAt(0).toUpperCase() + string.slice(1);
	}

	static empty(value: any) {
		if(typeof value === "object" && value !== null && Object.keys(value).length === 0) {
			return true;
		}
		
		if(value === null || typeof value === "undefined" || value.toString().trim() === "") {
			return true;
		}

		return false;
	}

	static wait(duration: number) {
		return new Promise((resolve: any) => {
			setTimeout(() => {
				resolve();
			}, duration);
		});
	}

	static console = {
		underline: `\x1b[4m`,
		reset: `\x1b[0m`,
		orange: `\x1b[33m`,
		blue: `\x1b[34m`,
		magenta: `\x1b[35m`
	};
}