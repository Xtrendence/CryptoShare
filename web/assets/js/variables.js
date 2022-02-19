let Notify = new Notifier("TopRight");

let currencySymbols = {
	usd: "$",
	gbp: "£",
	eur: "€",
	chf: "Fr ",
	aud: "$",
	jpy: "¥",
	cad: "$"
};

let firstFetch = {
	chatBot: true,
	dashboard: true,
	market: true,
	holdings: true,
	activity: true,
	settings: true
};

let applicationSettings = getSettings();
let applicationChoices = getSettingsChoices();

let audioPlayable = false;

let tippyInstances = {};