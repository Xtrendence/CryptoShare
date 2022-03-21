// Navigate to the "Account" section of the "Settings" page when the user clicks on their username on the "Holdings" page.
divHoldingsCardUsername.addEventListener("click", () => {
	setSettingsPage("account");
	setPage("settings");
});

// Show holdings performance chart when the user clicks on their portfolio's total value.
divHoldingsCardValue.addEventListener("click", () => {
	buttonHoldingsPerformance.click();
});

// Show holdings performance chart.
buttonHoldingsPerformance.addEventListener("click", async () => {
	let choices = await getSettingsChoices();
	if(choices.activitiesAffectHoldings === "enabled") {
		try {
			let activityData = await fetchActivity();
			if(empty(activityData)) {
				errorNotification("No activities found.");
				return;
			}

			let days = dayRangeArray(previousYear(new Date()), new Date());

			let dataCrypto = await fetchHoldingsCryptoHistoricalData(undefined);
			let dataStocks = await fetchHoldingsStocksHistoricalData(days, undefined, undefined);

			if("error" in dataStocks) {
				dataStocks = null;
			}

			let pricesCrypto = dataCrypto?.prices;
			let activitiesCrypto = dataCrypto?.activities;

			let pricesStocks = dataStocks?.prices;
			let activitiesStocks = dataStocks?.activities;

			let pricesCombined = { ...pricesCrypto, ...pricesStocks };
			let activitiesCombined = { ...activitiesCrypto, ...activitiesStocks };

			showLoading(5000, "Parsing...");

			let dates;
			if(!empty(dataStocks)) {
				dates = await parseActivityAsDatedValue(days, pricesCombined, activitiesCombined);
			} else {
				dates = await parseActivityAsDatedValue(days, pricesCrypto, activitiesCrypto);
			}

			setTimeout(() => {
				hideLoading();
			}, 500);

			showHoldingsPerformanceChart(dates, undefined);
		} catch(error) {
			console.log(error);
			errorNotification("Something went wrong... - EW3");
		}
	} else {
		errorNotification("Activities must be set to affect holdings (this can be done in the settings).");
	}
});

// Show popup to add a crypto holding.
buttonHoldingsAddCryptoAsset.addEventListener("click", async () => {
	try {
		let choices = await getSettingsChoices();
		if(choices.activitiesAffectHoldings === "disabled") {
			let html = `
				<span class="popup-input-span">Coin Symbol</span>
				<input class="uppercase" id="popup-input-symbol-crypto" type="text" placeholder="Coin Symbol..." spellcheck="false" autocomplete="off">
				<span class="popup-input-span">Amount</span>
				<input id="popup-input-amount-crypto" type="number" placeholder="Amount..." spellcheck="false" autocomplete="off">
			`;
			let popup = new Popup(240, "auto", "Add Crypto Asset", html, { confirmText:"Add", page:"holdings" });
			popup.show();
			popup.updateHeight();

			let inputSymbol = document.getElementById("popup-input-symbol-crypto");
			let inputAmount = document.getElementById("popup-input-amount-crypto");

			inputSymbol.focus();

			popup.on("confirm", async () => {
				let symbol = inputSymbol.value;
				let amount = inputAmount.value;

				if(!empty(symbol) && !empty(amount) && !isNaN(amount) && amount > 0) {
					let userID = await appStorage.getItem("userID");
					let token = await appStorage.getItem("token");
					let key = await appStorage.getItem("key");

					let result = await getCoin({ symbol:symbol });

					if("id" in result) {
						showLoading(1000, "Adding...");

						let id = result.id;

						let exists = await assetHoldingExists(id);

						let encrypted = encryptObjectValues(key, {
							holdingAssetID: id,
							holdingAssetSymbol: symbol,
							holdingAssetAmount: amount,
							holdingAssetType: "crypto"
						});

						if(exists.exists) {
							await updateHolding(token, userID, exists.holdingID, encrypted.holdingAssetID, encrypted.holdingAssetSymbol, encrypted.holdingAssetAmount, encrypted.holdingAssetType);
							
							errorNotification("Asset was already part of your holdings, but the amount was updated.");
						} else {
							await createHolding(token, userID, encrypted.holdingAssetID, encrypted.holdingAssetSymbol, encrypted.holdingAssetAmount, encrypted.holdingAssetType);
						}

						populateHoldingsList(true);

						popup.hide();
					} else {
						let showMatches = showAssetMatches(inputAmount, result, false);

						if(showMatches) {
							popup.setSize(360, "auto");
							popup.updateHeight();

							popup.bottom.scrollTo(0, popup.bottom.scrollHeight);

							let rows = popup.element.getElementsByClassName("popup-list-row");

							for(let i = 0; i < rows.length; i++) {
								rows[i].addEventListener("click", async () => {
									showLoading(1000, "Adding...");

									let id = rows[i].getAttribute("data-id");

									let exists = await assetHoldingExists(id);

									let encrypted = encryptObjectValues(key, {
										holdingAssetID: id,
										holdingAssetSymbol: symbol,
										holdingAssetAmount: amount,
										holdingAssetType: "crypto"
									});

									if(exists.exists) {
										await updateHolding(token, userID, exists.holdingID, encrypted.holdingAssetID, encrypted.holdingAssetSymbol, encrypted.holdingAssetAmount, encrypted.holdingAssetType);

										errorNotification("Asset was already part of your holdings, but the amount was updated.");
									} else {
										await createHolding(token, userID, encrypted.holdingAssetID, encrypted.holdingAssetSymbol, encrypted.holdingAssetAmount, encrypted.holdingAssetType);
									}

									populateHoldingsList(true);

									popup.hide();
								});
							}
						}
					}
				} else {
					errorNotification("Please fill out both fields, and enter the amount as a number.");
				}
			});
		} else {
			errorNotification("You cannot modify your holdings this way while activities are affecting them. Add an activity instead.");
		}
	} catch(error) {
		errorNotification("Something went wrong... - EW4");
		console.log(error);
	}
});

// Show popup to add a stock holding.
buttonHoldingsAddStockAsset.addEventListener("click", async () => {
	try {
		let choices = await getSettingsChoices();
		if(choices.activitiesAffectHoldings === "disabled") {
			let html = `
				<span class="popup-input-span">Stock Symbol</span>
				<input class="uppercase" id="popup-input-symbol-stock" type="text" placeholder="Stock Symbol..." spellcheck="false" autocomplete="off">
				<span class="popup-input-span">Amount</span>
				<input id="popup-input-amount-stock" type="number" placeholder="Amount..." spellcheck="false" autocomplete="off">
			`;
			let popup = new Popup(240, "auto", "Add Stock Asset", html, { confirmText:"Add", page:"holdings" });
			popup.show();
			popup.updateHeight();

			let inputSymbol = document.getElementById("popup-input-symbol-stock");
			let inputAmount = document.getElementById("popup-input-amount-stock");

			inputSymbol.focus();

			popup.on("confirm", async () => {
				let currency = await getCurrency();

				let symbol = inputSymbol.value;
				let amount = inputAmount.value;

				if(!empty(symbol) && !empty(amount) && !isNaN(amount) && amount > 0) {
					showLoading(5000, "Loading...");

					symbol = symbol.toUpperCase();

					let userID = await appStorage.getItem("userID");
					let token = await appStorage.getItem("token");
					let key = await appStorage.getItem("key");

					let result = await fetchStockPrice(currency, [symbol], true);

					if("error" in result) {
						errorNotification(result.error);
					}

					hideLoading();

					if(!empty(result) && symbol in result) {
						showLoading(1000, "Adding...");

						let id = "stock-" + symbol;

						let exists = await assetHoldingExists(id);

						let encrypted = encryptObjectValues(key, {
							holdingAssetID: id,
							holdingAssetSymbol: symbol,
							holdingAssetAmount: amount,
							holdingAssetType: "stock"
						});

						if(exists.exists) {
							await updateHolding(token, userID, exists.holdingID, encrypted.holdingAssetID, encrypted.holdingAssetSymbol, encrypted.holdingAssetAmount, encrypted.holdingAssetType);
							
							errorNotification("Asset was already part of your holdings, but the amount was updated.");
						} else {
							await createHolding(token, userID, encrypted.holdingAssetID, encrypted.holdingAssetSymbol, encrypted.holdingAssetAmount, encrypted.holdingAssetType);
						}

						populateHoldingsList(true);

						hideLoading();

						popup.hide();
					} else {
						errorNotification("Asset not found.");
					}
				} else {
					errorNotification("Please fill out both fields, and enter the amount as a number.");
				}
			});
		} else {
			errorNotification("You cannot modify your holdings this way while activities are affecting them. Add an activity instead.");
		}
	} catch(error) {
		errorNotification("Something went wrong... - EW5");
		console.log(error);
	}
});

// Used when the window size is small.
buttonHoldingsPerformanceSmall.addEventListener("click", () => {
	buttonHoldingsPerformance.click();
});

// Used when the window size is small.
buttonHoldingsAddCryptoAssetSmall.addEventListener("click", () => {
	buttonHoldingsAddCryptoAsset.click();
});

// Used when the window size is small.
buttonHoldingsAddStockAssetSmall.addEventListener("click", () => {
	buttonHoldingsAddStockAsset.click();
});