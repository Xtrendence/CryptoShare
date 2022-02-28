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

	let popup = new Popup(300, "auto", "Logout Everywhere", `<span>Are you sure you want to log out from every active session?</span>`, { page:"settings" });
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
	let html = `
		<span class="popup-input-span">Current Password</span>
		<input type="password" id="popup-input-current-password" placeholder="Current Password..." spellcheck="false">
		<span class="popup-input-span">New Password</span>
		<input type="password" id="popup-input-new-password" placeholder="New Password..." spellcheck="false">
		<span class="popup-input-span">Repeat Password</span>
		<input type="password" id="popup-input-repeat-password" placeholder="Repeat Password..." spellcheck="false">
	`;

	let popup = new Popup(300, "auto", "Change Password", html, { page:"settings" });
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
			let key = localStorage.getItem("key");

			if(empty(key)) {
				errorNotification("Couldn't change encryption key.");
				return;
			}

			let encrypted = CryptoFN.encryptAES(key, newPassword);

			changePassword(userID, token, encrypted, currentPassword, newPassword).then(result => {
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

						logoutEverywhere(userID, token).then(result => {
							if("error" in result) {
								errorNotification(result.error);
							} else {
								finishLogout();
							}
						}).catch(error => {
							errorNotification(error);
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

buttonSettingsDeleteAccount.addEventListener("click", () => {
	let popup = new Popup(300, "auto", "Delete Account", `<span>Are you sure you want to delete your account?</span>`, { page:"settings" });
	popup.show();

	popup.on("confirm", () => {
		popup.hide();
		popup.show();
		popup.setHTML(`<span>Are you absolutely sure? This will delete all of your data as well.</span>`);

		popup.on("confirm", async () => {
			try {
				popup.hide();

				showLoading(5000, "Deleting Account...");

				let token = localStorage.getItem("token");
				let userID = localStorage.getItem("userID");
				
				await deleteUser(token, userID);

				setTimeout(() => {
					hideLoading();
					finishLogout();

					Notify.success({
						title: "Account Deleted",
						description: `Your account has been deleted.`,
						duration: 5000,
						background: "var(--accent-second)",
						color: "var(--accent-contrast)"
					});
				}, 2500);
			} catch(error) {
				hideLoading();
				console.log(error);
				errorNotification("Something went wrong...");
			}
		});
	});
});

buttonSettingsUserRegistration.addEventListener("click", async () => {
	try {
		let token = localStorage.getItem("token");
		let userID = localStorage.getItem("userID");
		let username = localStorage.getItem("username");
		let type = "enabled";
		let action = "enableRegistration";

		if(buttonSettingsUserRegistration.getAttribute("data-type") === "enabled") {
			type = "disabled";
			action = "disableRegistration";
		}

		await performAdminAction(token, userID, username, action);

		Notify.success({
			title: "Setting Changed",
			description: `User registration is now ${type}.`,
			duration: 5000,
			background: "var(--accent-second)",
			color: "var(--accent-contrast)"
		});

		getAdminSettings();
	} catch(error) {
		console.log(error);
	}
});

buttonSettingsStockAPIKey.addEventListener("click", () => {
	let popup = new Popup(300, "auto", "Set Stock API Key", `<span class="margin-bottom">If internal stock API is being used, set the API key to "-" or anything besides leaving it empty.</span><input spellcheck="false" type="text" id="popup-input-stock-api-key" placeholder="API Key...">`, { page:"settings" });
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
	let popup = new Popup(300, "auto", "Reset Settings", `<span>Are you sure you want to reset your settings?</span>`, { page:"settings" });
	popup.show();

	popup.on("confirm", () => {
		popup.hide();
		resetSettings();
	});
});