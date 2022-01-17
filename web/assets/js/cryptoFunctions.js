async function populateMarketListCrypto(page, currency) {
	try {
		let marketData = await cryptoAPI.getMarket(currency, 100, page);

		let rows = createMarketListCryptoRows(marketData, page, currency);

		if(divMarketListCrypto.getElementsByClassName("loading-icon").length > 0) {
			divMarketListCrypto.innerHTML = "";
		}

		for(let i = 0; i < rows.length; i++) {
			if(divMarketListCrypto.childElementCount >= i + 1) {
				let current = divMarketListCrypto.getElementsByClassName("market-list-row")[i];
				if(current.innerHTML !== rows[i].innerHTML) {
					let currentIcon = current.getElementsByClassName("icon")[0];
					let currentInfo = current.getElementsByClassName("info-wrapper")[0];

					if(currentIcon !== rows[i].getElementsByClassName("icon")[0]) {
						currentIcon.setAttribute("src", rows[i].getElementsByClassName("icon")[0].getAttribute("src"));
					}

					if(currentInfo.innerHTML !== rows[i].getElementsByClassName("info-wrapper")[0].innerHTML) {
						currentInfo.innerHTML = rows[i].getElementsByClassName("info-wrapper")[0].innerHTML;
					}
				}
			} else {
				divMarketListCrypto.appendChild(rows[i]);
			}
		}
	} catch(error) {
		console.log(error);
	}
}

function createMarketListCryptoRows(marketData, page, currency) {
	let rows = [];

	let ids = Object.keys(marketData);

	for(let i = 0; i < 100; i++) {
		try {
			let id = ids[i];
			
			let rank = (page - 1) * 100 + (i + 1);

			let coin = marketData[id];

			let coinID = coin.id;
			let price = coin.current_price;
			let icon = coin.image;
			let marketCap = coin.market_cap;
			let priceChangeDay = formatPercentage(coin.market_cap_change_percentage_24h);
			let athChange = formatPercentage(coin.ath_change_percentage);
			let ath = coin.ath;
			let high24h = coin.high_24h;
			let low24h = coin.low_24h;
			let volume = coin.total_volume;
			let supply = coin.circulating_supply;
			let name = coin.name;
			let symbol = coin.symbol;

			let info = { coinID:coinID, currency:currency, price:price, icon:icon, marketCap:marketCap, price:price, ath:ath, priceChangeDay:priceChangeDay, athChange:athChange, high24h:high24h, low24h:low24h, volume:volume, supply:supply, name:name, symbol:symbol, rank:rank };

			let div = document.createElement("div");
			div.id = "market-list-crypto-" + coinID;
			div.setAttribute("class", "market-list-row crypto noselect audible-pop");

			div.innerHTML = `
				<div class="icon-wrapper audible-pop">
					<img class="icon" src="${icon}" draggable="false">
				</div>
				<div class="info-wrapper audible-pop">
					<span class="name">${name}</span>
					<div class="rank-container audible-pop">
						<span class="rank">#${rank}</span>
						<span class="symbol">${symbol.toUpperCase()}</span>
					</div>
					<div class="info-container">
						<div class="top audible-pop">
							<span class="price">Price: ${currencySymbols[currency] + separateThousands(price)}</span>
							<span class="ath">ATH: ${currencySymbols[currency] + separateThousands(ath)}</span>
							<span class="high-24h">24h High: ${currencySymbols[currency] + separateThousands(high24h)}</span>
							<span class="low-24h">24h Low: ${currencySymbols[currency] + separateThousands(low24h)}</span>
							<span class="volume">Volume: ${currencySymbols[currency] + abbreviateNumber(volume, 2)}</span>
						</div>
						<div class="bottom audible-pop">
							<span class="market-cap">Market Cap: ${currencySymbols[currency] + separateThousands(marketCap)}</span>
							<span class="price-change">24h Change: ${priceChangeDay}%</span>
							<span class="ath-change">ATH Change: ${athChange}%</span>
							<span class="supply">Supply: ${abbreviateNumber(supply, 2)}</span>
						</div>
					</div>
				</div>
			`;

			div.addEventListener("click", () => {
				showCryptoMarketData(info);
			});

			rows.push(div);
		} catch(error) {
			console.log(error);
		}
	}

	return rows;
}

function createHoldingsListRows(marketData, holdingsData, currency) {
	let output = { rows:[], totalValue:0 };

	let ids = Object.keys(marketData);

	for(let i = 0; i < ids.length; i++) {
		try {
			let id = ids[i];

			let coin = marketData[id];

			let coinID = coin.id;
			let price = coin.current_price;
			let icon = coin.image;
			let priceChangeDay = formatPercentage(coin.market_cap_change_percentage_24h);
			let name = coin.name;
			let symbol = coin.symbol;
			let rank = coin.market_cap_rank;

			let holding = holdingsData[coinID];

			let amount = parseFloat(holding.holdingAssetAmount);
			let value = parseFloat((amount * price).toFixed(2));

			let div = document.createElement("div");
			div.id = "holdings-list-crypto-" + coinID;
			div.setAttribute("class", "holdings-list-row crypto noselect audible-pop");

			div.innerHTML = `
				<div class="icon-wrapper audible-pop">
					<img class="icon" src="${icon}" draggable="false">
				</div>
				<div class="info-wrapper audible-pop">
					<span class="name">${name}</span>
					<div class="rank-container audible-pop">
						<span class="rank">#${rank}</span>
						<span class="symbol">${symbol.toUpperCase()}</span>
					</div>
					<div class="info-container">
						<div class="top audible-pop">
							<span class="price">Value: ${currencySymbols[currency] + separateThousands(value)}</span>
							<span class="price">Price: ${currencySymbols[currency] + separateThousands(price)}</span>
						</div>
						<div class="bottom audible-pop">
							<span class="price-change">Amount: ${amount}</span>
							<span class="price-change">24h Change: ${priceChangeDay}%</span>
						</div>
					</div>
				</div>
			`;

			addHoldingListRowEvent(div, holding.holdingID, coinID, symbol);

			output.rows.push(div);
			output.totalValue += value;
		} catch(error) {
			console.log(error);
		}
	}

	return output;
}

function addHoldingListRowEvent(div, holdingID, holdingAssetID, holdingAssetSymbol) {
	div.addEventListener("click", () => {
		try {
			let html = `<input id="popup-input-amount-crypto" type="number" placeholder="Amount..."><button class="action-button delete" id="popup-button-delete-crypto">Delete Asset</button>`;
			let popup = new Popup(300, "auto", `Update ${holdingAssetSymbol.toUpperCase()} Amount`, html, { confirmText:"Update" });
			popup.show();
			popup.updateHeight();

			addHoldingPopupDeleteEvent(popup, document.getElementById("popup-button-delete-crypto"), holdingID);

			let inputAmount = document.getElementById("popup-input-amount-crypto");

			inputAmount.focus();
		
			popup.on("confirm", async () => {	
				showLoading(1500, "Updating...");

				let amount = inputAmount.value;
		
				if(!empty(amount) && !isNaN(amount) && amount > 0) {
					let userID = localStorage.getItem("userID");
					let token = localStorage.getItem("token");
					let key = localStorage.getItem("key");

					let encrypted = encryptObjectValues(key, {
						holdingAssetID: holdingAssetID,
						holdingAssetSymbol: holdingAssetSymbol,
						holdingAssetAmount: amount,
						holdingAssetType: "crypto"
					});

					await updateHolding(token, userID, holdingID, encrypted.holdingAssetID, encrypted.holdingAssetSymbol, encrypted.holdingAssetAmount, encrypted.holdingAssetType);

					populateHoldingsList(true);

					hideLoading();

					popup.hide();
				} else {
					errorNotification("Please fill out both fields, and enter the amount as a number.");
				}
			});
		} catch(error) {
			errorNotification("Something went wrong...");
			console.log(error);
		}
	});
}

function addHoldingPopupDeleteEvent(previousPopup, buttonDelete, holdingID) {
	buttonDelete.addEventListener("click", () => {
		previousPopup.hide();
		
		let userID = localStorage.getItem("userID");
		let token = localStorage.getItem("token");

		let popup = new Popup(300, "auto", "Delete Asset", `<span>Are you sure you want to remove this asset from your portfolio?</span>`);
		popup.show();

		popup.on("confirm", async () => {
			try {
				showLoading(1500, "Deleting...");

				await deleteHolding(token, userID, holdingID);

				populateHoldingsList(true);

				hideLoading();

				popup.hide();
			} catch(error) {
				console.log(error);
				errorNotification("Couldn't delete asset.");
			}
		});
	});
}

async function showCryptoMarketData(info) {
	try {
		showLoading(2500, "Fetching Market Data...");

		let userID = localStorage.getItem("userID");
		let token = localStorage.getItem("token");

		let data = await cryptoAPI.getCoinData(info.coinID);

		let popup = new Popup("full", "full", `${info.name} - ${info.symbol.toUpperCase()} - Market Data`, `<div class="chart-wrapper"></div><span>${data?.description?.en}</span>`, { cancelText:"Dismiss", confirmText:"-" });

		popup.show();

		let divChart = popup.element.getElementsByClassName("chart-wrapper")[0];

		let request = await readCoin(token, userID, info.coinID, info.symbol, info.currency);

		setTimeout(() => {
			hideLoading();
		}, 250);

		try {
			let historicalData = request?.data?.readCoin?.data;

			if(validJSON(historicalData)) {
				historicalData = JSON.parse(historicalData)?.historicalData?.prices;

				let parsed = parseHistoricalCryptoData(historicalData);

				generateMarketChart(divChart, `${info.name} Price`, parsed.labels, parsed.tooltips, info.currency, parsed.prices);

				addMarketCryptoData(divChart, info);
			} else {
				errorNotification("Invalid historical data JSON.");
			}
		} catch(error) {
			errorNotification("Couldn't parse historical data.");

			console.log(error);
		}
	} catch(error) {
		errorNotification(`Couldn't fetch market data for ${info.name}`);
		console.log(error);
	}
}

// TODO: Add watchlist, holdings, and activity buttons.
function addMarketCryptoData(previousElement, info) {
	let div = document.createElement("div");
	div.setAttribute("class", "info-wrapper noselect");

	div.innerHTML = `
		<div class="info-container">
			<span class="rank">Rank: #${info.rank}</span>
			<span class="name">Name: ${info.name}</span>
			<span class="symbol">Symbol: ${info.symbol.toUpperCase()}</span>
			<span class="price">Price: ${currencySymbols[info.currency] + separateThousands(info.price)}</span>
			<span class="ath">ATH: ${currencySymbols[info.currency] + separateThousands(info.ath)}</span>
			<span class="high-24h">24h High: ${currencySymbols[info.currency] + separateThousands(info.high24h)}</span>
			<span class="low-24h">24h Low: ${currencySymbols[info.currency] + separateThousands(info.low24h)}</span>
			<span class="volume">Volume: ${currencySymbols[info.currency] + abbreviateNumber(info.volume, 2)}</span>
			<span class="market-cap">Market Cap: ${currencySymbols[info.currency] + separateThousands(info.marketCap)}</span>
			<span class="price-change">24h Change: ${info.priceChangeDay}%</span>
			<span class="ath-change">ATH Change: ${info.athChange}%</span>
			<span class="supply">Supply: ${abbreviateNumber(info.supply, 2)}</span>
		</div>
	`;

	insertAfter(div, previousElement);
}

function parseCryptoMarketData(currency, coin) {
	let coinID = coin.id;
	let price = coin.current_price;
	let icon = coin.image;
	let marketCap = coin.market_cap;
	let priceChangeDay = formatPercentage(coin.market_cap_change_percentage_24h);
	let athChange = formatPercentage(coin.ath_change_percentage);
	let ath = coin.ath;
	let high24h = coin.high_24h;
	let low24h = coin.low_24h;
	let volume = coin.total_volume;
	let supply = coin.circulating_supply;
	let name = coin.name;
	let symbol = coin.symbol;
	let rank = coin.market_cap_rank;

	return { coinID:coinID, currency:currency, price:price, icon:icon, marketCap:marketCap, price:price, ath:ath, priceChangeDay:priceChangeDay, athChange:athChange, high24h:high24h, low24h:low24h, volume:volume, supply:supply, name:name, symbol:symbol, rank:rank };
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
				coin = findCryptoBySymbol(list, args.symbol, true);
			} else if(!empty(args.id)) {
				coin = findCryptoByID(list, args.id, true);
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

function showCryptoMatches(referenceNode, list) {
	if("matches" in list && list.matches.length > 1) {
		let div = document.createElement("div");
		div.setAttribute("class", "popup-list noselect");

		Object.keys(list.matches).map(index => {
			let match = list.matches[index];
			let symbol = Object.keys(match)[0];
			let id = match[symbol];

			let row = document.createElement("div");
			row.setAttribute("class", "popup-list-row");
			row.setAttribute("data-id", id);
			row.innerHTML = `<span class="symbol">${symbol.toUpperCase()}</span><span class="id">${id}</span>`;

			div.appendChild(row);
		});

		insertAfter(div, referenceNode);
	} else {
		errorNotification("Invalid number of matches.");
	}
}