divHoldingsCardUsername.addEventListener("click", () => {
	setSettingsPage("account");
	setPage("settings");
});

divHoldingsCardValue.addEventListener("click", () => {
	buttonHoldingsPerformance.click();
});

// TODO: Add functionality.
buttonHoldingsPerformance.addEventListener("click", async () => {
	if(getSettingsChoices().transactionsAffectHoldings === "enabled") {
		try {
			let activityData = await fetchActivity();
			if(empty(activityData)) {
				errorNotification("No activities found.");
				return;
			}

			let days = dayRangeArray(previousYear(new Date()), new Date());

			let data = await fetchHoldingsCryptoHistoricalData(undefined);

			let prices = data.prices;
			let activities = data.activities;

			showLoading(5000, "Parsing...");

			let dates = await parseActivityAsDatedValue(days, prices, activities);

			setTimeout(() => {
				hideLoading();
			}, 500);

			showHoldingsPerformanceChart(dates, undefined);
		} catch(error) {
			console.log(error);
			errorNotification("Something went wrong...");
		}
	} else {
		errorNotification("Transactions must be set to affect holdings (this can be done in the settings).");
	}
});

buttonHoldingsAddCryptoAsset.addEventListener("click", () => {
	try {
		if(getSettingsChoices().transactionsAffectHoldings === "disabled") {
			let html = `<input class="uppercase" id="popup-input-symbol-crypto" type="text" placeholder="Coin Symbol..."><input id="popup-input-amount-crypto" type="number" placeholder="Amount...">`;
			let popup = new Popup(240, "auto", "Add Crypto Asset", html, { confirmText:"Add" });
			popup.show();
			popup.updateHeight();

			let inputSymbol = document.getElementById("popup-input-symbol-crypto");
			let inputAmount = document.getElementById("popup-input-amount-crypto");

			inputSymbol.focus();

			popup.on("confirm", async () => {
				let symbol = inputSymbol.value;
				let amount = inputAmount.value;

				if(!empty(symbol) && !empty(amount) && !isNaN(amount) && amount > 0) {
					let userID = localStorage.getItem("userID");
					let token = localStorage.getItem("token");
					let key = localStorage.getItem("key");

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
			errorNotification("You cannot modify your holdings this way while transactions are affecting them. Add an activity/transaction instead.");
		}
	} catch(error) {
		errorNotification("Something went wrong...");
		console.log(error);
	}
});

buttonHoldingsAddStockAsset.addEventListener("click", () => {
	try {
		if(getSettingsChoices().transactionsAffectHoldings === "disabled") {
			let html = `<input class="uppercase" id="popup-input-symbol-stock" type="text" placeholder="Stock Symbol..."><input id="popup-input-amount-stock" type="number" placeholder="Amount...">`;
			let popup = new Popup(240, "auto", "Add Stock Asset", html, { confirmText:"Add" });
			popup.show();
			popup.updateHeight();

			let inputSymbol = document.getElementById("popup-input-symbol-stock");
			let inputAmount = document.getElementById("popup-input-amount-stock");

			inputSymbol.focus();

			popup.on("confirm", async () => {
				let currency = getCurrency();

				let symbol = inputSymbol.value;
				let amount = inputAmount.value;

				if(!empty(symbol) && !empty(amount) && !isNaN(amount) && amount > 0) {
					showLoading(5000, "Loading...");

					symbol = symbol.toUpperCase();

					let userID = localStorage.getItem("userID");
					let token = localStorage.getItem("token");
					let key = localStorage.getItem("key");

					let result = await fetchStockPrice(currency, [symbol]);

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
			errorNotification("You cannot modify your holdings this way while transactions are affecting them. Add an activity/transaction instead.");
		}
	} catch(error) {
		errorNotification("Something went wrong...");
		console.log(error);
	}
});