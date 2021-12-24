detectMobile() ? document.body.id = "mobile" : document.body.id = "desktop";

setTheme(applicationSettings.theme);

setSounds(applicationSettings.sounds);

setSettingsChoices(applicationChoices);

updatePasswordFields();

attemptLogin();

addNavbarEvents();

addSettingsNavbarEvents();

addSettingsChoiceEvents();

setPage(applicationChoices["default-page"]);

setSettingsPage(applicationChoices["default-settings-page"]);