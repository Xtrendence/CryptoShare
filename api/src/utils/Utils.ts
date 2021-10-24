import bcrypt from "bcrypt";
import crypto from "crypto";
import { existsSync, mkdirSync, readFileSync } from "fs";
import path from "path";
import DB from "./DB";

export default class Utils {
	static db: DB | undefined;
	static dataFolder: string = "./data/";

	static async verifyToken(userID: number, token: string) {
		return new Promise((resolve, reject) => {
			if(!this.verifyTokenTime(token)) {
				this.db?.runQuery("DELETE FROM Login WHERE userID = ? AND loginToken = ?", [userID, token]);
				reject();
				return;
			}

			this.db?.db?.get("SELECT * FROM Login WHERE userID = ? AND loginToken = ?", [userID, token], (error, row) => {
				if(error) {
					console.log(error);
					reject();
				} else {
					if(row === undefined) {
						reject("Invalid Token");
						return;
					}

					this.db?.db?.get("SELECT * FROM User WHERE userID = ?", [userID], async (error, row) => {
						if(error) {
							console.log(error);
							reject();
						} else {
							if(row === undefined) {
								reject("User Not Found");
								return;
							}

							resolve(JSON.stringify({
								userID: row.userID,
								username: row.username,
								key: row.key,
								token: token
							}));
						}
					});
				}
			});
		});
	}

	static verifyTokenTime(token: string) {
		let now = new Date().getTime() / 1000;
		let time = parseInt(token.split("-")[0]);
		if(now - time > 2629746) {
			return true;
		}
		return false;
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
						reject("!User Not Found!");
						return;
					}

					let valid = await bcrypt.compare(password, row.password);

					if(valid) {
						let token = await this.generateToken();
						this.db?.runQuery("INSERT INTO Login (userID, loginToken, loginDate) VALUES (?, ?, TIME())", [row.userID, token]);

						resolve(JSON.stringify({
							userID: row.userID,
							username: row.username,
							key: row.key,
							token: token
						}));
					} else {
						reject("!Incorrect Password!");
					}
				}
			});
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

	static checkFiles() {
		if(!existsSync(this.dataFolder)) {
			mkdirSync(this.dataFolder);
		}
	}

	static getSchema() {
		return readFileSync(path.join(__dirname, "../graphql/schema.graphql"), { encoding:"utf-8" });
	}
}