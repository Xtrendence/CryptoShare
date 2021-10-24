import Utils from "../../utils/Utils";
import DB from "../../utils/DB";
import Coin from "../../models/Coin";

const db = new DB();

export async function createCoin({ token, userID, assetID, assetSymbol }: any) {
	let valid = await Utils.verifyToken(userID, token);

	if(valid) {
		db.runQuery("INSERT INTO Coin (assetID, assetSymbol) VALUES (?, ?)", [assetID, assetSymbol]);
		return "Done";
	} else {
		return "Unauthorized";
	}
}

export async function readCoinByID({ token, userID, assetID }: any) {
	return new Promise(async (resolve, reject) => {
		let valid = await Utils.verifyToken(userID, token);

		if(valid) {
			db.db?.get("SELECT * FROM Coin WHERE assetID = ?", [assetID], (error, row) => {
				if(error) {
					console.log(error);
					reject();
				} else {
					if(row === undefined) {
						reject("!Coin Not Found!");
						return;
					}

					let coin = new Coin(assetID, row.assetSymbol);
					coin.coinID = row.coinID;
					resolve(coin);
				}
			});
		} else {
			reject("!Unauthorized!");
		}
	});
}

export async function readCoinBySymbol({ token, userID, assetSymbol }: any) {
	return new Promise(async (resolve, reject) => {
		let valid = await Utils.verifyToken(userID, token);

		if(valid) {
			db.db?.get("SELECT * FROM Coin WHERE assetSymbol = ?", [assetSymbol], (error, row) => {
				if(error) {
					console.log(error);
					reject();
				} else {
					if(row === undefined) {
						reject("!Coin Not Found!");
						return;
					}

					let coin = new Coin(row.assetID, assetSymbol);
					coin.coinID = row.coinID;
					resolve(coin);
				}
			});
		} else {
			reject("!Unauthorized!");
		}
	});
}

export async function updateCoin({ token, userID, coinID, assetID, assetSymbol }: any) {
	let valid = await Utils.verifyToken(userID, token);

	if(valid) {
		db.runQuery("UPDATE Coin SET assetID = ?, assetSymbol = ? WHERE coinID = ?", [assetID, assetSymbol, coinID]);
		return "Done";
	} else {
		return "Unauthorized";
	}
}

export async function deleteCoin({ token, userID, coinID }: any) {
	let valid = await Utils.verifyToken(userID, token);

	if(valid) {
		db.runQuery("DELETE FROM Coin WHERE coinID = ?", [coinID]);
		return "Done";
	} else {
		return "Unauthorized";
	}
}