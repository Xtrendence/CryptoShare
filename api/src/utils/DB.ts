import sqlite3, { Database } from "@louislam/sqlite3";
import path from "path";
import fs from "fs";
import Utils from "./Utils";

export default class DB {
	db: sqlite3.Database | undefined;
	file: string;

	constructor() {
		this.file = Utils.dbFile;
		this.setDB();
	}

	async initialize() {
		await this.createUserTable();
		await this.createActivityTable();
		await this.createHoldingTable();
		await this.createCoinTable();
		await this.createLoginTable();
		await this.createSettingTable();
		await this.createStockTable();
		await this.createWatchlistTable();
		await this.createMessageTable();
		await this.createUserLoginView();
	}

	setDB() {
		let retry = 0;
		this.db = new Database(this.file, sqlite3.OPEN_READWRITE, (error) => {
			if(error && retry < 10) {
				this.setDB();
				retry++;
			}
		});
	}

	runQuery(query: string, args: any) {
		return this.db?.serialize(() => {
			return this.db?.run(query, args, (error) => {
				if(error) {
					console.log(error);
				}
			});
		});
	}

	asyncDBGet(sql: string, values: any[]) {
		return new Promise((resolve, reject) => {
			this.db?.get(sql, values, (error: any, row: any) => {
				if(error) {
					console.log(error);
					reject();
				} else {
					if(row === undefined) {
						reject("Row not found.");
						return;
					}

					resolve(row);
				}
			});
		});
	}

	async createUserTable() {
		return new Promise((resolve, reject) => {
			this.db?.serialize(() => {
				let statement = (`
					CREATE TABLE IF NOT EXISTS User (
						userID INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
						username VARCHAR(32) UNIQUE NOT NULL,
						password BLOB NOT NULL,
						key BLOB NOT NULL
					);
				`);

				this.db?.run(statement, (result) => {
					resolve(result);
				});
			});
		});
	}

	async createActivityTable() {
		return new Promise((resolve, reject) => {
			this.db?.serialize(() => {
				let statement = (`
					CREATE TABLE IF NOT EXISTS Activity (
						activityID INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
						userID INTEGER NOT NULL,
						activityTransactionID VARCHAR(32) UNIQUE NOT NULL,
						activityAssetID BLOB NOT NULL,
						activityAssetSymbol BLOB NOT NULL,
						activityAssetType BLOB NOT NULL,
						activityDate BLOB NOT NULL,
						activityType BLOB NOT NULL,
						activityAssetAmount BLOB NOT NULL,
						activityFee BLOB NOT NULL,
						activityNotes BLOB NOT NULL,
						activityExchange BLOB NOT NULL,
						activityPair BLOB NOT NULL,
						activityPrice BLOB NOT NULL,
						activityFrom BLOB NOT NULL,
						activityTo BLOB NOT NULL,
						FOREIGN KEY (userID) REFERENCES User(userID) ON UPDATE CASCADE ON DELETE CASCADE
					);
				`);

				this.db?.run(statement, (result) => {
					resolve(result);
				});
			});
		});
	}

	async createHoldingTable() {
		return new Promise((resolve, reject) => {
			this.db?.serialize(() => {
				let statement = (`
					CREATE TABLE IF NOT EXISTS Holding (
						holdingID INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
						userID INTEGER NOT NULL,
						holdingAssetID BLOB NOT NULL,
						holdingAssetSymbol BLOB NOT NULL,
						holdingAssetAmount BLOB NOT NULL,
						holdingAssetType BLOB NOT NULL,
						FOREIGN KEY (userID) REFERENCES User(userID) ON UPDATE CASCADE ON DELETE CASCADE
					);
				`);

				this.db?.run(statement, (result) => {
					resolve(result);
				});
			});
		});
	}

	async createCoinTable() {
		return new Promise((resolve, reject) => {
			this.db?.serialize(() => {
				let statement = (`
					CREATE TABLE IF NOT EXISTS Coin (
						coinID INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
						assetID VARCHAR(64) NOT NULL,
						assetSymbol VARCHAR(16) NOT NULL
					);
				`);

				this.db?.run(statement, (result) => {
					resolve(result);
				});
			});
		});
	}

	async createLoginTable() {
		return new Promise((resolve, reject) => {
			this.db?.serialize(() => {
				let statement = (`
					CREATE TABLE IF NOT EXISTS Login (
						loginID INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
						userID INTEGER NOT NULL,
						loginToken VARCHAR(64) NOT NULL UNIQUE,
						loginDate DATETIME NOT NULL,
						FOREIGN KEY (userID) REFERENCES User(userID) ON UPDATE CASCADE ON DELETE CASCADE
					);
				`);

				this.db?.run(statement, (result) => {
					resolve(result);
				});
			});
		});
	}

	async createSettingTable() {
		return new Promise((resolve, reject) => {
			this.db?.serialize(() => {
				let statement = (`
					CREATE TABLE IF NOT EXISTS Setting (
						settingID INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
						userID INTEGER NOT NULL UNIQUE,
						userSettings BLOB NOT NULL,
						FOREIGN KEY (userID) REFERENCES User(userID) ON UPDATE CASCADE ON DELETE CASCADE
					);
				`);

				this.db?.run(statement, (result) => {
					resolve(result);
				});
			});
		});
	}

	async createStockTable() {
		return new Promise((resolve, reject) => {
			this.db?.serialize(() => {
				let statement = (`
					CREATE TABLE IF NOT EXISTS Stock (
						stockID INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
						assetID VARCHAR(64) NOT NULL,
						assetSymbol VARCHAR(16) NOT NULL
					);
				`);

				this.db?.run(statement, (result) => {
					resolve(result);
				});
			});
		});
	}

	async createWatchlistTable() {
		return new Promise((resolve, reject) => {
			this.db?.serialize(() => {
				let statement = (`
					CREATE TABLE IF NOT EXISTS Watchlist (
						watchlistID INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
						userID INTEGER NOT NULL,
						assetID BLOB NOT NULL,
						assetSymbol BLOB NOT NULL,
						assetType BLOB NOT NULL,
						FOREIGN KEY (userID) REFERENCES User(userID) ON UPDATE CASCADE ON DELETE CASCADE
					);
				`);

				this.db?.run(statement, (result) => {
					resolve(result);
				});
			});
		});
	}

	async createMessageTable() {
		return new Promise((resolve, reject) => {
			this.db?.serialize(() => {
				let statement = (`
					CREATE TABLE IF NOT EXISTS Message (
						messageID INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
						userID INTEGER NOT NULL,
						userMessage BLOB NOT NULL,
						botMessage BLOB,
						messageDate DATETIME NOT NULL,
						FOREIGN KEY (userID) REFERENCES User(userID) ON UPDATE CASCADE ON DELETE CASCADE
					);
				`);

				this.db?.run(statement, (result) => {
					resolve(result);
				});
			});
		});
	}

	async createUserLoginView() {
		return new Promise((resolve, reject) => {
			this.db?.serialize(() => {
				let statement = (`
					CREATE VIEW IF NOT EXISTS UserLogin
					AS 
					SELECT 
						userID, 
						username, 
						loginID, 
						loginToken,
						loginDate
					FROM
						Login
					INNER JOIN
						User USING (userID);
				`);

				this.db?.run(statement, (result) => {
					resolve(result);
				});
			});
		});
	}
}