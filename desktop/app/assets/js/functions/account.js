// Attempts to log the user in.
async function attemptLogin() {
	if(appPlatform === "app" || appBypass()) {
		urlAPI = await appStorage.getItem("api");

		if(!empty(urlAPI)) {
			try {
				let url = new URL(urlAPI);
				urlBot = url.toString().replace("graphql", "");

				inputLoginAPI.value = urlAPI;
			} catch(error) {
				console.log(error);
				
				errorNotification("Invalid API URL format.");

				setTimeout(() => {
					divLoading.classList.add("hidden");
					divTitlebar.removeAttribute("style");
				}, 1000);

				return;
			}
		} else {
			setTimeout(() => {
				divLoading.classList.add("hidden");
				divTitlebar.removeAttribute("style");
			}, 1000);
			
			return;
		}
	}

	let userID = await appStorage.getItem("userID");
	let token = await appStorage.getItem("token");

	if(!empty(userID) && !empty(token)) {
		verifyToken(userID, token).then(async result => {
			setTimeout(() => {
				divLoading.classList.add("hidden");
				divTitlebar.removeAttribute("style");
			}, 1000);

			if("error" in result) {
				if(result.error.includes("Invalid")) {
					removeAccountInfo();
				}
				
				errorNotification(result.error);
			} else {
				socket = io.connect(urlBot);
				attachSocketEvents(socket);
				
				let key = await appStorage.getItem("key");

				let settings = { ...defaultSettings, choices:JSON.stringify(defaultChoices) };

				let currentChoices = await getSettingsChoices();

				if(currentChoices?.settingsSync === "disabled") {
					settingsDataSync = "disabled";
					let json = await fetchSettings();
					settings = JSON.parse(json);
				} else {
					if(!empty(result.settings)) {
						let decryptedSettings = CryptoFN.decryptAES(result.settings.userSettings, key);
						if(validJSON(decryptedSettings)) {
							settings = JSON.parse(decryptedSettings);
						}
					}
				}

				let choices = JSON.parse(settings?.choices);
				
				await setSettings(settings);

				await setAccountInfo(result, false);
				
				showApp();

				setPage(choices?.defaultPage);
				setSettingsPage(choices?.defaultSettingsPage);
			}
		}).catch(error => {
			console.log(error);
			errorNotification(error);

			setTimeout(() => {
				divLoading.classList.add("hidden");
				divTitlebar.removeAttribute("style");
			}, 1000);
		});
	} else {
		setTimeout(() => {
			divLoading.classList.add("hidden");
			divTitlebar.removeAttribute("style");
		}, 1000);
	}
}

// Finish the logout process by resetting elements that contain user data, removing user credentials, and showing the "Login" page.
function finishLogout() {
	clearLogin();
	clearApp();

	removeAccountInfo();

	showLogin();

	successNotification("Logged Out", "You've been logged out of your account.");
}

// Set user credentials.
function setAccountInfo(info, updateKey) {
	return new Promise(async (resolve, reject) => {
		try {
			await appStorage.setItem("userID", info.userID);
			await appStorage.setItem("username", info.username);
			await appStorage.setItem("token", info.token);

			if(updateKey) {
				await appStorage.setItem("key", info.key);
			}

			let keyAPI = await appStorage.getItem("keyAPI");

			if(empty(keyAPI)) {
				await appStorage.setItem("keyAPI", "-");
			}

			resolve(null);
		} catch(error) {
			errorNotification("Couldn't save account info.");
			console.log(error);
			reject(error);
		}
	});
}

// Remove user credentials.
async function removeAccountInfo() {
	await appStorage.removeItem("userID");
	await appStorage.removeItem("username");
	await appStorage.removeItem("token");
	await appStorage.removeItem("key");
	await appStorage.removeItem("keyAPI");
}

// Clear "Login" page data.
function clearLogin() {
	inputLoginUsername.value = "";
	inputLoginPassword.value = "";
	inputCreateUsername.value = "";
	inputCreatePassword.value = "";
	inputCreateRepeatPassword.value = "";
	buttonExistingAccount.click();
}

// Show "Login" page.
function showLogin() {
	clearLogin();
	clearApp();
	divPageLogin.classList.remove("hidden");
	divPageApp.classList.add("hidden");
}

// Clear app data.
function clearApp() {
	// Clear Popups.
	let popupOverlays = document.getElementsByClassName("popup-overlay");
	let popupWrappers = document.getElementsByClassName("popup-wrapper");

	for(let i = 0; i < popupOverlays; i++) {
		popupOverlays[i].remove();
	}

	for(let i = 0; i < popupWrappers; i++) {
		popupWrappers[i].remove();
	}

	// Clear Chat Bot.
	divChatList.removeAttribute("data-checksum");
	divChatList.innerHTML = "";
	inputMessage.value = "";

	// Clear Dashboard.
	divDashboardBudgetList.removeAttribute("data-month");
	divDashboardBudgetList.removeAttribute("data-year");

	let currentDate = new Date();
	let currentMonth = currentDate.getMonth();
	let currentYear = currentDate.getFullYear();

	if(document.getElementById("button-budget-month")) {
		document.getElementById("button-budget-month").textContent = monthNames[currentMonth];
	}

	if(document.getElementById("button-budget-year")) {
		document.getElementById("button-budget-year").textContent = currentYear;
	}

	divDashboardBudgetList.innerHTML = "";
	divDashboardHoldingsList.innerHTML = "";
	divDashboardWatchlistList.innerHTML = "";

	// Clear Market.
	buttonMarketPrevious.setAttribute("data-page", "1");
	buttonMarketCrypto.click();

	// Clear Holdings.
	spanHoldingsUsername.textContent = "-";
	spanHoldingsValue.textContent = "-";
	divHoldingsList.innerHTML = "";

	// Clear Activity.
	inputActivitySearch.value = "";
	divActivityList.innerHTML = "";
}

// Show app.
function showApp() {
	clearLogin();
	clearApp();
	divPageLogin.classList.add("hidden");
	divPageApp.classList.remove("hidden");
}