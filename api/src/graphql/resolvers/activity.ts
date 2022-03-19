import Activity from "../../models/Activity";
import DB from "../../utils/DB";
import Utils from "../../utils/Utils";

const db = new DB();

// Creates an activity.
export async function createActivity({ token, userID, activityAssetID, activityAssetSymbol, activityAssetType, activityDate, activityType, activityAssetAmount, activityFee, activityNotes, activityExchange, activityPair, activityPrice, activityFrom, activityTo }: any) {
	try {
		let valid = await Utils.verifyToken(userID, token);

		if(valid) {
			let txID = await Utils.generateToken();
			let activityTransactionID = `ac-${userID.toString()}-${txID}`;

			db.runQuery("INSERT INTO Activity (userID, activityTransactionID, activityAssetID, activityAssetSymbol, activityAssetType, activityDate, activityType, activityAssetAmount, activityFee, activityNotes, activityExchange, activityPair, activityPrice, activityFrom, activityTo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [userID, activityTransactionID, activityAssetID, activityAssetSymbol, activityAssetType, activityDate, activityType, activityAssetAmount, activityFee, activityNotes, activityExchange, activityPair, activityPrice, activityFrom, activityTo]);
			return "Done";
		} else {
			return "Unauthorized";
		}
	} catch(error) {
		console.log(error);
		return error;
	}
}

// Reads all the activities of a user.
export async function readActivity({ token, userID }: any) {
	return new Promise(async (resolve, reject) => {
		try {
			let valid = await Utils.verifyToken(userID, token);

			if(valid) {
				db.db?.all("SELECT * FROM Activity WHERE userID = ?", [userID], (error, rows) => {
					if(error) {
						console.log(error);
						reject();
					} else {
						if(rows === undefined) {
							reject("!Activities not found.!");
							return;
						}

						let activities: Array<Activity> = [];

						rows.map(row => {
							let activity = new Activity(userID, row.activityTransactionID, row.activityAssetID, row.activityAssetSymbol, row.activityAssetType, row.activityDate, row.activityType, row.activityAssetAmount, row.activityFee, row.activityNotes, row.activityExchange, row.activityPair, row.activityPrice, row.activityFrom, row.activityTo);
							activity.activityID = row.activityID;
							activities.push(activity);
						});
						
						resolve(activities);
					}
				});
			} else {
				reject("!Unauthorized.!");
			}
		} catch(error) {
			console.log(error);
			reject(`!${error}!`);
		}
	});
}

// Updates an activity using the "activityTransactionID".
export async function updateActivity({ token, userID, activityTransactionID, activityAssetID, activityAssetSymbol, activityAssetType, activityDate, activityType, activityAssetAmount, activityFee, activityNotes, activityExchange, activityPair, activityPrice, activityFrom, activityTo }: any) {
	try {
		let valid = await Utils.verifyToken(userID, token);

		if(valid) {
			db.runQuery("UPDATE Activity SET activityAssetID = ?, activityAssetSymbol = ?, activityAssetType = ?, activityDate = ?, activityType = ?, activityAssetAmount = ?, activityFee = ?, activityNotes = ?, activityExchange = ?, activityPair = ?, activityPrice = ?, activityFrom = ?, activityTo = ? WHERE activityTransactionID = ? AND userID = ?", [activityAssetID, activityAssetSymbol, activityAssetType, activityDate, activityType, activityAssetAmount, activityFee, activityNotes, activityExchange, activityPair, activityPrice, activityFrom, activityTo, activityTransactionID, userID]);
			return "Done";
		} else {
			return "Unauthorized";
		}
	} catch(error) {
		console.log(error);
		return error;
	}
}

// Deletes an activity.
export async function deleteActivity({ token, userID, activityID }: any) {
	try {
		let valid = await Utils.verifyToken(userID, token);

		if(valid) {
			db.runQuery("DELETE FROM Activity WHERE activityID = ? AND userID = ?", [activityID, userID]);
			return "Done";
		} else {
			return "Unauthorized";
		}
	} catch(error) {
		console.log(error);
		return error;
	}
}

// Deletes all activities belonging to a user.
export async function deleteActivityAll({ token, userID }: any) {
	try {
		let valid = await Utils.verifyToken(userID, token);

		if(valid) {
			db.runQuery("DELETE FROM Activity WHERE userID = ?", [userID]);
			return "Done";
		} else {
			return "Unauthorized";
		}
	} catch(error) {
		console.log(error);
		return error;
	}
}