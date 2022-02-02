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

				setPage(choices?.defaultPage);
				setSettingsPage(choices?.defaultSettingsPage);

				setSettings(settings);

				setAccountInfo(result, false);
				showApp();
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

// TODO: Add functionality.
function clearApp() {

}

function showApp() {
	clearLogin();
	clearApp();
	divPageLogin.classList.add("hidden");
	divPageApp.classList.remove("hidden");
}