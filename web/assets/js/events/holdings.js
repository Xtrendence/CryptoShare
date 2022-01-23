// TODO: Add functionality.
buttonHoldingsPerformance.addEventListener("click", () => {
	if(getSettingsChoices().transactionsAffectHoldings === "enabled") {
		
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

						let exists = await cryptoHoldingExists(id);

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
						showAssetMatches(inputAmount, result, false);
						popup.setSize(360, "auto");
						popup.updateHeight();

						let rows = popup.element.getElementsByClassName("popup-list-row");

						for(let i = 0; i < rows.length; i++) {
							rows[i].addEventListener("click", async () => {
								showLoading(1000, "Adding...");

								let id = rows[i].getAttribute("data-id");

								let exists = await cryptoHoldingExists(id);

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

// TODO: Add functionality.
buttonHoldingsAddStockAsset.addEventListener("click", () => {
	
});