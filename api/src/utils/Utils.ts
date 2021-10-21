import fs, { existsSync, mkdirSync, writeFileSync, readFileSync } from "fs";
import path from "path";
import bcrypt from "bcrypt";
import crypto from "crypto";
import sqlite3, { Database } from "@louislam/sqlite3";
import DB from "./DB";

export default class Utils {
	db: DB | undefined;
	dataFolder: string;

	constructor() {
		this.dataFolder = "./data/";
	}

	async verifyToken(userID: number, token: string) {
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

	verifyTokenTime(token: string) {
		let now = new Date().getTime() / 1000;
		let time = parseInt(token.split("-")[0]);
		if(now - time > 2629746) {
			return true;
		}
		return false;
	}

	async login(username: string, password: string) {
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

	async generateToken() {
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

	checkFiles() {
		if(!existsSync(this.dataFolder)) {
			mkdirSync(this.dataFolder);
		}
	}

	getSchema() {
		return readFileSync(path.join(__dirname, "../graphql/schema.graphql"), { encoding:"utf-8" });
	}
}