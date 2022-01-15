import Stock from "../../models/Stock";
import DB from "../../utils/DB";
import Utils from "../../utils/Utils";

const db = new DB();

export async function readStock({ token, userID, assetID, assetSymbol, currency }: any) {
	return new Promise(async (resolve, reject) => {
		let valid = await Utils.verifyToken(userID, token);

		if(valid) {
			let id = `${assetID}-${currency}`;

			db.db?.get("SELECT * FROM Stock WHERE assetID = ?", [id], async (error, row) => {
				if(error) {
					console.log(error);
					reject();
				} else {
					if(row === undefined || !Utils.validJSON(row.data) || Utils.refetchRequired(JSON.parse(row.data).time)) {
						let from = Math.floor(Utils.previousYear(new Date()).getTime() / 1000);
						let now = Math.floor(new Date().getTime() / 1000);
					} else {
						
					}
				}
			});
		} else {
			reject("!Unauthorized!");
		}
	});
}