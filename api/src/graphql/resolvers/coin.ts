import Coin from "../../models/Coin";
import DB from "../../utils/DB";
import Utils from "../../utils/Utils";

const db = new DB();

export async function readCoin({ token, userID, assetID, assetSymbol, currency }: any) {
	return new Promise(async (resolve, reject) => {
		let valid = await Utils.verifyToken(userID, token);

		if(valid) {
			let id = `${assetID}-${currency}`;

			db.db?.get("SELECT * FROM Coin WHERE assetID = ?", [id], async (error, row) => {
				if(error) {
					console.log(error);
					reject();
				} else {
					if(row === undefined || !Utils.validJSON(row.data) || Utils.refetchRequired(JSON.parse(row.data).time)) {
						try {
							let from = Math.floor(Utils.previousYear(new Date()).getTime() / 1000);
							let now = Math.floor(new Date().getTime() / 1000);

							let historicalData = await Utils.request("GET", "https://api.coingecko.com/api/v3/coins/" + assetID + "/market_chart/range?vs_currency=" + currency + "&from=" + from + "&to=" + now, null);

							let data = JSON.stringify({ time:now, historicalData:historicalData });

							db.runQuery("INSERT INTO Coin (assetID, assetSymbol, data) VALUES (?, ?, ?)", [id, assetSymbol, data]);

							let coin = new Coin(id, assetSymbol, data);
							resolve(coin);
						} catch(error) {
							console.log(error);
							reject(error);
						}
					} else {
						let coin = new Coin(id, row.assetSymbol, row.data);
						resolve(coin);
					}
				}
			});
		} else {
			reject("!Unauthorized!");
		}
	});
}