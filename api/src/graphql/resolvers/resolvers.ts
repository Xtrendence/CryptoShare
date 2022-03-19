import { userExists, createUser, readUser, updateUser, deleteUser } from "./user";
import { createActivity, readActivity, updateActivity, deleteActivity, deleteActivityAll } from "./activity";
import { createSetting, readSetting, updateSetting, deleteSetting } from "./setting";
import { createHolding, readHolding, updateHolding, deleteHolding, deleteHoldingAll } from "./holding";
import { createWatchlist, readWatchlist, updateWatchlist, deleteWatchlist, deleteWatchlistAll } from "./watchlist";
import { createMessage, readMessage, updateMessage, deleteMessage, deleteMessageAll } from "./message";
import { createTransaction, readTransaction, updateTransaction, deleteTransaction, deleteTransactionAll } from "./transaction";
import { createBudget, readBudget, updateBudget, deleteBudget } from "./budget";
import { readCoin } from "./coin";
import { readStockHistorical, readStockPrice } from "./stock";

// GraphQL resolvers.
let resolvers = {
	userExists, createUser, readUser, updateUser, deleteUser,
	createActivity, readActivity, updateActivity, deleteActivity, deleteActivityAll,
	createSetting, readSetting, updateSetting, deleteSetting,
	createHolding, readHolding, updateHolding, deleteHolding, deleteHoldingAll,
	createWatchlist, readWatchlist, updateWatchlist, deleteWatchlist, deleteWatchlistAll,
	createMessage, readMessage, updateMessage, deleteMessage, deleteMessageAll,
	createTransaction, readTransaction, updateTransaction, deleteTransaction, deleteTransactionAll,
	createBudget, readBudget, updateBudget, deleteBudget,
	readCoin,
	readStockHistorical, readStockPrice
};

export default resolvers;