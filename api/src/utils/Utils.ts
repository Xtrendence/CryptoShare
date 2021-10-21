import fs, { existsSync, mkdirSync, writeFileSync, readFileSync } from "fs";
import path from "path";
import bcrypt from "bcrypt";
import sqlite3, { Database } from "@louislam/sqlite3";

export default class Utils {
	db: sqlite3.Database | undefined;
	dataFolder: string;

	constructor() {
		this.dataFolder = "./data/";
	}

	verifyToken(token: string) {
		if(token === "testing") {
			return true;
		}
		return false;
	}

	async login(username: string, password: string) {
		return new Promise(async (resolve, reject) => {
			this.db?.get("SELECT * FROM User WHERE username = ?", [username], async (error, row) => {
				if(error) {
					console.log(error);
				} else {
					if(row === undefined) {
						reject("!User Not Found!");
						return;
					}

					let valid = await bcrypt.compare(password, row.password);

					if(valid) {

					} else {
						reject("!Incorrect Password!");
					}
				}
			});
		});
	}

	generateToken() {
		
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