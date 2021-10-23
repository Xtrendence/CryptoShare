import { createUser, readUser, updateUser, deleteUser } from "./user";
import { createSetting, readSetting, updateSetting, deleteSetting } from "./setting";
import { createCoin, readCoinByID, readCoinBySymbol, updateCoin, deleteCoin } from "./coin";
import { createStock, readStockByID, readStockBySymbol, updateStock, deleteStock } from "./stock";

let resolvers = {
	createUser, readUser, updateUser, deleteUser,
	createSetting, readSetting, updateSetting, deleteSetting,
	createCoin, readCoinByID, readCoinBySymbol, updateCoin, deleteCoin,
	createStock, readStockByID, readStockBySymbol, updateStock, deleteStock
};

export default resolvers;