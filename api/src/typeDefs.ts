let typeDefs: any = [`
	type Query {
		test: String
	}
	type Mutation {
		test(message: String) : String
	}
`];

export default typeDefs;