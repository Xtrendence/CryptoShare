import express from "express";
import cors from "cors";
import { graphqlHTTP } from "express-graphql";
import { buildSchema } from "graphql";
import DB from "./utils/DB";
import resolvers from "./graphql/resolvers/resolvers";
import Utils from "./utils/Utils";

const utils = new Utils();
utils.checkFiles();

const schema = buildSchema(utils.getSchema());

const app: express.Application = express();
const port: number = 1999;

const db = new DB();
db.initialize();

utils.db = db.db;

app.use(cors());
app.use(express.urlencoded());
app.use(express.json());

app.use("/graphql", graphqlHTTP({ 
	schema: schema,
	rootValue: resolvers,
	graphiql: true,
	customFormatErrorFn: (error): any => {
		return error.message.split("!")[1];
	}
}));

app.listen(port, () => {
	console.log(`GraphQL API Listening At http://localhost:${port}/graphql`)
});

app.post("/login", async (request, response) => {
	let username = request.body.username;
	let password = request.body.password;
	response.send(await utils.login(username, password));
});

console.log("Starting Server... ", new Date().toTimeString().split(" ")[0]);