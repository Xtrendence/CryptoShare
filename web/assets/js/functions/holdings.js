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

			let holdings;
			
			if(getSettingsChoices().transactionsAffectHoldings === "disabled") {
				holdings = await readHolding(token, userID);

				if(empty(holdings?.data?.readHolding)) {
					holdings = {};
					divHoldingsList.innerHTML = `<span class="list-text noselect">No Holdings Found</span>`;
				}
			} else {
				// TODO: Fetch activity and convert into holdings.
				divHoldingsList.innerHTML = `<span class="list-text noselect">No Activity Found</span>`;
			}

			if(empty(holdings)) {
				return;
			}
			
			let holdingsData = {};

			let encrypted = holdings?.data?.readHolding;

			Object.keys(encrypted).map(index => {
				let decrypted = decryptObjectValues(key, encrypted[index]);
				decrypted.holdingID = encrypted[index].holdingID;
				holdingsData[decrypted.holdingAssetID] = decrypted;
			});

			let ids = Object.keys(holdingsData);

			let marketData = await cryptoAPI.getMarketByID(currency, ids.join(","));

			let parsed = createHoldingsListCryptoRows(marketData, holdingsData, currency);

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

function createHoldingsListCryptoRows(marketData, holdingsData, currency) {
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

			addHoldingListCryptoRowEvent(div, holding.holdingID, coinID, symbol);

			output.rows.push(div);
			output.totalValue += value;
		} catch(error) {
			console.log(error);
		}
	}

	return output;
}

function addHoldingListCryptoRowEvent(div, holdingID, holdingAssetID, holdingAssetSymbol) {
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

function setHoldingsUsername() {
	let username = localStorage.getItem("username");
	spanHoldingsUsername.textContent = username;
}