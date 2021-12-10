import { createUser, readUser, updateUser, deleteUser } from "./user";
import { createActivity, readActivity, updateActivity, deleteActivity, importActivity } from "./activity";
import { createSetting, readSetting, updateSetting, deleteSetting } from "./setting";
import { createHolding, readHolding, updateHolding, deleteHolding, importHolding } from "./holding";
import { createWatchlist, readWatchlist, updateWatchlist, deleteWatchlist } from "./watchlist";
import { createCoin, readCoinByID, readCoinBySymbol, updateCoin, deleteCoin } from "./coin";
import { createStock, readStockByID, readStockBySymbol, updateStock, deleteStock } from "./stock";

let resolvers = {
	createUser, readUser, updateUser, deleteUser,
	createActivity, readActivity, updateActivity, deleteActivity, importActivity,
	createSetting, readSetting, updateSetting, deleteSetting,
	createHolding, readHolding, updateHolding, deleteHolding, importHolding,
	createWatchlist, readWatchlist, updateWatchlist, deleteWatchlist,
	createCoin, readCoinByID, readCoinBySymbol, updateCoin, deleteCoin,
	createStock, readStockByID, readStockBySymbol, updateStock, deleteStock
};

export default resolvers;