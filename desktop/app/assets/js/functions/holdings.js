// Populate holdings list (on both the "Holdings" page, and the "Dashboard" page).
async function populateHoldingsList(recreate, callback = null) {
	if(getActivePage().id === "holdings-page" || getActivePage().id === "dashboard-page") {
		let firstFetchHoldings = firstFetch.holdings;

		if(recreate) {
			spanHoldingsValue.textContent = "-";
			spanDashboardHoldings.textContent = "-";
			divHoldingsList.innerHTML = `<div class="loading-icon"><div></div><div></div></div>`;
		}

		checkBackdrop();

		try {
			let userID = await appStorage.getItem("userID");
			let token = await appStorage.getItem("token");
			let key = await appStorage.getItem("key");

			let currency = await getCurrency();

			let holdingsData = {};

			let choices = await getSettingsChoices();
			
			if(choices.activitiesAffectHoldings === "disabled") {
				let holdings = await readHolding(token, userID);

				if(empty(holdings?.data?.readHolding)) {
					divHoldingsList.innerHTML = `<span class="list-text noselect">No Holdings Found</span>`;
					divDashboardHoldingsList.innerHTML = divHoldingsList.innerHTML;
					return;
				}

				let encrypted = holdings?.data?.readHolding;

				Object.keys(encrypted).map(index => {
					let decrypted = decryptObjectValues(key, encrypted[index]);
					decrypted.holdingID = encrypted[index].holdingID;
					holdingsData[decrypted.holdingAssetID] = decrypted;
				});
			} else {
				let parsedData = await parseActivityAsHoldings();
				holdingsData = parsedData?.holdingsData;

				if(empty(holdingsData)) {
					divHoldingsList.innerHTML = `<span class="list-text noselect">No Activities Found</span>`;
					divDashboardHoldingsList.innerHTML = divHoldingsList.innerHTML;
					return;
				}
			}

			// Used to tell the user their stock API key doesn't work.
			let errorRow = false;

			// Separate crypto and stock holdings.
			let filteredHoldings = filterHoldingsByType(holdingsData);

			// Get holding IDs and symbols.
			let holdingCryptoIDs = Object.keys(filteredHoldings.crypto);
			let holdingStockSymbols = getHoldingSymbols(filteredHoldings.stocks);

			// Get market data based on holding IDs and symbols.
			let marketCryptoData = !empty(holdingCryptoIDs) ? await cryptoAPI.getMarketByID(currency, holdingCryptoIDs.join(",")) : {};

			let marketStocksData = !empty(holdingStockSymbols) ? await fetchStockPrice(currency, holdingStockSymbols, false) : {};
			if("error" in marketStocksData) {
				errorRow = true;

				if(firstFetchHoldings) {
					errorNotification(marketStocksData.error);
				}

				marketStocksData = {};
				holdingStockSymbols = [];
				filteredHoldings.stocks = {};
			}

			// Combine and sort holdings data.
			let sortedHoldingsData = sortHoldingsDataByValue(filteredHoldings.crypto, filteredHoldings.stocks, marketCryptoData, marketStocksData);

			// Get sorted holding data.
			let sortedData = sortedHoldingsData.holdingsData;
			let sortedOrder = sortedHoldingsData.order;

			let parsed = createHoldingsListRows(marketCryptoData, marketStocksData, sortedData, sortedOrder, currency);

			let rows = parsed.rows;

			let totalValue = parseFloat(parsed.totalValue.toFixed(2));

			spanHoldingsValue.textContent = `${currencySymbols[currency] + separateThousands(totalValue)}`;
			spanDashboardHoldings.textContent = spanHoldingsValue.textContent;

			removeHoldingsListErrorRow();
			
			if(divHoldingsList.getElementsByClassName("loading-icon").length > 0 || divHoldingsList.childElementCount !== rows.length) {
				divHoldingsList.innerHTML = "";
			}

			for(let i = 0; i < rows.length; i++) {
				if(divHoldingsList.childElementCount >= i + 1) {
					let current = divHoldingsList.getElementsByClassName("holdings-list-row")[i];
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
					divHoldingsList.appendChild(rows[i]);
				}
			}

			if(errorRow) {
				divHoldingsList.prepend(createHoldingsListErrorRow());
			}

			if(divDashboardHoldingsList.innerHTML !== divHoldingsList.innerHTML) {
				divDashboardHoldingsList.innerHTML = divHoldingsList.innerHTML;
				let dashboardRows = divDashboardHoldingsList.getElementsByClassName("holdings-list-row");
				for(let i = 0; i < dashboardRows.length; i++) {
					dashboardRows[i].addEventListener("click", () => {
						setPage("holdings");
					});
				}
			}
		} catch(error) {
			console.log(error);
			errorNotification("Couldn't fetch holdings.");
		}
	}
}

// Removes the error row that is shown on the "Holdings" page when the user's stock API key isn't working.
function removeHoldingsListErrorRow() {
	let divError = divHoldingsList.getElementsByClassName("holdings-list-row error");
	for(let i = 0; i < divError.length; i++) {
		divError[i].remove();
	}
}

// Creates the error row that is shown on the "Holdings" page when the user's stock API key isn't working.
async function createHoldingsListErrorRow() {
	let div = document.createElement("div");
	div.id = "holdings-list-error-row";
	div.setAttribute("class", "holdings-list-row error noselect");

	let keyAPI = await appStorage.getItem("keyAPI");

	if(!empty(keyAPI)) {
		div.innerHTML = `
			<div class="icon-wrapper">
				<div class="icon-symbol-wrapper">
					<span>Error</span>
				</div>
			</div>
			<div class="info-wrapper">
				<span class="name">Stock API Error</span>
				<div class="rank-container">
					<span class="rank">Limit Exceeded</span>
				</div>
				<div class="info-container">
					<span>Stock API Limit Exceeded<br>Stock Holdings Omitted</span>
				</div>
			</div>
		`;
	} else {
		div.innerHTML = `
			<div class="icon-wrapper">
				<div class="icon-symbol-wrapper">
					<span>Error</span>
				</div>
			</div>
			<div class="info-wrapper">
				<span class="name">Stock API Error</span>
				<div class="rank-container">
					<span class="rank">Not Set</span>
				</div>
				<div class="info-container">
					<span>Stock API Key Not Set<br>Stock Holdings Omitted</span>
				</div>
			</div>
		`;
	}

	return div;
}

// Sorts holdings by value (price multiplied by amount).
function sortHoldingsDataByValue(holdingsCryptoData, holdingsStocksData, marketCryptoData, marketStocksData) {
	let combined = { ...holdingsCryptoData, ...holdingsStocksData };
	let sorted = {};
	let array = [];
	let order = [];

	marketCryptoData = sortMarketDataByCoinID(marketCryptoData);

	for(let holding in holdingsCryptoData) {
		try {
			let value = holdingsCryptoData[holding].holdingAssetAmount * marketCryptoData[holding].current_price;

			if(value > 0) {
				array.push([holding, value]);
			}
		} catch(error) {
			console.log(error);
			continue;
		}
	}
	
	for(let holding in holdingsStocksData) {
		try {
			let symbol = holdingsStocksData[holding].holdingAssetSymbol.toUpperCase();
			let value = holdingsStocksData[holding].holdingAssetAmount * marketStocksData[symbol].priceData.price;

			if(value > 0) {
				array.push([holding, value]);
			}
		} catch(error) {
			console.log(error);
			continue;
		}
	}

	array.sort(function(a, b) {
		return a[1] - b[1];
	});

	array.reverse().map(item => {
		order.push(item[0]);
		sorted[item[0]] = combined[item[0]];
	});

	return { holdingsData:sorted, order:order };
}

// Returns the symbols of assets in the user's holdings.
function getHoldingSymbols(holdings) {
	let symbols = [];

	Object.keys(holdings).map(id => {
		symbols.push(holdings[id].holdingAssetSymbol);
	});

	return symbols;
}

// Separates holdings by asset type ("crypto" or "stock").
function filterHoldingsByType(holdingsData) {
	let holdingsCrypto = {};
	let holdingsStocks = {};

	let ids = Object.keys(holdingsData);
	ids.map(id => {
		let holding = holdingsData[id];
		if(holding.holdingAssetType === "crypto") {
			holdingsCrypto[id] = holding;
		} else {
			holdingsStocks[id] = holding;
		}
	});

	return { crypto:holdingsCrypto, stocks:holdingsStocks };
}

// Creates holding list row elements.
function createHoldingsListRows(marketCryptoData, marketStocksData, sortedData, sortedOrder, currency) {
	let output = { rows:[], totalValue:0 };

	let ids = sortedOrder;

	marketCryptoData = sortMarketDataByCoinID(marketCryptoData);

	for(let i = 0; i < ids.length; i++) {
		try {
			let id = ids[i];
			
			let holding = sortedData[id];

			let value = 0;

			if(holding.holdingAssetType === "crypto") {
				let coin = marketCryptoData[id];

				let coinID = coin.id;
				let price = coin.current_price;
				let icon = coin.image;
				let priceChangeDay = formatPercentage(coin.market_cap_change_percentage_24h);
				let name = coin.name;
				let symbol = coin.symbol;
				let rank = coin.market_cap_rank || "-";

				let amount = parseFloat(holding.holdingAssetAmount);
				value = parseFloat((amount * price).toFixed(2));

				if(amount <= 0) {
					continue;
				}

				let div = document.createElement("div");
				div.id = "holdings-list-crypto-" + coinID;
				div.setAttribute("class", "holdings-list-row crypto noselect audible-pop");

				div.innerHTML = `
					<div class="icon-wrapper audible-pop">
						<img class="icon" src="${icon}" draggable="false" alt="${name} Icon">
					</div>
					<div class="info-wrapper audible-pop">
						<span class="name">${name}</span>
						<div class="rank-container audible-pop">
							<span class="rank">#${rank}</span>
							<span class="symbol">${symbol.toUpperCase()}</span>
						</div>
						<div class="info-container">
							<div class="top audible-pop">
								<span class="value">Value: ${currencySymbols[currency] + separateThousands(value)}</span>
								<span class="price">Price: ${currencySymbols[currency] + separateThousands(price)}</span>
							</div>
							<div class="bottom audible-pop">
								<span class="amount">Amount: ${separateThousands(amount)}</span>
								<span class="price-change">24h Change: ${priceChangeDay}%</span>
							</div>
						</div>
					</div>
				`;

				if(holding.holdingID === "-") {
					addHoldingListChartRowEvent(div, coinID, symbol, "crypto");
				} else {
					addHoldingListRowEvent(div, holding.holdingID, coinID, symbol, amount, "crypto");
				}

				output.rows.push(div);
			} else {
				let symbol = holding.holdingAssetSymbol.toUpperCase();

				let stock = marketStocksData[symbol].priceData;

				let shortName = stock.shortName;
				let price = stock.price;
				let priceChangeDay = formatPercentage(stock.change);

				let amount = parseFloat(holding.holdingAssetAmount);
				value = parseFloat((amount * price).toFixed(2));

				if(amount <= 0) {
					continue;
				}

				let div = document.createElement("div");
				div.id = "holdings-list-stock-" + symbol;
				div.setAttribute("class", "holdings-list-row stock noselect audible-pop");

				div.innerHTML = `
					<div class="icon-wrapper audible-pop">
						<div class="icon-symbol-wrapper">
							<span>${symbol}</span>
						</div>
					</div>
					<div class="info-wrapper audible-pop">
						<span class="name">${shortName}</span>
						<div class="rank-container audible-pop">
							<span class="rank">-</span>
							<span class="symbol">${symbol.toUpperCase()}</span>
						</div>
						<div class="info-container">
							<div class="top audible-pop">
								<span class="value">Value: ${currencySymbols[currency] + separateThousands(value)}</span>
								<span class="price">Price: ${currencySymbols[currency] + separateThousands(price)}</span>
							</div>
							<div class="bottom audible-pop">
								<span class="amount">Amount: ${separateThousands(amount)}</span>
								<span class="price-change">24h Change: ${priceChangeDay}%</span>
							</div>
						</div>
					</div>
				`;

				if(holding.holdingID === "-") {
					addHoldingListChartRowEvent(div, id, symbol, "stock");
				} else {
					addHoldingListRowEvent(div, holding.holdingID, id, symbol, amount, "stock");
				}

				output.rows.push(div);
			}
			
			output.totalValue += value;
		} catch(error) {
			console.log(error);
		}
	}

	return output;
}

// Add event to holding list rows to show the individual holding's performance chart.
function addHoldingListChartRowEvent(div, id, symbol, type) {
	div.addEventListener("click", async () => {
		try {
			let days = dayRangeArray(previousYear(new Date()), new Date());

			let data = {};
			if(type === "crypto") {
				data = await fetchHoldingsCryptoHistoricalData([id]);
			} else {
				data = await fetchHoldingsStocksHistoricalData(days, [id], [symbol]);
			}

			let prices = data.prices;
			let activities = filterActivitiesByAssetID(data.activities, id);

			showLoading(5000, "Parsing...");

			let dates = await parseActivityAsDatedValue(days, prices, activities);

			setTimeout(() => {
				hideLoading();
			}, 500);

			showHoldingsPerformanceChart(dates, { symbol:symbol });
		} catch(error) {
			console.log(error);
			errorNotification("Something went wrong... - EW54");
		}
	});
}

// Add event to holding list rows to show popup through which users can modify the holding amount.
function addHoldingListRowEvent(div, holdingID, holdingAssetID, holdingAssetSymbol, amount, holdingAssetType) {
	div.addEventListener("click", () => {
		try {
			let html = `
				<span class="popup-input-span">Amount</span>
				<input id="popup-input-amount" type="number" placeholder="Amount..." value="${amount}" spellcheck="false" autocomplete="off">
				<button class="action-button delete" id="popup-button-delete">Delete Asset</button>
			`;
			let popup = new Popup(300, "auto", `Update ${holdingAssetSymbol.toUpperCase()} Amount`, html, { confirmText:"Update", page:"holdings" });
			popup.show();
			popup.updateHeight();

			addHoldingPopupDeleteEvent(popup, document.getElementById("popup-button-delete"), holdingID, holdingAssetSymbol);

			let inputAmount = document.getElementById("popup-input-amount");

			inputAmount.focus();
		
			popup.on("confirm", async () => {	
				showLoading(1500, "Updating...");

				let amount = inputAmount.value;
		
				if(!empty(amount) && !isNaN(amount) && amount > 0) {
					let userID = await appStorage.getItem("userID");
					let token = await appStorage.getItem("token");
					let key = await appStorage.getItem("key");

					let encrypted = encryptObjectValues(key, {
						holdingAssetID: holdingAssetID,
						holdingAssetSymbol: holdingAssetSymbol,
						holdingAssetAmount: amount,
						holdingAssetType: holdingAssetType
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
			errorNotification("Something went wrong... - EW55");
			console.log(error);
		}
	});
}

function addHoldingPopupDeleteEvent(previousPopup, buttonDelete, holdingID, holdingAssetSymbol) {
	buttonDelete.addEventListener("click", async () => {
		previousPopup.hide();
		
		let userID = await appStorage.getItem("userID");
		let token = await appStorage.getItem("token");

		let popup = new Popup(300, "auto", "Delete Asset", `<span>Are you sure you want to remove ${holdingAssetSymbol.toUpperCase()} from your portfolio?</span>`, { page:"holdings" });
		popup.show();
		popup.updateHeight();

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

async function setHoldingsUsername() {
	let username = await appStorage.getItem("username");
	spanHoldingsUsername.textContent = username;
}

// Convert activities to holding data.
function parseActivityAsHoldings() {
	return new Promise(async (resolve, reject) => {
		try {
			let activityData = await fetchActivity();

			if(empty(activityData)) {
				resolve();
				return;
			}

			let transactionIDs = Object.keys(activityData);
			let holdings = {};

			for(let i = 0; i < transactionIDs.length; i++) {
				let activity = activityData[transactionIDs[i]];

				let activityAssetID = activity.activityAssetID;
				let activityAssetSymbol = activity.activityAssetSymbol;
				let activityAssetAmount = parseFloat(activity.activityAssetAmount);
				let activityAssetType = activity.activityAssetType;
				let activityType = activity.activityType;
				let activityFrom = activity.activityFrom;
				let activityTo = activity.activityTo;
				let activityFromAndTo = activityFrom + activityTo;

				if(!(activityAssetID in holdings) && (activityType !== "transfer" || (activityType === "transfer" && activityFromAndTo.match(/(\+|\-)/gi)))) {
					holdings[activityAssetID] = {
						holdingAssetAmount: activityAssetAmount,
						holdingAssetID: activityAssetID,
						holdingAssetSymbol: activityAssetSymbol,
						holdingAssetType: activityAssetType,
						holdingID: "-"
					};

					if(activityType === "sell") {
						holdings[activityAssetID].holdingAssetAmount = -activityAssetAmount;
					}

					if(activityFromAndTo.match(/(\+)/gi)) {
						holdings[activityAssetID].holdingAssetAmount = activityAssetAmount;
					} else if(activityFromAndTo.match(/\-/gi)) {
						holdings[activityAssetID].holdingAssetAmount = -activityAssetAmount;
					}

					continue;
				}

				if(activityType === "sell") {
					holdings[activityAssetID].holdingAssetAmount -= activityAssetAmount;
				} else if(activityType === "buy") {
					holdings[activityAssetID].holdingAssetAmount += activityAssetAmount;
				} else if(activityType === "transfer") {
					if(activityFromAndTo.match(/(\+)/gi)) {
						holdings[activityAssetID].holdingAssetAmount += activityAssetAmount;
					} else if(activityFromAndTo.match(/\-/gi)) {
						holdings[activityAssetID].holdingAssetAmount -= activityAssetAmount;
					}
				}
			}

			resolve({ holdingsData:holdings, activityData:activityData });
		} catch(error) {
			console.log(error);
			reject(error);
		}
	});
}

// Fetch the historical market data of one or more crypto assets.
async function fetchHoldingsCryptoHistoricalData(ids = null) {
	return new Promise(async (resolve, reject) => {
		try {
			let userID = await appStorage.getItem("userID");
			let token = await appStorage.getItem("token");

			let currency = await getCurrency();

			let prices = {};
			let parsedData = await parseActivityAsHoldings();
			parsedData.activityData = filterActivitiesByType(parsedData.activityData).crypto;
			let holdings = filterHoldingsByType(parsedData.holdingsData).crypto;

			let coinIDs = Object.keys(holdings);
			if(!empty(ids)) {
				coinIDs = ids;
			}

			for(let i = 0; i < coinIDs.length; i++) {
				setTimeout(async () => {
					showLoading(5000, `Getting Crypto Data... (${i + 1}/${coinIDs.length})`);

					let holding = holdings[coinIDs[i]];

					let request = await readCoin(token, userID, coinIDs[i], holding.holdingAssetSymbol, currency);

					let historicalData = request?.data?.readCoin?.data;

					if(validJSON(historicalData)) {
						historicalData = JSON.parse(historicalData)?.historicalData?.prices;
						prices[coinIDs[i]] = historicalData;
					}

					if(Object.keys(prices).length === coinIDs.length) {
						resolve({ coinIDs:coinIDs, prices:prices, holdings:holdings, activities:parsedData.activityData });
					}
				}, i * 2000);
			}
		} catch(error) {
			console.log(error);
			reject(error);
		}
	});
}

// Fetch the historical market data of one or more stock assets.
function fetchHoldingsStocksHistoricalData(days, ids = null, symbols = null) {
	return new Promise(async (resolve, reject) => {
		try {
			let currency = await getCurrency();

			let prices = {};
			let parsedData = await parseActivityAsHoldings();
			parsedData.activityData = filterActivitiesByType(parsedData.activityData).stocks;
			let holdings = filterHoldingsByType(parsedData.holdingsData).stocks;

			let assetIDs = Object.keys(holdings);
			let assetSymbols = [];
			
			assetIDs.map(id => {
				assetSymbols.push(holdings[id].holdingAssetSymbol.toUpperCase());
			});

			if(!empty(ids)) {
				assetIDs = ids;
			} else {
				resolve({});
				return;
			}

			if(!empty(symbols)) {
				assetSymbols = symbols;
			} else {
				resolve({});
				return;
			}

			let cancelled = false;

			for(let i = 0; i < assetSymbols.length; i++) {
				setTimeout(async () => {
					if(!cancelled) {
						showLoading(5000, `Getting Stocks Data... (${i + 1}/${assetSymbols.length})`);

						let assetID = "stock-" + assetSymbols[i];

						let request = await fetchStockHistorical(currency, assetSymbols[i], false);

						if("error" in request) {
							resolve({ error:request.error });
							hideLoading();
							cancelled = true;
							return;
						}

						let historicalData = request?.data?.historicalData?.chart?.result[0];

						prices[assetID] = parseStockHistoricalDataAsCrypto(days, historicalData);

						if(Object.keys(prices).length === assetIDs.length) {
							resolve({ assetIDs:assetIDs, prices:prices, holdings:holdings, activities:parsedData.activityData });
						}
					}
				}, i * 2000);
			}
		} catch(error) {
			console.log(error);
			reject(error);
		}
	});
}

// Gets the user's holding data on the earliest activity date.
function getInitialDatedValue(activities, futureDays) {
	let transactionIDs = Object.keys(activities);

	let firstActivity = activities[transactionIDs[0]];
	let firstDate = new Date(Date.parse(firstActivity.activityDate));

	let days = dayRangeArray(firstDate, addDays(previousYear(new Date()), 1));

	let dates = { [days[0]]:{ holdings:{} }};

	for(let i = 0; i < days.length; i++) {
		let day = days[i];

		if(i - 1 >= 0) {
			let previous = JSON.parse(JSON.stringify(dates[days[i - 1]]));
			dates[day] = previous;
		}

		for(let j = 0; j < transactionIDs.length; j++) {
			let txID = transactionIDs[j];
			let activity = activities[txID];

			let activityType = activity.activityType;
			let activityFromAndTo = activity.activityFrom + activity.activityTo;

			let activityDate = formatDateHyphenated(new Date(Date.parse(activity.activityDate)));

			if(day === activityDate) {
				let assetID = activity.activityAssetID;
				let amount = parseFloat(activity.activityAssetAmount);

				if(!(assetID in dates[day].holdings)) {
					dates[day].holdings[assetID] = { 
						amount: amount, 
						symbol: activity.activityAssetSymbol,
						holdingAssetType: activity.activityAssetType 
					};
					continue;
				}

				if(activityType === "sell") {
					subtract();
				} else if(activityType === "buy") {
					add();
				} else if(activityType === "transfer") {
					if(activityFromAndTo.match(/(\+)/gi)) {
						add();
					} else if(activityFromAndTo.match(/\-/gi)) {
						subtract();
					}
				}

				function add() {
					dates[day].holdings[assetID].amount += amount;
				}

				function subtract() {
					dates[day].holdings[assetID].amount -= amount;
				}
			}
		}
	}

	let last = dates[futureDays[0]]

	return last;
}

// Loops over every day of the past year (or since the first activity's date), and determines which assets the user had on each day, and how much they were worth on said day.
function parseActivityAsDatedValue(days, prices, activities) {
	return new Promise(async (resolve, reject) => {
		try {
			let dates = {
				[days[0]]: {
					holdings: {},
					totalValue: 0,
					modified: false
				}
			};

			let transactionIDs = Object.keys(activities);
			
			// If the first activity was more than a year ago, then activities before then must be taken into account.
			if(new Date(Date.parse(activities[transactionIDs[0]].activityDate)) < previousYear(new Date())) {
				dates = {
					[days[0]]: {
						...getInitialDatedValue(activities, days),
						totalValue: 0,
						modified: true
					}
				};
			}

			// Loop over days.
			for(let i = 0; i < days.length; i++) {
				let day = days[i];

				// Copy the previous day's data to the current one so it can build up over time to the current day.
				if(i - 1 >= 0) {
					// Object must be copied by value rather than reference, otherwise the content would be the same throughout.
					let previous = JSON.parse(JSON.stringify(dates[days[i - 1]]));
					dates[day] = previous;
				}

				// Loop over activities in case there's one on the day being looped over.
				for(let j = 0; j < transactionIDs.length; j++) {
					let txID = transactionIDs[j];
					let activity = activities[txID];

					let activityType = activity.activityType;
					let activityFromAndTo = activity.activityFrom + activity.activityTo;

					// Format the activity's date to be the same as the ones stored in the "dates" object.
					let activityDate = formatDateHyphenated(new Date(Date.parse(activity.activityDate)));

					// To prevent activities outside the desired date range from being added.
					if(day === activityDate) {
						let assetID = activity.activityAssetID;
						let amount = parseFloat(activity.activityAssetAmount);
						let price = prices[assetID][i][1];

						if(!empty(activity.activityPrice) && parseFloat(activity.activityPrice) > 0) {
							price = parseFloat(activity.activityPrice);
						}

						let value = parseFloat((price * amount).toFixed(3));

						// If the asset doesn't already exist, then its values are set directly instead of being incremented or decremented.
						if(!(assetID in dates[day].holdings)) {
							dates[day].holdings[assetID] = {
								amount: amount,
								value: value,
								price: price,
								symbol: activity.activityAssetSymbol,
								holdingAssetType: activity.activityAssetType
							};

							dates[day].modified = true;

							continue;
						}

						if(activityType === "sell") {
							subtract();
						} else if(activityType === "buy") {
							add();
						} else if(activityType === "transfer") {
							if(activityFromAndTo.match(/(\+)/gi)) {
								add();
							} else if(activityFromAndTo.match(/\-/gi)) {
								subtract();
							}
						}

						function add() {
							dates[day].holdings[assetID].amount += amount;
							dates[day].modified = true;
						}

						function subtract() {
							dates[day].holdings[assetID].amount -= amount;
							dates[day].modified = true;
						}
					}
				}

				// Update the total value on each date.
				let ids = Object.keys(dates[day].holdings);
				let total = 0;
				for(let j = 0; j < ids.length; j++) {
					let id = ids[j];
					let price = prices[id][i][1];
					let value = dates[day].holdings[id].amount * price;
					dates[day].holdings[id].value = value;
					total += value;
				}

				dates[day].totalValue = total;
			}

			// If the current day's data isn't found in the "dates" object, then the current prices are fetched, and the data is added.
			let today = formatDateHyphenated(new Date());
			if(!(today in dates)) {
				let currency = await getCurrency();

				// Get yesterday's holdings.
				let keys = Object.keys(dates);
				let previous = dates[keys[keys.length - 1]];

				// Set the initial value of today's holdings to that of yesterday's.
				dates[today] = JSON.parse(JSON.stringify(previous));
				dates[today].totalValue = 0;

				// Get today's holdings.
				let holdingsToday = dates[today].holdings;

				let filtered = filterHoldingsByType(holdingsToday);

				let idsCrypto = Object.keys(filtered.crypto);

				if(!empty(idsCrypto)) {
					// Get crypto market data for today's holdings.
					let marketData = await cryptoAPI.getMarketByID(currency, idsCrypto.join(","));
					let currentPrices = sortMarketDataByCoinID(marketData);

					Object.keys(filtered.crypto).map(assetID => {
						let amount = dates[today].holdings[assetID].amount;
						let value = amount * currentPrices[assetID].current_price;

						dates[today].holdings[assetID].value = value;
						dates[today].totalValue += value;
					});
				}

				let idsStocks = Object.keys(filtered.stocks);

				if(!empty(idsStocks)) {
					let symbolsStock = [];
					idsStocks.map(assetID => {
						symbolsStock.push(filtered.stocks[assetID].symbol.toUpperCase());
					});

					// Get stock market data for today's holdings.
					let priceData = await fetchStockPrice(currency, symbolsStock, false);

					idsStocks.map(assetID => {
						let symbol = assetID.replace("stock-", "");
						let amount = dates[today].holdings[assetID].amount;
						let value = amount * priceData[symbol].priceData.price;

						dates[today].holdings[assetID].value = value;
						dates[today].totalValue += value;
					});
				}
			}

			resolve(dates);
		} catch(error) {
			console.log(error);
			errorNotification("Something went wrong... - EW56");
			reject(error);
		}
	});
}

// Shows the holding performance chart of one or more assets.
async function showHoldingsPerformanceChart(dates, args = {}) {
	let currency = await getCurrency();

	let popup = new Popup("full", "full", ("symbol" in args ? `${args.symbol.toUpperCase()} Performance` : `Portfolio Performance`), `<div class="chart-wrapper"></div>`, { cancelText:"Dismiss", confirmText:"-", page:"holdings" });

	popup.show();
	popup.bottom.classList.add("less-margin");

	let divChart = popup.element.getElementsByClassName("chart-wrapper")[0];

	let colors = { 
		0: cssValue(divPageHoldings, "--accent-first"), 
		0.35: cssValue(divPageHoldings, "--accent-second"), 
		0.6: cssValue(divPageHoldings, "--accent-third"),
		1: cssValue(divPageHoldings, "--accent-first"),
	};

	dates = filterHoldingsPerformanceData(dates);

	let parsed = parseHoldingsDateData(dates);

	generateChart(divChart, ("symbol" in args ? `${args.symbol.toUpperCase()} Value` : `Portfolio Value`), parsed.labels, parsed.tooltips, currency, parsed.values, colors);

	let stats = getHoldingsPerformanceData(currency, parsed.values);

	let divStats = document.createElement("div");
	divStats.setAttribute("class", "info-wrapper noselect");

	divStats.innerHTML = `<div class="info-container">${stats}</div>`;

	insertAfter(divStats, divChart);
}

// Calculates and returns the holding performance stats.
function getHoldingsPerformanceData(currency, values) {
	let value0d = values.length >= 1 ? values[values.length - 1] : "-";
	let value1d = values.length >= 2 ? values[values.length - 2] : "-";
	let value1w = values.length >= 7 ? values[values.length - 8] : "-";
	let value1m = values.length >= 30 ? values[values.length - 31] : "-";
	let value3m = values.length >= 90 ? values[values.length - 91] : "-";
	let value6m = values.length >= 180 ? values[values.length - 181] : "-";
	let value1y = values.length >= 364 ? values[values.length - 365] : "-";

	let stats = "";

	let currentValue = values[values.length - 1];

	if(!isNaN(value0d) && value0d > 1) {
		value0d = separateThousands(value0d.toFixed(2));
		stats += `<span>Current (${currencySymbols[currency]}): ${value0d}</span>`;
	}
	if(!isNaN(value1d) && value1d > 1) {
		let spanClass = (currentValue - value1d) === 0 ? "" : (currentValue - value1d) > 0 ? "positive" : "negative";
		value1d = separateThousands((currentValue - value1d).toFixed(2));
		if(spanClass === "positive") {
			value1d = `+${value1d}`;
		}
		stats += `<span class="${spanClass}">1D (${currencySymbols[currency]}): ${value1d}</span>`;
	}
	if(!isNaN(value1w) && value1w > 1) {
		let spanClass = (currentValue - value1w) === 0 ? "" : (currentValue - value1w) > 0 ? "positive" : "negative";
		value1w = separateThousands((currentValue - value1w).toFixed(2));
		if(spanClass === "positive") {
			value1w = `+${value1w}`;
		}
		stats += `<span class="${spanClass}">1W (${currencySymbols[currency]}): ${value1w}</span>`;
	}
	if(!isNaN(value1m) && value1m > 1) {
		let spanClass = (currentValue - value1m) === 0 ? "" : (currentValue - value1m) > 0 ? "positive" : "negative";
		value1m = separateThousands((currentValue - value1m).toFixed(2));
		if(spanClass === "positive") {
			value1m = `+${value1m}`;
		}
		stats += `<span class="${spanClass}">1M (${currencySymbols[currency]}): ${value1m}</span>`;
	}
	if(!isNaN(value3m) && value3m > 1) {
		let spanClass = (currentValue - value3m) === 0 ? "" : (currentValue - value3m) > 0 ? "positive" : "negative";
		value3m = separateThousands((currentValue - value3m).toFixed(2));
		if(spanClass === "positive") {
			value3m = `+${value3m}`;
		}
		stats += `<span class="${spanClass}">3M (${currencySymbols[currency]}): ${value3m}</span>`;
	}
	if(!isNaN(value6m) && value6m > 1) {
		let spanClass = (currentValue - value6m) === 0 ? "" : (currentValue - value6m) > 0 ? "positive" : "negative";
		value6m = separateThousands((currentValue - value6m).toFixed(2));
		if(spanClass === "positive") {
			value6m = `+${value6m}`;
		}
		stats += `<span class="${spanClass}">6M (${currencySymbols[currency]}): ${value6m}</span>`;
	}
	if(!isNaN(value1y) && value1y > 1) {
		let spanClass = (currentValue - value1y) === 0 ? "" : (currentValue - value1y) > 0 ? "positive" : "negative";
		value1y = separateThousands((currentValue - value1y).toFixed(2));
		if(spanClass === "positive") {
			value1y = `+${value1y}`;
		}
		stats += `<span class="${spanClass}">1Y (${currencySymbols[currency]}): ${value1y}</span>`;
	}

	return stats;
}

// Initially, when the days of the past year (or since the first activity's date) are generated, they have a property called "modified" that is set to false. When the data of each day is updated, their "modified" property is set to true. Days with no data would not be modified, and are therefore removed from the chart data to avoid missing data.
function filterHoldingsPerformanceData(dates) {
	Object.keys(dates).map(date => {
		let day = dates[date];
		if(!day.modified) {
			delete dates[date];
		}
	});

	return dates;
}

// Generate holdings chart data.
function parseHoldingsDateData(data) {
	let labels = [];
	let tooltips = [];
	let values = [];

	let dates = Object.keys(data);

	dates.map(date => {
		labels.push(new Date(Date.parse(date)));
		tooltips.push(formatDateHuman(new Date(Date.parse(date))));
		values.push(data[date].totalValue);
	});

	return { labels:labels, tooltips:tooltips, values:values };
}

// Returns all activities with a given asset ID.
function filterActivitiesByAssetID(activities, assetID) {
	Object.keys(activities).map(txID => {
		if(activities[txID].activityAssetID !== assetID) {
			delete activities[txID];
		}
	});

	return activities;
}