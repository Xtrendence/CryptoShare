// Show global crypto market data.
buttonMarketInfo.addEventListener("click", async () => {
	try {
		showLoading(2000, "Fetching Global Crypto Market Data...");

		let currency = await getCurrency();

		let data = await cryptoAPI.getGlobal();

		setTimeout(() => {
			hideLoading();
		}, 250);

		let volume = parseFloat(data.data.total_volume[currency].toFixed(2));
		let marketCap = parseFloat(data.data.total_market_cap[currency].toFixed(2));
		let marketCapChangeDay = formatPercentage(data.data.market_cap_change_percentage_24h_usd);

		let html = `
			<div class="info-wrapper noselect">
				<div class="info-container">
					<span>Volume: ${currencySymbols[currency] + separateThousands(volume)}</span>
					<span>Market Cap: ${currencySymbols[currency] + separateThousands(marketCap)}</span>
					<span>24 Change: ${marketCapChangeDay}%</span>
				</div>
			</div>
		`;

		let popup = new Popup(400, "auto", "Global Crypto Market Info", html, { cancelText:"Dismiss", confirmText:"-", page:"market" });
		popup.show();
		popup.bottom.classList.add("less-margin");
		popup.updateHeight();
	} catch(error) {
		errorNotification("Could not fetch global market data.");
		console.log(error);
	}
});

// Show popup used to search for a crypto or stock.
buttonMarketSearch.addEventListener("click", () => {
	try {
		let html = `
			<span class="popup-input-span">Asset Symbol</span>
			<input class="uppercase" id="popup-input-search" type="text" placeholder="Asset Symbol..." spellcheck="false" autocomplete="off">
			<div class="popup-button-wrapper margin-bottom">
				<button id="popup-choice-crypto" class="choice active">Crypto</button>
				<button id="popup-choice-stock" class="choice">Stock</button>
			</div>
		`;

		let popup = new Popup(240, "auto", "Market Search", html, { confirmText:"Search", page:"market" });
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

		let inputSearch = document.getElementById("popup-input-search");

		inputSearch.focus();

		popup.on("confirm", async () => {
			let currency = await getCurrency();
			let symbol = inputSearch.value;

			if(!empty(symbol)) {
				let type = popupChoiceCrypto.classList.contains("active") ? "crypto" : "stock";

				showMarketSearchResult(popup, inputSearch, symbol, currency, type);
			} else {
				errorNotification("Please provide a symbol/ticker to search for.");
			}
		});
	} catch(error) {
		errorNotification("Something went wrong... - EW7");
		console.log(error);
	}
});

// Switch to the crypto market page.
buttonMarketCrypto.addEventListener("click", () => {
	if(!buttonMarketCrypto.classList.contains("active")) {
		buttonMarketCrypto.classList.add("active");
		buttonMarketStocks.classList.remove("active");

		divMarketListCrypto.classList.remove("hidden");
		divMarketListStocks.classList.add("hidden");

		let active = getActiveMarketPage();
		populateMarketList(active.cryptoPage, active.stocksPage, true);
	}
});

// Switch to the stock market page.
buttonMarketStocks.addEventListener("click", () => {
	if(!buttonMarketStocks.classList.contains("active")) {
		buttonMarketCrypto.classList.remove("active");
		buttonMarketStocks.classList.add("active");

		divMarketListCrypto.classList.add("hidden");
		divMarketListStocks.classList.remove("hidden");

		let active = getActiveMarketPage();
		populateMarketList(active.cryptoPage, active.stocksPage, true);
	}
});

// Display previous 100 cryptos.
buttonMarketPrevious.addEventListener("click", () => {
	let active = getActiveMarketPage();
	let previous = active.type === "crypto" ? active.cryptoPage - 1 : active.stocksPage - 1;

	if(previous > 0) {
		if(active.type === "crypto") {
			populateMarketList(previous, active.stocksPage, true);
		} else {
			populateMarketList(active.cryptoPage, previous, true);
		}
	} else {
		errorNotification("That's just not possible...");
	}
});

// Display next 100 cryptos. 
buttonMarketNext.addEventListener("click", () => {
	let active = getActiveMarketPage();
	let next = active.type === "crypto" ? active.cryptoPage + 1 : active.stocksPage + 1;

	if(next <= 5) {
		if(active.type === "crypto") {
			populateMarketList(next, active.stocksPage, true);
		} else {
			populateMarketList(active.cryptoPage, next, true);
		}
	} else {
		errorNotification("The market page only includes the top 500 assets.");
	}
});