import cors from "cors";
import path from "path";
import * as core from "express-serve-static-core";
import * as http from "http";
import { graphqlHTTP } from "express-graphql";
import { buildSchema } from "graphql";
import { Server } from "socket.io";
// @ts-ignore
import CryptoFN from "../utils/CryptoFN";
import { io as client } from "socket.io-client";
import Message from "../models/Message";
import addSocketEvents from "../bot/events";
import resolvers from "../graphql/resolvers/resolvers";
import DB from "./DB";
import Utils from "./Utils";
import express, { response } from "express";
import addStockAPIRoutes from "./StockAPI";

// A class for starting and stopping the GraphQL API and Socket.IO server.
export default class API {
	portAPI: number | undefined;
	appServer: http.Server | null;
	ioServer: Server | null;

	constructor() {
		this.appServer = null;
		this.ioServer = null;
	}

	// Starts the API and Socket.IO server.
	async start() {
		return new Promise(async (resolve, reject) => {
			try {
				let listening = { api:false, bot:false };

				const app = express();

				this.portAPI = Utils.portAPI;

				const webFolder = path.join(__dirname, "../../../web");
				const indexFile = path.join(webFolder, "index.html");

				// Ensures the necessary files, such as the database file, admin settings, and the relevant directories exist.
				Utils.checkFiles();

				// Ensures the API has a public and private key pair for encrypted communication with clients.
				await Utils.checkKeys();

				// Builds the GraphQL API schema.
				const schema = buildSchema(Utils.getSchema());

				// Creates the SQLite database if it doesn't exist, otherwise, it simply opens it.
				const db = new DB();
				await db.initialize();
				Utils.db = db;

				console.log(Utils.console.magenta, `-----------------------------\n`, `Starting Server... (${new Date().toTimeString().split(" ")[0]})`, Utils.console.reset);

				app.use(cors());
				app.use(express.urlencoded({ extended:true }));
				app.use(express.json());
				app.use(express.static(webFolder));

				// Set GraphQL API options.
				app.use("/graphql", graphqlHTTP({ 
					schema: schema,
					rootValue: resolvers,
					graphiql: false,
					customFormatErrorFn: (error): any => {
						return error.message.split("!")[1];
					}
				}));

				// Start the GraphQL API and Socket.IO server.
				this.appServer = app.listen(this.portAPI, () => {
					listening.api = true;

					listening.bot = true;

					console.log(Utils.console.reset, Utils.console.orange, `GraphQL API:`, Utils.console.blue, Utils.console.underline, `http://${Utils.getIP()}:${this.portAPI}/graphql`);

					console.log(Utils.console.reset, Utils.console.orange, `Bot Server:`, Utils.console.blue, Utils.console.underline, `http://${Utils.getIP()}:${this.portAPI}`);
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

				app.get("/keyRSA", async (request, response) => {
					try {
						let keys: any = await Utils.checkKeys();
						response.json({ publicKey:keys.publicKey });
					} catch(error) {
						response.send({ error:error });
					}
				});

				app.post("/login", async (request, response) => {
					try {
						let keys: any = await Utils.checkKeys();

						let username = request.body.username;
						let encryptedPassword = request.body.password;
						let password = await CryptoFN.decryptRSA(encryptedPassword, keys.privateKey);

						response.send(await Utils.login(username, password));
					} catch(error) {
						response.send({ error:error });
					}
				});

				app.post("/logout", async (request, response) => {
					try {
						let userID = request.body.userID;
						let token = request.body.token;
						response.send({ response:await Utils.logout(userID, token) });
					} catch(error) {
						response.send({ error:error });
					}
				});

				app.post("/logoutEverywhere", async (request, response) => {
					try {
						let userID = request.body.userID;
						let token = request.body.token;
						response.send({ response:await Utils.logoutEverywhere(userID, token) });
					} catch(error) {
						response.send({ error:error });
					}
				});

				app.post("/changePassword", async (request, response) => {
					try {
						let keys: any = await Utils.checkKeys();

						let userID = request.body.userID;
						let token = request.body.token;
						let key = request.body.key;
						
						let encryptedCurrentPassword = request.body.currentPassword;
						let encryptedNewPassword = request.body.newPassword;

						let currentPassword = await CryptoFN.decryptRSA(encryptedCurrentPassword, keys.privateKey);
						let newPassword = await CryptoFN.decryptRSA(encryptedNewPassword, keys.privateKey);

						response.send(await Utils.changePassword(userID, token, key, currentPassword, newPassword));
					} catch(error) {
						response.send({ error:error });
					}
				});

				app.post("/verifyToken", async (request, response) => {
					try {
						let userID = request.body.userID;
						let token = request.body.token;
						response.send(await Utils.verifyToken(userID, token));
					} catch(error) {
						response.send({ error:error });
					}
				});

				app.post("/adminAction", async (request, response) => {
					try {
						let userID = request.body.userID;
						let username = request.body.username;
						let token = request.body.token;
						let action = request.body.action;
						response.send(await Utils.processAdminAction(userID, username, token, action));
					} catch(error) {
						response.send({ error:error });
					}
				});

				addStockAPIRoutes(app);

				this.ioServer = new Server(this.appServer, {
					cors: {
						origin: "*",
						methods: ["GET", "POST", "PUT", "DELETE"]
					},
					maxHttpBufferSize: 8192 * 1024
				});

				await addSocketEvents(this.ioServer);

				let check = setInterval(() => {
					if(listening.api && listening.bot) {
						clearInterval(check);
						resolve(null);
					}
				}, 100);

				console.log(Utils.console.reset, `Started Server (${new Date().toTimeString().split(" ")[0]})`);

				console.log(Utils.console.reset, Utils.console.orange, `Web Interface:`, Utils.console.blue, Utils.console.underline, `http://${Utils.getIP()}:${this.portAPI}`, Utils.console.reset);
			} catch(error) {
				console.log(Utils.console.reset, Utils.console.red, error);
				reject(error);
			}
		});
	}

	// Stops the API and Socket.IO server.
	async kill() {
		return new Promise(async (resolve, reject) => {
			try {
				this.appServer?.close();
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