// Show transactions.
buttonDashboardBudgetTransactions.addEventListener("click", () => {
	showSideMenu();
	listTransactions();
});

// Show budget edit menu.
buttonDashboardBudgetEdit.addEventListener("click", () => {
	let html = `
		<button class="action-button block" id="popup-button-budget">Set Monthly Budget</button>
		<button class="action-button block" id="popup-button-income">Set Yearly Income</button>
	`;

	let popup = new Popup(250, "auto", "Update Budget", html, { cancelText:"Dismiss", confirmText:"-", page:"dashboard" });
	popup.show();
	popup.updateHeight();

	document.getElementById("popup-button-budget").addEventListener("click", () => {
		popup.hide();
		showBudgetPopup();
	});

	document.getElementById("popup-button-income").addEventListener("click", () => {
		popup.hide();
		showIncomePopup();
	});
});

// Show popup used to add assets to the user's watchlist.
buttonDashboardWatchlistAdd.addEventListener("click", () => {
	try {
		let html = `
			<span class="popup-input-span">Asset Symbol</span>
			<input class="uppercase" id="popup-input-symbol" type="text" placeholder="Asset Symbol..." spellcheck="false" autocomplete="off">
			<div class="popup-button-wrapper margin-bottom">
				<button id="popup-choice-crypto" class="choice active">Crypto</button>
				<button id="popup-choice-stock" class="choice">Stock</button>
			</div>
		`;

		let popup = new Popup(240, "auto", "Add To Watchlist", html, { confirmText:"Add", page:"dashboard" });
		popup.show();
		popup.updateHeight();

		let popupChoiceCrypto = document.getElementById("popup-choice-crypto");
		let popupChoiceStock = document.getElementById("popup-choice-stock");

		popupChoiceCrypto.addEventListener("click", () => {
			popupChoiceCrypto.classList.add("active");
			popupChoiceStock.classList.remove("active");
		});

		popupChoiceStock.addEventListener("click", () => {
			popupChoiceCrypto.classList.remove("active");
			popupChoiceStock.classList.add("active");
		});

		let inputSymbol = document.getElementById("popup-input-symbol");

		inputSymbol.focus();

		popup.on("confirm", async () => {
			let userID = await appStorage.getItem("userID");
			let token = await appStorage.getItem("token");
			let key = await appStorage.getItem("key");

			let currency = await getCurrency();
			let symbol = inputSymbol.value;

			if(!empty(symbol)) {
				let watchlist = await fetchWatchlist() || {};

				let type = popupChoiceCrypto.classList.contains("active") ? "crypto" : "stock";

				if(type === "crypto") {
					showLoading(5000, "Loading...");

					let result = await getCoin({ symbol:symbol });

					if("id" in result) {
						showLoading(1000, "Adding...");

						let id = result.id;

						if(watchlistExists(watchlist, id)) {
							errorNotification("Asset already in watchlist.");
							return;
						}

						let encrypted = encryptObjectValues(key, {
							assetID: id.toLowerCase(),
							assetSymbol: symbol.toUpperCase(),
							assetType: "crypto",
						});

						await createWatchlist(token, userID, encrypted.assetID, encrypted.assetSymbol, encrypted.assetType);

						populateDashboardWatchlist(true);

						popup.hide();
					} else {
						hideLoading();

						let showMatches = showAssetMatches(inputSymbol, result, false);

						if(showMatches) {
							popup.setSize(360, "auto");
							popup.updateHeight();

							popup.bottom.scrollTo(0, popup.bottom.scrollHeight);

							let rows = popup.element.getElementsByClassName("popup-list-row");

							for(let i = 0; i < rows.length; i++) {
								rows[i].addEventListener("click", async () => {
									showLoading(1000, "Adding...");

									let id = rows[i].getAttribute("data-id");

									if(watchlistExists(watchlist, id)) {
										errorNotification("Asset already in watchlist.");
										return;
									}

									let encrypted = encryptObjectValues(key, {
										assetID: id.toLowerCase(),
										assetSymbol: symbol.toUpperCase(),
										assetType: "crypto",
									});

									await createWatchlist(token, userID, encrypted.assetID, encrypted.assetSymbol, encrypted.assetType);

									populateDashboardWatchlist(true);

									popup.hide();
								});
							}
						}
					}
				} else {
					symbol = symbol.toUpperCase();

					showLoading(5000, "Loading...");

					let resultPrice = await fetchStockPrice(currency, [symbol], true);

					if("error" in resultPrice) {
						errorNotification(resultPrice.error);
						return;
					}

					showLoading(1000, "Adding...");

					let id = "stock-" + symbol;

					if(watchlistExists(watchlist, id)) {
						errorNotification("Asset already in watchlist.");
						return;
					}

					let encrypted = encryptObjectValues(key, {
						assetID: id,
						assetSymbol: symbol,
						assetType: "stock",
					});

					await createWatchlist(token, userID, encrypted.assetID, encrypted.assetSymbol, encrypted.assetType);

					populateDashboardWatchlist(true);

					popup.hide();
				}
			} else {
				errorNotification("Please provide a symbol/ticker to search for.");
			}
		});
	} catch(error) {
		errorNotification("Something went wrong... - EW2");
		console.log(error);
	}
});