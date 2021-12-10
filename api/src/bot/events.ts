import { Server } from "socket.io";
import Message from "../models/Message";
import Bot from "./Bot";

export default async function addEvents(io: Server) {
	const bot = new Bot();
	bot.initialize();

	io.on("connection", (socket) => {
		socket.on("message", (message) => {
			bot.generateResponse(message.userMessage);
		});
	});

	return io;
}