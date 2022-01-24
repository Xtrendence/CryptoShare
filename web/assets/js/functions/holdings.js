async function populateHoldingsList(recreate) {
	if(getActivePage().id === "holdings-page") {
		if(recreate) {
			spanHoldingsValue.textContent = "-";
			divHoldingsList.innerHTML = `<div class="loading-icon"><div></div><div></div></div>`;
		}

		checkBackdrop();

		try {
			let userID = localStorage.getItem("userID");
			let token = localStorage.getItem("token");
			let key = localStorage.getItem("key");

			let currency = getCurrency();

			let holdingsData = {};
			
			if(getSettingsChoices().transactionsAffectHoldings === "disabled") {
				let holdings = await readHolding(token, userID);

				if(empty(holdings?.data?.readHolding)) {
					divHoldingsList.innerHTML = `<span class="list-text noselect">No Holdings Found</span>`;
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
				holdingsData = parsedData.holdingsData;

				if(empty(holdingsData)) {
					divHoldingsList.innerHTML = `<span class="list-text noselect">No Activities Found</span>`;
					return;
				}
			}

			let ids = Object.keys(holdingsData);

			let marketData = await cryptoAPI.getMarketByID(currency, ids.join(","));

			sortedHoldingsData = sortHoldingsDataByValue(holdingsData, marketData);

			holdingsData = sortedHoldingsData.holdingsData;

			let parsed = createHoldingsListCryptoRows(marketData, holdingsData, sortedHoldingsData.order, currency);

			let rows = parsed.rows;
			let totalValue = parseFloat(parsed.totalValue.toFixed(2));

			spanHoldingsValue.textContent = `${currencySymbols[currency] + separateThousands(totalValue)}`;
			
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
		} catch(error) {
			errorNotification("Couldn't fetch holdings.");
		}
	}
}

function createHoldingsListCryptoRows(marketData, holdingsData, order, currency) {
	let output = { rows:[], totalValue:0 };

	let ids = order;

	marketData = sortMarketDataByCoinID(marketData);

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

			if(amount <= 0) {
				continue;
			}

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
							<span class="price-change">Amount: ${separateThousands(amount)}</span>
							<span class="price-change">24h Change: ${priceChangeDay}%</span>
						</div>
					</div>
				</div>
			`;

			if(holding.holdingID === "-") {
				addHoldingListChartCryptoRowEvent(div, coinID, symbol);
			} else {
				addHoldingListCryptoRowEvent(div, holding.holdingID, coinID, symbol, amount);
			}

			output.rows.push(div);
			output.totalValue += value;
		} catch(error) {
			console.log(error);
		}
	}

	return output;
}

// TODO: Add functionality.
function addHoldingListChartCryptoRowEvent(div, coinID, symbol) {
	div.addEventListener("click", async () => {
		try {
			let days = dayRangeArray(previousYear(new Date()), new Date());

			let data = await fetchHoldingsHistoricalData([coinID]);

			let prices = data.prices;
			let activities = filterActivitiesByAssetID(data.activities, coinID);

			showLoading(5000, "Parsing...");

			let dates = await parseActivityAsDatedValue(days, prices, activities);

			setTimeout(() => {
				hideLoading();
			}, 500);

			showHoldingsPerformanceChart(dates, { symbol:symbol });
		} catch(error) {
			console.log(error);
			errorNotification("Something went wrong...");
		}
	});
}

function addHoldingListCryptoRowEvent(div, holdingID, holdingAssetID, holdingAssetSymbol, amount) {
	div.addEventListener("click", () => {
		try {
			let html = `<input id="popup-input-amount-crypto" type="number" placeholder="Amount..." value="${amount}"><button class="action-button delete" id="popup-button-delete-crypto">Delete Asset</button>`;
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

function setHoldingsUsername() {
	let username = localStorage.getItem("username");
	spanHoldingsUsername.textContent = username;
}

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

function sortHoldingsDataByValue(holdingsData, marketData) {
	let sorted = {};
	let array = [];
	let order = [];

	marketData = sortMarketDataByCoinID(marketData);

	for(let holding in holdingsData) {
		let value = holdingsData[holding].holdingAssetAmount * marketData[holding].current_price;

		if(value > 0) {
			array.push([holding, value]);
		}
	}

	array.sort(function(a, b) {
		return a[1] - b[1];
	});

	array.reverse().map(item => {
		order.push(item[0]);
		sorted[item[0]] = holdingsData[item[0]];
	});

	return { holdingsData:sorted, order:order };
}

function fetchHoldingsHistoricalData(ids = null) {
	return new Promise(async (resolve, reject) => {
		try {
			let userID = localStorage.getItem("userID");
			let token = localStorage.getItem("token");

			let currency = getCurrency();

			let prices = {};
			let parsedData = await parseActivityAsHoldings();
			let holdings = parsedData.holdingsData;

			let coinIDs = Object.keys(holdings);
			if(!empty(ids)) {
				coinIDs = ids;
			}

			for(let i = 0; i < coinIDs.length; i++) {
				setTimeout(async () => {
					showLoading(5000, `Getting Data... (${i + 1}/${coinIDs.length})`);

					let holding = holdings[coinIDs[i]];

					let request = await readCoin(token, userID, coinIDs[i], holding.holdingAssetSymbol, currency);

					let historicalData = request?.data?.readCoin?.data;

					if(validJSON(historicalData)) {
						historicalData = JSON.parse(historicalData)?.historicalData?.prices;
						prices[coinIDs[i]] = historicalData;
					}

					if(Object.keys(prices).length === coinIDs.length) {
						hideLoading();
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
					dates[day].holdings[assetID] = { amount:amount };
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
						let value = parseFloat((price * amount).toFixed(3));

						// If the asset doesn't already exist, then its values are set directly instead of being incremented or decremented.
						if(!(assetID in dates[day].holdings)) {
							dates[day].holdings[assetID] = {
								amount: amount,
								value: value,
								price: price
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
					let value =  dates[day].holdings[id].amount * price;
					dates[day].holdings[id].value = value;
					total += value;
				}

				dates[day].totalValue = total;
			}

			// If the current day's data isn't found in the "dates" object, then the current prices are fetched, and the data is added.
			let today = formatDateHyphenated(new Date());
			if(!(today in dates)) {
				let currency = getCurrency();
				let keys = Object.keys(dates);
				let previous = dates[keys[keys.length - 1]];
				dates[today] = JSON.parse(JSON.stringify(previous));
				dates[today].totalValue = 0;
				let ids = Object.keys(dates[today].holdings);
				let marketData = await cryptoAPI.getMarketByID(currency, ids.join(","));
				let currentPrices = sortMarketDataByCoinID(marketData);
				Object.keys(dates[today].holdings).map(assetID => {
					let amount = dates[today].holdings[assetID].amount;
					let value = amount * currentPrices[assetID].current_price;
					dates[today].holdings[assetID].value = value;
					dates[today].totalValue += value;
				});
			}

			resolve(dates);
		} catch(error) {
			console.log(error);
			errorNotification("Something went wrong...");
			reject(error);
		}
	});
}

function showHoldingsPerformanceChart(dates, args = {}) {
	let currency = getCurrency();

	let popup = new Popup("full", "full", ("symbol" in args ? `${args.symbol.toUpperCase()} Performance` : `Portfolio Performance`), `<div class="chart-wrapper"></div>`, { cancelText:"Dismiss", confirmText:"-" });

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

	generateChart(divChart, ("symbol" in args ? `${args.symbol.toUpperCase()} Value` : `Portfolio Value`), parsed.labels, parsed.tooltips, getCurrency(), parsed.values, colors);

	let stats = getHoldingsPerformanceData(currency, parsed.values);

	let divStats = document.createElement("div");
	divStats.setAttribute("class", "info-wrapper noselect");

	divStats.innerHTML = `<div class="info-container">${stats}</div>`;

	insertAfter(divStats, divChart);
}

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

function filterHoldingsPerformanceData(dates) {
	Object.keys(dates).map(date => {
		let day = dates[date];
		if(!day.modified) {
			delete dates[date];
		}
	});

	return dates;
}

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

function filterActivitiesByAssetID(activities, assetID) {
	Object.keys(activities).map(txID => {
		if(activities[txID].activityAssetID !== assetID) {
			delete activities[txID];
		}
	});

	return activities;
}