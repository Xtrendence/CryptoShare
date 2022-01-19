
import API from "../src/utils/API";
import utils from "./utils";

let api: API;

describe("API Testing", () => {
	beforeAll(async () => {
		api = new API();
		await api.start();
	});

	afterAll(async () => {
		await api?.kill();
	});

	describe("Server Tests", () => {
		test("Ensure the server is running.", async () => {
			let response = await utils.request("GET", `http://localhost:${api.portAPI}/status`, null);
			expect(response).toEqual({ status:"online" });
		});
	});
});