import { Server } from "socket.io";

export default function addEvents(io: Server) {
	io.on("message", () => {

	});

	return io;
}