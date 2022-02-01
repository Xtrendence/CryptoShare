inputActivitySearch.addEventListener("keydown", () => {
	if(divActivityList.childElementCount < 100 || empty(inputActivitySearch.value)) {
		filterActivityList(inputActivitySearch.value);
	}
});

inputActivitySearch.addEventListener("keyup", () => {
	if(divActivityList.childElementCount < 100 || empty(inputActivitySearch.value)) {
		filterActivityList(inputActivitySearch.value);
	}
});

buttonActivitySearch.addEventListener("click", () => {
	filterActivityList(inputActivitySearch.value);
});

// TODO: Add functionality.
buttonActivityHelp.addEventListener("click", () => {

});

// TODO: Add functionality (and, in the future, additional income-related tools).
buttonActivityTools.addEventListener("click", () => {
	let html = `
		<button class="action-button block" id="popup-button-staking">Staking Calculator</button>
		<button class="action-button block" id="popup-button-mining">Mining Calculator</button>
		<button class="action-button block" id="popup-button-dividends">Dividends Calculator</button>
	`;

	let popup = new Popup(250, "auto", "Tools", html, { cancelText:"Dismiss", confirmText:"-" });
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

	// TODO: Add functionality.
	document.getElementById("popup-button-dividends").addEventListener("click", () => {
		popup.hide();
	});
});

buttonActivityAdd.addEventListener("click", () => {
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
		`;

		let popup = new Popup(300, 500, "Add Activity", html, { confirmText:"Add" });
		popup.show();

		let popupElements = getActivityPopupElements();
		addActivityPopupListeners(popupElements);

		popupElements.popupInputSymbol.focus();

		flatpickr(popupElements.popupInputDate, {
			enableTime: true,
			dateFormat: "Y-m-d H:i",
			allowInput: true
		});

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
		errorNotification("Something went wrong...");
	}
});