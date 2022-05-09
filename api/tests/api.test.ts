
import API from "../src/utils/API";
import { io, Socket } from "socket.io-client";
import sqlite3, { Database } from "sqlite3";
import utils from "./utils";
import fs from "fs";
import path from "path";
import { requests, cryptoAPI } from "./requests";

let api: API;
let socket: Socket;

let dbFile = path.join(__dirname, "../data/data.db");

let user: any = {};
let store: any = {};

describe("API Testing", () => {
	beforeAll(async () => {
		api = new API();
		await api.start();
	});

	afterAll(async () => {
		user = {};
		store = {};

		await api?.kill();
		socket.close();
	});

	describe("Server Tests", () => {
		test("Ensure the API server is running.", async () => {
			let response = await utils.request("GET", `http://localhost:${api.portAPI}/status`, null);
			expect(response).toEqual({ status:"online" });
		});

		test("Ensure the bot server is running.", (done) => {
			socket = io(`http://localhost:${api.portAPI}`);

			socket.io.on("open", () => {
				done();
			});
		});
	});

	describe("Database Tests", () => {
		test("Ensure the DB exists.", () => {
			let exists = fs.existsSync(dbFile);
			expect(exists).toEqual(true);
		});

		test("Ensure all tables exist.", () => {
			let db = new Database(dbFile, sqlite3.OPEN_READWRITE);

			db.serialize(() => {
				db.all("SELECT name FROM sqlite_master WHERE type='table'", function (error: any, tables: any) {
					let json = JSON.stringify(tables);

					expect(json).toContain("Activity");
					expect(json).toContain("Coin");
					expect(json).toContain("Holding");
					expect(json).toContain("Login");
					expect(json).toContain("Message");
					expect(json).toContain("Setting");
					expect(json).toContain("Stock");
					expect(json).toContain("User");
					expect(json).toContain("Watchlist");
					expect(json).toContain("Transaction");
					expect(json).toContain("Budget");
				});
			});

			db.close();
		});
	});

	describe("GraphQL API Tests", () => {
		describe("User", () => {
			test("Create user.", async () => {
				let create: any = await requests.createAccount("Testing", "test", "testkey");
				expect(create.data.createUser).toEqual("Done");
			});

			test("User exists.", async () => {
				let exists: any = await requests.userExists("Testing");
				expect(exists.data.userExists).toEqual("Testing");
			});

			test("Login.", async () => {
				let login: any = await requests.login("Testing", "test");
				user = login;
				expect(user.userID).toEqual(1);
			});

			test("Recreate user.", async () => {
				let deleteUser: any = await requests.deleteUser(user.token, user.userID);
				let userExists: any = await requests.userExists("Testing");
				let createUser: any = await requests.createAccount("AnotherTest", "test", "testKey");
				let login: any = await requests.login("AnotherTest", "test");
				user = login;
				expect(deleteUser.data.deleteUser).toEqual("Done");
				expect(userExists.data.userExists).not.toEqual("Testing");
				expect(createUser.data.createUser).toEqual("Done");
				expect(user.userID).toEqual(2);
			});
		});

		describe("Watchlist", () => {
			test("Create watchlist.", async () => {
				let create: any = await requests.createWatchlist(user.token, user.userID, "bitcoin", "BTC", "crypto");
				expect(create.data.createWatchlist).toEqual("Done");
			});

			test("Read watchlist.", async () => {
				let read: any = await requests.readWatchlist(user.token, user.userID);
				expect(read.data.readWatchlist[0].assetID).toEqual("bitcoin");
			});

			test("Delete watchlist.", async () => {
				let deleteWatchlist: any = await requests.deleteWatchlist(user.token, user.userID, 1);
				let read: any = await requests.readWatchlist(user.token, user.userID);
				expect(deleteWatchlist.data.deleteWatchlist).toEqual("Done");
				expect(utils.empty(read.data.readWatchlist)).toEqual(true);
			});
		});

		describe("Messages", () => {
			test("Create message.", async () => {
				let create: any = await requests.createMessage(user.token, user.userID, "Test Message");
				expect(create.data.createMessage).toEqual("Done");
			});

			test("Read message.", async () => {
				let read: any = await requests.readMessage(user.token, user.userID);
				expect(read.data.readMessage[0].message).toEqual("Test Message");
			});
			
			test("Delete message.", async () => {
				let deleteMessage: any = await requests.deleteMessage(user.token, user.userID, 1);
				let read: any = await requests.readMessage(user.token, user.userID);
				expect(deleteMessage.data.deleteMessage).toEqual("Done");
				expect(utils.empty(read.data.readMessage)).toEqual(true);
			});
		});

		describe("Transactions", () => {
			test("Create transaction.", async () => {
				let create: any = await requests.createTransaction(user.token, user.userID, "spent", "2022-01-01", "transport", "20", "Bus Ticket");
				expect(create.data.createTransaction).toEqual("Done");
			});

			test("Read transaction.", async () => {
				let read: any = await requests.readTransaction(user.token, user.userID);
				store.transactionID = read.data.readTransaction[0].transactionID;
				expect(read.data.readTransaction[0].transactionNotes).toEqual("Bus Ticket");
			});

			test("Update transaction.", async () => {
				let update: any = await requests.updateTransaction(user.token, user.userID, store.transactionID, "earned", "2022-01-01", "food", "50", "Restaurant");
				let read: any = await requests.readTransaction(user.token, user.userID);
				expect(update.data.updateTransaction).toEqual("Done");
				expect(read.data.readTransaction[0].transactionNotes).toEqual("Restaurant");
			});
			
			test("Delete transaction.", async () => {
				let deleteTransaction: any = await requests.deleteTransaction(user.token, user.userID, store.transactionID);
				let read: any = await requests.readTransaction(user.token, user.userID);
				expect(deleteTransaction.data.deleteTransaction).toEqual("Done");
				expect(utils.empty(read.data.readTransaction)).toEqual(true);
			});
		});

		describe("Budget", () => {
			test("Update budget.", async () => {
				let update: any = await requests.updateBudget(user.token, user.userID, "testData");
				let read: any = await requests.readBudget(user.token, user.userID);
				expect(update.data.updateBudget).toEqual("Done");
				expect(read.data.readBudget.budgetData).toEqual("testData");
			});

			test("Read budget.", async () => {
				let read: any = await requests.readBudget(user.token, user.userID);
				expect(read.data.readBudget.budgetData).toEqual("testData");
			});
		});

		describe("Settings", () => {
			test("Update settings.", async () => {
				let update: any = await requests.updateSetting(user.token, user.userID, "testSettings");
				let read: any = await requests.readSetting(user.token, user.userID);
				expect(update.data.updateSetting).toEqual("Done");
				expect(read.data.readSetting.userSettings).toEqual("testSettings");
			});

			test("Read settings.", async () => {
				let read: any = await requests.readSetting(user.token, user.userID);
				expect(read.data.readSetting.userSettings).toEqual("testSettings");
			});
		});

		describe("Holdings", () => {
			test("Create holding.", async () => {
				let create: any = await requests.createHolding(user.token, user.userID, "bitcoin", "BTC", "5", "crypto");
				expect(create.data.createHolding).toEqual("Done");
			});

			test("Read holdings.", async () => {
				let read: any = await requests.readHolding(user.token, user.userID);
				store.holdingID = read.data.readHolding[0].holdingID;
				expect(read.data.readHolding[0].holdingAssetID).toEqual("bitcoin");
			});

			test("Update holding.", async () => {
				let update: any = await requests.updateHolding(user.token, user.userID, store.holdingID, "ethereum", "ETH", "2", "crypto");
				let read: any = await requests.readHolding(user.token, user.userID);
				expect(update.data.updateHolding).toEqual("Done");
				expect(read.data.readHolding[0].holdingAssetID).toEqual("ethereum");
			});
			
			test("Delete holding.", async () => {
				let deleteHolding: any = await requests.deleteHolding(user.token, user.userID, store.holdingID);
				let read: any = await requests.readHolding(user.token, user.userID);
				expect(deleteHolding.data.deleteHolding).toEqual("Done");
				expect(utils.empty(read.data.readHolding)).toEqual(true);
			});
		});

		describe("Activities", () => {
			test("Create activity.", async () => {
				let create: any = await requests.createActivity(user.token, user.userID, "bitcoin", "BTC", "crypto", "2022-01-01", "buy", "5", "0", "Test", "Example", "BTC/USD", "50000", "", "");
				expect(create.data.createActivity).toEqual("Done");
			});

			test("Read activities.", async () => {
				let read: any = await requests.readActivity(user.token, user.userID);
				store.activityID = read.data.readActivity[0].activityID;
				store.activityTransactionID = read.data.readActivity[0].activityTransactionID;
				expect(read.data.readActivity[0].activityNotes).toEqual("Test");
			});

			test("Update activity.", async () => {
				let update: any = await requests.updateActivity(user.token, user.userID, store.activityTransactionID, "loopring", "BTC", "crypto", "2022-01-01", "buy", "5", "0", "Test", "Example", "BTC/USD", "50000", "", "");
				let read: any = await requests.readActivity(user.token, user.userID);
				expect(update.data.updateActivity).toEqual("Done");
				expect(read.data.readActivity[0].activityAssetID).toEqual("loopring");
			});
			
			test("Delete activity.", async () => {
				let deleteActivity: any = await requests.deleteActivity(user.token, user.userID, store.activityID);
				let read: any = await requests.readActivity(user.token, user.userID);
				expect(deleteActivity.data.deleteActivity).toEqual("Done");
				expect(utils.empty(read.data.readActivity)).toEqual(true);
			});
		});

		describe("Stock", () => {
			test("Get stock price.", async () => {
				let read: any = await requests.readStockPrice(user.token, user.userID, "-", ["AAPL"]);
				let name = JSON.parse(read.data.readStockPrice[0].priceData).priceData.displayName;
				let price = JSON.parse(read.data.readStockPrice[0].priceData).priceData.price;
				expect(name).toEqual("Apple");
				expect(isNaN(price)).toEqual(false);
			});
		});

		describe("Crypto", () => {
			test("Get global.", async () => {
				let data: any = await cryptoAPI.getGlobal();
				expect(isNaN(data.data.total_market_cap.usd)).toEqual(false);
			});
		});
	});
	
	describe("RESTful API Tests", () => {
		test("Change password.", async () => {
			let change: any = await requests.changePassword(user.userID, user.token, user.key, "test", "newPass");
			user = change;
			expect(change.userID).toEqual(2);
		});

		test("Verify token.", async () => {
			let verify: any = await requests.verifyToken(user.userID, user.token);
			expect(verify.username).toEqual("AnotherTest");
		});

		test("Logout.", async () => {
			let logout: any = await requests.logout(user.userID, user.token);
			expect(logout.response).toEqual("Done");
		});
	});
});