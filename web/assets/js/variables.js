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

let applicationSettings = getSettings();
let applicationChoices = getSettingsChoices();

let audioPlayable = false;