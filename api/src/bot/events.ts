import { Server } from "socket.io";
import { NlpManager } from "node-nlp";
import Message from "../models/Message";
import Utils from "../utils/Utils";

export default async function addEvents(io: Server) {
	const manager = new NlpManager({ languages:["en"], forceNER:true });

	io.on("connection", (socket) => {
		let users: any = {};

		socket.on("set-credentials", async (data) => {
			users[data.userID] = {
				userID: data.userID,
				token: data.token
			}
		});

		// TODO: Verify Credentials
		socket.on("message", async (message) => {
			try {
				let processed = await manager.process(message);
				socket.emit("process", processed);
			} catch(error) {
				socket.emit("response", { message:"Not sure what that means..." });
			}
		});
	});

	return io;
}