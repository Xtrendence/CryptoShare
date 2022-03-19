import API from "./utils/API";

// Entry point for the Node.js app.
// Instantiates the API class and starts the GraphQL API and Socket.IO server.
(async () => {
	let api = new API();
	await api.start();
})();