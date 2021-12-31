import cors from "cors";
import express from "express";
import path from "path";
import { graphqlHTTP } from "express-graphql";
import { buildSchema } from "graphql";
import { createServer } from "http";
import { Server } from "socket.io";
import { io as client } from "socket.io-client";
import Message from "./models/Message";
import addEvents from "./bot/events";
import resolvers from "./graphql/resolvers/resolvers";
import DB from "./utils/DB";
import Utils from "./utils/Utils";

const portAPI = 3190;
const portBot = 3191;

const webFolder = path.join(__dirname, "../../web");
const indexFile = path.join(webFolder, "index.html");

Utils.checkFiles();

const schema = buildSchema(Utils.getSchema());

const app = express();

const httpServer = createServer();

(async () => {
	const db = new DB();
	await db.initialize();
	Utils.db = db;

	const io = new Server(httpServer);
	await addEvents(io);

	console.log(Utils.console.magenta, `-----------------------------\n`, `Starting Server... (${new Date().toTimeString().split(" ")[0]})`, Utils.console.reset);

	app.use(cors());
	app.use(express.urlencoded({ extended:true }));
	app.use(express.json());
	app.use(express.static(webFolder));

	app.use("/graphql", graphqlHTTP({ 
		schema: schema,
		rootValue: resolvers,
		graphiql: true,
		customFormatErrorFn: (error): any => {
			return error.message.split("!")[1];
		}
	}));

	app.listen(portAPI, () => {
		console.log(Utils.console.reset, Utils.console.orange, `GraphQL API:`, Utils.console.blue, Utils.console.underline, `http://localhost:${portAPI}/graphql`);
	});

	app.get("/", (request, response) => {
		try {
			response.sendFile(indexFile);
		} catch(error) {
			console.log(error);
		}
	});

	app.post("/login", async (request, response) => {
		let username = request.body.username;
		let password = request.body.password;

		try {
			response.send(await Utils.login(username, password));
		} catch(error) {
			response.send({ error:error });
		}
	});

	app.post("/logout", async (request, response) => {
		let userID = request.body.userID;
		let token = request.body.token;

		try {
			response.send({ response:await Utils.logout(userID, token) });
		} catch(error) {
			response.send({ error:error });
		}
	});

	app.post("/logoutEverywhere", async (request, response) => {
		let userID = request.body.userID;
		let token = request.body.token;

		try {
			response.send({ response:await Utils.logoutEverywhere(userID, token) });
		} catch(error) {
			response.send({ error:error });
		}
	});

	app.post("/changePassword", async (request, response) => {
		let userID = request.body.userID;
		let token = request.body.token;
		let currentPassword = request.body.currentPassword;
		let newPassword = request.body.newPassword;

		try {
			response.send(await Utils.changePassword(userID, token, currentPassword, newPassword));
		} catch(error) {
			response.send({ error:error });
		}
	});

	app.post("/verifyToken", async (request, response) => {
		let userID = request.body.userID;
		let token = request.body.token;

		try {
			response.send(await Utils.verifyToken(userID, token));
		} catch(error) {
			response.send({ error:error });
		}
	});

	httpServer.listen(portBot, () => {
		console.log(Utils.console.reset, Utils.console.orange, `Bot Server:`, Utils.console.blue, Utils.console.underline, `http://localhost:${portBot}`);
	});

	console.log(Utils.console.reset, `Started Server (${new Date().toTimeString().split(" ")[0]})`);

	console.log(Utils.console.reset, Utils.console.orange, `Web Interface:`, Utils.console.blue, Utils.console.underline, `http://localhost:${portAPI}`, Utils.console.reset);
})();