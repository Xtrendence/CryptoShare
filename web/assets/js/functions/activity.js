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

function fetchActivity() {
	return new Promise(async (resolve, reject) => {
		try {
			let userID = localStorage.getItem("userID");
			let token = localStorage.getItem("token");
			let key = localStorage.getItem("key");

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
					<span class="amount">Amount: ${separateThousands(activity.activityAssetAmount)}</span>
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
					let showMatches = showAssetMatches(popupElements.popupWrapperTransfer, result, true);

					if(showMatches) {
						popup.bottom.scrollTo(0, popup.bottom.scrollHeight);

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

function showActivityStakingPopup() {
	let html = `
		<input class="uppercase" type="text" id="popup-input-symbol" placeholder="Staked Asset Symbol...">
		<input type="number" id="popup-input-amount" placeholder="Staked Amount...">
		<input type="number" id="popup-input-apy" placeholder="Asset APY...">
		<span class="hidden" id="popup-span-output"></span>
	`;

	let popup = new Popup(300, "auto", "Staking Calculator", html, { cancelText:"Dismiss", confirmText:"Calculate" });
	popup.show();
	popup.updateHeight();
	
	let popupInputSymbol = document.getElementById("popup-input-symbol");
	let popupInputAmount = document.getElementById("popup-input-amount");
	let popupInputAPY = document.getElementById("popup-input-apy");
	let popupSpanOutput = document.getElementById("popup-span-output");

	popup.on("confirm", async () => {
		let currency = getCurrency();

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
		<input class="uppercase" type="text" id="popup-input-symbol" placeholder="Mining Asset Symbol...">
		<input type="number" id="popup-input-equipment-cost" placeholder="Equipment Cost...">
		<input type="number" id="popup-input-daily-amount" placeholder="Daily Amount...">
		<input type="number" id="popup-input-daily-power-cost" placeholder="Daily Power Cost...">
		<span class="hidden" id="popup-span-output"></span>
	`;

	let popup = new Popup(340, "auto", "Mining Calculator", html, { cancelText:"Dismiss", confirmText:"Calculate" });
	popup.show();
	popup.updateHeight();
	
	let popupInputSymbol = document.getElementById("popup-input-symbol");
	let popupInputEquipmentCost = document.getElementById("popup-input-equipment-cost");
	let popupInputDailyAmount = document.getElementById("popup-input-daily-amount");
	let popupInputDailyPowerCost = document.getElementById("popup-input-daily-power-cost");
	let popupSpanOutput = document.getElementById("popup-span-output");

	popup.on("confirm", async () => {
		let currency = getCurrency();

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