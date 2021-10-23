import Utils from "../../utils/Utils";
import DB from "../../utils/DB";
import Watchlist from "../../models/Watchlist";

const utils = new Utils();
const db = new DB();

export async function createWatchlist({ token, userID, assetID, assetSymbol, assetType }: any) {
	let valid = await utils.verifyToken(userID, token);

	if(valid) {
		db.runQuery("INSERT INTO Watchlist (userID, assetID, assetSymbol, assetType) VALUES (?, ?, ?, ?)", [userID, assetID, assetSymbol, assetType]);
		return "Done";
	} else {
		return "Unauthorized";
	}
}

export async function readWatchlist({ token, userID }: any) {
	return new Promise(async (resolve, reject) => {
		let valid = await utils.verifyToken(userID, token);

		if(valid) {
			db.db?.get("SELECT * FROM Watchlist WHERE userID = ?", [userID], (error, row) => {
				if(error) {
					console.log(error);
					reject();
				} else {
					if(row === undefined) {
						reject("!Watchlist Not Found!");
						return;
					}

					let watchlist = new Watchlist(userID, row.assetID, row.assetSymbol, row.assetType);
					watchlist.watchlistID = row.watchlistID;
					resolve(watchlist);
				}
			});
		} else {
			reject("!Unauthorized!");
		}
	});
}

export async function updateWatchlist({ token, userID, watchlistID, assetID, assetSymbol, assetType }: any) {
	let valid = await utils.verifyToken(userID, token);

	if(valid) {
		db.runQuery("UPDATE Watchlist SET assetID = ?, assetSymbol = ?, assetType = ? WHERE watchlistID = ? AND userID = ?", [assetID, assetSymbol, assetType, watchlistID, userID]);
		return "Done";
	} else {
		return "Unauthorized";
	}
}

export async function deleteWatchlist({ token, userID, watchlistID }: any) {
	let valid = await utils.verifyToken(userID, token);

	if(valid) {
		db.runQuery("DELETE FROM Watchlist WHERE watchlistID = ? AND userID = ?", [watchlistID, userID]);
		return "Done";
	} else {
		return "Unauthorized";
	}
}