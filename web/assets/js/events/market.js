buttonMarketInfo.addEventListener("click", async () => {
	try {
		showLoading(2000, "Fetching Global Market Data...");

		let currency = getCurrency();

		let data = await cryptoAPI.getGlobal();

		setTimeout(() => {
			hideLoading();
		}, 250);

		let volume = parseInt(data.data.total_volume[currency].toFixed(2));
		let marketCap = parseInt(data.data.total_market_cap[currency].toFixed(2));
		let marketCapChangeDay = formatPercentage(data.data.market_cap_change_percentage_24h_usd);
		let updated = formatDateHuman(new Date(data.data.updated_at * 1000));

		let html = `
			<div class="info-wrapper noselect">
				<div class="info-container">
					<span>Volume: ${currencySymbols[currency] + separateThousands(volume)}</span>
					<span>Market Cap: ${currencySymbols[currency] + separateThousands(marketCap)}</span>
					<span>24 Change: ${marketCapChangeDay}%</span>
				</div>
			</div>
			<span>Last Update: ${updated}</span>
		`;

		let popup = new Popup(400, "auto", "Global Market Info", html, { cancelText:"Dismiss", confirmText:"-" });
		popup.show();
		popup.updateHeight();
	} catch(error) {
		errorNotification("Could not fetch global market data.");
		console.log(error);
	}
});

buttonMarketSearch.addEventListener("click", () => {
	try {
		let html = `<input class="uppercase" id="popup-input-search" type="text" placeholder="Coin Symbol...">`;
		let popup = new Popup(240, "auto", "Market Search", html, { confirmText:"Search" });
		popup.show();
		popup.updateHeight();

		let inputSearch = document.getElementById("popup-input-search");

		inputSearch.focus();

		popup.on("confirm", async () => {
			let currency = getCurrency();
			let symbol = inputSearch.value;

			if(!empty(symbol)) {
				let result = await getCoin({ symbol:symbol });

				if("id" in result) {
					showLoading(1000, "Loading...");

					let data = await cryptoAPI.getMarketByID(currency, result.id);
					let info = parseCryptoMarketData(currency, data[0]);
					showCryptoMarketData(info);
					popup.hide();
				} else {
					showAssetMatches(inputSearch, result);
					popup.setSize(360, "auto");
					popup.updateHeight();

					let rows = popup.element.getElementsByClassName("popup-list-row");

					for(let i = 0; i < rows.length; i++) {
						rows[i].addEventListener("click", async () => {
							showLoading(1000, "Loading...");

							let id = rows[i].getAttribute("data-id");

							let data = await cryptoAPI.getMarketByID(currency, id);
							let info = parseCryptoMarketData(currency, data[0]);
							showCryptoMarketData(info);
							popup.hide();
						});
					}
				}
			} else {
				errorNotification("Please provide a symbol/ticker to search for.");
			}
		});
	} catch(error) {
		errorNotification("Something went wrong...");
		console.log(error);
	}
});

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