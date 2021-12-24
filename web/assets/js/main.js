detectMobile() ? document.body.id = "mobile" : document.body.id = "desktop";

setTheme(applicationTheme);

setSounds(applicationSounds);

updatePasswordFields();

attemptLogin();

addNavbarEvents();

addSettingsNavbarEvents();

setPage("settings");