import { Server } from "socket.io";
import { NlpManager } from "node-nlp";
import Message from "../models/Message";
import Utils from "../utils/Utils";

export default async function addEvents(io: Server) {
	const manager = new NlpManager({ languages:["en"], forceNER:true });

	io.on("connection", (socket) => {
		socket.on("message", async (data) => {
			try {
				let valid = await Utils.verifyToken(data.userID, data.token);

				if(valid) {
					let processed = await manager.process(data.message);
					socket.emit("process", { processed:processed, userMessage:data.message });
				} else {
					socket.emit("response", { message:"Invalid credentials." });
				}
			} catch(error) {
				socket.emit("response", { message:"Not sure what that means..." });
			}
		});
	});

	return io;
}