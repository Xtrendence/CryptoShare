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
			populateHoldingsList(true);
			setHoldingsUsername();
			break;
		case "activity":
			populateActivityList(true);
			break;
		case "settings":
			syncSettings(false);
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

function showAssetMatches(referenceNode, list) {
	if("matches" in list && list.matches.length > 1) {
		let div = document.createElement("div");
		div.setAttribute("class", "popup-list noselect");

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

		insertAfter(div, referenceNode);
	} else {
		errorNotification("Invalid number of matches.");
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
	tippy(buttonMarketInfo, { content:"Market Info", placement:"top" });
	tippy(buttonMarketSearch, { content:"Search", placement:"top" });
	tippy(buttonMarketCrypto, { content:"Crypto Market", placement:"left" });
	tippy(buttonMarketStocks, { content:"Stock Market", placement:"right" });
	tippy(buttonMarketPrevious, { content:"Previous", placement:"top" });
	tippy(buttonMarketNext, { content:"Next", placement:"top" });
	tippy(".holdings-card.username", { content:"Account", placement:"right" });
	tippy(".holdings-card.value", { content:"Total Portfolio Value", placement:"right" });
	tippy(buttonSettingsLogoutEverywhere, { content:"Deletes all your active session tokens, causing you to get logged out on every device.", placement:"right" });
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

function addPattern() {
	let items = divNavbarWrapper.getElementsByClassName("item");

	for(let i = 0; i < items.length; i++) {
		items[i].innerHTML += svgNavbarPattern;
	}
}