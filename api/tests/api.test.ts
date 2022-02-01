
import API from "../src/utils/API";
import { io, Socket } from "socket.io-client";
import sqlite3, { Database } from "@louislam/sqlite3";
import utils from "./utils";
import fs from "fs";
import path from "path";

let api: API;
let socket: Socket;

let dbFile = path.join(__dirname, "../data/data.db");

describe("API Testing", () => {
	beforeAll(async () => {
		api = new API();
		await api.start();
	});

	afterAll(async () => {
		await api?.kill();
		socket.close();
	});

	describe("Server Tests", () => {
		test("Ensure the API server is running.", async () => {
			let response = await utils.request("GET", `http://localhost:${api.portAPI}/status`, null);
			expect(response).toEqual({ status:"online" });
		});

		test("Ensure the bot server is running.", (done) => {
			socket = io(`http://localhost:${api.portBot}`);

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
				});
			});

			db.close();
		});
	});

	describe("Encryption / Decryption Tests", () => {
		let CryptoFN = require("../src/utils/CryptoFN");

		test("Ensure data can be symmetrically encrypted and decrypted.", () => {
			let encrypted = CryptoFN.encryptAES("test", "Password");
			let decryptedWrongCiphertext = CryptoFN.decryptAES("test", "Password");
			let decryptedWrongPassword = CryptoFN.decryptAES(encrypted, "Wrong");
			let decrypted = CryptoFN.decryptAES(encrypted, "Password");

			expect(encrypted).not.toEqual("test");
			expect(decryptedWrongCiphertext).not.toEqual("test");
			expect(decryptedWrongPassword).not.toEqual("test");
			expect(decrypted).toEqual("test");
		});
	});
});