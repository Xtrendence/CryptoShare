import Watchlist from "../../models/Watchlist";
import DB from "../../utils/DB";
import Utils from "../../utils/Utils";

const db = new DB();

// Creates a watchlist row.
export async function createWatchlist({ token, userID, assetID, assetSymbol, assetType }: any) {
	try {
		let valid = await Utils.verifyToken(userID, token);

		if(valid) {
			db.runQuery("INSERT INTO Watchlist (userID, assetID, assetSymbol, assetType) VALUES (?, ?, ?, ?)", [userID, assetID, assetSymbol, assetType]);
			return "Done";
		} else {
			return "Unauthorized";
		}
	} catch(error) {
		console.log(error);
		return error;
	}
}

// Returns a user's watchlist data.
export async function readWatchlist({ token, userID }: any) {
	return new Promise(async (resolve, reject) => {
		try {
			let valid = await Utils.verifyToken(userID, token);

			if(valid) {
				db.db?.all("SELECT * FROM Watchlist WHERE userID = ?", [userID], (error, rows) => {
					if(error) {
						console.log(error);
						reject();
					} else {
						if(rows === undefined) {
							reject("!Watchlist not found.!");
							return;
						}

						let items: Array<Watchlist> = [];

						rows.map(row => {
							let watchlist = new Watchlist(userID, row.assetID, row.assetSymbol, row.assetType);
							watchlist.watchlistID = row.watchlistID;
							items.push(watchlist);
						});
						
						resolve(items);
					}
				});
			} else {
				reject("!Unauthorized!");
			}
		} catch(error) {
			console.log(error);
			reject(`!${error}!`);
		}
	});
}

// Updates a watchlist row.
export async function updateWatchlist({ token, userID, watchlistID, assetID, assetSymbol, assetType }: any) {
	try {
		let valid = await Utils.verifyToken(userID, token);

		if(valid) {
			db.runQuery("UPDATE Watchlist SET assetID = ?, assetSymbol = ?, assetType = ? WHERE watchlistID = ? AND userID = ?", [assetID, assetSymbol, assetType, watchlistID, userID]);
			return "Done";
		} else {
			return "Unauthorized";
		}
	} catch(error) {
		console.log(error);
	}
}

// Deletes a watchlist row.
export async function deleteWatchlist({ token, userID, watchlistID }: any) {
	try {
		let valid = await Utils.verifyToken(userID, token);

		if(valid) {
			db.runQuery("DELETE FROM Watchlist WHERE watchlistID = ? AND userID = ?", [watchlistID, userID]);
			return "Done";
		} else {
			return "Unauthorized";
		}
	} catch(error) {
		console.log(error);
		return error;
	}
}

// Deletes all watchlist rows belonging to a user.
export async function deleteWatchlistAll({ token, userID }: any) {
	try {
		let valid = await Utils.verifyToken(userID, token);

		if(valid) {
			db.runQuery("DELETE FROM Watchlist WHERE userID = ?", [userID]);
			return "Done";
		} else {
			return "Unauthorized";
		}
	} catch(error) {
		console.log(error);
		return error;
	}
}