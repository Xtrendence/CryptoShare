import express from "express";
import { graphqlHTTP } from "express-graphql";
import { buildSchema } from "graphql";
import DB from "./utils/DB";
import resolvers from "./graphql/resolvers";
import Utils from "./utils/Utils";

const utils = new Utils();
utils.checkFiles();

const schema = buildSchema(utils.getSchema());

const app: express.Application = express();
const port: number = 1999;

const db = new DB("./data.db").initialize();

app.use("/graphql", graphqlHTTP({ 
	schema: schema,
	rootValue: resolvers,
	graphiql: true
}));

app.listen(port, () => {
	console.log(`GraphQL API Listening At http://localhost:${port}/graphql`)
});

console.log("Starting Server... ", new Date().toTimeString().split(" ")[0]);