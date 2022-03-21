// Fetches the stock price of one or more assets.
async function fetchStockPrice(currency, symbols, showError) {
	try {
		let userID = await appStorage.getItem("userID");
		let token = await appStorage.getItem("token");
		let keyAPI = await appStorage.getItem("keyAPI");

		if(empty(symbols)) {
			return { error:"No symbols provided." };
		}

		if(empty(keyAPI)) {
			return { error:"No stock API key provided. Please set this in settings." };
		}

		let data = await readStockPrice(token, userID, keyAPI, symbols);

		if("errors" in data && data.errors.length > 0) {
			if(showError) {
				errorNotification(data.errors[0]);
			}
			
			return { error:data.errors[0] };
		}

		if(!empty(data?.data?.readStockPrice)) {
			let parsedOutput = {};
			let result = data?.data?.readStockPrice;

			result.map(item => {
				let parsedData = JSON.parse(item.priceData);
				parsedOutput[parsedData.priceData.symbol] = parsedData;
			});

			let converted = await convertStockPrice(currency, parsedOutput);
			return converted;
		}

		return { error:"No data found." };
	} catch(error) {
		return { error:"Something went wrong... - EW59" };
	}
}

// Fetches the historical market data of an asset.
async function fetchStockHistorical(currency, assetSymbol, showError) {
	try {
		let userID = await appStorage.getItem("userID");
		let token = await appStorage.getItem("token");
		let keyAPI = await appStorage.getItem("keyAPI");

		if(empty(keyAPI)) {
			return { error:"No stock API key provided. Please set this in settings." };
		}

		let data = await readStockHistorical(token, userID, keyAPI, assetSymbol);

		if("errors" in data && data.errors.length > 0) {
			if(showError) {
				errorNotification(data.errors[0]);
			}

			return { error:data.errors[0] };
		}

		if(!empty(data?.data?.readStockHistorical)) {
			let result = data?.data?.readStockHistorical;
			let historicalData = JSON.parse(result.historicalData);

			let converted = await convertStockHistorical(currency, historicalData);

			return { data:converted };
		}

		return { error:"No data found." };
	} catch(error) {
		return { error:"Something went wrong... - EW60" };
	}
}

// Generate stock market chart.
function parseHistoricalStockData(timestamps, prices) {
	let labels = [];
	let tooltips = [];
	let values = [];

	for(let i = 0; i < timestamps.length; i++) {
		let time = timestamps[i];

		let date = new Date(time * 1000);

		labels.push(date);
		tooltips.push(formatDateHuman(date));
		values.push(prices[i]);
	}

	return { labels:labels, tooltips:tooltips, prices:prices };
}

// Fetch currency exchange rates.
async function fetchExchangeRates() {
	return new Promise(async (resolve, reject) => {
		try {
			let current = await appStorage.getItem("exchangeRates");
			
			if(empty(current) || !validJSON(current) || refetchRequired(JSON.parse(current).time)) {
				let data = await cryptoAPI.getExchangeRates();

				let rates = data.rates;

				let exchangeRates = {
					time: Math.floor(new Date().getTime() / 1000),
					data: rates
				};

				await appStorage.setItem("exchangeRates", JSON.stringify(exchangeRates));

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

// Convert the value of one currency to another (for example, GBP to USD).
async function convertCurrency(from, to, value, exchangeRates = null) {
	try {
		if(from === to) {
			return value;
		}
		
		let rates = exchangeRates;
		if(empty(rates)) {
			rates = await fetchExchangeRates();
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

// Convert the price of a stock from one currency to another.
async function convertStockPrice(currency, data) {
	let exchangeRates = await fetchExchangeRates();

	let symbols = Object.keys(data);

	symbols.map(async symbol => {
		let priceData = data[symbol].priceData;
		
		data[symbol].priceData.high1y = await convertCurrency("usd", currency, priceData.high1y, exchangeRates);
		data[symbol].priceData.low1y = await convertCurrency("usd", currency, priceData.low1y, exchangeRates);
		data[symbol].priceData.marketCap = await convertCurrency("usd", currency, priceData.marketCap, exchangeRates);
		data[symbol].priceData.price = await convertCurrency("usd", currency, priceData.price, exchangeRates);
	});

	return data;
}

// Convert the historical prices of an asset from one currency to another.
async function convertStockHistorical(currency, data) {
	let exchangeRates = await fetchExchangeRates();

	let prices = data.historicalData.chart.result[0].indicators.quote[0].close;

	let convertedPrices = [];

	prices.map(async price => {
		let converted = await convertCurrency("usd", currency, price, exchangeRates);
		convertedPrices.push(converted);
	});

	data.historicalData.chart.result[0].indicators.quote[0].close = convertedPrices;

	return data;
}

// Converts historical stock market data to match the format of historical crypto market data (for example, stocks aren't traded on weekends, so there's only 5 data points per week).
function parseStockHistoricalDataAsCrypto(days, historicalData) {
	let parsed = [];
	let parsedObject = {};
	let datedPrices = {};
	let prices = historicalData?.indicators?.quote[0]?.close;
	let times = historicalData?.timestamp;

	for(let i = 0; i < times.length; i++) {
		let date = formatDateHyphenated(new Date(times[i] * 1000));
		datedPrices[date] = prices[i];
	}

	for(let i = 0; i < days.length; i++) {
		let day = days[i];
		let currentTime = times[i] * 1000;
		let currentDay = formatDateHyphenated(new Date(currentTime));
		let currentPrice = datedPrices[currentDay];
		parsedObject[currentDay] = [currentTime, currentPrice];

		if(!(day in parsedObject)) {
			let value = previousValueInObject(parsedObject, i - 1);
			if(empty(value)) {
				value = nextValueInObject(parsedObject, i);
			}

			parsedObject[day] = value;
		}

		let time = parsedObject[day][0];
		let price = parsedObject[day][1];

		parsed.push([time, price]);
	}

	return parsed;
}