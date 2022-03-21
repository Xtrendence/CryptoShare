// Used to send the user notifications.
let Notify = new Notifier("TopRight");

// Fiat currency symbols.
let currencySymbols = {
	usd: "$",
	gbp: "£",
	eur: "€",
	chf: "Fr ",
	aud: "$",
	jpy: "¥",
	cad: "$"
};

let monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// Used to keep track of which pages the user has already opened.
let firstFetch = {
	chatBot: true,
	dashboard: true,
	market: true,
	holdings: true,
	activity: true,
	settings: true
};

// User settings between the web and desktop app are normally synced, but this can be disabled.
let settingsDataSync = "enabled";

let applicationSettings = {};
let applicationChoices = {};

// When the app first loads, the user's settings are fetched and set.
(async () => {
	applicationSettings = await getSettings();
	applicationChoices = await getSettingsChoices();

	await setTheme(applicationSettings.theme);
	await setSounds(applicationSettings.sounds);
	setSettingsChoices(applicationChoices);
})();

// Used to keep track of the last 5 elements the user has clicked on. This is only used to enable/disable the desktop app mode for debugging.
let clickTargets = [];

// Used to ensure audio files can be played.
let audioPlayable = false;

// The tooltip library used in the app keeps adding additional tooltips even if an element already has one. Keeping track of existing ones allows them to be updated instead of recreated, improving performance.
let tippyInstances = {
	budgetStats: {}
};

let socket = null;