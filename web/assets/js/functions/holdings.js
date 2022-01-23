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
				holdingsData = await parseActivityAsHoldings();

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
							<span class="price-change">Amount: ${amount}</span>
							<span class="price-change">24h Change: ${priceChangeDay}%</span>
						</div>
					</div>
				</div>
			`;

			if(holding.holdingID === "-") {
				addHoldingListChartCryptoRowEvent(div, coinID, symbol, amount);
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
function addHoldingListChartCryptoRowEvent(div, coinID, symbol, amount) {

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

			resolve(holdings);
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

function fetchHoldingsHistoricalData() {
	return new Promise(async (resolve, reject) => {
		try {
			let userID = localStorage.getItem("userID");
			let token = localStorage.getItem("token");

			let currency = getCurrency();

			let prices = {};
			let holdings = await parseActivityAsHoldings();

			let coinIDs = Object.keys(holdings);

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
						resolve({ coinIDs:coinIDs, prices:prices, holdings:holdings });
					}
				}, i * 2000);
			}
		} catch(error) {
			console.log(error);
			reject(error);
		}
	});
}