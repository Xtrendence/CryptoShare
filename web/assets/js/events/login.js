buttonNewAccount.addEventListener("click", () => {
	divPageLogin.classList.remove("login");
	divPageLogin.classList.add("create");
});

buttonLoginAccount.addEventListener("click", () => {
	try {
		if(empty(inputLoginUsername.value) || empty(inputLoginPassword.value)) {
			errorNotification("Please fill out all fields.");
			return;
		}

		login(inputLoginUsername.value, inputLoginPassword.value).then(result => {
			if("error" in result) {
				errorNotification(result.error.replaceAll("!", ""));
			} else {
				let decrypted = CryptoFN.decryptAES(result.key, inputLoginPassword.value);
				result.key = decrypted;

				let settings = { ...defaultSettings, choices:JSON.stringify(defaultChoices) };
				if(!empty(result.settings)) {
					let decryptedSettings = CryptoFN.decryptAES(result.settings.userSettings, decrypted);
					if(validJSON(decryptedSettings)) {
						settings = JSON.parse(decryptedSettings);
					}
				}

				let choices = JSON.parse(settings?.choices);

				setSettings(settings);
				setAccountInfo(result, true);
				
				showApp();

				setPage(choices?.defaultPage);
				setSettingsPage(choices?.defaultSettingsPage);
			}
		}).catch(error => {
			errorNotification(error);
		});
	} catch(error) {
		errorNotification("Something went wrong...");
		console.log(error);
	}
});

buttonExistingAccount.addEventListener("click", () => {
	divPageLogin.classList.add("login");
	divPageLogin.classList.remove("create");
});

buttonCreateAccount.addEventListener("click", () => {
	accountSetup();
});

loginToggleTheme.addEventListener("click", () => {
	if(loginToggleTheme.classList.contains("active")) {
		setTheme("dark");
	} else {
		setTheme("light");
	}
});