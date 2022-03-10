detectMobile() ? document.body.id = "mobile" : document.body.id = "desktop";

let ignoredErrors = [];

updatePasswordFields();

attemptLogin();

addNavbarEvents();

addSettingsNavbarEvents();

addSettingsChoiceEvents();

addPattern();

addTooltips();

setInterval(() => {
	let active = getActiveMarketPage();
	populateDashboardBudget(false);
	populateDashboardWatchlist(false);
	populateChatList(false);
	populateMarketList(active.cryptoPage, active.stocksPage, false);
	populateHoldingsList(false);
	populateActivityList(false);
}, 15000);