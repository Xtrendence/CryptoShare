let resizeTimeout;
window.addEventListener("resize", () => {
	clearTimeout(resizeTimeout);
	resizeTimeout = setTimeout(() => {
		particlesJS("animated-background", getParticlesConfig(applicationSettings.theme, document.documentElement));
	}, 250);
});

document.addEventListener("click", (event) => {
	let audible = audibleElement(event.target);
	if(applicationSettings.sounds === "enabled" && audioPlayable && audible.audible) {
		if(audible.type === "switch") {
			audioSwitch.currentTime = 0;
			audioSwitch.play();
		} else {
			audioPop.currentTime = 0;
			audioPop.play();
		}
	}
});

audioPop.addEventListener("canplay", () => {
	audioPlayable = true;
});

buttonNewAccount.addEventListener("click", () => {
	divPageLogin.classList.remove("login");
	divPageLogin.classList.add("create");
});

buttonLoginAccount.addEventListener("click", () => {
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

			setPage(choices?.defaultPage);
			setSettingsPage(choices?.defaultSettingsPage);

			setSettings(settings);
			setAccountInfo(result, true);
			showApp();
		}
	}).catch(error => {
		errorNotification(error);
	});
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

buttonMarketCrypto.addEventListener("click", () => {
	if(!buttonMarketCrypto.classList.contains("active")) {
		buttonMarketCrypto.classList.add("active");
		buttonMarketStocks.classList.remove("active");

		divMarketListCrypto.classList.remove("hidden");
		divMarketListStocks.classList.add("hidden");

		let active = getActiveMarketPage();
		populateMarketList(active.cryptoPage, active.stocksPage, true);
	}
});

buttonMarketStocks.addEventListener("click", () => {
	if(!buttonMarketStocks.classList.contains("active")) {
		buttonMarketCrypto.classList.remove("active");
		buttonMarketStocks.classList.add("active");

		divMarketListCrypto.classList.add("hidden");
		divMarketListStocks.classList.remove("hidden");

		let active = getActiveMarketPage();
		populateMarketList(active.cryptoPage, active.stocksPage, true);
	}
});

buttonMarketPrevious.addEventListener("click", () => {
	let active = getActiveMarketPage();
	let previous = active.type === "crypto" ? active.cryptoPage - 1 : active.stocksPage - 1;

	if(previous > 0) {
		if(active.type === "crypto") {
			populateMarketList(previous, active.stocksPage, true);
		} else {
			populateMarketList(active.cryptoPage, previous, true);
		}
	} else {
		errorNotification("That's just not possible...");
	}
});

buttonMarketNext.addEventListener("click", () => {
	let active = getActiveMarketPage();
	let next = active.type === "crypto" ? active.cryptoPage + 1 : active.stocksPage + 1;

	if(next <= 5) {
		if(active.type === "crypto") {
			populateMarketList(next, active.stocksPage, true);
		} else {
			populateMarketList(active.cryptoPage, next, true);
		}
	} else {
		errorNotification("The market page only includes the top 500 assets.");
	}
});

settingsToggleTheme.addEventListener("click", () => {
	if(settingsToggleTheme.classList.contains("active")) {
		setTheme("dark");
	} else {
		setTheme("light");
	}

	syncSettings(true);
});

settingsToggleBackground.addEventListener("click", () => {
	if(settingsToggleBackground.classList.contains("active")) {
		setBackground("static", applicationSettings.theme);
	} else {
		setBackground("animated", applicationSettings.theme);
	}

	syncSettings(true);
});

settingsToggleSimpleBackground.addEventListener("click", () => {
	if(settingsToggleSimpleBackground.classList.contains("active")) {
		setBackground("static", applicationSettings.theme);
	} else {
		setBackground("simple", applicationSettings.theme);
	}

	syncSettings(true);
});

settingsToggleSounds.addEventListener("click", () => {
	if(settingsToggleSounds.classList.contains("active")) {
		setTimeout(() => {
			setSounds("disabled");
		}, 50);
	} else {
		setSounds("enabled");
	}

	syncSettings(true);
});

buttonSettingsLogout.addEventListener("click", () => {
	let userID = localStorage.getItem("userID");
	let token = localStorage.getItem("token");

	logout(userID, token).then(result => {
		if("error" in result) {
			errorNotification(result.error);
		} else {
			finishLogout();
		}
	}).catch(error => {
		errorNotification(error);
	});
});

buttonSettingsLogoutEverywhere.addEventListener("click", () => {
	let userID = localStorage.getItem("userID");
	let token = localStorage.getItem("token");

	let popup = new Popup(300, "auto", "Logout Everywhere", `<span>Are you sure you want to log out from every active session?</span>`);
	popup.show();

	popup.on("confirm", () => {
		popup.hide();
		
		logoutEverywhere(userID, token).then(result => {
			if("error" in result) {
				errorNotification(result.error);
			} else {
				finishLogout();
			}
		}).catch(error => {
			errorNotification(error);
		});
	});
});

buttonSettingsPassword.addEventListener("click", () => {
	let popup = new Popup(300, "auto", "Change Password", `<input type="password" id="popup-input-current-password" placeholder="Current Password..."><input type="password" id="popup-input-new-password" placeholder="New Password..."><input type="password" id="popup-input-repeat-password" placeholder="Repeat Password...">`);
	popup.show();

	popup.on("confirm", () => {
		let userID = localStorage.getItem("userID");
		let token = localStorage.getItem("token");

		let currentPassword = document.getElementById("popup-input-current-password").value;
		let newPassword = document.getElementById("popup-input-new-password").value;
		let repeatPassword = document.getElementById("popup-input-repeat-password").value;

		if(newPassword === repeatPassword) {
			changePassword(userID, token, currentPassword, newPassword).then(result => {
				if("error" in result) {
					errorNotification(result.error);
				} else {
					if("username" in result) {
						Notify.success({
							title: "Password Changed",
							description: "Your password has been changed.",
							duration: 5000,
							background: "var(--accent-second)",
							color: "var(--accent-contrast)"
						});

						popup.hide();
					}
				}
			}).catch(error => {
				errorNotification(error);
			});
		} else {
			errorNotification("Passwords don't match.");
		}
	});
});

buttonSettingsReset.addEventListener("click", () => {
	let popup = new Popup(300, "auto", "Reset Settings", `<span>Are you sure you want to reset your settings?</span>`);
	popup.show();

	popup.on("confirm", () => {
		popup.hide();
		resetSettings();
	});
});