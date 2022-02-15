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
	page = empty(page) ? defaultChoices.defaultPage.toLowerCase() : page.toLowerCase().replace(" ", "");

	clearActiveNavbarItem();
	clearActivePage();

	document.getElementById(`navbar-${page}`).classList.add("active");
	document.getElementById(`${page}-page`).classList.remove("hidden");

	switch(page) {
		case "chatbot":
			populateChatList(true);
			firstFetch.chatBot = false;
			break;
		case "dashboard":
			firstFetch.dashboard = false;
			break;
		case "market":
			populateMarketList(1, 1, true);
			firstFetch.market = false;
			break;
		case "holdings":
			populateHoldingsList(true);
			setHoldingsUsername();
			firstFetch.holdings = false;
			break;
		case "activity":
			populateActivityList(true);
			firstFetch.activity = false;
			break;
		case "settings":
			syncSettings(false);
			adminCheck();
			firstFetch.settings = false;
			break;
	}
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

async function assetHoldingExists(id) {
	let userID = localStorage.getItem("userID");
	let token = localStorage.getItem("token");
	let key = localStorage.getItem("key");

	return new Promise(async (resolve, reject) => {
		try {
			let holdings = await readHolding(token, userID);

			if(empty(holdings) || holdings?.data?.readHolding.length === 0) {
				resolve({ exists:false });
			} else {
				let encrypted = holdings?.data?.readHolding;

				Object.keys(encrypted).map(index => {
					let decrypted = decryptObjectValues(key, encrypted[index]);

					if(decrypted.holdingAssetID === id) {
						resolve({ exists:true, holdingID:encrypted[index].holdingID });
						return;
					}
				});

				resolve({ exists:false });
			}
		} catch(error) {
			console.log(error);
			reject(error);
		}
	});
}

function showAssetMatches(referenceNode, list, marginBottom) {
	if("matches" in list && Object.keys(list.matches).length > 1) {
		let current = document.getElementsByClassName("popup-list asset-matches");
		for(let i = 0; i < current.length; i++) {
			current[i].remove();
		}
		
		let div = document.createElement("div");
		div.setAttribute("class", "popup-list asset-matches noselect");

		if(marginBottom) {
			div.classList.add("margin-bottom");
		}

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

		errorNotification("Two or more assets have the same symbol. Please choose an asset from the list.");

		insertAfter(div, referenceNode);

		return true;
	} else {
		errorNotification("Asset not found.");
		return false;
	}
}

function getCurrency() {
	let currency = getSettingsChoices()?.currency;

	if(empty(currency)) {
		return defaultChoices.currency;
	}

	return currency;
}

function addTooltips() {
	tippy(".button-hide-password", { content:"Show/Hide Password", placement:"right" });
	tippy(buttonMarketInfo, { content:"Crypto Market Info", placement:"top" });
	tippy(buttonMarketSearch, { content:"Search", placement:"top" });
	tippy(buttonMarketCrypto, { content:"Crypto Market", placement:"left" });
	tippy(buttonMarketStocks, { content:"Stock Market", placement:"right" });
	tippy(buttonMarketPrevious, { content:"Previous", placement:"top" });
	tippy(buttonMarketNext, { content:"Next", placement:"top" });
	tippy(".holdings-card.username", { content:"Account", placement:"right" });
	tippy(".holdings-card.value", { content:"Total Portfolio Value", placement:"right" });
	tippy(buttonSettingsLogoutEverywhere, { content:"Deletes all your active session tokens, causing you to get logged out on every device.", placement:"right" });
	tippy(buttonSettingsUserRegistration, { content:"Enables or disables the ability for users to register new accounts.", placement:"right" });
	tippy(buttonSettingsStockAPIType, { content:"Switches between the internal stock API, and an external one. The internal one would not have API rate limits if used in moderation by a handful of users, but isn't recommended if user registration is enabled. The external one allows each user to set an API key, and make 100 requests per day. Market data is aggressively cached and shared between users to limit API requests to a minimum, and stock prices only update once a day. Both APIs are unofficial, and could cease to work at any point.", placement:"bottom" });
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

function ignoreError(description) {
	if(!ignoredErrors.includes(description)) {
		ignoredErrors.push(description);
	}
}

function errorNotification(description) {
	if(!ignoredErrors.includes(description)) {
		Notify.error({
			title: "Error",
			description: description,
			duration: 5000,
			background: "var(--accent-second)",
			color: "var(--accent-contrast)"
		});
	}
}

function addPattern() {
	let items = divNavbarWrapper.getElementsByClassName("item");

	for(let i = 0; i < items.length; i++) {
		items[i].innerHTML += svgNavbarPattern;
	}
}

async function generateChart(element, title, labels, tooltips, currency, data, colors) {
	let canvas = document.createElement("canvas");
	canvas.id = "chart-canvas";
	canvas.classList.add("chart-canvas");

	let context = canvas.getContext("2d");

	let mainSecond = cssValue(document.documentElement, "--main-second");

	let mainContrastDark = cssValue(document.documentElement, "--main-contrast-dark");

	let gradientStroke = context.createLinearGradient(1000, 0, 300, 0);

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
						let value = data[item.index];

						if(value > 1) {
							value = separateThousands(value.toFixed(2));
						}

						return [tooltips[item.index], currencySymbols[currency] + value];
					}
				}
			}
		}
	});

	element.innerHTML = "";
	element.appendChild(canvas);
}