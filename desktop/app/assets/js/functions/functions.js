// Creates an anchor element with an attached file.
function createLink(url, filename) {
	let link = document.createElement("a");

	link.style = "display:none";
	link.href = url;
	link.download = filename;

	return link;
}

// Shows a file picker so the user can upload a file.
function upload() {
	return new Promise((resolve, reject) => {
		try {
			let input = document.createElement("input");
			input.type = "file";
			input.classList.add("hidden");

			input.addEventListener("change", async () => {
				if(input.files.length !== 1) {
					errorNotification("No file chosen.");
					resolve(null);
					return;
				}

				let file = input.files[0];
				let content = await file.text();

				resolve(content);
			});

			document.body.appendChild(input);

			input.click();
		} catch(error) {
			console.log(error);
			reject(error);
		}
	});
}

// Downloads a file. Used to export user data.
function download(data, filename, type) {
	if(typeof data === "string") {
		data = [data];
	}

	let blob = new Blob(data, { type:type });

	let url = window.URL.createObjectURL(blob);
	let link = createLink(url, filename);

	document.body.appendChild(link);

	link.click();

	document.body.removeChild(link);

	setTimeout(function() {
		window.URL.revokeObjectURL(url);
	}, 1000);
}

// Adds a hide/show button to password input fields.
function updatePasswordFields() {
	let wrappers = document.getElementsByClassName("input-password-wrapper");
	for(let i = 0; i < wrappers.length; i++) {
		let div = wrappers[i];

		if(div.getElementsByClassName("button-hide-password").length === 0) {
			let input = div.getElementsByTagName("input")[0];

			let button = document.createElement("button");
			button.setAttribute("title", "Show/Hide Password");
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
}

// Add events to navbar elements.
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

function showSideMenu() {
	divSideMenuWrapper.classList.remove("hidden");
	divSideMenuOverlay.classList.remove("hidden");
	
	divSideMenuWrapper.style.left = `-${divSideMenuWrapper.scrollWidth}px`;

	let left = divSideMenuWrapper.scrollWidth * -1;

	let animation = setInterval(() => {
		divSideMenuWrapper.style.left = `${left}px`;

		if(left >= 0) {
			clearInterval(animation);
			divSideMenuWrapper.removeAttribute("style");
			buttonSideMenuClose.classList.remove("hidden");
		}
		
		left += 20;
	}, 10);
}

function hideSideMenu() {
	let left = 0;
	
	buttonSideMenuClose.classList.add("hidden");

	let animation = setInterval(() => {
		divSideMenuWrapper.style.left = `${left}px`;

		if(left <= (divSideMenuWrapper.scrollWidth * -1)) {
			clearInterval(animation);
			divSideMenuWrapper.classList.add("hidden");
			divSideMenuOverlay.classList.add("hidden");
			divSideMenuWrapper.removeAttribute("style");
			divSideMenuContainer.innerHTML = '<div class="loading-icon"><div></div><div></div></div>';
			divSideMenuBottom.innerHTML = "";
		}
		
		left -= 20;
	}, 10);
}

// Returns the currently active page.
function getActivePage() {
	if(!divPageLogin.classList.contains("hidden")) {
		return divPageLogin.id;
	}

	let pages = divPageApp.getElementsByClassName("page");
	for(let i = 0; i < pages.length; i++) {
		if(!pages[i].classList.contains("hidden")) {
			return pages[i];
		}
	}
}

// Clear the "active" status of all navbar elements.
function clearActiveNavbarItem() {
	let items = divNavbar.getElementsByClassName("item");
	for(let i = 0; i < items.length; i++) {
		items[i].classList.remove("active");
	}
}

// Clear the "active" status of all app pages.
function clearActivePage() {
	let pages = divPageApp.getElementsByClassName("page");
	for(let i = 0; i < pages.length; i++) {
		pages[i].classList.add("hidden");
	}
}

// Set active app page.
function setPage(page) {
	page = empty(page) ? defaultChoices.defaultPage.toLowerCase() : page.toLowerCase().replace(" ", "");

	clearActiveNavbarItem();
	clearActivePage();

	document.getElementById(`navbar-${page}`).classList.add("active");
	document.getElementById(`navbar-${page}`).classList.add("animate");
	document.getElementById(`${page}-page`).classList.remove("hidden");

	setTimeout(() => {
		document.getElementById(`navbar-${page}`).classList.remove("animate");
	}, 1000);

	switch(page) {
		case "chatbot":
			populateChatList(true);
			firstFetch.chatBot = false;
			break;
		case "dashboard":
			populateHoldingsList();
			populateDashboardBudget(true);
			populateDashboardWatchlist(true);
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

// Determines whether or not the "assetIconBackdrop" settings choice is enabled.
async function checkBackdrop() {
	let choices = await getSettingsChoices();

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

// Determines whether or not the "holdingsOnDashboard" settings choice is enabled.
async function checkHoldingsOnDashboard() {
	let choices = await getSettingsChoices();

	if("holdingsOnDashboard" in choices && choices.holdingsOnDashboard === "enabled") {
		divPageDashboard.classList.add("show-holdings");
	} else {
		divPageDashboard.classList.remove("show-holdings");
	}
}

// Checks whether or not an asset is in the user's holdings.
async function assetHoldingExists(id) {
	let userID = await appStorage.getItem("userID");
	let token = await appStorage.getItem("token");
	let key = await appStorage.getItem("key");

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

// Show a list of matching crypto assets.
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

// Returns the user's chosen fiat currency.
async function getCurrency() {
	return new Promise(async (resolve, reject) => {
		try {
			let currency = await getSettingsChoices()?.currency;

			if(empty(currency)) {
				resolve(defaultChoices.currency);
				return;
			}

			resolve(currency);
		} catch(error) {
			resolve(defaultChoices.currency);
		}
	});
}

// Add tooltips to app elements.
function addTooltips() {
	tippy(".button-hide-password", { content:"Show/Hide Password", placement:"right" });
	tippy(divChatStatus, { content:"Connection Status", placement:"right" });
	tippy(buttonChatHelp, { content:"Help", placement:"bottom" });
	tippy(buttonChatMenu, { content:"Chat Actions", placement:"bottom" });
	tippy(buttonDashboardBudgetEdit, { content:"Edit Budget", placement:"bottom" });
	tippy(buttonDashboardWatchlistAdd, { content:"Add Asset", placement:"bottom" });
	tippy(buttonMarketInfo, { content:"Crypto Market Info", placement:"top" });
	tippy(buttonMarketSearch, { content:"Search", placement:"top" });
	tippy(buttonMarketCrypto, { content:"Crypto Market", placement:"left" });
	tippy(buttonMarketStocks, { content:"Stock Market", placement:"right" });
	tippy(buttonMarketPrevious, { content:"Previous", placement:"top" });
	tippy(buttonMarketNext, { content:"Next", placement:"top" });
	tippy(".holdings-card.username", { content:"Account", placement:"right" });
	tippy(".holdings-card.value", { content:"Total Portfolio Value", placement:"right" });
	tippy(buttonActivityHelp, { content:"Help", placement:"top" });
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

// Returns whether or not an element plays a sound effect when clicked on, and which sound effect it plays.
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

// Ignores an error in the future.
function ignoreError(description) {
	if(!ignoredErrors.includes(description)) {
		ignoredErrors.push(description);
	}
}

// Shows an error notification.
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

// Shows a success notification.
function successNotification(title, description) {
	Notify.success({
		title: title,
		description: description,
		duration: 5000,
		background: "var(--accent-second)",
		color: "var(--accent-contrast)"
	});
}

// Add background pattern to navbar elements.
function addPattern() {
	let items = divNavbarWrapper.getElementsByClassName("item");

	for(let i = 0; i < items.length; i++) {
		items[i].innerHTML += svgNavbarPattern;
	}
}

// Generate line chart.
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