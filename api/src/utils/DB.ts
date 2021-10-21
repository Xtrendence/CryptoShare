import sqlite3, { Database } from "@louislam/sqlite3";
import path from "path";

export default class DB {
	db: sqlite3.Database | undefined;
	file: string;

	constructor() {
		this.file = path.join("./data/", "data.db");
		this.db = new Database(this.file, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (error) => {
			if(error) {
				console.log(error);
			}
		});
	}

	initialize() {
		this.createUserTable();
		this.createActivityTable();
		this.createHoldingTable();
		this.createCoinTable();
		this.createLoginTable();
		this.createSettingTable();
		this.createStockTable();
		this.createWatchlistTable();
		this.createUserLoginView();
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

	createUserTable() {
		this.db?.serialize(() => {
			let statement = (`
				CREATE TABLE IF NOT EXISTS User (
					userID INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
					username VARCHAR(32) UNIQUE NOT NULL,
					password BLOB NOT NULL,
					key BLOB NOT NULL
				);
			`);

			this.db?.run(statement);
		});
	}

	createActivityTable() {
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

			this.db?.run(statement);
		});
	}

	createHoldingTable() {
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

			this.db?.run(statement);
		});
	}

	createCoinTable() {
		this.db?.serialize(() => {
			let statement = (`
				CREATE TABLE IF NOT EXISTS Coin (
					coinID INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
					assetID VARCHAR(64) NOT NULL,
					assetSymbol VARCHAR(16) NOT NULL
				);
			`);

			this.db?.run(statement);
		});
	}

	createLoginTable() {
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

			this.db?.run(statement);
		});
	}

	createSettingTable() {
		this.db?.serialize(() => {
			let statement = (`
				CREATE TABLE IF NOT EXISTS Setting (
					settingID INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
					userID INTEGER NOT NULL UNIQUE,
					userSettings BLOB NOT NULL,
					FOREIGN KEY (userID) REFERENCES User(userID) ON UPDATE CASCADE ON DELETE CASCADE
				);
			`);

			this.db?.run(statement);
		});
	}

	createStockTable() {
		this.db?.serialize(() => {
			let statement = (`
				CREATE TABLE IF NOT EXISTS Stock (
					stockID INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
					assetID VARCHAR(64) NOT NULL,
					assetSymbol VARCHAR(16) NOT NULL
				);
			`);

			this.db?.run(statement);
		});
	}

	createWatchlistTable() {
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

			this.db?.run(statement);
		});
	}

	createUserLoginView() {
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

			this.db?.run(statement);
		});
	}
}