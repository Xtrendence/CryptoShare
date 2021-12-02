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
			db.db?.all("SELECT * FROM Holding WHERE userID = ?", [userID], (error, rows) => {
				if(error) {
					console.log(error);
					reject();
				} else {
					if(rows === undefined) {
						reject("!Holdings Not Found!");
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

export async function importHolding({ token, userID, rows }: any) {
	return new Promise(async (resolve, reject) => {
		let valid = await Utils.verifyToken(userID, token);

		if(valid) {
			for(let i = 0; i < rows.length; i++) {
				let row = rows[i];

				let data = row.split(",");

				let holdingAssetID = data[0];
				let holdingAssetSymbol = data[1];
				let holdingAssetAmount = data[2];
				let holdingAssetType = data[3];

				db.db?.get("SELECT * FROM Holding WHERE userID = ? AND holdingAssetID = ?", [userID, holdingAssetID], (error, row) => {
					if(error) {
						console.log(error);
						reject();
					} else {
						if(row === undefined) {
							createHolding({ token:token, userID:userID, holdingAssetID:holdingAssetID, holdingAssetSymbol:holdingAssetSymbol, holdingAssetAmount:holdingAssetAmount, holdingAssetType:holdingAssetType });
						} else {
							updateHolding({ token:token, userID:userID, holdingID:row.holdingID, holdingAssetID:holdingAssetID, holdingAssetSymbol:holdingAssetSymbol, holdingAssetAmount:holdingAssetAmount, holdingAssetType:holdingAssetType });
						}
					}

					if(i === rows.length - 1) {
						resolve("Done");
					}
				});
			}
		} else {
			reject("!Unauthorized!");
		}
	});
}