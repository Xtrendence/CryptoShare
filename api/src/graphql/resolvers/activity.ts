import Activity from "../../models/Activity";
import DB from "../../utils/DB";
import Utils from "../../utils/Utils";

const db = new DB();

export async function createActivity({ token, userID, activityAssetID, activityAssetSymbol, activityAssetType, activityDate, activityType, activityAssetAmount, activityFee, activityNotes, activityExchange, activityPair, activityPrice, activityFrom, activityTo }: any) {
	try {
		let valid = await Utils.verifyToken(userID, token);

		if(valid) {
			let activityTransactionID = "tx-" + await Utils.generateToken();

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

export async function updateActivity({ token, userID, activityID, activityAssetID, activityAssetSymbol, activityAssetType, activityDate, activityType, activityAssetAmount, activityFee, activityNotes, activityExchange, activityPair, activityPrice, activityFrom, activityTo }: any) {
	try {
		let valid = await Utils.verifyToken(userID, token);

		if(valid) {
			db.runQuery("UPDATE Activity SET activityAssetID = ?, activityAssetSymbol = ?, activityAssetType = ?, activityDate = ?, activityType = ?, activityAssetAmount = ?, activityFee = ?, activityNotes = ?, activityExchange = ?, activityPair = ?, activityPrice = ?, activityFrom = ?, activityTo = ? WHERE activityID = ? AND userID = ?", [activityAssetID, activityAssetSymbol, activityAssetType, activityDate, activityType, activityAssetAmount, activityFee, activityNotes, activityExchange, activityPair, activityPrice, activityFrom, activityTo, activityID, userID]);
			return "Done";
		} else {
			return "Unauthorized";
		}
	} catch(error) {
		console.log(error);
		return error;
	}
}

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

export async function importActivity({ token, userID, rows }: any) {
	return new Promise(async (resolve, reject) => {
		try {
			let valid = await Utils.verifyToken(userID, token);

			if(valid) {
				for(let i = 0; i < rows.length; i++) {
					let row = rows[i];

					let data = row.split(",");

					let activityTransactionID = Utils.empty(data[0]) ? "tx-" + await Utils.generateToken() : data[0];
					let activityAssetID = data[1];
					let activityAssetSymbol = data[2];
					let activityAssetType = data[3];
					let activityDate = data[4];
					let activityType = data[5];
					let activityAssetAmount = data[6];
					let activityFee = data[7];
					let activityNotes = data[8];
					let activityExchange = data[9];
					let activityPair = data[10];
					let activityPrice = data[11];
					let activityFrom = data[12];
					let activityTo = data[13];

					db.db?.get("SELECT * FROM Activity WHERE userID = ? AND activityTransactionID = ?", [userID, activityTransactionID], (error, row) => {
						if(error) {
							console.log(error);
							reject();
						} else {
							if(row === undefined) {
								createActivity({ token:token, userID:userID, activityAssetID:activityAssetID, activityAssetSymbol:activityAssetSymbol, activityAssetType:activityAssetType, activityDate:activityDate, activityType:activityType, activityAssetAmount:activityAssetAmount, activityFee:activityFee, activityNotes:activityNotes, activityExchange:activityExchange, activityPair:activityPair, activityPrice:activityPrice, activityFrom:activityFrom, activityTo:activityTo });
							} else {
								updateActivity({ token:token, userID:userID, activityID:row.activityID, activityAssetID:activityAssetID, activityAssetSymbol:activityAssetSymbol, activityAssetType:activityAssetType, activityDate:activityDate, activityType:activityType, activityAssetAmount:activityAssetAmount, activityFee:activityFee, activityNotes:activityNotes, activityExchange:activityExchange, activityPair:activityPair, activityPrice:activityPrice, activityFrom:activityFrom, activityTo:activityTo });
							}
						}

						if(i === rows.length - 1) {
							resolve("Done");
						}
					});
				}
			} else {
				reject("!Unauthorized.!");
			}
		} catch(error) {
			console.log(error);
			reject(`!${error}!`);
		}
	});
}