import Coin from "../../models/Coin";
import DB from "../../utils/DB";
import Utils from "../../utils/Utils";

const db = new DB();

// Fetches and returns the market data of a crypto asset. Only fetches the data from the third-party API if no data exists, or if the existing data is older than the "refetchTime" (24 hours by default).
export async function readCoin({ token, userID, assetID, assetSymbol, currency }: any) {
	return new Promise(async (resolve, reject) => {
		try {
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

								let historicalData: any = await Utils.request("GET", "https://api.coingecko.com/api/v3/coins/" + assetID + "/market_chart/range?vs_currency=" + currency + "&from=" + from + "&to=" + now, null, null);

								if(!("error" in historicalData)) {
									let data = JSON.stringify({ time:now, historicalData:historicalData });

									db.runQuery("INSERT OR REPLACE INTO Coin (assetID, assetSymbol, data) VALUES (?, ?, ?)", [id, assetSymbol, data]);

									let coin = new Coin(id, assetSymbol, data);

									resolve(coin);
								} else {
									reject(historicalData.error);
								}
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
		} catch(error) {
			console.log(error);
			reject(`!${error}!`);
		}
	});
}