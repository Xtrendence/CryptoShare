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

async function populateMarketListCrypto(page, currency) {
	try {
		let marketData = await cryptoAPI.getMarket(currency, 100, page);

		let rows = createMarketListCryptoRows(marketData, page, currency);

		if(divMarketListCrypto.getElementsByClassName("loading-icon").length > 0) {
			divMarketListCrypto.innerHTML = "";
		}

		for(let i = 0; i < rows.length; i++) {
			if(divMarketListCrypto.childElementCount >= i + 1) {
				let current = divMarketListCrypto.getElementsByClassName("market-list-row")[i];
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
				divMarketListCrypto.appendChild(rows[i]);
			}
		}
	} catch(error) {
		console.log(error);
	}
}

function createMarketListCryptoRows(marketData, page, currency) {
	let rows = [];

	let ids = Object.keys(marketData);

	for(let i = 0; i < 100; i++) {
		try {
			let id = ids[i];
			
			let rank = (page - 1) * 100 + (i + 1);

			let coin = marketData[id];

			let coinID = coin.id;
			let price = coin.current_price;
			let icon = coin.image;
			let marketCap = coin.market_cap;
			let priceChangeDay = formatPercentage(coin.market_cap_change_percentage_24h);
			let athChange = formatPercentage(coin.ath_change_percentage);
			let ath = coin.ath;
			let high24h = coin.high_24h;
			let low24h = coin.low_24h;
			let volume = coin.total_volume;
			let supply = coin.circulating_supply;
			let name = coin.name;
			let symbol = coin.symbol;

			let info = { coinID:coinID, currency:currency, price:price, icon:icon, marketCap:marketCap, price:price, ath:ath, priceChangeDay:priceChangeDay, athChange:athChange, high24h:high24h, low24h:low24h, volume:volume, supply:supply, name:name, symbol:symbol, rank:rank };

			let div = document.createElement("div");
			div.id = "market-list-crypto-" + coinID;
			div.setAttribute("class", "market-list-row crypto noselect audible-pop");

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
							<span class="price">Price: ${currencySymbols[currency] + separateThousands(price)}</span>
							<span class="ath">ATH: ${currencySymbols[currency] + separateThousands(ath)}</span>
							<span class="high-24h">24h High: ${currencySymbols[currency] + separateThousands(high24h)}</span>
							<span class="low-24h">24h Low: ${currencySymbols[currency] + separateThousands(low24h)}</span>
							<span class="volume">Volume: ${currencySymbols[currency] + abbreviateNumber(volume, 2)}</span>
						</div>
						<div class="bottom audible-pop">
							<span class="market-cap">Market Cap: ${currencySymbols[currency] + separateThousands(marketCap)}</span>
							<span class="price-change">24h Change: ${priceChangeDay}%</span>
							<span class="ath-change">ATH Change: ${athChange}%</span>
							<span class="supply">Supply: ${abbreviateNumber(supply, 2)}</span>
						</div>
					</div>
				</div>
			`;

			div.addEventListener("click", () => {
				showCryptoMarketData(info);
			});

			rows.push(div);
		} catch(error) {
			console.log(error);
		}
	}

	return rows;
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

// TODO: Add watchlist, holdings, and activity buttons.
function addMarketCryptoData(previousElement, info) {
	let div = document.createElement("div");
	div.setAttribute("class", "info-wrapper noselect");

	div.innerHTML = `
		<div class="info-container">
			<span class="rank">Rank: #${info.rank}</span>
			<span class="name">Name: ${info.name}</span>
			<span class="symbol">Symbol: ${info.symbol.toUpperCase()}</span>
			<span class="price">Price: ${currencySymbols[info.currency] + separateThousands(info.price)}</span>
			<span class="ath">ATH: ${currencySymbols[info.currency] + separateThousands(info.ath)}</span>
			<span class="high-24h">24h High: ${currencySymbols[info.currency] + separateThousands(info.high24h)}</span>
			<span class="low-24h">24h Low: ${currencySymbols[info.currency] + separateThousands(info.low24h)}</span>
			<span class="volume">Volume: ${currencySymbols[info.currency] + abbreviateNumber(info.volume, 2)}</span>
			<span class="market-cap">Market Cap: ${currencySymbols[info.currency] + separateThousands(info.marketCap)}</span>
			<span class="price-change">24h Change: ${info.priceChangeDay}%</span>
			<span class="ath-change">ATH Change: ${info.athChange}%</span>
			<span class="supply">Supply: ${abbreviateNumber(info.supply, 2)}</span>
		</div>
	`;

	insertAfter(div, previousElement);
}

function parseCryptoMarketData(currency, coin) {
	let coinID = coin.id;
	let price = coin.current_price;
	let icon = coin.image;
	let marketCap = coin.market_cap;
	let priceChangeDay = formatPercentage(coin.market_cap_change_percentage_24h);
	let athChange = formatPercentage(coin.ath_change_percentage);
	let ath = coin.ath;
	let high24h = coin.high_24h;
	let low24h = coin.low_24h;
	let volume = coin.total_volume;
	let supply = coin.circulating_supply;
	let name = coin.name;
	let symbol = coin.symbol;
	let rank = coin.market_cap_rank;

	return { coinID:coinID, currency:currency, price:price, icon:icon, marketCap:marketCap, price:price, ath:ath, priceChangeDay:priceChangeDay, athChange:athChange, high24h:high24h, low24h:low24h, volume:volume, supply:supply, name:name, symbol:symbol, rank:rank };
}

async function showCryptoMarketData(info) {
	try {
		showLoading(2500, "Fetching Market Data...");

		let userID = localStorage.getItem("userID");
		let token = localStorage.getItem("token");

		let data = await cryptoAPI.getCoinData(info.coinID);

		let popup = new Popup("full", "full", `${info.name} - ${info.symbol.toUpperCase()} - Market Data`, `<div class="chart-wrapper"></div><span>${data?.description?.en}</span>`, { cancelText:"Dismiss", confirmText:"-" });

		popup.show();

		let divChart = popup.element.getElementsByClassName("chart-wrapper")[0];

		let request = await readCoin(token, userID, info.coinID, info.symbol, info.currency);

		setTimeout(() => {
			hideLoading();
		}, 250);

		try {
			let historicalData = request?.data?.readCoin?.data;

			if(validJSON(historicalData)) {
				historicalData = JSON.parse(historicalData)?.historicalData?.prices;

				let parsed = parseHistoricalCryptoData(historicalData);

				generateMarketChart(divChart, `${info.name} Price`, parsed.labels, parsed.tooltips, info.currency, parsed.prices);

				addMarketCryptoData(divChart, info);
			} else {
				errorNotification("Invalid historical data JSON.");
			}
		} catch(error) {
			errorNotification("Couldn't parse historical data.");

			console.log(error);
		}
	} catch(error) {
		errorNotification(`Couldn't fetch market data for ${info.name}`);
		console.log(error);
	}
}