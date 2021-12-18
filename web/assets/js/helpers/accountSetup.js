function accountSetup() {
	let popup = new Popup(300, "auto", "Account Creation", `<span>Would you like to create your new account, ${inputCreateUsername.value}?</span>`);
	popup.show();

	DOMCache.innerHTML = `<div id="cache-content"><img class="hidden" src="./assets/img/BG-White-Gold.png"><img class="hidden" src="./assets/img/BG-Black-Gold.png"></div>`;

	let count = 0;

	popup.on("confirm", () => {
		switch(count) {
			case 0:
				popup.setOptions({ confirmText:"Continue" });
				popup.setHTML(`<span>Before your account can be created, you'll need to complete a short setup process.</span>`);
				break;
			case 1:
				popup.setSize(700, "auto");
				popup.setOptions({ cancelText:"Disagree", confirmText:"Agree" });
				popup.setHTML(`<span>By using CryptoShare, you understand that third-party APIs are used to get the prices and details of stocks and cryptoassets. This data may be incorrect or inaccurate at any given time, and basing your trading activity on it is your own responsibility. You understand that trading can be a high-risk activity, and that you may lose all your money. You understand that CryptoShare does not provide any trading services, and does not manage or access your actual financial accounts. While steps have been taken to ensure the integrity of your data and the software working as intended, you understand that bugs may be present, and that the developer of the application cannot be held responsible for any loss of data or otherwise. You understand that all your data is stored on the device hosting the CryptoShare server, and is never sent to any third-party servers or service providers. You understand that, in order to function, data sent to and received from the chat bot is not encrypted on the client-side (a compromised CryptoShare server could read/store it). You understand that the tax, mortgage, and other related data are exclusively based on UK law, and may not be accurate.</span>`);

				break;
			case 2:
				popup.setSize(460, 695);
				popup.setOptions({ cancelText:"Cancel", confirmText:"Continue" });
				popup.setHTML(`<span>Which color theme would you like to use?</span><img class="clickable" id="popup-clickable-light" src="./assets/img/BG-White-Gold.png"><img class="clickable" id="popup-clickable-dark" src="./assets/img/BG-Black-Gold.png">`);

				DOMCache.innerHTML = "";

				let images = popup.element.getElementsByTagName("img");
				for(let i = 0; i < images.length; i++) {
					if(images[i].id.includes(applicationTheme)) {
						images[i].classList.add("active");
					}

					images[i].addEventListener("click", () => {
						for(let j = 0; j < images.length; j++) {
							images[j].classList.remove("active");
						}

						if(images[i].id === "popup-clickable-light") {
							setTheme("light");
						} else {
							setTheme("dark");
						}

						images[i].classList.add("active");
					});
				}

				break;
			case 3:
				popup.setSize(400, "auto");
				popup.setHTML(`<span>Would you like the background to be animated? This uses more system resources, and may reduce battery life if your device runs on a battery.</span><div class="toggle-wrapper" id="popup-toggle-background"><div class="toggle-container"></div></div>`);

				let toggle = document.getElementById("popup-toggle-background");

				if(applicationBackground === "animated") {
					toggle.classList.add("active");
				}

				toggle.addEventListener("click", () => {
					if(toggle.classList.contains("active")) {
						toggle.classList.remove("active");
						setBackground("static", applicationTheme);
					} else {
						toggle.classList.add("active");
						setBackground("animated", applicationTheme);
					}
				});

				break;
			case 4:
				popup.setOptions({ confirmText:"Finish" });
				popup.setHTML(`<span>If you aren't hosting CryptoShare yourself, please be aware that whoever is hosting it can modify the code to steal your financial data, so make sure you trust them.</span>`);
				break;
			case 5:
				// TODO: Account creation.
				popup.hide();
				break;
		}

		count++;
	});
}