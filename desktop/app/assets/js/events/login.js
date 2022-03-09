buttonNewAccount.addEventListener("click", () => {
	divPageLogin.classList.remove("login");
	divPageLogin.classList.add("create");
});

buttonLoginAccount.addEventListener("click", async () => {
	try {
		if(empty(inputLoginUsername.value) || empty(inputLoginPassword.value)) {
			errorNotification("Please fill out all fields.");
			return;
		}

		if((empty(inputLoginAPI.value) && appPlatform === "app") || (empty(inputLoginAPI.value) && appBypass())) {
			errorNotification("API URL must be provided.");
			return;
		}

		if(appPlatform === "app" || appBypass()) {
			urlAPI = inputLoginAPI.value;

			try {
				let url = new URL(urlAPI);
				urlBot = `${url.protocol}//${url.hostname}:${url.port + 1}`;
				
				await appStorage.setItem("api", url.toString());
			} catch(error) {
				console.log(error);
				errorNotification("Invalid API URL format.");
				return;
			}
		}

		login(inputLoginUsername.value, inputLoginPassword.value).then(async result => {
			if("error" in result) {
				errorNotification(result.error.replaceAll("!", ""));
			} else {
				socket = io.connect(urlBot);
				attachSocketEvents(socket);
				
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

				await setSettings(settings);
				await setAccountInfo(result, true);
				
				showApp();

				setPage(choices?.defaultPage);
				setSettingsPage(choices?.defaultSettingsPage);
			}
		}).catch(error => {
			errorNotification(error);
		});
	} catch(error) {
		errorNotification("Something went wrong... - EW6");
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