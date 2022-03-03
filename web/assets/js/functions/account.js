function attemptLogin() {
	let userID = localStorage.getItem("userID");
	let token = localStorage.getItem("token");

	if(!empty(userID) && !empty(token)) {
		verifyToken(userID, token).then(result => {
			setTimeout(() => {
				divLoading.classList.add("hidden");
			}, 1000);

			if("error" in result) {
				if(result.error.includes("Invalid")) {
					removeAccountInfo();
				}
				
				errorNotification(result.error);
			} else {
				let key = localStorage.getItem("key");

				let settings = { ...defaultSettings, choices:JSON.stringify(defaultChoices) };
				if(!empty(result.settings)) {
					let decryptedSettings = CryptoFN.decryptAES(result.settings.userSettings, key);
					if(validJSON(decryptedSettings)) {
						settings = JSON.parse(decryptedSettings);
					}
				}

				let choices = JSON.parse(settings?.choices);
				
				setSettings(settings);

				setAccountInfo(result, false);
				
				showApp();

				setPage(choices?.defaultPage);
				setSettingsPage(choices?.defaultSettingsPage);
			}
		}).catch(error => {
			errorNotification(error);
		});
	} else {
		setTimeout(() => {
			divLoading.classList.add("hidden");
		}, 1000);
	}
}

function finishLogout() {
	clearLogin();
	clearApp();

	removeAccountInfo();

	showLogin();

	Notify.success({
		title: "Logged Out",
		description: "You've been logged out of your account.",
		duration: 5000,
		background: "var(--accent-second)",
		color: "var(--accent-contrast)"
	});
}

function setAccountInfo(info, updateKey) {
	localStorage.setItem("userID", info.userID);
	localStorage.setItem("username", info.username);
	localStorage.setItem("token", info.token);

	if(updateKey) {
		localStorage.setItem("key", info.key);
	}

	if(empty(localStorage.getItem("keyAPI"))) {
		localStorage.setItem("keyAPI", "-");
	}
}

function removeAccountInfo() {
	localStorage.removeItem("userID");
	localStorage.removeItem("username");
	localStorage.removeItem("token");
	localStorage.removeItem("key");
	localStorage.removeItem("keyAPI");
}

function clearLogin() {
	inputLoginUsername.value = "";
	inputLoginPassword.value = "";
	inputCreateUsername.value = "";
	inputCreatePassword.value = "";
	inputCreateRepeatPassword.value = "";
	buttonExistingAccount.click();
}

function showLogin() {
	clearLogin();
	clearApp();
	divPageLogin.classList.remove("hidden");
	divPageApp.classList.add("hidden");
}

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

function showApp() {
	clearLogin();
	clearApp();
	divPageLogin.classList.add("hidden");
	divPageApp.classList.remove("hidden");
}