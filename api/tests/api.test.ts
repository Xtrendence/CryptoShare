
import API from "../src/utils/API";
import { io, Socket } from "socket.io-client";
import utils from "./utils";

let api: API;
let socket: Socket;

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
});