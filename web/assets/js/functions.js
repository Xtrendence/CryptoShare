function setTheme(theme) {
	applicationSettings.theme = theme;

	let themeToggles = document.getElementsByClassName("toggle-wrapper theme");
	let favicons = document.getElementsByClassName("favicon");
	let browserTheme = document.getElementsByClassName("browser-theme")[0];

	if(theme === "light") {
		browserTheme.setAttribute("content", "#ffffff");

		for(let i = 0; i < favicons.length; i++) {
			favicons[i].href = favicons[i].href.replace("dark", "light");
		}

		for(let i = 0; i < themeToggles.length; i++) {
			themeToggles[i].classList.add("active");
		}

		localStorage.setItem("theme", "light");

		document.documentElement.classList.add("light");
		document.documentElement.classList.remove("dark");

		setBackground(applicationSettings.theme);
	} else {
		browserTheme.setAttribute("content", "#000000");

		for(let i = 0; i < favicons.length; i++) {
			favicons[i].href = favicons[i].href.replace("light", "dark");
		}

		for(let i = 0; i < themeToggles.length; i++) {
			themeToggles[i].classList.remove("active");
		}

		localStorage.setItem("theme", "dark");

		document.documentElement.classList.remove("light");
		document.documentElement.classList.add("dark");

		setBackground(applicationSettings.theme);
	}
}

function setBackground(theme) {
	divBackground.style.backgroundImage = theme === "light" ? `url("./assets/img/BG-White.png")` : `url("./assets/img/BG-Black.png")`;
}

function setSounds(sounds) {
	let soundToggles = document.getElementsByClassName("toggle-wrapper sounds");

	if(sounds === "enabled") {
		applicationSettings.sounds = "enabled";

		for(let i = 0; i < soundToggles.length; i++) {
			soundToggles[i].classList.add("active");
		}

		localStorage.setItem("sounds", "enabled");
	} else {
		applicationSettings.sounds = "disabled";

		for(let i = 0; i < soundToggles.length; i++) {
			soundToggles[i].classList.remove("active");
		}

		localStorage.setItem("sounds", "disabled");
	}
}

function updatePasswordFields() {
	let wrappers = document.getElementsByClassName("input-password-wrapper");
	for(let i = 0; i < wrappers.length; i++) {
		let div = wrappers[i];
		let input = div.getElementsByTagName("input")[0];

		let button = document.createElement("button");
		button.setAttribute("class", "button-hide-password");
		button.innerHTML = `<svg width="1792" height="1792" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"><path d="M1664 960q-152-236-381-353 61 104 61 225 0 185-131.5 316.5t-316.5 131.5-316.5-131.5-131.5-316.5q0-121 61-225-229 117-381 353 133 205 333.5 326.5t434.5 121.5 434.5-121.5 333.5-326.5zm-720-384q0-20-14-34t-34-14q-125 0-214.5 89.5t-89.5 214.5q0 20 14 34t34 14 34-14 14-34q0-86 61-147t147-61q20 0 34-14t14-34zm848 384q0 34-20 69-140 230-376.5 368.5t-499.5 138.5-499.5-139-376.5-368q-20-35-20-69t20-69q140-229 376.5-368t499.5-139 499.5 139 376.5 368q20 35 20 69z"/></svg>`;

		button.addEventListener("click", () => {
			if(button.classList.contains("active")) {
				input.type = "password";
				button.classList.remove("active");
			} else {
				input.type = "text";
				button.classList.add("active");
			}
		});

		div.appendChild(button);
	}
}

function attemptLogin() {
	let userID = localStorage.getItem("userID");
	let token = localStorage.getItem("token");

	if(!empty(userID) && !empty(token)) {
		verifyToken(userID, token).then(result => {
			setTimeout(() => {
				divLoading.classList.add("hidden");
			}, 1000);

			if("error" in result) {
				if(result.error.includes("Invalid")) {
					removeAccountInfo();
				}
				errorNotification(result.error);
			} else {
				let key = localStorage.getItem("key");

				let settings = { ...defaultSettings, choices:JSON.stringify(defaultChoices) };
				if(!empty(result.settings)) {
					let decryptedSettings = CryptoFN.decryptAES(result.settings.userSettings, key);
					if(validJSON(decryptedSettings)) {
						settings = JSON.parse(decryptedSettings);
					}
				}

				let choices = JSON.parse(settings?.choices);

				setPage(choices?.defaultPage);
				setSettingsPage(choices?.defaultSettingsPage);

				setSettings(settings);

				setAccountInfo(result, false);
				showApp();
			}
		}).catch(error => {
			errorNotification(error);
		});
	} else {
		setTimeout(() => {
			divLoading.classList.add("hidden");
		}, 1000);
	}
}

function finishLogout() {
	clearLogin();
	clearApp();

	removeAccountInfo();

	showLogin();

	Notify.success({
		title: "Logged Out",
		description: "You've been logged out of your account.",
		duration: 5000,
		background: "var(--accent-second)",
		color: "var(--accent-contrast)"
	});
}

function setAccountInfo(info, updateKey) {
	localStorage.setItem("userID", info.userID);
	localStorage.setItem("username", info.username);
	localStorage.setItem("token", info.token);

	if(updateKey) {
		localStorage.setItem("key", info.key);
	}
}

function removeAccountInfo() {
	localStorage.removeItem("userID");
	localStorage.removeItem("username");
	localStorage.removeItem("token");
	localStorage.removeItem("key");
}

function clearLogin() {
	inputLoginUsername.value = "";
	inputLoginPassword.value = "";
	inputCreateUsername.value = "";
	inputCreatePassword.value = "";
	inputCreateRepeatPassword.value = "";
	buttonExistingAccount.click();
}

function showLogin() {
	clearLogin();
	clearApp();
	divPageLogin.classList.remove("hidden");
	divPageApp.classList.add("hidden");
}

function clearApp() {

}

function showApp() {
	clearLogin();
	clearApp();
	divPageLogin.classList.add("hidden");
	divPageApp.classList.remove("hidden");
}

function addNavbarEvents() {
	let items = divNavbar.getElementsByClassName("item");
	
	for(let i = 0; i < items.length; i++) {
		let item = items[i];

		item.addEventListener("click", () => {
			let page = item.id.replace("navbar-", "");
			setPage(page);
		});
	}
}

function getActivePage() {
	let pages = divPageApp.getElementsByClassName("page");
	for(let i = 0; i < pages.length; i++) {
		if(!pages[i].classList.contains("hidden")) {
			return pages[i];
		}
	}
}

function clearActiveNavbarItem() {
	let items = divNavbar.getElementsByClassName("item");
	for(let i = 0; i < items.length; i++) {
		items[i].classList.remove("active");
	}
}

function clearActivePage() {
	let pages = divPageApp.getElementsByClassName("page");
	for(let i = 0; i < pages.length; i++) {
		pages[i].classList.add("hidden");
	}
}

// TODO: Fetch data when switching between pages.
function setPage(page) {
	page = empty(page) ? defaultChoices.defaultPage.toLowerCase() : page.toLowerCase();

	clearActiveNavbarItem();
	clearActivePage();

	document.getElementById(`navbar-${page}`).classList.add("active");
	document.getElementById(`${page}-page`).classList.remove("hidden");

	switch(page) {
		case "chatbot":
			break;
		case "dashboard":
			break;
		case "market":
			populateMarketList(1, 1, true);
			break;
		case "holdings":
			populateHoldingsList(true);
			setHoldingsUsername();
			break;
		case "activity":
			populateActivityList(true);
			break;
		case "settings":
			syncSettings(false);
			break;
	}
}

function getActiveMarketPage() {
	return { 
		type: buttonMarketCrypto.classList.contains("active") ? "crypto" : "stocks", 
		cryptoPage: parseInt(divMarketListCrypto.getAttribute("data-page")),
		stocksPage: parseInt(divMarketListStocks.getAttribute("data-page"))
	};
}

async function populateMarketList(cryptoPage, stocksPage, recreate) {
	if(getActivePage().id === "market-page") {
		divMarketListCrypto.setAttribute("data-page", cryptoPage);
		divMarketListStocks.setAttribute("data-page", stocksPage);

		if(recreate) {
			let active = getActiveMarketPage();

			if(active.type === "crypto") {
				divMarketListCrypto.innerHTML = `<div class="loading-icon"><div></div><div></div></div>`;
				spanMarketPage.textContent = `Page ${active.cryptoPage}`;
			} else {
				divMarketListStocks.innerHTML = `<div class="loading-icon"><div></div><div></div></div>`;
				spanMarketPage.textContent = `Page ${active.stocksPage}`;
			}
		}

		checkBackdrop();
		let currency = getCurrency();
		populateMarketListCrypto(cryptoPage, currency);
	}
}

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

async function populateActivityList(recreate) {
	if(getActivePage().id === "activity-page") {
		if(recreate) {
			divActivityList.innerHTML = `<div class="loading-icon"><div></div><div></div></div>`;
		}
	
		try {
			let userID = localStorage.getItem("userID");
			let token = localStorage.getItem("token");
			let key = localStorage.getItem("key");

			let activity = await readActivity(token, userID);

			if(empty(activity?.data?.readActivity)) {
				activity = {};
				divActivityList.innerHTML = `<span class="list-text noselect">No Activity Found</span>`;
				inputActivitySearch.classList.remove("active");
				return;
			}

			inputActivitySearch.classList.add("active");

			let activityData = {};
	
			let encrypted = activity?.data?.readActivity;
	
			Object.keys(encrypted).map(index => {
				let decrypted = decryptObjectValues(key, encrypted[index]);
				decrypted.activityID = encrypted[index].activityID;
				decrypted.activityTransactionID = encrypted[index].activityTransactionID;
				activityData[decrypted.activityTransactionID] = decrypted;
			});

			let rows = createActivityListRows(activityData);

			if(divActivityList.getElementsByClassName("loading-icon").length > 0 || divActivityList.childElementCount !== rows.length) {
				divActivityList.innerHTML = "";
			}

			for(let i = 0; i < rows.length; i++) {
				if(divActivityList.childElementCount >= i + 1) {
					let current = divActivityList.getElementsByClassName("activity-list-row")[i];
					if(current.innerHTML !== rows[i].innerHTML) {
						current.innerHTML = rows[i].innerHTML;
					}
				} else {
					divActivityList.appendChild(rows[i]);
				}
			}
		} catch(error) {
			console.log(error);
			errorNotification("Couldn't fetch activity data.");
		}
	}
}

function filterActivityList(query) {
	let rows = divActivityList.getElementsByClassName("activity-list-row");

	if(empty(query)) {
		for(let i = 0; i < rows.length; i++) {
			rows[i].classList.remove("hidden");
		}

		return;
	}

	query = query.toLowerCase();

	for(let i = 0; i < rows.length; i++) {
		let spans = rows[i].getElementsByTagName("span");
		let values = [];

		for(let j = 0; j < spans.length; j++) {
			values.push(spans[j].textContent.toLowerCase());
		}

		if(values.join(",").includes(query)) {
			rows[i].classList.remove("hidden");
		} else {
			rows[i].classList.add("hidden");
		}
	}
}

function createActivityListRows(activityData) {
	let transactionIDs = Object.keys(activityData).reverse();

	let rows = [];

	transactionIDs.map(txID => {
		let activity = activityData[txID];

		let div = document.createElement("div");
		div.id = "activity-list-" + txID;
		div.setAttribute("class", "activity-list-row noselect audible-pop");

		div.innerHTML = `
			<div class="info-wrapper audible-pop">
				<div class="asset-container audible-pop">
					<span class="date">${activity.activityDate}</span>
					<span class="symbol">${activity.activityAssetSymbol.toUpperCase()}</span>
					<span class="type ${activity.activityType}">${capitalizeFirstLetter(activity.activityType)}</span>
				</div>
				<div class="info-container">
					${ !empty(activity.activityNotes) && activity.activityNotes !== "-" &&
						`<span class="notes">${activity.activityNotes}</span>`
					}
					<span class="amount">Amount: ${activity.activityAssetAmount}</span>
				</div>
			</div>
		`;

		addActivityListRowEvent(div, activity);

		rows.push(div);
	});

	return rows;
}

function addActivityListRowEvent(div, activity) {
	div.addEventListener("click", () => {
		try {
			let html = `
				<input class="uppercase" id="popup-input-symbol" type="text" placeholder="Asset Symbol...">
				<div class="popup-button-wrapper margin-bottom">
					<button id="popup-choice-crypto" class="choice active">Crypto</button>
					<button id="popup-choice-stock" class="choice">Stock</button>
				</div>
				<input id="popup-input-amount" type="number" placeholder="Amount...">
				<input id="popup-input-date" type="text" placeholder="Date..." autocomplete="off">
				<input id="popup-input-fee" type="number" placeholder="Fee...">
				<input id="popup-input-notes" type="text" placeholder="Notes...">
				<div class="popup-button-wrapper three margin-bottom">
					<button id="popup-choice-buy" class="choice small active">Buy</button>
					<button id="popup-choice-sell" class="choice small">Sell</button>
					<button id="popup-choice-transfer" class="choice large">Transfer</button>
				</div>
				<div id="popup-wrapper-trade">
					<input id="popup-input-exchange" type="text" placeholder="Exchange...">
					<input id="popup-input-pair" type="text" placeholder="Pair...">
					<input id="popup-input-price" type="number" placeholder="Price...">
				</div>
				<div id="popup-wrapper-transfer" class="hidden">
					<input id="popup-input-from" type="text" placeholder="From...">
					<input id="popup-input-to" type="text" placeholder="To...">
				</div>
				<button class="action-button delete" id="popup-button-delete-activity">Delete Activity</button>
			`;

			let popup = new Popup(300, 500, "Update Activity", html, { confirmText:"Update" });
			popup.show();

			let popupElements = getActivityPopupElements();
			addActivityPopupListeners(popupElements);
			fillActivityPopupElements(popupElements, activity);

			popupElements.popupInputSymbol.focus();

			flatpickr(popupElements.popupInputDate, {
				enableTime: true,
				dateFormat: "Y-m-d H:i",
				allowInput: true
			});

			addActivityPopupDeleteEvent(popup, document.getElementById("popup-button-delete-activity"), activity.activityID);

			popup.on("confirm", async () => {
				let userID = localStorage.getItem("userID");
				let token = localStorage.getItem("token");
				let key = localStorage.getItem("key");

				let data = parseActivityPopupData(popupElements);

				if(empty(data)) {
					errorNotification("Please fill out all fields.");
					return;
				}

				if("error" in data) {
					errorNotification(data.error);
					return;
				}

				let result = await getActivityPopupAssetID(data.activityAssetType, data.activityAssetSymbol);

				if("id" in result) {
					showLoading(1000, "Updating...");
				
					data.activityAssetID = result.id;

					let encrypted = encryptObjectValues(key, data);

					await updateActivity(token, userID, activity.activityID, encrypted.activityAssetID, encrypted.activityAssetSymbol, encrypted.activityAssetType, encrypted.activityDate, encrypted.activityType, encrypted.activityAssetAmount, encrypted.activityFee, encrypted.activityNotes, encrypted.activityExchange, encrypted.activityPair, encrypted.activityPrice, encrypted.activityFrom, encrypted.activityTo);

					populateActivityList(true);

					popup.hide();
				} else {
					showAssetMatches(popupElements.popupWrapperTransfer, result);

					let rows = popup.element.getElementsByClassName("popup-list-row");

					for(let i = 0; i < rows.length; i++) {
						rows[i].addEventListener("click", async () => {
							showLoading(1000, "Updating...");

							data.activityAssetID = rows[i].getAttribute("data-id");

							let encrypted = encryptObjectValues(key, data);

							await updateActivity(token, userID, activity.activityID, encrypted.activityAssetID, encrypted.activityAssetSymbol, encrypted.activityAssetType, encrypted.activityDate, encrypted.activityType, encrypted.activityAssetAmount, encrypted.activityFee, encrypted.activityNotes, encrypted.activityExchange, encrypted.activityPair, encrypted.activityPrice, encrypted.activityFrom, encrypted.activityTo);

							populateActivityList(true);
						
							popup.hide();
						});
					}
				}
			});
		} catch(error) {
			console.log(error);
			errorNotification("Something went wrong...");
		}
	});
}

function addActivityPopupDeleteEvent(previousPopup, buttonDelete, activityID) {
	buttonDelete.addEventListener("click", () => {
		previousPopup.hide();
		
		let userID = localStorage.getItem("userID");
		let token = localStorage.getItem("token");

		let popup = new Popup(300, "auto", "Delete Activity", `<span>Are you sure you want to remove this activity?</span>`);
		popup.show();

		popup.on("confirm", async () => {
			try {
				showLoading(1500, "Deleting...");

				await deleteActivity(token, userID, activityID);

				populateActivityList(true);

				hideLoading();

				popup.hide();
			} catch(error) {
				console.log(error);
				errorNotification("Couldn't delete activity.");
			}
		});
	});
}

function fillActivityPopupElements(elements, activity) {
	elements.popupInputSymbol.value = activity.activityAssetSymbol;
	elements.popupInputDate.value = activity.activityDate;
	elements.popupInputAmount.value = activity.activityAssetAmount;
	elements.popupInputFee.value = activity.activityFee;
	elements.popupInputNotes.value = activity.activityNotes;
	elements.popupInputExchange.value = activity.activityExchange;
	elements.popupInputPair.value = activity.activityPair;
	elements.popupInputPrice.value = activity.activityPrice;
	elements.popupInputFrom.value = activity.activityFrom;
	elements.popupInputTo.value = activity.activityTo;

	activity.activityAssetType === "crypto" ? elements.popupChoiceCrypto.click() : elements.popupChoiceStock.click();

	if(activity.activityType === "buy") {
		elements.popupChoiceBuy.click();
	} else if(activity.activityType === "sell") {
		elements.popupChoiceSell.click();
	} else {
		elements.popupChoiceTransfer.click();
	}
}

// Add stock functionality.
async function getActivityPopupAssetID(type, symbol) {
	return new Promise(async (resolve, reject) => {
		if(type === "crypto") {
			let result = await getCoin({ symbol:symbol });
			resolve(result);
		} else {

		}
	});
}

function getActivityPopupElements() {
	return {
		popupInputSymbol: document.getElementById("popup-input-symbol"),
		popupChoiceCrypto: document.getElementById("popup-choice-crypto"),
		popupChoiceStock: document.getElementById("popup-choice-stock"),
		popupInputAmount: document.getElementById("popup-input-amount"),
		popupInputDate: document.getElementById("popup-input-date"),
		popupInputFee: document.getElementById("popup-input-fee"),
		popupInputNotes: document.getElementById("popup-input-notes"),
		popupChoiceBuy: document.getElementById("popup-choice-buy"),
		popupChoiceSell: document.getElementById("popup-choice-sell"),
		popupChoiceTransfer: document.getElementById("popup-choice-transfer"),
		popupInputExchange: document.getElementById("popup-input-exchange"),
		popupInputPair: document.getElementById("popup-input-pair"),
		popupInputPrice: document.getElementById("popup-input-price"),
		popupInputFrom: document.getElementById("popup-input-from"),
		popupInputTo: document.getElementById("popup-input-to"),
		popupWrapperTrade: document.getElementById("popup-wrapper-trade"),
		popupWrapperTransfer: document.getElementById("popup-wrapper-transfer")
	};
}

function parseActivityPopupData(elements) {
	try {
		let activityAssetType = elements.popupChoiceCrypto.classList.contains("active") ? "crypto" : "stock";

		let activityType = "buy";
		if(elements.popupChoiceSell.classList.contains("active")) {
			activityType = "sell";
		} else if(elements.popupChoiceTransfer.classList.contains("active")) {
			activityType = "transfer";
		}

		let values = {
			activityAssetSymbol: elements.popupInputSymbol.value,
			activityAssetType: activityAssetType,
			activityAssetAmount: elements.popupInputAmount.value,
			activityDate: elements.popupInputDate.value,
			activityFee: elements.popupInputFee.value,
			activityNotes: elements.popupInputNotes.value,
			activityType: activityType,
			activityExchange: elements.popupInputExchange.value,
			activityPair: elements.popupInputPair.value,
			activityPrice: elements.popupInputPrice.value,
			activityFrom: elements.popupInputFrom.value,
			activityTo: elements.popupInputTo.value
		};

		if(isNaN(values.activityAssetAmount) || isNaN(values.activityFee) || isNaN(values.activityPrice)) {
			return { error:"The values of the amount, fee, and price fields must be numbers."};
		}

		if(empty(values.activityAssetSymbol) || empty(values.activityAssetType) || empty(values.activityAssetAmount) || empty(values.activityDate) || empty(values.activityType)) {
			return { error:"At minimum, the symbol, asset type, amount, date, and activity type must be specified." };
		}

		if(activityType === "buy" || activityType === "sell") {
			if(empty(values.activityExchange)) {
				values.activityExchange = "";
			}

			if(empty(values.activityPair)) {
				values.activityPair = "";
			}

			if(empty(values.activityPrice)) {
				values.activityPrice = 0;
			}

			values.activityFrom = "";
			values.activityTo = "";
		} else {
			if(empty(values.activityFrom)) {
				values.activityFrom = "";
			}

			if(empty(values.activityTo)) {
				values.activityTo = "";
			}

			values.activityExchange = "";
			values.activityPair = "";
			values.activityPrice = 0;
		}

		if(empty(values.activityFee)) {
			values.activityFee = 0;
		}

		if(empty(values.activityNotes)) {
			values.activityNotes = "-";
		}

		return values;
	} catch(error) {
		console.log(error);
		return { error:"Something went wrong..." };
	}
}

function addActivityPopupListeners(elements) {
	elements.popupChoiceCrypto.addEventListener("click", () => {
		elements.popupChoiceCrypto.classList.add("active");
		elements.popupChoiceStock.classList.remove("active");
	});

	elements.popupChoiceStock.addEventListener("click", () => {
		elements.popupChoiceCrypto.classList.remove("active");
		elements.popupChoiceStock.classList.add("active");
	});

	elements.popupChoiceBuy.addEventListener("click", () => {
		elements.popupWrapperTrade.classList.remove("hidden");
		elements.popupWrapperTransfer.classList.add("hidden");
		elements.popupChoiceBuy.classList.add("active");
		elements.popupChoiceSell.classList.remove("active");
		elements.popupChoiceTransfer.classList.remove("active");
	});

	elements.popupChoiceSell.addEventListener("click", () => {
		elements.popupWrapperTrade.classList.remove("hidden");
		elements.popupWrapperTransfer.classList.add("hidden");
		elements.popupChoiceBuy.classList.remove("active");
		elements.popupChoiceSell.classList.add("active");
		elements.popupChoiceTransfer.classList.remove("active");
	});

	elements.popupChoiceTransfer.addEventListener("click", () => {
		elements.popupWrapperTrade.classList.add("hidden");
		elements.popupWrapperTransfer.classList.remove("hidden");
		elements.popupChoiceBuy.classList.remove("active");
		elements.popupChoiceSell.classList.remove("active");
		elements.popupChoiceTransfer.classList.add("active");
	});
}

function checkBackdrop() {
	let choices = getSettingsChoices();

	if("assetIconBackdrop" in choices && choices.assetIconBackdrop === "enabled") {
		divMarketListCrypto.classList.add("backdrop");
		divMarketListStocks.classList.add("backdrop");
		divHoldingsList.classList.add("backdrop");
	} else {
		divMarketListCrypto.classList.remove("backdrop");
		divMarketListStocks.classList.remove("backdrop");
		divHoldingsList.classList.remove("backdrop");
	}
}

function showAssetMatches(referenceNode, list) {
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

async function generateMarketChart(element, title, labels, tooltips, currency, data) {
	let canvas = document.createElement("canvas");
	canvas.id = "chart-canvas";
	canvas.classList.add("chart-canvas");

	let context = canvas.getContext("2d");

	let mainSecond = cssValue("--main-second");

	let mainContrastDark = cssValue("--main-contrast-dark");

	let gradientStroke = context.createLinearGradient(1000, 0, 300, 0);

	let colors = { 0:"#feac5e", 0.5:"#c779d0", 0.7:"#4bc0c8", 1:"#c779d0" };

	Object.keys(colors).map(stop => {
		gradientStroke.addColorStop(stop, colors[stop]);
	});

	new Chart(canvas, {
		type: "line",
		data: {
			labels: labels,
			datasets:[{
				label: title,
				backgroundColor: "rgba(0,0,0,0)",
				borderColor: gradientStroke,
				data: data,
				pointRadius: 1,
				pointHoverRadius: 6,
			}],
		},
		options: {
			events: ["mousemove", "mouseout", "touchstart", "touchmove"],
			responsive: true,
			legend: {
				display: false
			},
			hover: {
				mode: "index",
				intersect: false,
			},
			scales: {
				xAxes: [{
					beginAtZero: true,
					gridLines: {
						zeroLineColor: mainSecond,
						color: mainSecond,
					},
					ticks: {
						autoSkip: true,
						maxTicksLimit: 12,
						fontColor: mainContrastDark
					},
					type: "time",
					time: {
						unit: "month"
					}
				}],
				yAxes: [{
					beginAtZero: true,
					gridLines: {
						color: mainSecond
					},
					ticks: {
						fontColor: mainContrastDark
					}
				}]
			},
			tooltips: {
				displayColors: false,
				intersect: false,
				callbacks: {
					title: function() {
						return "";
					},
					label: function(item) {
						let price = data[item.index];

						if(price > 1) {
							price = separateThousands(price.toFixed(2));
						}

						return [tooltips[item.index], currencySymbols[currency] + price];
					}
				}
			}
		}
	});

	element.innerHTML = "";
	element.appendChild(canvas);
}

function getCurrency() {
	let currency = getSettingsChoices()?.currency;

	if(empty(currency)) {
		return defaultChoices.currency;
	}

	return currency;
}

function addSettingsNavbarEvents() {
	let items = divSettingsNavbar.getElementsByClassName("item");
	
	for(let i = 0; i < items.length; i++) {
		let item = items[i];

		item.addEventListener("click", () => {
			let page = item.id.replace("settings-navbar-", "");
			setSettingsPage(page);
		});
	}
}

function clearActiveSettingsNavbarItem() {
	let items = divSettingsNavbar.getElementsByClassName("item");
	for(let i = 0; i < items.length; i++) {
		items[i].classList.remove("active");
	}
}

function clearActiveSettingsPage() {
	let pages = divPageSettings.getElementsByClassName("settings-page");
	for(let i = 0; i < pages.length; i++) {
		pages[i].classList.add("hidden");
	}
}

function addSettingsChoiceEvents() {
	let buttons = divPageSettings.getElementsByClassName("choice-button");
	for(let i = 0; i < buttons.length; i++) {
		let button = buttons[i];

		button.addEventListener("click", () => {
			let key = button.parentElement.parentElement.getAttribute("data-key");
			let value = button.getAttribute("data-value");
			setChoice(key, value);
			setSettingsChoices(getSettingsChoices());
			syncSettings(true);
		});
	}
}

function setChoice(key, value) {
	let choicesJSON = localStorage.getItem("choices");
	let choices = defaultChoices;

	if(!empty(choicesJSON) && validJSON(choicesJSON)) {
		let parsed = JSON.parse(choicesJSON);

		Object.keys(parsed).map(choice => {
			choices[choice] = parsed[choice];
		});
	}
	
	choices[key] = value;

	localStorage.setItem("choices", JSON.stringify(choices));
}

function fetchSettings() {
	let userID = localStorage.getItem("userID");
	let token = localStorage.getItem("token");
	let key = localStorage.getItem("key");

	return new Promise((resolve, reject) => {
		readSetting(token, userID).then(result => {
			if(!("errors" in result)) {
				let current = CryptoFN.decryptAES(result.data.readSetting.userSettings, key);
				resolve(current);
			} else {
				errorNotification(result.errors[0]);
			}
		}).catch(error => {
			reject(error);
		});
	});
}

function getSettings() {
	let settings = {};

	settings["theme"] = empty(localStorage.getItem("theme")) ? defaultSettings.theme : localStorage.getItem("theme");
	settings["sounds"] = empty(localStorage.getItem("sounds")) ? defaultSettings.sounds : localStorage.getItem("sounds");

	return settings;
}

function getSettingsChoices() {
	let choicesJSON = localStorage.getItem("choices");

	if(empty(choicesJSON) || !validJSON(choicesJSON)) {
		return defaultChoices;
	} else {
		return JSON.parse(choicesJSON);
	}
}

function setSettingsChoices(choices) {
	let sections = divPageSettings.getElementsByClassName("settings-section");

	for(let i = 0; i < sections.length; i++) {
		let section = sections[i];
		let key = section.getAttribute("data-key");
		let buttons = section.getElementsByClassName("choice-button");

		for(let j = 0; j < buttons.length; j++) {
			let button = buttons[j];
			let value = button.getAttribute("data-value");
			
			button.classList.remove("active");

			if(value === choices[key]) {
				button.classList.add("active");
				processChoice(key, value);
			}
		}
	}
}

function processChoice(key, value) {
	switch(key) {
		case "navbarStyle":
			if(value === "compact") {
				document.documentElement.classList.add("navbar-compact");
			} else {
				document.documentElement.classList.remove("navbar-compact");
			}
	}
}

function setSettings(settings) {
	if(empty(settings)) {
		settings = { ...defaultSettings, choices:JSON.stringify(defaultChoices) };
	}

	Object.keys(settings).map(key => {
		let value = settings[key];
		localStorage.setItem(key, value);
	});

	applicationSettings = getSettings();
	applicationChoices = getSettingsChoices();

	setSettingsChoices(applicationChoices);
}

function setSettingsPage(page) {
	page = empty(page) ? defaultChoices.defaultSettingsPage : page.toLowerCase();

	clearActiveSettingsNavbarItem();
	clearActiveSettingsPage();

	document.getElementById(`settings-navbar-${page}`).classList.add("active");
	document.getElementById(`settings-page-${page}`).classList.remove("hidden");
}

function resetSettings() {
	showLoading(4000, "Resetting Settings...");
	
	localStorage.removeItem("theme");
	localStorage.removeItem("background");
	localStorage.removeItem("sounds");
	localStorage.removeItem("choices");

	setTimeout(() => {
		window.location.reload();
	}, 3500);
}

async function syncSettings(update) {
	let token = localStorage.getItem("token");
	let userID = localStorage.getItem("userID");
	let key = localStorage.getItem("key");

	let settings = { ...getSettings(), choices:JSON.stringify(getSettingsChoices()) };

	let current = await fetchSettings();

	if(validJSON(current)) {
		current = JSON.parse(current);

		Object.keys(current).map(settingKey => {
			if(settingKey in settings) {
				current[settingKey] = settings[settingKey];
			}
		});
	} else {
		current = settings;
	}

	setSettings(current);

	let encrypted = CryptoFN.encryptAES(JSON.stringify(current), key);

	if(update) {
		updateSetting(token, userID, encrypted).then(result => {
			if(!("data" in result) && !("updateSetting" in result.data) && result.data.updateSetting !== "Done") {
				errorNotification("Couldn't update / sync setting.");
				console.log(result);
			}
		}).catch(error => {
			errorNotification(error);
			console.log(error);
		});
	}
}

function addTooltips() {
	tippy(".button-hide-password", { content:"Show/Hide Password", placement:"right" });
	tippy(buttonMarketInfo, { content:"Market Info", placement:"top" });
	tippy(buttonMarketSearch, { content:"Search", placement:"top" });
	tippy(buttonMarketCrypto, { content:"Crypto Market", placement:"left" });
	tippy(buttonMarketStocks, { content:"Stock Market", placement:"right" });
	tippy(buttonMarketPrevious, { content:"Previous", placement:"top" });
	tippy(buttonMarketNext, { content:"Next", placement:"top" });
	tippy(".holdings-card.username", { content:"Account", placement:"right" });
	tippy(".holdings-card.value", { content:"Total Portfolio Value", placement:"right" });
	tippy(buttonSettingsLogoutEverywhere, { content:"Deletes all your active session tokens, causing you to get logged out on every device.", placement:"right" });
}

function showLoading(limit, text = "") {
	hideLoading();

	let element = document.createElement("div");
	element.classList.add("loading-screen");
	element.innerHTML = '<div class="loading-icon"><div></div><div></div></div><span id="loading-text">' + text + '</span>';
	document.body.appendChild(element);

	setTimeout(() => {
		element.remove();
	}, limit);
}

function hideLoading() {
	for(let i = 0; i < document.getElementsByClassName("loading-screen").length; i++) {
		document.getElementsByClassName("loading-screen")[i].remove();
	}
}

function audibleElement(element) {
	try {
		let tags = ["svg", "path", "button"];
		let popType = ["item", "audible-pop"];
		let switchType = ["toggle-wrapper", "toggle-container", "audible-switch"];

		for(let i = 0; i < popType.length; i++) {
			if(element.classList.contains(popType[i]) || element.parentElement.classList.contains(popType[i])) {
				return { audible:true, type:"pop" };
			}
		}

		for(let i = 0; i < switchType.length; i++) {
			if(element.classList.contains(switchType[i]) || element.parentElement.classList.contains(switchType[i])) {
				return { audible:true, type:"switch" };
			}
		}
		
		for(let i = 0; i < tags.length; i++) {
			if(element.tagName.toLowerCase() === tags[i] || element.parentElement.tagName.toLowerCase() === tags[i]) {
				return { audible:true, type:"pop" };
			}
		}

		return { audible:false };
	} catch(error) {
		return { audible:false, error:error };
	}
}

function setHoldingsUsername() {
	let username = localStorage.getItem("username");
	spanHoldingsUsername.textContent = username;
}

function errorNotification(description) {
	Notify.error({
		title: "Error",
		description: description,
		duration: 5000,
		background: "var(--accent-second)",
		color: "var(--accent-contrast)"
	});
}

function addPattern() {
	let items = divNavbarWrapper.getElementsByClassName("item");

	for(let i = 0; i < items.length; i++) {
		items[i].innerHTML += svgNavbarPattern;
	}
}