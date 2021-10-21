import express from "express";
import { graphqlHTTP } from "express-graphql";
import { makeExecutableSchema } from "graphql-tools";
import DB from "./db";
import typeDefs from "./typeDefs";
import resolvers from "./resolvers";
import Utils from "./utils";

const utils = new Utils();
utils.initialize();

const app: express.Application = express();
const port: number = 1999;

const db = new DB("./data.db").initialize();

app.use('/graphql', graphqlHTTP({ 
	schema: makeExecutableSchema({typeDefs, resolvers}), 
	graphiql: true 
}));

app.listen(port, () => {
	console.log(`GraphQL API Listening On Port ${port}`)
});

console.log("Starting Server... ", new Date().toTimeString().split(" ")[0]);