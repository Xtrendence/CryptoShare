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
				if(!urlAPI.includes("http://") && !urlAPI.includes("https://")) {
					urlAPI = `http://${urlAPI}`;
				}
				
				let url = new URL(urlAPI);
				urlBot = url.toString().replace("graphql", "");

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

				let firstLogin = await appStorage.getItem("firstLogin");

				let settings = { ...defaultSettings, choices:JSON.stringify(defaultChoices) };

				let currentChoices = await getSettingsChoices();

				if(currentChoices?.settingsSync === "disabled") {
					settingsDataSync = "disabled";
					let json = await fetchSettings();
					settings = JSON.parse(json);
				} else {
					if(!empty(result.settings)) {
						let decryptedSettings = CryptoFN.decryptAES(result.settings.userSettings, decrypted);
						if(validJSON(decryptedSettings)) {
							settings = JSON.parse(decryptedSettings);
						}
					}
				}

				if(firstLogin === "true") {
					let currentTheme = await appStorage.getItem("theme");
					settings.theme = currentTheme;
				}

				let choices = JSON.parse(settings?.choices);

				await setSettings(settings);
				await setAccountInfo(result, true);
				
				if(firstLogin === "true") {
					await syncSettings(true);
					await appStorage.removeItem("firstLogin");
				}
				
				showApp();

				setPage(choices?.defaultPage);
				setSettingsPage(choices?.defaultSettingsPage);
			}
		}).catch(error => {
			console.log(error);
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

loginToggleTheme.addEventListener("click", async () => {
	if(loginToggleTheme.classList.contains("active")) {
		await setTheme("dark");
	} else {
		await setTheme("light");
	}
});

inputLoginPassword.addEventListener("keydown", (event) => {
	if(event.key.toLowerCase() === "enter") {
		buttonLoginAccount.click();
	}
});

inputCreateRepeatPassword.addEventListener("keydown", (event) => {
	if(event.key.toLowerCase() === "enter") {
		buttonCreateAccount.click();
	}
});