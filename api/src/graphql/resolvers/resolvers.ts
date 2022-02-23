import { userExists, createUser, readUser, updateUser, deleteUser } from "./user";
import { createActivity, readActivity, updateActivity, deleteActivity } from "./activity";
import { createSetting, readSetting, updateSetting, deleteSetting } from "./setting";
import { createHolding, readHolding, updateHolding, deleteHolding } from "./holding";
import { createWatchlist, readWatchlist, updateWatchlist, deleteWatchlist } from "./watchlist";
import { createMessage, readMessage, updateMessage, deleteMessage, deleteMessageAll } from "./message";
import { createTransaction, readTransaction, updateTransaction, deleteTransaction } from "./transaction";
import { createBudget, readBudget, updateBudget, deleteBudget } from "./budget";
import { readCoin } from "./coin";
import { readStockHistorical, readStockPrice } from "./stock";

let resolvers = {
	userExists, createUser, readUser, updateUser, deleteUser,
	createActivity, readActivity, updateActivity, deleteActivity,
	createSetting, readSetting, updateSetting, deleteSetting,
	createHolding, readHolding, updateHolding, deleteHolding,
	createWatchlist, readWatchlist, updateWatchlist, deleteWatchlist,
	createMessage, readMessage, updateMessage, deleteMessage, deleteMessageAll,
	createTransaction, readTransaction, updateTransaction, deleteTransaction,
	createBudget, readBudget, updateBudget, deleteBudget,
	readCoin,
	readStockHistorical, readStockPrice
};

export default resolvers;