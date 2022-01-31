async function fetchStockPrice(currency, symbols) {
	try {
		let userID = localStorage.getItem("userID");
		let token = localStorage.getItem("token");
		let keyAPI = localStorage.getItem("keyAPI");

		if(empty(keyAPI)) {
			return { error:"No stock API key provided. Please set this in settings." };
		}

		let data = await readStockPrice(token, userID, keyAPI, symbols);

		if(!empty(data?.data?.readStockPrice)) {
			let parsedOutput = {};
			let result = data?.data?.readStockPrice;

			result.map(item => {
				let parsedData = JSON.parse(item.priceData);
				parsedOutput[parsedData.priceData.symbol] = parsedData;
			});

			return convertStockPrice(currency, parsedOutput);
		}

		return { error:"No data found." };
	} catch(error) {
		return { error:"Something went wrong..." };
	}
}

async function fetchStockHistorical(currency, assetSymbol) {
	try {
		let userID = localStorage.getItem("userID");
		let token = localStorage.getItem("token");
		let keyAPI = localStorage.getItem("keyAPI");

		if(empty(keyAPI)) {
			return { error:"No stock API key provided. Please set this in settings." };
		}

		let data = await readStockHistorical(token, userID, keyAPI, assetSymbol);

		if(!empty(data?.data?.readStockHistorical)) {
			let result = data?.data?.readStockHistorical;
			let historicalData = JSON.parse(result.historicalData);

			return { data:convertStockHistorical(currency, historicalData) };
		}

		return { error:"No data found." };
	} catch(error) {
		return { error:"Something went wrong..." };
	}
}

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

async function fetchExchangeRates() {
	return new Promise(async (resolve, reject) => {
		try {
			let current = localStorage.getItem("exchangeRates");
			
			if(empty(current) || !validJSON(current) || refetchRequired(JSON.parse(current).time)) {
				let data = await cryptoAPI.getExchangeRates();

				let rates = data.rates;

				let exchangeRates = {
					time: Math.floor(new Date().getTime() / 1000),
					data: rates
				};

				localStorage.setItem("exchangeRates", JSON.stringify(exchangeRates));

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

async function convertStockPrice(currency, data) {
	let exchangeRates = await fetchExchangeRates();

	let symbols = Object.keys(data);

	symbols.map(async symbol => {
		let priceData = data[symbol].priceData;

		priceData.high1y = await convertCurrency("usd", currency, priceData.high1y, exchangeRates);
		priceData.low1y = await convertCurrency("usd", currency, priceData.low1y, exchangeRates);
		priceData.marketCap = await convertCurrency("usd", currency, priceData.marketCap, exchangeRates);
		priceData.price = await convertCurrency("usd", currency, priceData.price, exchangeRates);
	});

	return data;
}

function convertStockHistorical(currency, data) {
	console.log(data);
	return data;
}