import Holding from "../../models/Holding";
import DB from "../../utils/DB";
import Utils from "../../utils/Utils";

const db = new DB();

export async function createHolding({ token, userID, holdingAssetID, holdingAssetSymbol, holdingAssetAmount, holdingAssetType }: any) {
	let valid = await Utils.verifyToken(userID, token);

	if(valid) {
		db.runQuery("INSERT INTO Holding (userID, holdingAssetID, holdingAssetSymbol, holdingAssetAmount, holdingAssetType) VALUES (?, ?, ?, ?, ?)", [userID, holdingAssetID, holdingAssetSymbol, holdingAssetAmount, holdingAssetType]);
		return "Done";
	} else {
		return "Unauthorized";
	}
}

export async function readHolding({ token, userID }: any) {
	return new Promise(async (resolve, reject) => {
		let valid = await Utils.verifyToken(userID, token);

		if(valid) {
			db.db?.get("SELECT * FROM Holding WHERE userID = ?", [userID], (error, row) => {
				if(error) {
					console.log(error);
					reject();
				} else {
					if(row === undefined) {
						reject("!Holding Not Found!");
						return;
					}

					let holding = new Holding(userID, row.holdingAssetID, row.holdingAssetSymbol, row.holdingAssetAmount, row.holdingAssetType);
					holding.holdingID = row.holdingID;
					resolve(holding);
				}
			});
		} else {
			reject("!Unauthorized!");
		}
	});
}

export async function updateHolding({ token, userID, holdingID, holdingAssetID, holdingAssetSymbol, holdingAssetAmount, holdingAssetType }: any) {
	let valid = await Utils.verifyToken(userID, token);

	if(valid) {
		db.runQuery("UPDATE Holding SET holdingAssetID = ?, holdingAssetSymbol = ?, holdingAssetAmount = ?, holdingAssetType = ? WHERE holdingID = ? AND userID = ?", [holdingAssetID, holdingAssetSymbol, holdingAssetAmount, holdingAssetType, holdingID, userID]);
		return "Done";
	} else {
		return "Unauthorized";
	}
}

export async function deleteHolding({ token, userID, holdingID }: any) {
	let valid = await Utils.verifyToken(userID, token);

	if(valid) {
		db.runQuery("DELETE FROM Holding WHERE holdingID = ? AND userID = ?", [holdingID, userID]);
		return "Done";
	} else {
		return "Unauthorized";
	}
}