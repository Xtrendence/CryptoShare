import { Server } from "socket.io";
import Message from "../models/Message";
import Utils from "../utils/Utils";
import Bot from "./Bot";

export default async function addEvents(io: Server) {
	const bot = new Bot();

	io.on("connection", (socket) => {
		let user:any = {};

		socket.on("set-credentials", async (data) => {
			user.userID = data.userID;
			user.token = data.token;
		});

		// TODO: Verify Credentials
		socket.on("message", async (message) => {
			let response: any = await bot.generateResponse(message.userMessage);
			console.log(JSON.stringify(bot.queue[response.index], null, 4));
		});

		// TODO: Verify Credentials
		socket.on("provide-type", async (data) => {
			let response: any = await bot.processType(user.userID, user.token, data.index, data.type, data.rowID);
		});
	});

	return io;
}