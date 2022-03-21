// The body element's ID is set to mobile or desktop depending on what device the user is on (based on the user agent).
detectMobile() ? document.body.id = "mobile" : document.body.id = "desktop";

// Used to ignore repetitive errors.
let ignoredErrors = [];

// Adds a hide/show button to password input fields.
updatePasswordFields();

// Attempts to log the user in automatically.
attemptLogin();

// Add events to the navbar elements.
addNavbarEvents();

// Add events to the elements of the "Settings" page's navbar.
addSettingsNavbarEvents();

// Add events to settings choice buttons.
addSettingsChoiceEvents();

// Add the background pattern to navbar elements.
addPattern();

// Add tooltips to elements.
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