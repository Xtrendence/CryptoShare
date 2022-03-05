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

buttonSettingsLogout.addEventListener("click", async () => {
	let userID = await appStorage.getItem("userID");
	let token = await appStorage.getItem("token");

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

buttonSettingsLogoutEverywhere.addEventListener("click", async () => {
	let userID = await appStorage.getItem("userID");
	let token = await appStorage.getItem("token");

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

	popup.on("confirm", async () => {
		let userID = await appStorage.getItem("userID");
		let token = await appStorage.getItem("token");

		let currentPassword = inputCurrentPassword.value;
		let newPassword = document.getElementById("popup-input-new-password").value;
		let repeatPassword = document.getElementById("popup-input-repeat-password").value;

		if(newPassword === repeatPassword) {
			let key = await appStorage.getItem("key");

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
	let popup = new Popup(300, "auto", "Delete Account", `<span>Are you sure you want to delete your account?</span>`, { confirmText:"Delete", page:"settings" });
	popup.show();

	popup.on("confirm", () => {
		popup.hide();
		popup.show();
		popup.setHTML(`<span>Are you absolutely sure? This will delete all of your data as well.</span>`);

		popup.on("confirm", async () => {
			try {
				popup.hide();

				showLoading(5000, "Deleting Account...");

				let token = await appStorage.getItem("token");
				let userID = await appStorage.getItem("userID");
				
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
		let token = await appStorage.getItem("token");
		let userID = await appStorage.getItem("userID");
		let username = await appStorage.getItem("username");
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

buttonSettingsStockAPIKey.addEventListener("click", async () => {
	let popup = new Popup(300, "auto", "Set Stock API Key", `<span class="margin-bottom">If internal stock API is being used, set the API key to "-" or anything besides leaving it empty.</span><input spellcheck="false" type="text" id="popup-input-stock-api-key" placeholder="API Key...">`, { page:"settings" });
	popup.show();

	let inputStockAPIKey = document.getElementById("popup-input-stock-api-key");

	inputStockAPIKey.value = await appStorage.getItem("keyAPI");

	inputStockAPIKey.focus();

	popup.on("confirm", async () => {
		if(!empty(inputStockAPIKey.value)) {
			await appStorage.setItem("keyAPI", inputStockAPIKey.value);

			Notify.success({
				title: "Stock API Key Set",
				description: "API key has been set.",
				duration: 5000,
				background: "var(--accent-second)",
				color: "var(--accent-contrast)"
			});
		} else {
			await appStorage.removeItem("keyAPI");

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
		let token = await appStorage.getItem("token");
		let userID = await appStorage.getItem("userID");
		let username = await appStorage.getItem("username");
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

buttonSettingsQRCode.addEventListener("click", () => {
	if(urlAPI.includes("localhost") || urlAPI.includes("127.0.0.1")) {
		errorNotification(`You can't generate a QR login code when accessing the web app as "localhost".`);
		return;
	}

	let popup = new Popup(300, "auto", "Generate QR Code", `<span class="margin-bottom">Please enter your password to generate a login token.</span><input spellcheck="false" type="password" id="popup-input-qr-password" placeholder="Password...">`, { page:"settings" });
	popup.show();

	popup.on("confirm", async () => {
		let password = document.getElementById("popup-input-qr-password").value;

		if(empty(password)) {
			errorNotification("Password cannot be empty.");
			return;
		}

		try {
			popup.hide();

			popup = new Popup(420, 562, "QR Code", `<span class="margin-bottom">Please log in using the mobile app.</span><div class="popup-canvas-wrapper" id="popup-canvas-wrapper"></div>`, { page:"settings", confirmText:"-", cancelText:"Dismiss" });
			popup.show();

			let username = await appStorage.getItem("username");
			let response = await login(username, password);

			if("error" in response) {
				errorNotification(response.error);
				console.log(response.error);
				return;
			}

			let qrStyle = JSON.parse(qrCodeStyle);
			qrStyle.width = 340;
			qrStyle.height = 340;
			qrStyle.data = new URL(urlAPI, document.baseURI).href + "!" + username + "!" + password;

			let qrCode = new QRCodeStyling(qrStyle);

			qrCode.append(document.getElementById("popup-canvas-wrapper"));
		} catch(error) {
			errorNotification("Something went wrong...");
			console.log(error);
		}
	});
});

buttonSettingsReset.addEventListener("click", () => {
	let popup = new Popup(300, "auto", "Reset Settings", `<span>Are you sure you want to reset your settings?</span>`, { page:"settings" });
	popup.show();

	popup.on("confirm", () => {
		popup.hide();
		resetSettings();
	});
});

buttonSettingsDataWatchlist.addEventListener("click", async () => {
	let watchlist = await fetchWatchlist() || {};

	if(empty(watchlist)) {
		errorNotification("No watchlist items found.");
		return;
	}

	let userID = await appStorage.getItem("userID");
	let token = await appStorage.getItem("token");

	let popup = new Popup(400, "auto", "Manage Watchlist Data", `<span>Use this to remove data that is causing issues.</span><div id="popup-data-list" class="popup-data-list noselect"></div>`, { page:"settings", confirmText:"-" });
	popup.show();
	popup.updateHeight();

	let dataList = document.getElementById("popup-data-list");

	Object.keys(watchlist).map(index => {
		let row = document.createElement("div");
		row.innerHTML = `<span>${watchlist[index]?.assetID} - ${watchlist[index]?.assetSymbol.toUpperCase()}</span>`;
		row.addEventListener("click", () => {
			popup.hide();

			popup = new Popup(300, "auto", "Delete Watchlist Item", `<span>Are you sure you want to delete this item?</span>`, { page:"settings" });
			popup.show();
			popup.updateHeight();

			popup.on("confirm", async () => {
				try {
					showLoading(2000, "Deleting...");
					await deleteWatchlist(token, userID, watchlist[index].watchlistID);
					hideLoading();
					popup.hide();
				} catch(error) {
					errorNotification("Something went wrong...");
					console.log(error);
				}
			});
		});

		dataList.appendChild(row);
	});

	popup.updateHeight();
});

buttonSettingsDataHolding.addEventListener("click", async () => {
	let userID = await appStorage.getItem("userID");
	let token = await appStorage.getItem("token");
	let key = await appStorage.getItem("key");

	let holdingsData = {};

	let holdings = await readHolding(token, userID);

	let encrypted = holdings?.data?.readHolding;

	Object.keys(encrypted).map(index => {
		let decrypted = decryptObjectValues(key, encrypted[index]);
		decrypted.holdingID = encrypted[index].holdingID;
		holdingsData[decrypted.holdingAssetID] = decrypted;
	});

	if(empty(holdingsData)) {
		errorNotification("No holdings found.");
		return;
	}

	let popup = new Popup(400, "auto", "Manage Holding Data", `<span>Use this to remove data that is causing issues.</span><div id="popup-data-list" class="popup-data-list noselect"></div>`, { page:"settings", confirmText:"-" });
	popup.show();
	popup.updateHeight();

	let dataList = document.getElementById("popup-data-list");

	Object.keys(holdingsData).map(id => {
		let row = document.createElement("div");
		row.innerHTML = `<span>${id} - ${holdingsData[id]?.holdingAssetSymbol.toUpperCase()}</span>`;
		row.addEventListener("click", () => {
			popup.hide();

			popup = new Popup(300, "auto", "Delete Holding Item", `<span>Are you sure you want to delete this item?</span>`, { page:"settings" });
			popup.show();
			popup.updateHeight();

			popup.on("confirm", async () => {
				try {
					showLoading(2000, "Deleting...");
					await deleteHolding(token, userID, holdingsData[id].holdingID);
					hideLoading();
					popup.hide();
				} catch(error) {
					errorNotification("Something went wrong...");
					console.log(error);
				}
			});
		});

		dataList.appendChild(row);
	});

	popup.updateHeight();
});

buttonSettingsDataActivity.addEventListener("click", async () => {
	let activities = await fetchActivity() || {};

	if(empty(activities)) {
		errorNotification("No activities found.");
		return;
	}
	
	let userID = await appStorage.getItem("userID");
	let token = await appStorage.getItem("token");

	let popup = new Popup(450, "auto", "Manage Activity Data", `<span class="margin-bottom">Use this to remove data that is causing issues.</span><input id="popup-input-search" placeholder="Search..." spellcheck="false"><div id="popup-data-list" class="popup-data-list noselect"></div>`, { page:"settings", confirmText:"-" });
	popup.show();
	popup.updateHeight();

	let popupInputSearch = document.getElementById("popup-input-search");

	popupInputSearch.addEventListener("keydown", () => {
		filterPopupList(popupInputSearch.value);
	});

	popupInputSearch.addEventListener("keyup", () => {
		filterPopupList(popupInputSearch.value);
	});

	let dataList = document.getElementById("popup-data-list");
	
	function filterPopupList(query) {
		let spans = dataList.getElementsByTagName("span");

		dataList.classList.remove("hidden");

		if(empty(query)) {
			for(let i = 0; i < spans.length; i++) {
				spans[i].parentElement.classList.remove("hidden");
			}

			popup.updateHeight();

			return;
		}

		query = query.toLowerCase();

		let match = false;

		for(let i = 0; i < spans.length; i++) {
			let span = spans[i];
			let content = span.textContent.toLowerCase();
			
			if(content.includes(query)) {
				span.parentElement.classList.remove("hidden");
				match = true;
			} else {
				span.parentElement.classList.add("hidden");
			}
		}

		if(!match) {
			dataList.classList.add("hidden");
		}

		popup.updateHeight();
	}

	Object.keys(activities).map(id => {
		let row = document.createElement("div");
		row.innerHTML = `<span>${activities[id]?.activityAssetID} - ${activities[id]?.activityAssetSymbol.toUpperCase()} - ${activities[id]?.activityDate}</span>`;
		row.addEventListener("click", () => {
			popup.hide();

			popup = new Popup(300, "auto", "Delete Activity Item", `<span>Are you sure you want to delete this item?</span>`, { page:"settings" });
			popup.show();
			popup.updateHeight();

			popup.on("confirm", async () => {
				try {
					showLoading(2000, "Deleting...");
					await deleteActivity(token, userID, activities[id].activityID);
					hideLoading();
					popup.hide();
				} catch(error) {
					errorNotification("Something went wrong...");
					console.log(error);
				}
			});
		});

		dataList.appendChild(row);
	});

	popup.updateHeight();
});