import { createUser, readUser, updateUser, deleteUser } from "./user";
import { createCoin, readCoinByID, readCoinBySymbol, updateCoin, deleteCoin } from "./coin";

let resolvers = {
	createUser, readUser, updateUser, deleteUser,
	createCoin, readCoinByID, readCoinBySymbol, updateCoin, deleteCoin
};

export default resolvers;