import AsyncStorage from "@react-native-async-storage/async-storage";
import Requests, { cryptoAPI } from "./Requests";
import Utils from "./Utils";

export default class Stock {
	// Fetches the market data of one or more stock assets.
	static async fetchStockPrice(currency: string, symbols: any) {
		try {
			let userID = await AsyncStorage.getItem("userID");
			let token = await AsyncStorage.getItem("token");
			let keyAPI = await AsyncStorage.getItem("keyAPI");
			let api = await AsyncStorage.getItem("api");

			if(Utils.empty(symbols)) {
				return { error:"No symbols provided." };
			}

			if(Utils.empty(keyAPI)) {
				return { error:"No stock API key provided. Please set this in settings." };
			}
			
			let requests = new Requests(api);

			let data = await requests.readStockPrice(token, userID, keyAPI, symbols);

			if("errors" in data && data.errors.length > 0) {			
				return { error:data.errors[0] };
			}

			if(!Utils.empty(data?.data?.readStockPrice)) {
				let parsedOutput: any = {};
				let result = data?.data?.readStockPrice;

				result.map((item: any) => {
					let parsedData = JSON.parse(item.priceData);
					parsedOutput[parsedData.priceData.symbol] = parsedData;
				});

				let converted = await this.convertStockPrice(currency, parsedOutput);
				return converted;
			}

			return { error:"No data found." };
		} catch(error) {
			console.log(error);
			return { error:"Something went wrong... - EM71" };
		}
	}

	// Fetches the historical stock market data of an asset.
	static async fetchStockHistorical(currency: string, assetSymbol: string) {
		try {
			let userID = await AsyncStorage.getItem("userID");
			let token = await AsyncStorage.getItem("token");
			let keyAPI = await AsyncStorage.getItem("keyAPI");
			let api = await AsyncStorage.getItem("api");

			if(Utils.empty(keyAPI)) {
				return { error:"No stock API key provided. Please set this in settings." };
			}
			
			let requests = new Requests(api);

			let data = await requests.readStockHistorical(token, userID, keyAPI, assetSymbol);

			if("errors" in data && data.errors.length > 0) {
				return { error:data.errors[0] };
			}

			if(!Utils.empty(data?.data?.readStockHistorical)) {
				let result = data?.data?.readStockHistorical;
				let historicalData = JSON.parse(result.historicalData);

				let converted = await this.convertStockHistorical(currency, historicalData);

				return { data:converted };
			}

			return { error:"No data found." };
		} catch(error) {
			console.log(error);
			return { error:"Something went wrong... - EM72" };
		}
	}

	// Generates chart data for a stock asset.
	static parseHistoricalStockData(timestamps: any, prices: any) {
		let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

		let parsed: any = {
			labels: [],
			tooltips: [],
			prices: [],
			months: []
		};

		for(let i = 0; i < timestamps.length; i++) {
			let time = timestamps[i];

			let date = new Date(time * 1000);

			parsed.labels.push(date);
			parsed.tooltips.push(Utils.formatDateHuman(date));
			parsed.prices.push(prices[i]);

			let month = date.getMonth();
			let monthName = months[month];

			let lastMonth = parsed.months.slice(i - 31, i);
			if(i - 31 < 0) {
				lastMonth = parsed.months.slice(0, i);
			}

			if(!lastMonth.includes(monthName)) {
				parsed.months.push(monthName);
			} else {
				parsed.months.push("");
			}
		}

		return parsed;
	}

	// Fetches currency exchange rates.
	static async fetchExchangeRates() {
		return new Promise(async (resolve, reject) => {
			try {
				let current = await AsyncStorage.getItem("exchangeRates") || "";
			
				if(Utils.empty(current) || !Utils.validJSON(current) || Utils.refetchRequired(JSON.parse(current).time)) {
					let data = await cryptoAPI.getExchangeRates();

					let rates = data.rates;

					let exchangeRates = {
						time: Math.floor(new Date().getTime() / 1000),
						data: rates
					};

					await AsyncStorage.setItem("exchangeRates", JSON.stringify(exchangeRates));

					resolve(rates);
				} else {
					resolve(JSON.parse(current).data);
				}
			} catch(error) {
				console.log(error);
				reject(error);
			}
		});
	}

	// Converts the value of one currency to another (for example, GBP to USD).
	static async convertCurrency(from: string, to: string, value: number, exchangeRates = null) {
		try {
			if(from === to) {
				return value;
			}
		
			let rates: any = exchangeRates;
			if(Utils.empty(rates)) {
				rates = await this.fetchExchangeRates();
			}

			let valueFrom = rates[from].value;
			let valueTo = rates[to].value;

			let rate = valueTo / valueFrom;

			let converted = value * rate;

			if(converted < 1) {
				return converted;
			} else if(converted > 100) {
				return parseFloat(converted.toFixed(2));
			} else if(converted > 1 && converted < 10) {
				return parseFloat(converted.toFixed(4));
			} else {
				return parseFloat(converted.toFixed(2));
			}
		} catch(error) {
			console.log(error);
		}
	}

	// Converts the price of a stock from one currency to another.
	static async convertStockPrice(currency: string, data: any) {
		let exchangeRates: any = await this.fetchExchangeRates();

		let symbols = Object.keys(data);

		symbols.map(async symbol => {
			let priceData = data[symbol].priceData;
		
			data[symbol].priceData.high1y = await this.convertCurrency("usd", currency, priceData.high1y, exchangeRates);
			data[symbol].priceData.low1y = await this.convertCurrency("usd", currency, priceData.low1y, exchangeRates);
			data[symbol].priceData.marketCap = await this.convertCurrency("usd", currency, priceData.marketCap, exchangeRates);
			data[symbol].priceData.price = await this.convertCurrency("usd", currency, priceData.price, exchangeRates);
		});

		return data;
	}

	// Converts the historical prices of a stock from one currency to another.
	static async convertStockHistorical(currency: string, data: any) {
		let exchangeRates: any = await this.fetchExchangeRates();

		let prices = data.historicalData.chart.result[0].indicators.quote[0].close;

		let convertedPrices: any = [];

		prices.map(async (price: any) => {
			let converted = await this.convertCurrency("usd", currency, price, exchangeRates);
			convertedPrices.push(converted);
		});

		data.historicalData.chart.result[0].indicators.quote[0].close = convertedPrices;

		return data;
	}

	// Converts historical stock market data to match the format of historical crypto market data (for example, stocks aren't traded on weekends, so there's only 5 data points per week).
	static parseStockHistoricalDataAsCrypto(days: any, historicalData: any) {
		let parsed = [];
		let parsedObject: any = {};
		let datedPrices: any = {};
		let prices = historicalData?.indicators?.quote[0]?.close;
		let times = historicalData?.timestamp;

		for(let i = 0; i < times.length; i++) {
			let date = Utils.formatDateHyphenated(new Date(times[i] * 1000));
			datedPrices[date] = prices[i];
		}

		for(let i = 0; i < days.length; i++) {
			let day = days[i];
			let currentTime = times[i] * 1000;
			let currentDay = Utils.formatDateHyphenated(new Date(currentTime));
			let currentPrice = datedPrices[currentDay];
			parsedObject[currentDay] = [currentTime, currentPrice];

			if(!(day in parsedObject)) {
				let value = Utils.previousValueInObject(parsedObject, i - 1);
				if(Utils.empty(value) || isNaN(value[0])) {
					value = Utils.nextValueInObject(parsedObject, i);
				}

				parsedObject[day] = value;
			}

			let time = parsedObject[day][0];
			let price = parsedObject[day][1];

			parsed.push([time, price]);
		}

		return parsed;
	}
}