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

document.addEventListener("keydown", (event) => {
	if(event.key.toLowerCase() === "enter") {
		if(document.getElementById("popup-button-confirm")) {
			document.getElementById("popup-button-confirm").click();
		} else {
			if(document.getElementById("popup-button-cancel")) {
				document.getElementById("popup-button-cancel").click();
			}
		}
	}

	if(event.key.toLowerCase() === "escape") {
		if(document.getElementById("popup-button-cancel")) {
			document.getElementById("popup-button-cancel").click();
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

				setPage(choices?.defaultPage);
				setSettingsPage(choices?.defaultSettingsPage);

				showApp();
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

buttonMarketInfo.addEventListener("click", async () => {
	try {
		showLoading(2000, "Fetching Global Market Data...");

		let currency = getCurrency();

		let data = await cryptoAPI.getGlobal();

		setTimeout(() => {
			hideLoading();
		}, 250);

		let volume = parseInt(data.data.total_volume[currency].toFixed(2));
		let marketCap = parseInt(data.data.total_market_cap[currency].toFixed(2));
		let marketCapChangeDay = formatPercentage(data.data.market_cap_change_percentage_24h_usd);
		let updated = formatDateHuman(new Date(data.data.updated_at * 1000));

		let html = `
			<div class="info-wrapper noselect">
				<div class="info-container">
					<span>Volume: ${currencySymbols[currency] + separateThousands(volume)}</span>
					<span>Market Cap: ${currencySymbols[currency] + separateThousands(marketCap)}</span>
					<span>24 Change: ${marketCapChangeDay}%</span>
				</div>
			</div>
			<span>Last Update: ${updated}</span>
		`;

		let popup = new Popup(400, "auto", "Global Market Info", html, { cancelText:"Dismiss", confirmText:"-" });
		popup.show();
		popup.updateHeight();
	} catch(error) {
		errorNotification("Could not fetch global market data.");
		console.log(error);
	}
});

buttonMarketSearch.addEventListener("click", () => {
	try {
		let html = `<input class="uppercase" id="popup-input-search" type="text" placeholder="Coin Symbol...">`;
		let popup = new Popup(240, "auto", "Market Search", html, { confirmText:"Search" });
		popup.show();
		popup.updateHeight();

		let inputSearch = document.getElementById("popup-input-search");

		inputSearch.focus();

		popup.on("confirm", async () => {
			let currency = getCurrency();
			let symbol = inputSearch.value;

			if(!empty(symbol)) {
				let result = await getCoin({ symbol:symbol });

				if("id" in result) {
					showLoading(1000, "Loading...");

					let data = await cryptoAPI.getMarketByID(currency, result.id);
					let info = parseCryptoMarketData(currency, data[0]);
					showCryptoMarketData(info);
					popup.hide();
				} else {
					showCryptoMatches(inputSearch, result);
					popup.setSize(360, "auto");
					popup.updateHeight();

					let rows = popup.element.getElementsByClassName("popup-list-row");

					for(let i = 0; i < rows.length; i++) {
						rows[i].addEventListener("click", async () => {
							showLoading(1000, "Loading...");

							let id = rows[i].getAttribute("data-id");

							let data = await cryptoAPI.getMarketByID(currency, id);
							let info = parseCryptoMarketData(currency, data[0]);
							showCryptoMarketData(info);
							popup.hide();
						});
					}
				}
			} else {
				errorNotification("Please provide a symbol/ticker to search for.");
			}
		});
	} catch(error) {
		errorNotification("Something went wrong...");
		console.log(error);
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

// TODO: Add functionality.
buttonHoldingsPerformance.addEventListener("click", () => {
	if(getSettingsChoices().transactionsAffectHoldings === "enabled") {
		
	} else {
		errorNotification("Transactions must be set to affect holdings (this can be done in the settings).");
	}
});

buttonHoldingsAddCryptoAsset.addEventListener("click", () => {
	try {
		if(getSettingsChoices().transactionsAffectHoldings === "disabled") {
			let html = `<input class="uppercase" id="popup-input-symbol-crypto" type="text" placeholder="Coin Symbol..."><input id="popup-input-amount-crypto" type="number" placeholder="Amount...">`;
			let popup = new Popup(240, "auto", "Add Crypto Asset", html, { confirmText:"Add" });
			popup.show();
			popup.updateHeight();

			let inputSymbol = document.getElementById("popup-input-symbol-crypto");
			let inputAmount = document.getElementById("popup-input-amount-crypto");

			inputSymbol.focus();

			popup.on("confirm", async () => {
				let symbol = inputSymbol.value;
				let amount = inputAmount.value;

				if(!empty(symbol) && !empty(amount) && !isNaN(amount) && amount > 0) {
					let userID = localStorage.getItem("userID");
					let token = localStorage.getItem("token");
					let key = localStorage.getItem("key");

					let result = await getCoin({ symbol:symbol });

					if("id" in result) {
						showLoading(1000, "Adding...");

						let id = result.id;

						let exists = await cryptoHoldingExists(id);

						let encrypted = encryptObjectValues(key, {
							holdingAssetID: id,
							holdingAssetSymbol: symbol,
							holdingAssetAmount: amount,
							holdingAssetType: "crypto"
						});

						if(exists.exists) {
							await updateHolding(token, userID, exists.holdingID, encrypted.holdingAssetID, encrypted.holdingAssetSymbol, encrypted.holdingAssetAmount, encrypted.holdingAssetType);
							
							errorNotification("Asset was already part of your holdings, but the amount was updated.");
						} else {
							await createHolding(token, userID, encrypted.holdingAssetID, encrypted.holdingAssetSymbol, encrypted.holdingAssetAmount, encrypted.holdingAssetType);
						}

						populateHoldingsList(true);

						popup.hide();
					} else {
						showCryptoMatches(inputAmount, result);
						popup.setSize(360, "auto");
						popup.updateHeight();

						let rows = popup.element.getElementsByClassName("popup-list-row");

						for(let i = 0; i < rows.length; i++) {
							rows[i].addEventListener("click", async () => {
								showLoading(1000, "Adding...");

								let id = rows[i].getAttribute("data-id");

								let exists = await cryptoHoldingExists(id);

								let encrypted = encryptObjectValues(key, {
									holdingAssetID: id,
									holdingAssetSymbol: symbol,
									holdingAssetAmount: amount,
									holdingAssetType: "crypto"
								});

								if(exists.exists) {
									await updateHolding(token, userID, exists.holdingID, encrypted.holdingAssetID, encrypted.holdingAssetSymbol, encrypted.holdingAssetAmount, encrypted.holdingAssetType);

									errorNotification("Asset was already part of your holdings, but the amount was updated.");
								} else {
									await createHolding(token, userID, encrypted.holdingAssetID, encrypted.holdingAssetSymbol, encrypted.holdingAssetAmount, encrypted.holdingAssetType);
								}

								populateHoldingsList(true);

								popup.hide();
							});
						}
					}
				} else {
					errorNotification("Please fill out both fields, and enter the amount as a number.");
				}
			});
		} else {
			errorNotification("You cannot modify your holdings this way while transactions are affecting them. Add an activity/transaction instead.");
		}
	} catch(error) {
		errorNotification("Something went wrong...");
		console.log(error);
	}
});

// TODO: Add functionality.
buttonHoldingsAddStockAsset.addEventListener("click", () => {
	
});

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
	let popup = new Popup(300, "auto", "Change Password", `<input type="password" id="popup-input-current-password" placeholder="Current Password..."><input type="password" id="popup-input-new-password" placeholder="New Password..."><input type="password" id="popup-input-repeat-password" placeholder="Repeat Password...">`);
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

buttonSettingsReset.addEventListener("click", () => {
	let popup = new Popup(300, "auto", "Reset Settings", `<span>Are you sure you want to reset your settings?</span>`);
	popup.show();

	popup.on("confirm", () => {
		popup.hide();
		resetSettings();
	});
});