import { createUser, readUser, updateUser, deleteUser } from "./user";
import { createCoin, readCoinByID, readCoinBySymbol, updateCoin, deleteCoin } from "./coin";
import { createStock, readStockByID, readStockBySymbol, updateStock, deleteStock } from "./stock";

let resolvers = {
	createUser, readUser, updateUser, deleteUser,
	createCoin, readCoinByID, readCoinBySymbol, updateCoin, deleteCoin,
	createStock, readStockByID, readStockBySymbol, updateStock, deleteStock
};

export default resolvers;