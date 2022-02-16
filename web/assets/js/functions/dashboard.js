async function populateDashboardBudget(recreate) {
	if(getActivePage().id === "dashboard-page") {
		if(recreate) {
			divDashboardBudgetList.innerHTML = `<div class="loading-icon"><div></div><div></div></div>`;
		}
		
		try {
			let budgetData = await fetchBudget();

			if(empty(budgetData)) {
				await setDefaultBudgetData();
				budgetData = await fetchBudget();
			}

			if(divDashboardBudgetList.getElementsByTagName("canvas").length === 0) {
				divDashboardBudgetList.innerHTML = `
					<div class="chart-wrapper">
						<canvas class="pie-chart-canvas" id="pie-chart-canvas"></canvas>
					</div>
				`;

				generatePieChart(budgetData);
			}
		} catch(error) {
			console.log(error);
			errorNotification("Something went wrong...");
		}
	}
}

function generatePieChart(budgetData) {
	let canvas = document.getElementById("pie-chart-canvas");

	let currency = getCurrency();

	let mainContrast = cssValue(document.documentElement, "--main-contrast");

	let backgroundColors = ["#f0bb35", "#67648f", "#c5d145", "#d63e3e", "#3bb85c", "#4f3dbf", "#3ba1db", "#9f54c7"];

	let categories = budgetData.categories;
	let income = budgetData.income;

	let labels = [];
	let values = [];

	Object.keys(categories).map(category => {
		let percentage = categories[category];
		let amount = parseFloat((((percentage * income) / 100) / 12).toFixed(0));
		labels.push(`  ${capitalizeFirstLetter(category)}: ${currencySymbols[currency] + separateThousands(amount)}`);
		values.push(categories[category]);
	});

	new Chart(canvas, {
		type: "doughnut",
		data: {
			labels: labels,
			datasets: [{
				data: values,
				backgroundColor: backgroundColors,
				hoverOffset: 4,
				spacing: 4,
				borderWidth: 0,
				pointStyle: "circle"
			}]
		},
		options: {
			responsive: true,
			legend: {
				display: true,
				position: "right",
				labels: {
					fontColor: mainContrast,
					fontStyle: "bold",
					usePointStyle: true,
				},
			},
			tooltips: {
				callbacks: {
					title: function() {
						return "";
					},
					label: function(item) {
						return `${labels[item.index]} (${values[item.index]}%)`;
					}
				}
			}
		}
	});
}

async function populateDashboardWatchlist(recreate) {
	if(getActivePage().id === "dashboard-page") {
		if(recreate) {
			divDashboardWatchlistList.innerHTML = `<div class="loading-icon"><div></div><div></div></div>`;
		}
		
		try {
			let watchlistData = await fetchWatchlist();

			if(empty(watchlistData)) {
				divDashboardWatchlistList.innerHTML = `<span class="list-text noselect">No Assets In Watchlist</span>`;
				return;
			}

			let currency = getCurrency();

			let filteredWatchlist = filterWatchlistByType(watchlistData);

			let watchlistCryptoIDs = getWatchlistIDs(filteredWatchlist.crypto);
			let watchlistStockSymbols = getWatchlistSymbols(filteredWatchlist.stocks);

			let marketCryptoData = !empty(watchlistCryptoIDs) ? await cryptoAPI.getMarketByID(currency, watchlistCryptoIDs.join(",")) : {};

			let marketStocksData = !empty(watchlistStockSymbols) ? await fetchStockPrice(currency, watchlistStockSymbols, false) : {};
			if("error" in marketStocksData) {
				marketStocksData = {};
				watchlistStockSymbols = [];
				filteredWatchlist.stocks = {};
			}

			let rows = createWatchlistListRows(marketCryptoData, marketStocksData, watchlistData);

			if(divDashboardWatchlistList.getElementsByClassName("loading-icon").length > 0 || divDashboardWatchlistList.childElementCount !== rows.length) {
				divDashboardWatchlistList.innerHTML = "";
			}

			for(let i = 0; i < rows.length; i++) {
				if(divDashboardWatchlistList.childElementCount >= i + 1) {
					let current = divDashboardWatchlistList.getElementsByClassName("watchlist-list-row")[i];
					if(current.innerHTML !== rows[i].innerHTML) {
						let currentInfo = current.getElementsByClassName("info-wrapper")[0];

						if(currentInfo.innerHTML !== rows[i].getElementsByClassName("info-wrapper")[0].innerHTML) {
							currentInfo.innerHTML = rows[i].getElementsByClassName("info-wrapper")[0].innerHTML;
						}
					}
				} else {
					divDashboardWatchlistList.appendChild(rows[i]);
				}
			}
		} catch(error) {
			console.log(error);
			errorNotification("Something went wrong...");
		}
	}
}

function createWatchlistListRows(marketCryptoData, marketStocksData, watchlistData) {
	let currency = getCurrency();

	let rows = [];

	let ids = Object.keys(watchlistData);

	marketCryptoData = sortMarketDataByCoinID(marketCryptoData);

	for(let i = 0; i < ids.length; i++) {
		try {
			let id = ids[i];
			
			let asset = watchlistData[id];

			if(asset.assetType === "crypto") {
				let coin = marketCryptoData[asset.assetID];

				let coinID = coin.id;
				let price = coin.current_price;
				let priceChangeDay = formatPercentage(coin.market_cap_change_percentage_24h);
				let name = coin.name;
				let symbol = coin.symbol;
				let marketCap = coin.market_cap;
				let volume = coin.total_volume;
				let rank = coin.market_cap_rank || "-";

				let div = document.createElement("div");
				div.id = "watchlist-list-crypto-" + coinID;
				div.setAttribute("class", "watchlist-list-row crypto noselect audible-pop");

				div.innerHTML = `
					<div class="info-wrapper audible-pop">
						<span class="name">${name}</span>
						<div class="rank-container audible-pop">
							<span class="rank">#${rank}</span>
							<span class="symbol">${symbol.toUpperCase()}</span>
						</div>
						<div class="info-container">
							<div class="top audible-pop">
								<span class="price">Price: ${currencySymbols[currency] + separateThousands(price)}</span>
								<span class="market-cap">Market Cap: ${currencySymbols[currency] + abbreviateNumber(marketCap, 2)}</span>
							</div>
							<div class="bottom audible-pop">
								<span class="volume">Volume: ${currencySymbols[currency] + abbreviateNumber(volume, 2)}</span>
								<span class="price-change">24h Change: ${priceChangeDay}%</span>
							</div>
						</div>
					</div>
				`;

				addWatchlistRowEvent(div, asset.watchlistID);

				rows.push(div);
			} else {
				let symbol = asset.assetSymbol.toUpperCase();

				let stock = marketStocksData[symbol].priceData;

				let shortName = stock.shortName;
				let price = stock.price;
				let marketCap = stock.marketCap;
				let volume = stock.volume;
				let priceChangeDay = formatPercentage(stock.change);

				let div = document.createElement("div");
				div.id = "watchlist-list-stock-" + symbol;
				div.setAttribute("class", "watchlist-list-row stock noselect audible-pop");

				div.innerHTML = `
					<div class="info-wrapper audible-pop">
						<span class="name">${shortName}</span>
						<div class="rank-container audible-pop">
							<span class="rank">-</span>
							<span class="symbol">${symbol.toUpperCase()}</span>
						</div>
						<div class="info-container">
							<div class="top audible-pop">
								<span class="price">Price: ${currencySymbols[currency] + separateThousands(price)}</span>
								<span class="market-cap">Market Cap: ${currencySymbols[currency] + abbreviateNumber(marketCap, 2)}</span>
							</div>
							<div class="bottom audible-pop">
								<span class="volume">Volume: ${currencySymbols[currency] + abbreviateNumber(volume, 2)}</span>
								<span class="price-change">24h Change: ${priceChangeDay}%</span>
							</div>
						</div>
					</div>
				`;

				addWatchlistRowEvent(div, asset.watchlistID);

				rows.push(div);
			}
		} catch(error) {
			console.log(error);
		}
	}

	return rows;
}

function addWatchlistRowEvent(div, watchlistID) {
	div.addEventListener("click", () => {
		let userID = localStorage.getItem("userID");
		let token = localStorage.getItem("token");

		let popup = new Popup(300, "auto", "Delete Asset", `<span>Are you sure you want to remove this asset from your watchlist?</span>`);
		popup.show();
		popup.updateHeight();

		popup.on("confirm", async () => {
			try {
				showLoading(1500, "Deleting...");

				await deleteWatchlist(token, userID, watchlistID);

				populateDashboardWatchlist(true);

				hideLoading();

				popup.hide();
			} catch(error) {
				console.log(error);
				errorNotification("Couldn't delete asset.");
			}
		});
	});
}

function getWatchlistIDs(watchlist) {
	let ids = [];

	Object.keys(watchlist).map(id => {
		ids.push(watchlist[id].assetID);
	});

	return ids;
}

function getWatchlistSymbols(watchlist) {
	let symbols = [];

	Object.keys(watchlist).map(id => {
		symbols.push(watchlist[id].assetSymbol);
	});

	return symbols;
}

function filterWatchlistByType(watchlistData) {
	let watchlistCrypto = {};
	let watchlistStocks = {};

	let ids = Object.keys(watchlistData);
	ids.map(id => {
		let asset = watchlistData[id];
		if(asset.assetType === "crypto") {
			watchlistCrypto[id] = asset;
		} else {
			watchlistStocks[id] = asset;
		}
	});

	return { crypto:watchlistCrypto, stocks:watchlistStocks };
}

function watchlistExists(watchlist, id) {
	let exists = false;

	Object.keys(watchlist).map(index => {
		let asset = watchlist[index];
		if(asset?.assetID === id) {
			exists = true;
		}
	});

	return exists;
}

function fetchWatchlist() {
	return new Promise(async (resolve, reject) => {
		try {
			let userID = localStorage.getItem("userID");
			let token = localStorage.getItem("token");
			let key = localStorage.getItem("key");

			let watchlist = await readWatchlist(token, userID);

			if(empty(watchlist?.data?.readWatchlist)) {
				resolve();
				return;
			}

			let watchlistData = {};
	
			let encrypted = watchlist?.data?.readWatchlist;
	
			Object.keys(encrypted).map(index => {
				let decrypted = decryptObjectValues(key, encrypted[index]);
				decrypted.watchlistID = encrypted[index].watchlistID;
				watchlistData[decrypted.watchlistID] = decrypted;
			});

			resolve(watchlistData);
		} catch(error) {
			console.log(error);
			reject(error);
		}
	});
}

function fetchBudget() {
	return new Promise(async (resolve, reject) => {
		try {
			let userID = localStorage.getItem("userID");
			let token = localStorage.getItem("token");
			let key = localStorage.getItem("key");

			let budget = await readBudget(token, userID);

			if(empty(budget?.data?.readBudget)) {
				resolve({});
				return;
			}
	
			let encrypted = budget?.data?.readBudget?.budgetData;

			if(empty(encrypted)) {
				resolve({});
				return;
			}

			let budgetData = CryptoFN.decryptAES(encrypted, key);

			if(!validJSON(budgetData)) {
				resolve({});
				return;
			}

			resolve(JSON.parse(budgetData));
		} catch(error) {
			console.log(error);
			reject(error);
		}
	});
}

function setDefaultBudgetData() {
	return new Promise(async (resolve, reject) => {
		try {
			let userID = localStorage.getItem("userID");
			let token = localStorage.getItem("token");
			let key = localStorage.getItem("key");

			let encrypted = CryptoFN.encryptAES(JSON.stringify(defaultBudgetData), key);

			await updateBudget(token, userID, encrypted);

			resolve();
		} catch(error) {
			console.log(error);
			reject(error);
		}
	});
}