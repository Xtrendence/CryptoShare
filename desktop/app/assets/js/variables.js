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

let monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

let firstFetch = {
	chatBot: true,
	dashboard: true,
	market: true,
	holdings: true,
	activity: true,
	settings: true
};

let applicationSettings = {};
let applicationChoices = {};

(async () => {
	applicationSettings = await getSettings();
	applicationChoices = await getSettingsChoices();
})();

let clickTargets = [];

let audioPlayable = false;

let tippyInstances = {
	budgetStats: {}
};

let socket = null;