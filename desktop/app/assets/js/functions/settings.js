// Set the theme of the app.
function setTheme(theme) {
	return new Promise(async (resolve, reject) => {
		try {
			applicationSettings.theme = theme;

			let themeToggles = document.getElementsByClassName("toggle-wrapper theme");
			let favicons = document.getElementsByClassName("favicon");
			let browserTheme = document.getElementsByClassName("browser-theme")[0];
			
			let choices = await getSettingsChoices();
			let alternate = choices?.alternateBackground === "disabled" ? false : true;

			if(theme === "light") {
				browserTheme.setAttribute("content", "#ffffff");

				for(let i = 0; i < favicons.length; i++) {
					favicons[i].href = favicons[i].href.replace("dark", "light");
				}

				for(let i = 0; i < themeToggles.length; i++) {
					themeToggles[i].classList.add("active");
				}

				await appStorage.setItem("theme", "light");

				document.documentElement.classList.add("light");
				document.documentElement.classList.remove("dark");

				setBackground(applicationSettings.theme, alternate);
			} else {
				browserTheme.setAttribute("content", "#000000");

				for(let i = 0; i < favicons.length; i++) {
					favicons[i].href = favicons[i].href.replace("light", "dark");
				}

				for(let i = 0; i < themeToggles.length; i++) {
					themeToggles[i].classList.remove("active");
				}

				await appStorage.setItem("theme", "dark");

				document.documentElement.classList.remove("light");
				document.documentElement.classList.add("dark");

				setBackground(applicationSettings.theme, alternate);
			}

			resolve();
		} catch(error) {
			console.log(error);
			reject(error);
		}
	});
}

// Set the background image of the app.
function setBackground(theme, alternate) {
	if(alternate) {
		document.documentElement.classList.add("alternate-background");
		divBackground.style.backgroundImage = `url("./assets/img/BG-Alt.jpg")`;
	} else {
		document.documentElement.classList.remove("alternate-background");
		divBackground.style.backgroundImage = theme === "light" ? `url("./assets/img/BG-White.png")` : `url("./assets/img/BG-Black.png")`;
	}
}

// Enable/disable the app's sounds.
function setSounds(sounds) {
	return new Promise(async (resolve, reject) => {
		try {
			let soundToggles = document.getElementsByClassName("toggle-wrapper sounds");

			if(sounds === "enabled") {
				applicationSettings.sounds = "enabled";

				for(let i = 0; i < soundToggles.length; i++) {
					soundToggles[i].classList.add("active");
				}

				await appStorage.setItem("sounds", "enabled");
			} else {
				applicationSettings.sounds = "disabled";

				for(let i = 0; i < soundToggles.length; i++) {
					soundToggles[i].classList.remove("active");
				}

				await appStorage.setItem("sounds", "disabled");
			}

			resolve();
		} catch(error) {
			console.log(error);
			reject(error);
		}
	});
}

// Add events to the "Settings" page's navbar.
function addSettingsNavbarEvents() {
	let items = divSettingsNavbar.getElementsByClassName("item");
	
	for(let i = 0; i < items.length; i++) {
		let item = items[i];

		item.addEventListener("click", () => {
			let page = item.id.replace("settings-navbar-", "");
			setSettingsPage(page);
		});
	}
}

// Clear the "active" status of all settings navbar items.
function clearActiveSettingsNavbarItem() {
	let items = divSettingsNavbar.getElementsByClassName("item");
	for(let i = 0; i < items.length; i++) {
		items[i].classList.remove("active");
	}
}

// Clear the "active" status of all settings pages.
function clearActiveSettingsPage() {
	let pages = divPageSettings.getElementsByClassName("settings-page");
	for(let i = 0; i < pages.length; i++) {
		pages[i].classList.add("hidden");
	}
}

// Add events to the "Settings" page's choice buttons.
function addSettingsChoiceEvents() {
	let buttons = divPageSettings.getElementsByClassName("choice-button");
	for(let i = 0; i < buttons.length; i++) {
		let button = buttons[i];

		button.addEventListener("click", async () => {
			let key = button.parentElement.parentElement.getAttribute("data-key");
			let value = button.getAttribute("data-value");
			await setChoice(key, value);
			let choices = await getSettingsChoices();
			setSettingsChoices(choices);
			syncSettings(true);
		});
	}
}

// Set the value of a settings choice.
async function setChoice(key, value) {
	return new Promise(async (resolve, reject) => {
		try {
			let choicesJSON = await appStorage.getItem("choices");
			let choices = defaultChoices;

			if(!empty(choicesJSON) && validJSON(choicesJSON)) {
				let parsed = JSON.parse(choicesJSON);

				Object.keys(parsed).map(choice => {
					choices[choice] = parsed[choice];
				});
			}
			
			choices[key] = value;

			await appStorage.setItem("choices", JSON.stringify(choices));

			resolve();
		} catch(error) {
			console.log(error);
			errorNotification("Couldn't update choice...");
			reject(error);
		}
	});
}

// Fetch and return user settings.
async function fetchSettings() {
	let userID = await appStorage.getItem("userID");
	let token = await appStorage.getItem("token");
	let key = await appStorage.getItem("key");

	return new Promise(async (resolve, reject) => {
		if(settingsDataSync === "disabled") {
			let currentSettings = await getSettings();
			let currentChoices = await getSettingsChoices();
			let settings = JSON.stringify({ ...currentSettings, choices:JSON.stringify(currentChoices) });
			resolve(settings);
			return;
		}

		readSetting(token, userID).then(result => {
			if(!("errors" in result)) {
				let current = CryptoFN.decryptAES(result.data.readSetting.userSettings, key);
				resolve(current);
			} else {
				errorNotification(result.errors[0]);
			}
		}).catch(error => {
			reject(error);
		});
	});
}

// Return user settings.
async function getSettings() {
	return new Promise(async (resolve, reject) => {
		try {
			let settings = {};

			let theme = await appStorage.getItem("theme");
			let sounds = await appStorage.getItem("sounds");

			settings["theme"] = empty(theme) ? defaultSettings.theme : theme;
			settings["sounds"] = empty(sounds) ? defaultSettings.sounds : sounds;

			resolve(settings);
		} catch(error) {
			console.log(error);
			resolve(defaultSettings);
		}
	});
}

// Return settings choices.
async function getSettingsChoices() {
	return new Promise(async (resolve, reject) => {
		try {
			let choicesJSON = await appStorage.getItem("choices");

			if(empty(choicesJSON) || !validJSON(choicesJSON)) {
				resolve(defaultChoices);
			} else {
				resolve(JSON.parse(choicesJSON));
			}
		} catch(error) {
			console.log(error);
			resolve(defaultChoices);
		}
	});
}

// Set settings choices.
function setSettingsChoices(choices) {
	let sections = divPageSettings.getElementsByClassName("settings-section");

	for(let i = 0; i < sections.length; i++) {
		let section = sections[i];
		let key = section.getAttribute("data-key");
		let buttons = section.getElementsByClassName("choice-button");

		for(let j = 0; j < buttons.length; j++) {
			let button = buttons[j];
			let value = button.getAttribute("data-value");
			
			button.classList.remove("active");

			if(value === choices[key]) {
				button.classList.add("active");
				processChoice(key, value);
			}
		}
	}
}

// Process choice change for some settings.
async function processChoice(key, value) {
	switch(key) {
		case "settingsSync":
			settingsDataSync = value;
			break;
		case "navbarStyle":
			if(value === "compact") {
				document.documentElement.classList.add("navbar-compact");
			} else {
				document.documentElement.classList.remove("navbar-compact");
			}
			
			break;
		case "alternateBackground":
			let settings = await getSettings();

			if(value === "disabled") {
				setBackground(settings.theme, false);
			} else {
				setBackground(settings.theme, true);
			}

			break;
	}
}

// Set user settings.
function setSettings(settings) {
	return new Promise(async (resolve, reject) => {
		try {
			if(empty(settings)) {
				settings = { ...defaultSettings, choices:JSON.stringify(defaultChoices) };
			}

			Object.keys(settings).map(async key => {
				let value = settings[key];
				await appStorage.setItem(key, value);
			});

			applicationSettings = await getSettings();
			applicationChoices = await getSettingsChoices();

			setTheme(applicationSettings.theme);
			setSounds(applicationSettings.sounds);

			setSettingsChoices(applicationChoices);

			resolve();
		} catch(error) {
			console.log(error);
			reject(error);
		}
	});
}

// Set settings page.
function setSettingsPage(page) {
	page = empty(page) ? defaultChoices.defaultSettingsPage : page.toLowerCase();

	clearActiveSettingsNavbarItem();
	clearActiveSettingsPage();

	document.getElementById(`settings-navbar-${page}`).classList.add("active");
	document.getElementById(`settings-page-${page}`).classList.remove("hidden");
}

// Reset user settings.
async function resetSettings() {
	try {
		let token = await appStorage.getItem("token");
		let userID = await appStorage.getItem("userID");

		showLoading(4000, "Resetting Settings...");
		
		await appStorage.removeItem("theme");
		await appStorage.removeItem("sounds");
		await appStorage.removeItem("choices");

		await updateSetting(token, userID, "");

		setTimeout(() => {
			window.location.reload();
		}, 3500);
	} catch(error) {
		console.log(error);
		errorNotification("Something went wrong... - EW58");
		
		setTimeout(() => {
			window.location.reload();
		}, 3500);
	}
}

// Update user settings.
function syncSettings(update) {
	return new Promise(async (resolve, reject) => {
		try {
			if(settingsDataSync === "disabled") {
				update = false;
			}

			let token = await appStorage.getItem("token");
			let userID = await appStorage.getItem("userID");
			let key = await appStorage.getItem("key");

			let currentSettings = await getSettings();
			let currentChoices = await getSettingsChoices();

			if(settingsDataSync !== "disabled") {
				currentChoices.settingsSync = "enabled";
			}

			let settings = { ...currentSettings, choices:JSON.stringify(currentChoices) };

			let current = await fetchSettings();

			if(validJSON(current)) {
				current = JSON.parse(current);

				Object.keys(current).map(settingKey => {
					if(settingKey in settings) {
						current[settingKey] = settings[settingKey];
					}
				});
			} else {
				current = settings;
			}

			await setSettings(current);

			if(update) {
				console.log("Updating Settings...");

				let choices = JSON.parse(current.choices);
				delete choices.settingsSync;
				current.choices = JSON.stringify(choices);

				let encrypted = CryptoFN.encryptAES(JSON.stringify(current), key);

				updateSetting(token, userID, encrypted).then(result => {
					if(!("data" in result) && !("updateSetting" in result.data) && result.data.updateSetting !== "Done") {
						errorNotification("Couldn't update / sync setting.");
						console.log(result);
						reject(error);
						return;
					}

					resolve();
				}).catch(error => {
					errorNotification(error);
					console.log(error);
					reject(error);
				});
			} else {
				resolve();
			}
		} catch(error) {
			errorNotification("Couldn't update settings.");
			console.log(error);
			reject(error);
		}
	});
}

// Determines whether or not the user is the admin.
async function adminCheck() {
	let username = await appStorage.getItem("username");

	if(!empty(username) && username.toLowerCase() === "admin") {
		buttonSettingsUserRegistration.classList.remove("hidden");
		buttonSettingsStockAPIType.classList.remove("hidden");
		buttonSettingsStockAPIType.parentElement.classList.add("block");
		getAdminSettings();
	} else {
		buttonSettingsUserRegistration.classList.add("hidden");
		buttonSettingsStockAPIType.classList.add("hidden");
		buttonSettingsStockAPIType.parentElement.classList.remove("block");
	}
}

// Returns admin settings.
async function getAdminSettings() {
	try {
		let token = await appStorage.getItem("token");
		let userID = await appStorage.getItem("userID");
		let username = await appStorage.getItem("username");

		let response = await performAdminAction(token, userID, username, "getSettings");

		if(response.userRegistration === "enabled") {
			buttonSettingsUserRegistration.textContent = "Disable Registration";
			buttonSettingsUserRegistration.setAttribute("data-type", "enabled");
		} else {
			buttonSettingsUserRegistration.textContent = "Enable Registration";
			buttonSettingsUserRegistration.setAttribute("data-type", "disabled");
		}

		if(response.stockAPIType === "internal") {
			buttonSettingsStockAPIType.textContent = "Using Internal";
			buttonSettingsStockAPIType.setAttribute("data-type", "internal");
		} else {
			buttonSettingsStockAPIType.textContent = "Using External";
			buttonSettingsStockAPIType.setAttribute("data-type", "external");
		}
	} catch(error) {
		console.log(error);
	}
}

// Shows a popup with the appropriate donation address.
function showDonationAddress(symbol) {
	let addresses = {
		ADA: "addr1qyh9ejp2z7drzy8vzpyfeuvzuej5t5tnmjyfpfjn0vt722zqupdg44rqfw9fd8jruaez30fg9fxl34vdnncc33zqwhlqn37lz4",
		XMR: "49wDQf83p5tHibw9ay6fBvcv48GJynyjVE2V8EX8Vrtt89rPyECRm5zbBqng3udqrYHTjsZStSpnMCa8JRw7cfyGJwMPxDM",
		ETH: "0x40E1452025d7bFFDfa05d64C2d20Fb87c2b9C0be",
		BCH: "qrvyd467djuxtw5knjt3d50mqzspcf6phydmyl8ka0",
		BTC: "bc1qdy5544m2pwpyr6rhzcqwmerczw7e2ytjjc2wvj",
		LTC: "ltc1qq0ptdjsuvhw6gz9m4huwmhq40gpyljwn5hncxz",
		NANO: "nano_3ed4ip7cjkzkrzh9crgcdipwkp3h49cudxxz4t8x7pkb8rad7bckqfhzyadg",
		DOT: "12nGqTQsgEHwkAuHGNXpvzcfgtQkTeo3WCZgwrXLsiqs3KyA"
	};

	let style = { 
		width: 310,
		height: 310,
		data: addresses[symbol],
		margin: 0,
		qrOptions: {
			typeNumber: 0,
			mode: "Byte",
			errorCorrectionLevel: "Q"
		},
		backgroundOptions: {
			color: "rgba(0,0,0,0)"
		}
	};

	let popup = new Popup(420, "auto", "Address QR Code", `<span class="margin-bottom">If you'd like to donate, then please feel free to do so, it'd be much appreciated. However, I don't want you to feel obliged to do so, and there are no perks for it. If you decide to donate, please contact me afterwards so I can actually thank you, and I'd love to hear about any ideas you may have for CryptoShare. If they're within the scope of the project, I'll probably implement them.</span><div class="popup-canvas-wrapper" style="background:rgb(255,255,255);" id="popup-canvas-wrapper"></div><span class="break-word" style="margin-top:20px;">${addresses[symbol]}</span>`, { page:"settings", confirmText:"-", cancelText:"Dismiss" });
	popup.show();

	let qrCode = new QRCodeStyling(style);
	
	qrCode.append(document.getElementById("popup-canvas-wrapper"));
	
	popup.updateHeight();
}