import { userExists, createUser, readUser, updateUser, deleteUser } from "./user";
import { createActivity, readActivity, updateActivity, deleteActivity, importActivity } from "./activity";
import { createSetting, readSetting, updateSetting, deleteSetting } from "./setting";
import { createHolding, readHolding, updateHolding, deleteHolding, importHolding } from "./holding";
import { createWatchlist, readWatchlist, updateWatchlist, deleteWatchlist } from "./watchlist";
import { readCoin } from "./coin";
import { readStock } from "./stock";

let resolvers = {
	userExists, createUser, readUser, updateUser, deleteUser,
	createActivity, readActivity, updateActivity, deleteActivity, importActivity,
	createSetting, readSetting, updateSetting, deleteSetting,
	createHolding, readHolding, updateHolding, deleteHolding, importHolding,
	createWatchlist, readWatchlist, updateWatchlist, deleteWatchlist,
	readCoin,
	readStock
};

export default resolvers;