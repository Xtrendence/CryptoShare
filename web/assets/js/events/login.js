// Show user registration form.
buttonNewAccount.addEventListener("click", () => {
	divPageLogin.classList.remove("login");
	divPageLogin.classList.add("create");
});

// Log the user in.
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

		// If the user is logging in on the desktop app, the API URL is required.
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

				// Used to apply user settings chosen during registration.
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

// Show login form.
buttonExistingAccount.addEventListener("click", () => {
	divPageLogin.classList.add("login");
	divPageLogin.classList.remove("create");
});

// Start the registration process.
buttonCreateAccount.addEventListener("click", async () => {
	// If the user is logging in on the desktop app, the API URL is required.
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

	accountSetup();
});

// Toggle app theme.
loginToggleTheme.addEventListener("click", async () => {
	if(loginToggleTheme.classList.contains("active")) {
		await setTheme("dark");
	} else {
		await setTheme("light");
	}
});

// Log in when the "Enter" key is pressed.
inputLoginPassword.addEventListener("keydown", (event) => {
	if(event.key.toLowerCase() === "enter") {
		buttonLoginAccount.click();
	}
});

// Start registration process when the "Enter" key is pressed.
inputCreateRepeatPassword.addEventListener("keydown", (event) => {
	if(event.key.toLowerCase() === "enter") {
		buttonCreateAccount.click();
	}
});