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

		setBackground(applicationSettings.background, theme);
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

		setBackground(applicationSettings.background, theme);
	}
}

function setBackground(background, theme) {
	let backgroundToggles = document.getElementsByClassName("toggle-wrapper background");

	if(background === "animated") {
		applicationSettings.background = "animated";

		for(let i = 0; i < backgroundToggles.length; i++) {
			backgroundToggles[i].classList.add("active");
		}

		settingsToggleSimpleBackground.classList.remove("active");

		localStorage.setItem("background", "animated");
		divAnimatedBackground.classList.remove("hidden");
		divStaticBackground.classList.add("hidden");
		divSimpleBackground.classList.add("hidden");
		particlesJS("animated-background", getParticlesConfig(theme, document.documentElement));
	} else if(background === "static") {
		applicationSettings.background = "static";

		for(let i = 0; i < backgroundToggles.length; i++) {
			backgroundToggles[i].classList.remove("active");
		}

		settingsToggleSimpleBackground.classList.remove("active");

		localStorage.setItem("background", "static");
		divAnimatedBackground.innerHTML = "";
		divAnimatedBackground.classList.add("hidden");
		divStaticBackground.classList.remove("hidden");
		divStaticBackground.style.backgroundImage = theme === "light" ? `url("./assets/img/BG-White-Gold.png")` : `url("./assets/img/BG-Black-Gold.png")`;
		divSimpleBackground.classList.add("hidden");
	} else if(background === "simple") {
		applicationSettings.background = "simple";

		for(let i = 0; i < backgroundToggles.length; i++) {
			backgroundToggles[i].classList.remove("active");
		}

		settingsToggleSimpleBackground.classList.add("active");

		localStorage.setItem("background", "simple");
		divAnimatedBackground.innerHTML = "";
		divAnimatedBackground.classList.add("hidden");
		divStaticBackground.classList.add("hidden");
		divStaticBackground.removeAttribute("style");
		divSimpleBackground.classList.remove("hidden");
		divSimpleBackground.style.backgroundImage = theme === "light" ? `url("./assets/img/BG-White.png")` : `url("./assets/img/BG-Black.png")`;
	}
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

				let settings = { ...defaultSettings, ...defaultChoices };
				if(!empty(result.settings)) {
					let decryptedSettings = CryptoFN.decryptAES(result.settings.userSettings, key);
					if(validJSON(decryptedSettings)) {
						settings = JSON.parse(decryptedSettings);
					}
				}

				setPage(settings?.defaultPage);
				setSettingsPage(settings?.defaultSettingsPage);

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
			break;
		case "activity":
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
				divMarketListCrypto.innerHTML = "";
				spanMarketPage.textContent = `Page ${active.cryptoPage}`;
			} else {
				divMarketListStocks.innerHTML = "";
				spanMarketPage.textContent = `Page ${active.stocksPage}`;
			}
		}

		checkBackdrop();
		let currency = getCurrency();
		populateMarketListCrypto(cryptoPage, currency);
	}
}

function checkBackdrop() {
	let choices = getSettingsChoices();

	if("assetIconBackdrop" in choices && choices.assetIconBackdrop === "enabled") {
		divMarketListCrypto.classList.add("backdrop");
		divMarketListStocks.classList.add("backdrop");
	} else {
		divMarketListCrypto.classList.remove("backdrop");
		divMarketListStocks.classList.remove("backdrop");
	}
}

async function populateMarketListCrypto(page, currency) {
	try {
		let marketData = await cryptoAPI.getMarket(currency, 100, page);

		let rows = createMarketListCryptoRows(marketData, page, currency);

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

			let info = { coinID:coinID, currency:currency, price:price, icon:icon, marketCap:marketCap, price:price, ath:ath, athChange:ath, high24h:high24h, low24h:low24h, volume:volume, supply:supply, name:name, symbol:symbol };

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

			addMarketListCryptoRowListener(div, info);

			rows.push(div);
		} catch(error) {
			console.log(error);
		}
	}

	return rows;
}

function addMarketListCryptoRowListener(div, info) {
	div.addEventListener("click", async () => {
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
	});
}

function parseHistoricalCryptoData(data) {
	let labels = [];
	let tooltips = [];
	let prices = [];

	data.map(day => {
		labels.push(new Date(day[0]));
		tooltips.push(formatDateHuman(new Date(day[0])));
		prices.push(day[1]);
	});

	return { labels:labels, tooltips:tooltips, prices:prices };
}

async function generateMarketChart(element, title, labels, tooltips, currency, data) {
	let canvas = document.createElement("canvas");
	canvas.id = "chart-canvas";
	canvas.classList.add("chart-canvas");

	let context = canvas.getContext("2d");

	let mainSecond = cssValue("--main-second");

	let mainContrastDark = cssValue("--main-contrast-dark");

	let accentFirst = cssValue("--accent-first");
	let accentSecond = cssValue("--accent-second");
	let accentThird = cssValue("--accent-third");

	let gradientStroke = context.createLinearGradient(1000, 0, 300, 0);
	gradientStroke.addColorStop(0, accentFirst);
	gradientStroke.addColorStop(0.5, accentSecond);
	gradientStroke.addColorStop(0.7, accentThird);
	gradientStroke.addColorStop(1, accentFirst);

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
	settings["background"] = empty(localStorage.getItem("background")) ? defaultSettings.background : localStorage.getItem("background");
	settings["sounds"] = empty(localStorage.getItem("sounds")) ? defaultSettings.sounds : localStorage.getItem("sounds");

	return settings;
}

function getSettingsChoices() {
	let choicesJSON = localStorage.getItem("choices");

	if(empty(choicesJSON) || !validJSON(choicesJSON)) {
		return defaultChoices;
	} else {
		let choices = {};

		let parsed = JSON.parse(choicesJSON);

		let keys = Object.keys(parsed);

		keys.map(key => {
			choices[key] = parsed[key];
		});

		return choices;
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
			}
		}
	}
}

function setSettings(settings) {
	if(empty(settings)) {
		settings = { ...defaultSettings, ...defaultChoices };
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

	let settings = { ...getSettings(), ...getSettingsChoices() };

	let current = await fetchSettings();

	if(validJSON(current)) {
		current = JSON.parse(current);

		Object.keys(current).map(settingKey => {
			if(settingKey in settings) {
				current[settingKey] = settings[settingKey];
			}
		});
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

function errorNotification(description) {
	Notify.error({
		title: "Error",
		description: description,
		duration: 5000,
		background: "var(--accent-second)",
		color: "var(--accent-contrast)"
	});
}