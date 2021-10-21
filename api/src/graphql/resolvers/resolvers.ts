import Utils from "../../utils/Utils";
import { createUser, readUser, updateUser } from "./user";

let resolvers = {
	createUser,
	readUser,
	updateUser
};

export default resolvers;