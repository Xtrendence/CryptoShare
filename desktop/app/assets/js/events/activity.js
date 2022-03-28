// Search for an activity automatically when the input field's value changes (if there are less than 100 activities).
inputActivitySearch.addEventListener("keydown", (event) => {
	if(divActivityList.childElementCount < 100 || empty(inputActivitySearch.value)) {
		filterActivityList(inputActivitySearch.value);
	}

	if(event.key.toLowerCase() === "enter") {
		buttonActivitySearch.click();
	}
});

// Search for an activity automatically when the input field's value changes (if there are less than 100 activities).
inputActivitySearch.addEventListener("keyup", (event) => {
	if(divActivityList.childElementCount < 100 || empty(inputActivitySearch.value)) {
		filterActivityList(inputActivitySearch.value);
	}

	if(event.key.toLowerCase() === "enter") {
		buttonActivitySearch.click();
	}
});

// Search for an activity.
buttonActivitySearch.addEventListener("click", () => {
	filterActivityList(inputActivitySearch.value);
});

// Show activity help popup.
buttonActivityHelp.addEventListener("click", () => {
	let html = `
		<span>An activity represents an event where a crypto or stock asset was bought, sold, or transferred. The settings page includes an option where activities can be set to affect holdings, which means your portfolio would be based on activities you record. For users who simply wish to track their assets without having to record each trade, the aforementioned option can be turned off, and holdings can be added directly through the holdings page.</span>
		<span class="margin-top">Adding a plus (+) sign to the "From" or "To" fields of a "Transfer" activity would cause the asset to get added to your holdings, whereas adding a minus (-) would subtract the amount.</span>
		<span class="margin-top">To decrease ambiguity, the preferred date format when recording activities is YYYY-MM-DD. However, the format of the date shown once the activity has been recorded can be changed through the settings page.</span>
		<span class="margin-top">Only the asset symbol, asset type, amount, date, and activity type need to be provided. The rest of the fields can be left empty.</span>
	`;

	let popup = new Popup(360, "auto", "Help", html, { cancelText:"Dismiss", confirmText:"-", page:"activity" });
	popup.show();
	popup.updateHeight();
});

// Show tools menu.
buttonActivityTools.addEventListener("click", () => {
	let html = `
		<button class="action-button block" id="popup-button-staking">Staking Calculator</button>
		<button class="action-button block" id="popup-button-mining">Mining Calculator</button>
		<button class="action-button block" id="popup-button-dividends">Dividends Calculator</button>
		<button class="action-button block" id="popup-button-mortgage">Mortgage Calculator</button>
		<button class="action-button block" id="popup-button-tax">Tax Calculator</button>
	`;

	let popup = new Popup(250, "auto", "Tools", html, { cancelText:"Dismiss", confirmText:"-", page:"activity" });
	popup.show();
	popup.updateHeight();

	document.getElementById("popup-button-staking").addEventListener("click", () => {
		popup.hide();
		showActivityStakingPopup();
	});

	document.getElementById("popup-button-mining").addEventListener("click", () => {
		popup.hide();
		showActivityMiningPopup();
	});
	
	document.getElementById("popup-button-dividends").addEventListener("click", () => {
		popup.hide();
		showActivityDividendPopup();
	});

	document.getElementById("popup-button-mortgage").addEventListener("click", () => {
		popup.hide();
		showActivityMortgagePopup();
	});

	document.getElementById("popup-button-tax").addEventListener("click", () => {
		popup.hide();
		showActivityTaxPopup();
	});
});

// Show popup used to create activities.
buttonActivityAdd.addEventListener("click", () => {
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
				<input id="popup-input-from" type="text" placeholder="From..." autocomplete="off">
				<span class="popup-input-span">To</span>
				<input id="popup-input-to" type="text" placeholder="To..." autocomplete="off">
			</div>
		`;

		let popup = new Popup(300, 500, "Add Activity", html, { confirmText:"Add", page:"activity" });
		popup.show();

		let popupElements = getActivityPopupElements();
		addActivityPopupListeners(popupElements);

		popupElements.popupInputSymbol.focus();

		flatpickr(popupElements.popupInputDate, {
			enableTime: false,
			dateFormat: "Y-m-d",
			allowInput: true
		});

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
				showLoading(1000, "Adding...");
				
				data.activityAssetID = result.id;

				let encrypted = encryptObjectValues(key, data);

				await createActivity(token, userID, encrypted.activityAssetID, encrypted.activityAssetSymbol, encrypted.activityAssetType, encrypted.activityDate, encrypted.activityType, encrypted.activityAssetAmount, encrypted.activityFee, encrypted.activityNotes, encrypted.activityExchange, encrypted.activityPair, encrypted.activityPrice, encrypted.activityFrom, encrypted.activityTo);

				populateActivityList(true);

				popup.hide();
			} else {
				let showMatches = showAssetMatches(popupElements.popupWrapperTransfer, result, false);

				if(showMatches) {
					popup.bottom.scrollTo(0, popup.bottom.scrollHeight);

					let rows = popup.element.getElementsByClassName("popup-list-row");

					for(let i = 0; i < rows.length; i++) {
						rows[i].addEventListener("click", async () => {
							showLoading(1000, "Adding...");

							data.activityAssetID = rows[i].getAttribute("data-id");

							let encrypted = encryptObjectValues(key, data);

							await createActivity(token, userID, encrypted.activityAssetID, encrypted.activityAssetSymbol, encrypted.activityAssetType, encrypted.activityDate, encrypted.activityType, encrypted.activityAssetAmount, encrypted.activityFee, encrypted.activityNotes, encrypted.activityExchange, encrypted.activityPair, encrypted.activityPrice, encrypted.activityFrom, encrypted.activityTo);

							populateActivityList(true);
							
							popup.hide();
						});
					}
				}
			}
		});
	} catch(error) {
		console.log(error);
		errorNotification("Something went wrong... - EW1");
	}
});