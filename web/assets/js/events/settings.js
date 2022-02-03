settingsToggleTheme.addEventListener("click", () => {
	if(settingsToggleTheme.classList.contains("active")) {
		setTheme("dark");
	} else {
		setTheme("light");
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
	let popup = new Popup(300, "auto", "Change Password", `<input type="password" id="popup-input-current-password" placeholder="Current Password..." spellcheck="false"><input type="password" id="popup-input-new-password" placeholder="New Password..." spellcheck="false"><input type="password" id="popup-input-repeat-password" placeholder="Repeat Password..." spellcheck="false">`);
	popup.show();

	let inputCurrentPassword = document.getElementById("popup-input-current-password");

	inputCurrentPassword.focus();

	popup.on("confirm", () => {
		let userID = localStorage.getItem("userID");
		let token = localStorage.getItem("token");

		let currentPassword = inputCurrentPassword.value;
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

buttonSettingsStockAPIKey.addEventListener("click", () => {
	let popup = new Popup(300, "auto", "Set Stock API Key", `<input spellcheck="false" type="text" id="popup-input-stock-api-key" placeholder="API Key...">`);
	popup.show();

	let inputStockAPIKey = document.getElementById("popup-input-stock-api-key");

	inputStockAPIKey.value = localStorage.getItem("keyAPI");

	inputStockAPIKey.focus();

	popup.on("confirm", () => {
		if(!empty(inputStockAPIKey.value)) {
			localStorage.setItem("keyAPI", inputStockAPIKey.value);

			Notify.success({
				title: "Stock API Key Set",
				description: "API key has been set.",
				duration: 5000,
				background: "var(--accent-second)",
				color: "var(--accent-contrast)"
			});
		} else {
			localStorage.removeItem("keyAPI");

			Notify.success({
				title: "Stock API Key Removed",
				description: "API key has been removed.",
				duration: 5000,
				background: "var(--accent-second)",
				color: "var(--accent-contrast)"
			});
		}

		popup.hide();
	});
});

buttonSettingsStockAPIType.addEventListener("click", async () => {
	try {
		let token = localStorage.getItem("token");
		let userID = localStorage.getItem("userID");
		let username = localStorage.getItem("username");
		let type = "internal";
		let action = "internalStockAPI";

		if(buttonSettingsStockAPIType.getAttribute("data-type") === "internal") {
			type = "external";
			action = "externalStockAPI";
		}

		await performAdminAction(token, userID, username, action);

		Notify.success({
			title: "Setting Changed",
			description: `Now using ${type} stock API.`,
			duration: 5000,
			background: "var(--accent-second)",
			color: "var(--accent-contrast)"
		});

		getAdminSettings();
	} catch(error) {
		console.log(error);
	}
});

buttonSettingsReset.addEventListener("click", () => {
	let popup = new Popup(300, "auto", "Reset Settings", `<span>Are you sure you want to reset your settings?</span>`);
	popup.show();

	popup.on("confirm", () => {
		popup.hide();
		resetSettings();
	});
});