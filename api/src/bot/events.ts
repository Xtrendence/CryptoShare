import { Server } from "socket.io";
import Client from "socket.io-client";
import Message from "../models/Message";

export default function addEvents(io: Server) {
	io.on("message", (message: Message) => {

	});

	return io;
}