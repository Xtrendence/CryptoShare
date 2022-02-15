import cors from "cors";
import path from "path";
import * as core from "express-serve-static-core";
import * as http from "http";
import { graphqlHTTP } from "express-graphql";
import { buildSchema } from "graphql";
import { Server } from "socket.io";
import { io as client } from "socket.io-client";
import Message from "../models/Message";
import addEvents from "../bot/events";
import resolvers from "../graphql/resolvers/resolvers";
import DB from "./DB";
import Utils from "./Utils";
import express from "express";
import addStockAPIRoutes from "./StockAPI";

export default class API {
	portAPI: number | undefined;
	portBot: number | undefined;
	appServer: http.Server | null;
	httpServer: http.Server | null;
	ioServer: Server | null;

	constructor() {
		this.appServer = null;
		this.httpServer = null;
		this.ioServer = null;
	}

	async start() {
		return new Promise(async (resolve, reject) => {
			try {
				let listening = { api:false, bot:false };

				const app = express();

				this.portAPI = 3190;
				this.portBot = 3191;

				const webFolder = path.join(__dirname, "../../../web");
				const indexFile = path.join(webFolder, "index.html");

				Utils.checkFiles();

				const schema = buildSchema(Utils.getSchema());

				const db = new DB();
				await db.initialize();
				Utils.db = db;

				this.httpServer = http.createServer();

				this.ioServer = new Server(this.httpServer, {
					cors: {
						origin: "*",
						methods: ["GET", "POST", "PUT", "DELETE"]
					},
					maxHttpBufferSize: 8192 * 1024
				});

				await addEvents(this.ioServer);

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

				this.appServer = app.listen(this.portAPI, () => {
					listening.api = true;

					console.log(Utils.console.reset, Utils.console.orange, `GraphQL API:`, Utils.console.blue, Utils.console.underline, `http://localhost:${this.portAPI}/graphql`);
				});

				app.get("/", (request, response) => {
					try {
						response.sendFile(indexFile);
					} catch(error) {
						console.log(error);
					}
				});

				app.get("/status", (request, response) => {
					response.json({ status:"online" });
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

				app.post("/adminAction", async (request, response) => {
					let userID = request.body.userID;
					let username = request.body.username;
					let token = request.body.token;
					let action = request.body.action;

					try {
						response.send(await Utils.processAdminAction(userID, username, token, action));
					} catch(error) {
						response.send({ error:error });
					}
				});

				addStockAPIRoutes(app);

				this.httpServer.listen(this.portBot, () => {
					listening.bot = true;

					console.log(Utils.console.reset, Utils.console.orange, `Bot Server:`, Utils.console.blue, Utils.console.underline, `http://localhost:${this.portBot}`);
				});

				let check = setInterval(() => {
					if(listening.api && listening.bot) {
						clearInterval(check);
						resolve(null);
					}
				}, 100);

				console.log(Utils.console.reset, `Started Server (${new Date().toTimeString().split(" ")[0]})`);

				console.log(Utils.console.reset, Utils.console.orange, `Web Interface:`, Utils.console.blue, Utils.console.underline, `http://localhost:${this.portAPI}`, Utils.console.reset);
			} catch(error) {
				console.log(Utils.console.reset, Utils.console.red, error);
				reject(error);
			}
		});
	}

	async kill() {
		return new Promise(async (resolve, reject) => {
			try {
				this.appServer?.close();
				this.httpServer?.close();
				this.ioServer?.close();

				await Utils.wait(1000);

				resolve(null);
			} catch(error) {
				console.log(Utils.console.reset, Utils.console.red, error);
				reject(error);
			}
		});
	}
}