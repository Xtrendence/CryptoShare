import Utils from "./utils";

const utils = new Utils();

let resolvers = {
	getUsers: ({token}: any) => {
		let valid = utils.verifyToken(token);

		if(valid) {
			return [];
		}

		throw new Error("Unauthorized");
	}
};

export default resolvers;