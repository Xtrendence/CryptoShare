import Activity from "../../models/Activity";
import DB from "../../utils/DB";
import Utils from "../../utils/Utils";

const db = new DB();

export async function createActivity({ token, userID, activityAssetID, activityAssetSymbol, activityAssetType, activityDate, activityType, activityAssetAmount, activityFee, activityNotes, activityExchange, activityPair, activityPrice, activityFrom, activityTo }: any) {
	let valid = await Utils.verifyToken(userID, token);

	if(valid) {
		let activityTransactionID = "tx-" + await Utils.generateToken();

		db.runQuery("INSERT INTO Activity (userID, activityTransactionID, activityAssetID, activityAssetSymbol, activityAssetType, activityDate, activityType, activityAssetAmount, activityFee, activityNotes, activityExchange, activityPair, activityPrice, activityFrom, activityTo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [userID, activityTransactionID, activityAssetID, activityAssetSymbol, activityAssetType, activityDate, activityType, activityAssetAmount, activityFee, activityNotes, activityExchange, activityPair, activityPrice, activityFrom, activityTo]);
		return "Done";
	} else {
		return "Unauthorized";
	}
}

export async function readActivity({ token, userID }: any) {
	return new Promise(async (resolve, reject) => {
		let valid = await Utils.verifyToken(userID, token);

		if(valid) {
			db.db?.get("SELECT * FROM Activity WHERE userID = ?", [userID], (error, row) => {
				if(error) {
					console.log(error);
					reject();
				} else {
					if(row === undefined) {
						reject("!Activity Not Found!");
						return;
					}

					let activity = new Activity(userID, row.activityTransactionID, row.activityAssetID, row.activityAssetSymbol, row.activityAssetType, row.activityDate, row.activityType, row.activityAssetAmount, row.activityFee, row.activityNotes, row.activityExchange, row.activityPair, row.activityPrice, row.activityFrom, row.activityTo);
					activity.activityID = row.activityID;
					resolve(activity);
				}
			});
		} else {
			reject("!Unauthorized!");
		}
	});
}

export async function updateActivity({ token, userID, activityID, activityAssetID, activityAssetSymbol, activityAssetType, activityDate, activityType, activityAssetAmount, activityFee, activityNotes, activityExchange, activityPair, activityPrice, activityFrom, activityTo }: any) {
	let valid = await Utils.verifyToken(userID, token);

	if(valid) {
		db.runQuery("UPDATE Activity SET activityAssetID = ?, activityAssetSymbol = ?, activityAssetType = ?, activityDate = ?, activityType = ?, activityAssetAmount = ?, activityFee = ?, activityNotes = ?, activityExchange = ?, activityPair = ?, activityPrice = ?, activityFrom = ?, activityTo = ? WHERE activityID = ? AND userID = ?", [activityAssetID, activityAssetSymbol, activityAssetType, activityDate, activityType, activityAssetAmount, activityFee, activityNotes, activityExchange, activityPair, activityPrice, activityFrom, activityTo, activityID, userID]);
		return "Done";
	} else {
		return "Unauthorized";
	}
}

export async function deleteActivity({ token, userID, activityID }: any) {
	let valid = await Utils.verifyToken(userID, token);

	if(valid) {
		db.runQuery("DELETE FROM Activity WHERE activityID = ? AND userID = ?", [activityID, userID]);
		return "Done";
	} else {
		return "Unauthorized";
	}
}