import Stock from "../../models/Stock";
import DB from "../../utils/DB";
import Utils from "../../utils/Utils";

const db = new DB();

export async function createStock({ token, userID, assetID, assetSymbol }: any) {
	let valid = await Utils.verifyToken(userID, token);

	if(valid) {
		db.runQuery("INSERT INTO Stock (assetID, assetSymbol) VALUES (?, ?)", [assetID, assetSymbol]);
		return "Done";
	} else {
		return "Unauthorized";
	}
}

export async function readStockByID({ token, userID, assetID }: any) {
	return new Promise(async (resolve, reject) => {
		let valid = await Utils.verifyToken(userID, token);

		if(valid) {
			db.db?.get("SELECT * FROM Stock WHERE assetID = ?", [assetID], (error, row) => {
				if(error) {
					console.log(error);
					reject();
				} else {
					if(row === undefined) {
						reject("!Stock not found.!");
						return;
					}

					let stock = new Stock(assetID, row.assetSymbol);
					stock.stockID = row.stockID;
					resolve(stock);
				}
			});
		} else {
			reject("!Unauthorized!");
		}
	});
}

export async function readStockBySymbol({ token, userID, assetSymbol }: any) {
	return new Promise(async (resolve, reject) => {
		let valid = await Utils.verifyToken(userID, token);

		if(valid) {
			db.db?.get("SELECT * FROM Stock WHERE assetSymbol = ?", [assetSymbol], (error, row) => {
				if(error) {
					console.log(error);
					reject();
				} else {
					if(row === undefined) {
						reject("!Stock not found.!");
						return;
					}

					let stock = new Stock(row.assetID, assetSymbol);
					stock.stockID = row.stockID;
					resolve(stock);
				}
			});
		} else {
			reject("!Unauthorized!");
		}
	});
}

export async function updateStock({ token, userID, stockID, assetID, assetSymbol }: any) {
	let valid = await Utils.verifyToken(userID, token);

	if(valid) {
		db.runQuery("UPDATE Stock SET assetID = ?, assetSymbol = ? WHERE stockID = ?", [assetID, assetSymbol, stockID]);
		return "Done";
	} else {
		return "Unauthorized";
	}
}

export async function deleteStock({ token, userID, stockID }: any) {
	let valid = await Utils.verifyToken(userID, token);

	if(valid) {
		db.runQuery("DELETE FROM Stock WHERE stockID = ?", [stockID]);
		return "Done";
	} else {
		return "Unauthorized";
	}
}