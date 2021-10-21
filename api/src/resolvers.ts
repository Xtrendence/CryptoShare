let resolvers = {
	Query: {
		test: () => "Testing"
	},
	Mutation: {
		test: (message: any, testData: any) => {
			let testMessage = testData.message;
			return testMessage;
		}
	}
};

export default resolvers;