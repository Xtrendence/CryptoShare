async function cryptoHoldingExists(id) {
	let userID = localStorage.getItem("userID");
	let token = localStorage.getItem("token");
	let key = localStorage.getItem("key");

	return new Promise(async (resolve, reject) => {
		try {
			let holdings = await readHolding(token, userID);

			if(empty(holdings) || holdings?.data?.readHolding.length === 0) {
				resolve({ exists:false });
			} else {
				let encrypted = holdings?.data?.readHolding;

				Object.keys(encrypted).map(index => {
					let decrypted = decryptObjectValues(key, encrypted[index]);

					if(decrypted.holdingAssetID === id) {
						resolve({ exists:true, holdingID:encrypted[index].holdingID });
						return;
					}
				});

				resolve({ exists:false });
			}
		} catch(error) {
			console.log(error);
			reject(error);
		}
	});
}

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

async function fetchCoinList() {
	return new Promise(async (resolve, reject) => {
		try {
			let current = localStorage.getItem("coinList");
			
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

				localStorage.setItem("coinList", JSON.stringify(coinList));

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

function sortMarketDataByCoinID(marketData) {
	let prices = {};

	Object.keys(marketData).map(index => {
		let coin = marketData[index];
		prices[coin.id] = coin;
	});

	return prices;
}

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