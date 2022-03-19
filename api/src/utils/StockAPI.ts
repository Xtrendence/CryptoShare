import * as core from "express-serve-static-core";
import YahooFinance from "yahoo-finance2";
import Utils from "./Utils";

// Internal stock market API that fetches data from Yahoo Finance directly.
export default function addStockAPIRoutes(app: core.Express) {
	// Fetches the stock market data for one or more assets (separated using commas).
	app.get("/v6/finance/quote", async (request, response) => {
		try {
			if(!Utils.empty(request?.query)) {
				let querySymbols: string = request?.query?.symbols?.toString() || "";
				if(!Utils.empty(querySymbols)) {
					let symbols = querySymbols?.split(",");
					let result = await YahooFinance.quote(symbols, {}, { validateResult:false });

					let output = {
						quoteResponse: { 
							result: result
						}
					};

					response.json(output);
				} else {
					response.json({ error:"No symbols provided." });
				}
			} else {
				response.json({ error:"No queries found." });
			}
		} catch(error) {
			response.json({ error:error });
		}
	});

	// Fetches the historical stock market data for an asset.
	app.get("/v8/finance/chart/*", async (request, response) => {
		try {
			if(!Utils.empty(request?.params)) {
				let params: any = request?.params;
				let keys: any = Object.keys(params);
				let symbol: string = params[keys[0]] || "";
				if(!Utils.empty(symbol)) {
					let result = await YahooFinance.historical(symbol, {
						period1: Utils.previousYear(new Date),
						period2: new Date(),
						interval: "1d"
					}, { validateResult:false });

					let timestamp: any = [];
					let close: any = [];

					Object.keys(result).map((index: any) => {
						let day = result[index];
						timestamp.push(Math.floor(new Date(Date.parse(day.date.toString())).getTime() / 1000));
						close.push(day.close);
					});

					let output = {
						chart: {
							result: [{
								meta: {
									symbol: symbol.toUpperCase()
								},
								timestamp: timestamp,
								indicators: {
									quote: [{
										close: close
									}]
								}
							}]
						}
					};

					response.json(output);
				} else {
					response.json({ error:"No symbols provided." });
				}
			} else {
				response.json({ error:"No parameters found." });
			}
		} catch(error) {
			response.json({ error:error });
		}
	});
}