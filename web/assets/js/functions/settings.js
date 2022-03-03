async function setTheme(theme) {
	applicationSettings.theme = theme;

	let themeToggles = document.getElementsByClassName("toggle-wrapper theme");
	let favicons = document.getElementsByClassName("favicon");
	let browserTheme = document.getElementsByClassName("browser-theme")[0];

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

		setBackground(applicationSettings.theme);
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

		setBackground(applicationSettings.theme);
	}
}

function setBackground(theme) {
	divBackground.style.backgroundImage = theme === "light" ? `url("./assets/img/BG-White.png")` : `url("./assets/img/BG-Black.png")`;
}

async function setSounds(sounds) {
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
}

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

function clearActiveSettingsNavbarItem() {
	let items = divSettingsNavbar.getElementsByClassName("item");
	for(let i = 0; i < items.length; i++) {
		items[i].classList.remove("active");
	}
}

function clearActiveSettingsPage() {
	let pages = divPageSettings.getElementsByClassName("settings-page");
	for(let i = 0; i < pages.length; i++) {
		pages[i].classList.add("hidden");
	}
}

function addSettingsChoiceEvents() {
	let buttons = divPageSettings.getElementsByClassName("choice-button");
	for(let i = 0; i < buttons.length; i++) {
		let button = buttons[i];

		button.addEventListener("click", async () => {
			let key = button.parentElement.parentElement.getAttribute("data-key");
			let value = button.getAttribute("data-value");
			setChoice(key, value);
			let choices = await getSettingsChoices();
			setSettingsChoices(choices);
			syncSettings(true);
		});
	}
}

async function setChoice(key, value) {
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
}

async function fetchSettings() {
	let userID = await appStorage.getItem("userID");
	let token = await appStorage.getItem("token");
	let key = await appStorage.getItem("key");

	return new Promise((resolve, reject) => {
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

function processChoice(key, value) {
	switch(key) {
		case "navbarStyle":
			if(value === "compact") {
				document.documentElement.classList.add("navbar-compact");
			} else {
				document.documentElement.classList.remove("navbar-compact");
			}
	}
}

async function setSettings(settings) {
	if(empty(settings)) {
		settings = { ...defaultSettings, choices:JSON.stringify(defaultChoices) };
	}

	Object.keys(settings).map(async key => {
		let value = settings[key];
		await appStorage.setItem(key, value);
	});

	applicationSettings = await getSettings();
	applicationChoices = await getSettingsChoices();

	setSettingsChoices(applicationChoices);
}

function setSettingsPage(page) {
	page = empty(page) ? defaultChoices.defaultSettingsPage : page.toLowerCase();

	clearActiveSettingsNavbarItem();
	clearActiveSettingsPage();

	document.getElementById(`settings-navbar-${page}`).classList.add("active");
	document.getElementById(`settings-page-${page}`).classList.remove("hidden");
}

async function resetSettings() {
	showLoading(4000, "Resetting Settings...");
	
	await appStorage.removeItem("theme");
	await appStorage.removeItem("background");
	await appStorage.removeItem("sounds");
	await appStorage.removeItem("choices");

	setTimeout(() => {
		window.location.reload();
	}, 3500);
}

async function syncSettings(update) {
	let token = await appStorage.getItem("token");
	let userID = await appStorage.getItem("userID");
	let key = await appStorage.getItem("key");

	let currentSettings = await getSettings();
	let currentChoices = await getSettingsChoices();

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

	setSettings(current);

	let encrypted = CryptoFN.encryptAES(JSON.stringify(current), key);

	if(update) {
		updateSetting(token, userID, encrypted).then(result => {
			if(!("data" in result) && !("updateSetting" in result.data) && result.data.updateSetting !== "Done") {
				errorNotification("Couldn't update / sync setting.");
				console.log(result);
			}
		}).catch(error => {
			errorNotification(error);
			console.log(error);
		});
	}
}

async function adminCheck() {
	let username = await appStorage.getItem("username");

	if(!empty(username) && username.toLowerCase() === "admin") {
		buttonSettingsUserRegistration.classList.remove("hidden");
		buttonSettingsStockAPIType.classList.remove("hidden");
		getAdminSettings();
	} else {
		buttonSettingsUserRegistration.classList.add("hidden");
		buttonSettingsStockAPIType.classList.add("hidden");
	}
}

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