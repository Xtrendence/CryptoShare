import { createUser, readUser, updateUser, deleteUser } from "./user";

let resolvers = {
	createUser,
	readUser,
	updateUser,
	deleteUser
};

export default resolvers;