async function fetchStockPrice(symbols) {
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

			return parsedOutput;
		}

		return { error:"No data found." };
	} catch(error) {
		return { error:"Something went wrong..." };
	}
}

async function fetchStockHistorical(assetSymbol) {
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

			return { data:JSON.parse(result.historicalData) };
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