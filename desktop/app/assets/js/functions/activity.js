// Populates the activity list.
async function populateActivityList(recreate) {
	if(getActivePage().id === "activity-page") {
		if(recreate) {
			divActivityList.innerHTML = `<div class="loading-icon"><div></div><div></div></div>`;
		}
	
		try {
			let activityData = await fetchActivity();

			if(empty(activityData)) {
				divActivityList.innerHTML = `<span class="list-text noselect">No Activities Found</span>`;
				inputActivitySearch.classList.remove("active");
				return;
			}

			inputActivitySearch.classList.add("active");

			let rows = await createActivityListRows(activityData);

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

			filterActivityList(inputActivitySearch.value);
		} catch(error) {
			console.log(error);
			errorNotification("Couldn't fetch activity data.");
		}
	}
}

// Fetches, decrypts, sorts, and returns activity data.
function fetchActivity() {
	return new Promise(async (resolve, reject) => {
		try {
			let userID = await appStorage.getItem("userID");
			let token = await appStorage.getItem("token");
			let key = await appStorage.getItem("key");

			let activity = await readActivity(token, userID);

			if(empty(activity?.data?.readActivity)) {
				resolve();
				return;
			}

			let activityData = {};
	
			let encrypted = activity?.data?.readActivity;
	
			Object.keys(encrypted).map(index => {
				let decrypted = decryptObjectValues(key, encrypted[index]);
				decrypted.activityID = encrypted[index].activityID;
				decrypted.activityTransactionID = encrypted[index].activityTransactionID;
				activityData[decrypted.activityTransactionID] = decrypted;
			});

			let sortedByDate = sortActivityDataByDate(activityData);

			resolve(sortedByDate);
		} catch(error) {
			console.log(error);
			reject(error);
		}
	});
}

// Sorts activity data by date.
function sortActivityDataByDate(activityData) {
	let sorted = {};
	let array = [];

	for(let activity in activityData) {
		array.push([activity, activityData[activity].activityDate]);
	}

	array.sort(function(a, b) {
		return new Date(a[1]).getTime() - new Date(b[1]).getTime();
	});

	array.map(item => {
		sorted[item[0]] = activityData[item[0]];
	});

	return sorted;
}

// Separates activities by type ("crypto" or "stock").
function filterActivitiesByType(activityData) {
	let activitiesCrypto = {};
	let activitiesStocks = {};

	let ids = Object.keys(activityData);
	ids.map(id => {
		let activity = activityData[id];
		if(activity.activityAssetType === "crypto") {
			activitiesCrypto[id] = activity;
		} else {
			activitiesStocks[id] = activity;
		}
	});

	return { crypto:activitiesCrypto, stocks:activitiesStocks };
}

// Filters activities by a given search query.
function filterActivityList(query) {
	let rows = divActivityList.getElementsByClassName("activity-list-row");

	if(empty(query)) {
		for(let i = 0; i < rows.length; i++) {
			rows[i].classList.remove("hidden");
		}

		return;
	}

	query = query.toLowerCase();

	let firstFound;

	for(let i = 0; i < rows.length; i++) {
		rows[i].removeAttribute("style");

		let spans = rows[i].getElementsByTagName("span");
		let values = [];

		for(let j = 0; j < spans.length; j++) {
			values.push(spans[j].textContent.toLowerCase());
		}

		if(values.join(",").includes(query)) {
			if(empty(firstFound)) {
				firstFound = rows[i];
			}

			if(rows[i] !== rows[0] && rows[i] === firstFound) {
				firstFound.style.marginTop = "20px";
			}

			rows[i].classList.remove("hidden");
		} else {
			rows[i].classList.add("hidden");
		}
	}
}

// Creates activity list rows.
async function createActivityListRows(activityData) {
	return new Promise(async (resolve, reject) => {
		try {
			let choices = await getSettingsChoices();

			let transactionIDs = Object.keys(activityData).reverse();

			let rows = [];

			transactionIDs.map(txID => {
				let activity = activityData[txID];

				let div = document.createElement("div");
				div.id = "activity-list-" + txID;
				div.setAttribute("class", "activity-list-row noselect audible-pop");
				div.setAttribute("data-id", activity.activityAssetID);

				let date = choices?.dateFormat === "dd-mm-yyyy" ? formatDateHyphenatedHuman(new Date(Date.parse(activity.activityDate))) : formatDateHyphenated(new Date(Date.parse(activity.activityDate)));

				div.innerHTML = `
					<div class="info-wrapper audible-pop">
						<div class="asset-container audible-pop">
							<span class="date">${date}</span>
							<span class="symbol">${activity.activityAssetSymbol.toUpperCase()}</span>
							<span class="type ${activity.activityType}">${capitalizeFirstLetter(activity.activityType)}</span>
						</div>
						<div class="info-container">
							${ !empty(activity.activityNotes) && activity.activityNotes !== "-" &&
								`<span class="notes">${activity.activityNotes}</span>`
							}
							<span class="amount">Amount: ${separateThousands(activity.activityAssetAmount)}</span>
							<span class="hidden">${activity.activityAssetType}</span>
						</div>
					</div>
				`;

				addActivityListRowEvent(div, activity);

				rows.push(div);
			});

			resolve(rows);
		} catch(error) {
			console.log(error);
			reject(error);
		}
	});
}

// Add event to each activity row.
function addActivityListRowEvent(div, activity) {
	div.addEventListener("click", () => {
		try {
			let html = `
				<span class="popup-input-span">Asset Symbol</span>
				<input class="uppercase" id="popup-input-symbol" type="text" placeholder="Asset Symbol..." spellcheck="false" autocomplete="off">
				<div class="popup-button-wrapper margin-bottom">
					<button id="popup-choice-crypto" class="choice active">Crypto</button>
					<button id="popup-choice-stock" class="choice">Stock</button>
				</div>
				<span class="popup-input-span">Amount</span>
				<input id="popup-input-amount" type="number" placeholder="Amount..." spellcheck="false" autocomplete="off">
				<span class="popup-input-span">Date</span>
				<input id="popup-input-date" type="text" placeholder="Date..." autocomplete="off" spellcheck="false">
				<span class="popup-input-span">Fee</span>
				<input id="popup-input-fee" type="number" placeholder="Fee..." spellcheck="false" autocomplete="off">
				<span class="popup-input-span">Notes</span>
				<input id="popup-input-notes" type="text" placeholder="Notes..." autocomplete="off">
				<div class="popup-button-wrapper three margin-bottom">
					<button id="popup-choice-buy" class="choice small active">Buy</button>
					<button id="popup-choice-sell" class="choice small">Sell</button>
					<button id="popup-choice-transfer" class="choice large">Transfer</button>
				</div>
				<div id="popup-wrapper-trade">
					<span class="popup-input-span">Exchange</span>
					<input id="popup-input-exchange" type="text" placeholder="Exchange..." spellcheck="false" autocomplete="off">
					<span class="popup-input-span">Pair</span>
					<input id="popup-input-pair" type="text" placeholder="Pair..." spellcheck="false" autocomplete="off">
					<span class="popup-input-span">Price</span>
					<input id="popup-input-price" type="number" placeholder="Price..." spellcheck="false" autocomplete="off">
				</div>
				<div id="popup-wrapper-transfer" class="hidden">
					<span class="popup-input-span">From</span>
					<input id="popup-input-from" type="text" placeholder="From..." spellcheck="false" autocomplete="off">
					<span class="popup-input-span">To</span>
					<input id="popup-input-to" type="text" placeholder="To..." spellcheck="false" autocomplete="off">
				</div>
				<button class="action-button delete" id="popup-button-delete-activity">Delete Activity</button>
			`;

			let popup = new Popup(300, 500, "Update Activity", html, { confirmText:"Update", page:"activity" });
			popup.show();

			let popupElements = getActivityPopupElements();
			addActivityPopupListeners(popupElements);
			fillActivityPopupElements(popupElements, activity);

			popupElements.popupInputSymbol.focus();

			flatpickr(popupElements.popupInputDate, {
				enableTime: false,
				dateFormat: "Y-m-d",
				allowInput: true
			});

			addActivityPopupDeleteEvent(popup, document.getElementById("popup-button-delete-activity"), activity.activityID);

			popup.on("confirm", async () => {
				let userID = await appStorage.getItem("userID");
				let token = await appStorage.getItem("token");
				let key = await appStorage.getItem("key");

				let data = parseActivityPopupData(popupElements);

				if(empty(data)) {
					errorNotification("Please fill out all fields.");
					return;
				}

				if("error" in data) {
					errorNotification(data.error);
					return;
				}

				showLoading(5000, "Loading...");

				let result = await getActivityPopupAssetID(data.activityAssetType, data.activityAssetSymbol);

				hideLoading();

				if("id" in result) {
					showLoading(1000, "Updating...");
				
					data.activityAssetID = result.id;

					let encrypted = encryptObjectValues(key, data);

					await updateActivity(token, userID, activity.activityTransactionID, encrypted.activityAssetID, encrypted.activityAssetSymbol, encrypted.activityAssetType, encrypted.activityDate, encrypted.activityType, encrypted.activityAssetAmount, encrypted.activityFee, encrypted.activityNotes, encrypted.activityExchange, encrypted.activityPair, encrypted.activityPrice, encrypted.activityFrom, encrypted.activityTo);

					populateActivityList(true);

					popup.hide();
				} else {
					let showMatches = showAssetMatches(popupElements.popupWrapperTransfer, result, true);

					if(showMatches) {
						popup.bottom.scrollTo(0, popup.bottom.scrollHeight);

						let rows = popup.element.getElementsByClassName("popup-list-row");

						for(let i = 0; i < rows.length; i++) {
							rows[i].addEventListener("click", async () => {
								showLoading(1000, "Updating...");

								data.activityAssetID = rows[i].getAttribute("data-id");

								let encrypted = encryptObjectValues(key, data);

								await updateActivity(token, userID, activity.activityTransactionID, encrypted.activityAssetID, encrypted.activityAssetSymbol, encrypted.activityAssetType, encrypted.activityDate, encrypted.activityType, encrypted.activityAssetAmount, encrypted.activityFee, encrypted.activityNotes, encrypted.activityExchange, encrypted.activityPair, encrypted.activityPrice, encrypted.activityFrom, encrypted.activityTo);

								populateActivityList(true);
							
								popup.hide();
							});
						}
					}
				}
			});
		} catch(error) {
			console.log(error);
			errorNotification("Something went wrong... - EW19");
		}
	});
}

function addActivityPopupDeleteEvent(previousPopup, buttonDelete, activityID) {
	buttonDelete.addEventListener("click", async () => {
		previousPopup.hide();
		
		let userID = await appStorage.getItem("userID");
		let token = await appStorage.getItem("token");

		let popup = new Popup(300, "auto", "Delete Activity", `<span>Are you sure you want to remove this activity?</span>`, { page:"activity" });
		popup.show();
		popup.updateHeight();

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

// Prefills activity popup data.
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

// Returns the asset ID of a crypto or stock.
async function getActivityPopupAssetID(type, symbol) {
	return new Promise(async (resolve, reject) => {
		try {
			if(empty(symbol)) {
				reject();
			}

			if(type === "crypto") {
				let result = await getCoin({ symbol:symbol });
				resolve(result);
			} else {
				symbol = symbol.toUpperCase();

				let currency = await getCurrency();

				let result = await fetchStockPrice(currency, [symbol], true);

				if("error" in result) {
					errorNotification(result.error);
				}

				if(!empty(result) && symbol in result) {
					resolve({ id:"stock-" + symbol.toUpperCase() });
				} else {
					resolve({});
				}
			}
		} catch(error) {
			reject(error);
		}
	});
}

// Returns the activity popup elements.
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

// Validate activity popup data.
function validateActivityData(values) {
	try {
		if(isNaN(values.activityAssetAmount) || isNaN(values.activityFee) || isNaN(values.activityPrice)) {
			return { error:"The values of the amount, fee, and price fields must be numbers."};
		}

		if(parseFloat(values.activityAssetAmount) <= 0) {
			return { error:"Amount must be greater than zero." };
		}

		try {
			new Date(Date.parse(values.activityDate));
		} catch(error) {
			return { error:"Invalid date." };
		}

		if(empty(values.activityAssetSymbol) || empty(values.activityAssetType) || empty(values.activityAssetAmount) || empty(values.activityDate) || empty(values.activityType)) {
			return { error:"At minimum, the symbol, asset type, amount, date, and activity type must be specified." };
		}

		if(values.activityType === "buy" || values.activityType === "sell") {
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
		return { error:"Something went wrong... - EW20" };
	}
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

		return validateActivityData(values);
	} catch(error) {
		console.log(error);
		return { error:"Something went wrong... - EW21" };
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

function showActivityStakingPopup() {
	let html = `
		<span class="popup-input-span">Staked Asset Symbol</span>
		<input class="uppercase" type="text" id="popup-input-symbol" placeholder="Staked Asset Symbol..." spellcheck="false" autocomplete="off">
		<span class="popup-input-span">Staked Amount</span>
		<input type="number" id="popup-input-amount" placeholder="Staked Amount..." spellcheck="false" autocomplete="off">
		<span class="popup-input-span">Asset APY</span>
		<input type="number" id="popup-input-apy" placeholder="Asset APY..." spellcheck="false" autocomplete="off">
		<span class="hidden" id="popup-span-output"></span>
	`;

	let popup = new Popup(300, "auto", "Staking Calculator", html, { cancelText:"Dismiss", confirmText:"Calculate", page:"activity" });
	popup.show();
	popup.updateHeight();
	
	let popupInputSymbol = document.getElementById("popup-input-symbol");
	let popupInputAmount = document.getElementById("popup-input-amount");
	let popupInputAPY = document.getElementById("popup-input-apy");
	let popupSpanOutput = document.getElementById("popup-span-output");

	popup.on("confirm", async () => {
		let currency = await getCurrency();

		let symbol = popupInputSymbol.value;
		let amount = popupInputAmount.value;
		let apy = popupInputAPY.value;

		if(!empty(symbol) && !empty(amount) && !isNaN(amount) && amount > 0 && !isNaN(apy) && apy > 0) {
			let result = await getCoin({ symbol:symbol });

			if("id" in result) {
				let id = result.id;

				let marketData = await cryptoAPI.getMarketByID(currency, id);
				let price = marketData[0].current_price;
				popupSpanOutput.innerHTML = calculateStakingRewards(currency, symbol, amount, apy, price);
				popupSpanOutput.classList.remove("hidden");
				popupSpanOutput.classList.remove("margin-top");
				popup.updateHeight();
			} else {
				popupSpanOutput.innerHTML = "";
				popupSpanOutput.classList.add("hidden");

				let showMatches = showAssetMatches(popupInputAPY, result, false);

				if(showMatches) {
					popup.setSize(360, "auto");
					popup.updateHeight();

					popup.bottom.scrollTo(0, popup.bottom.scrollHeight);

					let rows = popup.element.getElementsByClassName("popup-list-row");

					for(let i = 0; i < rows.length; i++) {
						rows[i].addEventListener("click", async () => {
							let id = rows[i].getAttribute("data-id");

							let marketData = await cryptoAPI.getMarketByID(currency, id);
							let price = marketData[0].current_price;
							popupSpanOutput.innerHTML = calculateStakingRewards(currency, symbol, amount, apy, price);
							popupSpanOutput.classList.remove("hidden");
							popupSpanOutput.classList.add("margin-top");
							popup.updateHeight();
						});
					}
				}
			}
		} else {
			popupSpanOutput.innerHTML = "";
			popupSpanOutput.classList.add("hidden");
			popup.updateHeight();
			errorNotification("Please fill out all fields, and enter the amount and APY as numbers.");
		}
	});
}

function showActivityMiningPopup() {
	let html = `
		<span class="popup-input-span">Mining Asset Symbol</span>
		<input class="uppercase" type="text" id="popup-input-symbol" placeholder="Mining Asset Symbol..." spellcheck="false" autocomplete="off">
		<span class="popup-input-span">Equipment Cost</span>
		<input type="number" id="popup-input-equipment-cost" placeholder="Equipment Cost..." spellcheck="false" autocomplete="off">
		<span class="popup-input-span">Daily Amount</span>
		<input type="number" id="popup-input-daily-amount" placeholder="Daily Amount..." spellcheck="false" autocomplete="off">
		<span class="popup-input-span">Daily Power Cost</span>
		<input type="number" id="popup-input-daily-power-cost" placeholder="Daily Power Cost..." spellcheck="false" autocomplete="off">
		<span class="hidden" id="popup-span-output"></span>
	`;

	let popup = new Popup(340, "auto", "Mining Calculator", html, { cancelText:"Dismiss", confirmText:"Calculate", page:"activity" });
	popup.show();
	popup.updateHeight();
	
	let popupInputSymbol = document.getElementById("popup-input-symbol");
	let popupInputEquipmentCost = document.getElementById("popup-input-equipment-cost");
	let popupInputDailyAmount = document.getElementById("popup-input-daily-amount");
	let popupInputDailyPowerCost = document.getElementById("popup-input-daily-power-cost");
	let popupSpanOutput = document.getElementById("popup-span-output");

	popup.on("confirm", async () => {
		let currency = await getCurrency();

		let symbol = popupInputSymbol.value;
		let equipmentCost = popupInputEquipmentCost.value;
		let dailyAmount = popupInputDailyAmount.value;
		let dailyPowerCost = popupInputDailyPowerCost.value;

		if(!empty(symbol) && !isNaN(equipmentCost) && equipmentCost > 0 && !isNaN(dailyAmount) && dailyAmount > 0 && !isNaN(dailyPowerCost)) {
			let result = await getCoin({ symbol:symbol });

			if("id" in result) {
				let id = result.id;

				let marketData = await cryptoAPI.getMarketByID(currency, id);
				let price = marketData[0].current_price;
				popupSpanOutput.innerHTML = calculateMiningRewards(currency, symbol, price, equipmentCost, dailyAmount, dailyPowerCost);
				popupSpanOutput.classList.remove("hidden");
				popupSpanOutput.classList.remove("margin-top");
				popup.updateHeight();
			} else {
				popupSpanOutput.innerHTML = "";
				popupSpanOutput.classList.add("hidden");

				let showMatches = showAssetMatches(popupInputDailyPowerCost, result, false);

				if(showMatches) {
					popup.setSize(360, "auto");
					popup.updateHeight();

					popup.bottom.scrollTo(0, popup.bottom.scrollHeight);

					let rows = popup.element.getElementsByClassName("popup-list-row");

					for(let i = 0; i < rows.length; i++) {
						rows[i].addEventListener("click", async () => {
							let id = rows[i].getAttribute("data-id");

							let marketData = await cryptoAPI.getMarketByID(currency, id);
							let price = marketData[0].current_price;
							popupSpanOutput.innerHTML = calculateMiningRewards(currency, symbol, price, equipmentCost, dailyAmount, dailyPowerCost);
							popupSpanOutput.classList.remove("hidden");
							popupSpanOutput.classList.add("margin-top");
							popup.updateHeight();
						});
					}
				}
			}
		} else {
			popupSpanOutput.innerHTML = "";
			popupSpanOutput.classList.add("hidden");
			popup.updateHeight();
			errorNotification("Please fill out all fields, and enter the amount and APY as numbers.");
		}
	});
}

function showActivityDividendPopup() {
	let html = `
		<span class="popup-input-span">Number Of Shares</span>
		<input type="number" id="popup-input-amount" placeholder="Number Of Shares..." spellcheck="false" autocomplete="off">
		<span class="popup-input-span">Annual Dividend Per Share</span>
		<input type="number" id="popup-input-dividend" placeholder="Annual Dividend Per Share..." spellcheck="false" autocomplete="off">
		<span class="hidden" id="popup-span-output"></span>
	`;

	let popup = new Popup(340, "auto", "Dividend Calculator", html, { cancelText:"Dismiss", confirmText:"Calculate", page:"activity" });
	popup.show();
	popup.updateHeight();

	let popupInputAmount = document.getElementById("popup-input-amount");
	let popupInputDividend = document.getElementById("popup-input-dividend");
	let popupSpanOutput = document.getElementById("popup-span-output");

	popup.on("confirm", async () => {
		let currency = await getCurrency();

		let amount = popupInputAmount.value;
		let dividend = popupInputDividend.value;

		if(!empty(amount) && !isNaN(amount) && amount > 0 && !isNaN(dividend) && dividend > 0) {
			popupSpanOutput.innerHTML = calculateDividendRewards(currency, amount, dividend);
			popupSpanOutput.classList.remove("hidden");
			popup.updateHeight();
		} else {
			popupSpanOutput.innerHTML = "";
			popupSpanOutput.classList.add("hidden");
			popup.updateHeight();
			errorNotification("Please fill out all fields, and enter the amount and APY as numbers.");
		}
	});
}

function showActivityMortgagePopup() {
	let html = `
		<span class="popup-input-span">Property Price</span>
		<input type="number" id="popup-input-price" placeholder="Property Price..." spellcheck="false" autocomplete="off">
		<span class="popup-input-span">Deposit</span>
		<input type="number" id="popup-input-deposit" placeholder="Deposit..." spellcheck="false" autocomplete="off">
		<span class="popup-input-span">Term In Years</span>
		<input type="number" id="popup-input-term" placeholder="Term In Years..." spellcheck="false" autocomplete="off">
		<span class="popup-input-span">Interest Rate</span>
		<input type="number" id="popup-input-interest" placeholder="Interest Rate..." spellcheck="false" autocomplete="off">
		<span class="hidden" id="popup-span-output"></span>
	`;

	let popup = new Popup(340, "auto", "Mortgage Calculator", html, { cancelText:"Dismiss", confirmText:"Calculate", page:"activity" });
	popup.show();
	popup.updateHeight();

	let popupInputPrice = document.getElementById("popup-input-price");
	let popupInputDeposit = document.getElementById("popup-input-deposit");
	let popupInputTerm = document.getElementById("popup-input-term");
	let popupInputInterest = document.getElementById("popup-input-interest");
	let popupSpanOutput = document.getElementById("popup-span-output");

	popup.on("confirm", async () => {
		let currency = await getCurrency();

		let price = popupInputPrice.value;
		let deposit = popupInputDeposit.value;
		let term = popupInputTerm.value;
		let interest = popupInputInterest.value;

		if(!isNaN(price) && price > 0 && !isNaN(deposit) && deposit > 0 && !isNaN(term) && term > 0 && !isNaN(interest) && interest > 0) {
			popupSpanOutput.innerHTML = calculateMortgage(currency, price, deposit, term, interest);
			popupSpanOutput.classList.remove("hidden");
			popup.updateHeight();
		} else {
			popupSpanOutput.innerHTML = "";
			popupSpanOutput.classList.add("hidden");
			popup.updateHeight();
			errorNotification("Please fill out all fields, and enter them as numbers.");
		}
	});
}

function showActivityTaxPopup() {
	let html = `
		<span class="popup-input-span">Yearly Income</span>
		<input type="number" id="popup-input-income" placeholder="Yearly Income..." spellcheck="false" autocomplete="off">
		<span class="hidden" id="popup-span-output"></span>
	`;

	let popup = new Popup(340, "auto", "Tax Calculator", html, { cancelText:"Dismiss", confirmText:"Calculate", page:"activity" });
	popup.show();
	popup.updateHeight();

	let popupInputIncome = document.getElementById("popup-input-income");
	let popupSpanOutput = document.getElementById("popup-span-output");

	popup.on("confirm", async () => {
		let currency = await getCurrency();

		let income = popupInputIncome.value;

		if(!isNaN(income) && income > 0) {
			popupSpanOutput.innerHTML = calculateTax(currency, income);
			popupSpanOutput.classList.remove("hidden");
			popup.updateHeight();
		} else {
			popupSpanOutput.innerHTML = "";
			popupSpanOutput.classList.add("hidden");
			popup.updateHeight();
			errorNotification("Please fill out the field, and enter the value as a number.");
		}
	});
}