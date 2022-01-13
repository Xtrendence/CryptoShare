detectMobile() ? document.body.id = "mobile" : document.body.id = "desktop";

setTheme(applicationSettings.theme);

setSounds(applicationSettings.sounds);

setSettingsChoices(applicationChoices);

updatePasswordFields();

attemptLogin();

addNavbarEvents();

addSettingsNavbarEvents();

addSettingsChoiceEvents();

setInterval(() => {
	let active = getActiveMarketPage();
	populateMarketList(active.cryptoPage, active.stocksPage, false);
}, 15000);