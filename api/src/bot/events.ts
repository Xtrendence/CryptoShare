import { Server } from "socket.io";
import { NlpManager } from "node-nlp";
import Message from "../models/Message";
// @ts-ignore
import CryptoFN from "../utils/CryptoFN";
import Utils from "../utils/Utils";

// A function used to add the relevant event listeners to the Socket.IO server and any connected sockets.
export default async function addSocketEvents(io: Server) {
	const manager = new NlpManager({ languages:["en"], forceNER:true });

	io.on("connection", (socket) => {
		// The Socket.IO server is responsible for the NLP functionality of the chat bot. The "message" event expects the userID and token, along with the user's message. It then processes the message if the user's credentials are valid, and triggers the client-side "process" event.
		socket.on("message", async (data) => {
			try {
				let valid = await Utils.verifyToken(data.userID, data.token);

				if(valid) {
					let keys: any = await Utils.checkKeys();
					let message = await CryptoFN.decryptRSA(data.message, keys.privateKey);
					let processed = await manager.process(message);
					socket.emit("process", { processed:processed, message:message });
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