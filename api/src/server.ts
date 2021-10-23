import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { graphqlHTTP } from "express-graphql";
import { buildSchema } from "graphql";
import DB from "./utils/DB";
import resolvers from "./graphql/resolvers/resolvers";
import Utils from "./utils/Utils";
import addEvents from "./bot/events";

const portAPI = 1999;
const portBot = 2000;

const utils = new Utils();
utils.checkFiles();

const schema = buildSchema(utils.getSchema());

const app = express();

const httpServer = createServer();

const io = new Server(httpServer);
addEvents(io);

const db = new DB();
db.initialize();

utils.db = db;

app.use(cors());
app.use(express.urlencoded({ extended:true }));
app.use(express.json());

app.use("/graphql", graphqlHTTP({ 
	schema: schema,
	rootValue: resolvers,
	graphiql: true,
	customFormatErrorFn: (error): any => {
		return error.message.split("!")[1];
	}
}));

app.listen(portAPI, () => {
	console.log(`GraphQL API Listening At http://localhost:${portAPI}/graphql`);
});

app.post("/login", async (request, response) => {
	let username = request.body.username;
	let password = request.body.password;
	response.send(await utils.login(username, password));
});

app.post("/verifyToken", async (request, response) => {
	let userID = request.body.userID;
	let token = request.body.token;
	response.send(await utils.verifyToken(userID, token));
});

httpServer.listen(portBot, () => {
	console.log(`Bot Server Listening At http://localhost:${portBot}`);
});

console.log("Starting Server... ", new Date().toTimeString().split(" ")[0]);