import Holding from "../../models/Holding";
import DB from "../../utils/DB";
import Utils from "../../utils/Utils";

const db = new DB();

// Creates a holding.
export async function createHolding({ token, userID, holdingAssetID, holdingAssetSymbol, holdingAssetAmount, holdingAssetType }: any) {
	try {
		let valid = await Utils.verifyToken(userID, token);

		if(valid) {
			db.runQuery("INSERT INTO Holding (userID, holdingAssetID, holdingAssetSymbol, holdingAssetAmount, holdingAssetType) VALUES (?, ?, ?, ?, ?)", [userID, holdingAssetID, holdingAssetSymbol, holdingAssetAmount, holdingAssetType]);
			return "Done";
		} else {
			return "Unauthorized";
		}
	} catch(error) {
		console.log(error);
		return error;
	}
}

// Returns the holdings of a user.
export async function readHolding({ token, userID }: any) {
	return new Promise(async (resolve, reject) => {
		try {
			let valid = await Utils.verifyToken(userID, token);

			if(valid) {
				db.db?.all("SELECT * FROM Holding WHERE userID = ?", [userID], (error, rows) => {
					if(error) {
						console.log(error);
						reject();
					} else {
						if(rows === undefined) {
							reject("!Holdings not found.!");
							return;
						}

						let holdings: Array<Holding> = [];

						rows.map(row => {
							let holding = new Holding(userID, row.holdingAssetID, row.holdingAssetSymbol, row.holdingAssetAmount, row.holdingAssetType);
							holding.holdingID = row.holdingID;
							holdings.push(holding);
						});
						
						resolve(holdings);
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

// Updates a holding.
export async function updateHolding({ token, userID, holdingID, holdingAssetID, holdingAssetSymbol, holdingAssetAmount, holdingAssetType }: any) {
	try {
		let valid = await Utils.verifyToken(userID, token);

		if(valid) {
			db.runQuery("UPDATE Holding SET holdingAssetID = ?, holdingAssetSymbol = ?, holdingAssetAmount = ?, holdingAssetType = ? WHERE holdingID = ? AND userID = ?", [holdingAssetID, holdingAssetSymbol, holdingAssetAmount, holdingAssetType, holdingID, userID]);
			return "Done";
		} else {
			return "Unauthorized";
		}
	} catch(error) {
		console.log(error);
		return error;
	}
}

// Deletes a holding.
export async function deleteHolding({ token, userID, holdingID }: any) {
	try {
		let valid = await Utils.verifyToken(userID, token);

		if(valid) {
			db.runQuery("DELETE FROM Holding WHERE holdingID = ? AND userID = ?", [holdingID, userID]);
			return "Done";
		} else {
			return "Unauthorized";
		}
	} catch(error) {
		console.log(error);
		return error;
	}
}

// Deletes all the holdings of a user.
export async function deleteHoldingAll({ token, userID }: any) {
	try {
		let valid = await Utils.verifyToken(userID, token);

		if(valid) {
			db.runQuery("DELETE FROM Holding WHERE userID = ?", [userID]);
			return "Done";
		} else {
			return "Unauthorized";
		}
	} catch(error) {
		console.log(error);
		return error;
	}
}