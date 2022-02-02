import Stock from "../../models/Stock";
import DB from "../../utils/DB";
import Utils from "../../utils/Utils";

const db = new DB();

export async function readStockHistorical({ token, userID, keyAPI, assetSymbol }: any) {
	return new Promise(async (resolve, reject) => {
		try {
			let valid = await Utils.verifyToken(userID, token);

			if(valid) {
				assetSymbol = assetSymbol.toUpperCase();
				
				db.db?.get("SELECT * FROM Stock WHERE assetSymbol = ?", [assetSymbol], async (error, row) => {
					if(error) {
						console.log(error);
						reject();
					} else {
						if(row === undefined || !Utils.validJSON(row.historicalData) || Utils.refetchRequired(JSON.parse(row.historicalData).time)) {
							try {
								let historicalData: any = await getHistoricalData(assetSymbol, keyAPI);

								if(Utils.validJSON(historicalData) && "error" in JSON.parse(historicalData)) {
									reject(`!${JSON.parse(historicalData).error}!`);
									return;
								}

								db.runQuery("INSERT OR REPLACE INTO Stock (assetSymbol, historicalData, priceData) VALUES (?, ?, ?)", [assetSymbol, historicalData, row?.priceData || ""]);

								let stock = new Stock(assetSymbol, historicalData, row?.priceData || "");
								resolve(stock);
							} catch(error) {
								console.log(error);
								reject(error);
							}
						} else {
							let stock = new Stock(row.assetSymbol, row.historicalData, row.priceData || "");
							resolve(stock);
						}
					}
				});
			} else {
				reject("!Unauthorized!");
			}
		} catch(error) {
			console.log(error);
		}
	});
}

export async function readStockPrice({ token, userID, keyAPI, symbols }: any) {
	return new Promise(async (resolve, reject) => {
		try {
			let valid = await Utils.verifyToken(userID, token);

			if(valid) {
				try {
					if(Utils.empty(keyAPI)) {
						reject("!API Key Required!");
						return;
					}
					
					let refetch: any = await getSymbolsToRefetch(symbols) || {};
					let refetchSymbols = Object.keys(refetch);

					try {
						if(refetchSymbols.length > 0) {
							let priceData: any = await getPriceData(refetchSymbols, keyAPI);

							if("error" in priceData) {
								reject(`!${priceData.error}!`);
								return;
							}

							let fetchedSymbols = Object.keys(priceData.priceData);

							fetchedSymbols.map(symbol => {
								db.db?.get("SELECT * FROM Stock WHERE assetSymbol = ?", [symbol], async (error, row) => {
									if(error) {
										console.log(error);
									} else {
										if(row !== undefined) {
											db.runQuery("INSERT OR REPLACE INTO Stock (assetSymbol, historicalData, priceData) VALUES (?, ?, ?)", [symbol, row.historicalData || "", JSON.stringify({ time:priceData.time, priceData:priceData.priceData[symbol] })]);
										} else {
											db.runQuery("INSERT OR REPLACE INTO Stock (assetSymbol, historicalData, priceData) VALUES (?, ?, ?)", [symbol, "", JSON.stringify({ time:priceData.time, priceData:priceData.priceData[symbol] })]);
										}
									}
								});
							});
						}
					} catch(error) {
						console.log(error);
					}

					setTimeout(async () => {
						let rows = await getStocks(symbols);

						resolve(rows);
					}, 1000);
				} catch(error) {
					console.log(error);
					reject(error);
				}
			} else {
				reject("!Unauthorized!");
			}
		} catch(error) {
			console.log(error);
		}
	});
}

function getStocks(symbols: any) {
	return new Promise((resolve, reject) => {
		try {
			let output: any = [];

			for(let i = 0; i < symbols.length; i++) {
				let symbol = symbols[i].toUpperCase();

				db.db?.get("SELECT * FROM Stock WHERE assetSymbol = ?", [symbol], async (error, row) => {
					if(error) {
						console.log(error);
					} else {
						if(row !== undefined) {
							let stock = new Stock(symbol, row.historicalData || "", row.priceData);
							output.push(stock);
						}
					}
				});
			}

			let check = setInterval(() => {
				if(output.length === symbols.length) {
					resolve(output);
					clearInterval(check);
				}
			}, 100);
		} catch(error) {
			reject(error);
		}
	});
}

function getSymbolsToRefetch(symbols: any) {
	return new Promise((resolve, reject) => {
		try {
			let refetchSymbols: any = {};

			for(let i = 0; i < symbols.length; i++) {
				let symbol = symbols[i];

				db.db?.get("SELECT * FROM Stock WHERE assetSymbol = ?", [symbol], async (error, row) => {
					if(error) {
						console.log(error);
						reject();
					} else {
						if(row === undefined || !Utils.validJSON(row.priceData) || Utils.refetchRequired(JSON.parse(row.priceData).time)) {
							refetchSymbols[symbol] = row;
						}
					}

					if(i === symbols.length - 1) {
						resolve(refetchSymbols);
					}
				});
			}
		} catch(error) {
			console.log(error);
			reject(error);
		}
	});
}

async function getHistoricalData(assetSymbol: string, keyAPI: string) {
	let now = Math.floor(new Date().getTime() / 1000);

	let historicalData: any = await Utils.request("GET", "https://yfapi.net/v8/finance/chart/" + assetSymbol.toUpperCase() + "?range=1y&interval=1d&lang=en", null, [["X-API-KEY", keyAPI]]);

	if("chart" in historicalData) {
		return JSON.stringify({ time:now, historicalData:historicalData });
	} else if("message" in historicalData && historicalData.message === "Limit Exceeded") {
		return JSON.stringify({ error:"Stock API Rate Limit Exceeded" });
	} else {
		return JSON.stringify("");
	}
}

function getPriceData(symbols: any, keyAPI: string) {
	return new Promise(async (resolve, reject) => {
		try {
			let now = Math.floor(new Date().getTime() / 1000);

			let output: any = {};

			symbols = Utils.chunkArray(symbols, 10);

			for(let i = 0; i < symbols.length; i++) {
				let chunk = symbols[i];
				let joinedSymbols = chunk.join("%2C").toUpperCase();

				let priceData: any = await Utils.request("GET", "https://yfapi.net/v6/finance/quote?lang=en&symbols=" + joinedSymbols, null, [["X-API-KEY", keyAPI]]);

				if("quoteResponse" in priceData && "result" in priceData.quoteResponse) {
					let results = priceData.quoteResponse.result;

					let keys = Object.keys(results);

					keys.map((index: any) => {
						let result = results[index];
						output[result.symbol] = {
							symbol: result.symbol,
							currency: result.currency,
							price: result.regularMarketPrice,
							marketCap: result.marketCap,
							shortName: result.shortName,
							longName: result.longName,
							displayName: result.displayName,
							change: result.regularMarketChangePercent,
							low1y: result.fiftyTwoWeekLow,
							high1y: result.fiftyTwoWeekHigh 
						};
					});
				} else if("message" in priceData && priceData.message === "Limit Exceeded") {
					resolve({ error:"Stock API Rate Limit Exceeded" });
				}

				if(i === symbols.length - 1) {
					resolve({ time:now, priceData:output });
				}
			}
		} catch(error) {
			reject(error);
		}
	});
}