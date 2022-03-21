// Returns a crypto asset's ID or a list of matching assets.
async function getCoin(args) {
	return new Promise(async (resolve, reject) => {
		try {
			let list = await fetchCoinList();

			let coin;

			if((empty(args.id) && empty(args.symbol)) || (!empty(args.id) && !empty(args.symbol))) {
				reject("Only symbol or ID must be provided, not both.");
				return;
			} else if(!empty(args.symbol)) {
				coin = findCryptoBySymbol(list, args.symbol.toLowerCase(), true);
			} else if(!empty(args.id)) {
				coin = findCryptoByID(list, args.id.toLowerCase(), true);
			}

			resolve(coin);
		} catch(error) {
			console.log(error);
			reject(error);
		}
	});
}

// Fetches every crypto's symbol and ID.
async function fetchCoinList() {
	return new Promise(async (resolve, reject) => {
		try {
			let current = await appStorage.getItem("coinList");
			
			if(empty(current) || !validJSON(current) || refetchRequired(JSON.parse(current).time)) {
				let list = await cryptoAPI.getCoinList();

				let pairs = [];

				Object.keys(list).map(coin => {
					let symbol = list[coin].symbol.toLowerCase();
					let pair = { [symbol]:list[coin].id };
					pairs.push(pair);
				});

				let coinList = {
					time: Math.floor(new Date().getTime() / 1000),
					data: pairs
				};

				await appStorage.setItem("coinList", JSON.stringify(coinList));

				resolve(pairs);
			} else {
				resolve(JSON.parse(current).data);
			}
		} catch(error) {
			console.log(error);
			reject(error);
		}
	});
}

// Finds a crypto asset using its symbol.
function findCryptoBySymbol(coins, symbol, retry) {
	let matches = [];

	coins.map(coin => {
		if(Object.keys(coin)[0] === symbol) {
			matches.push(coin);
		}
	});

	if(matches.length === 1) {
		return { id:matches[0][symbol], symbol:symbol };
	} else if(empty(matches)) {
		if(retry) {
			return findCryptoByID(coins, symbol, false);
		} else {
			return { error:"No coins were found with that symbol." };
		}
	} else {
		return { matches:matches };
	}
}

// Finds a crypto asset using its ID.
function findCryptoByID(coins, id, retry) {
	let values = Object.values(coins);
	let symbols = {};
	let ids = [];

	values.map(value => {
		ids.push(value[Object.keys(value)[0]]);
		symbols[value[Object.keys(value)[0]]] = Object.keys(value)[0];
	});

	if(ids.includes(id)) {
		return { id:id, symbol:symbols[id] };
	} else {
		if(retry) {
			return findCryptoBySymbol(coins, id, false);
		} else {
			return { error:"No coins were found with that symbol." };
		}
	}
}

// The crypto market data is initially indexed using numbers. This function indexes each coin's data using its symbol.
function sortMarketDataByCoinID(marketData) {
	let prices = {};

	Object.keys(marketData).map(index => {
		let coin = marketData[index];
		prices[coin.id] = coin;
	});

	return prices;
}

// Generate crypto chart data.
function parseHistoricalCryptoData(data) {
	let labels = [];
	let tooltips = [];
	let prices = [];

	data.map(day => {
		labels.push(new Date(day[0]));
		tooltips.push(formatDateHuman(new Date(day[0])));
		prices.push(day[1]);
	});

	return { labels:labels, tooltips:tooltips, prices:prices };
}