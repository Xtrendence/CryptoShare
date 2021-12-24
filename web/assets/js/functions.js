function setTheme(theme) {
	applicationTheme = theme;

	let themeToggles = document.getElementsByClassName("toggle-wrapper theme");
	let favicons = document.getElementsByClassName("favicon");
	let browserTheme = document.getElementsByClassName("browser-theme")[0];

	if(theme === "light") {
		browserTheme.setAttribute("content", "#ffffff");

		for(let i = 0; i < favicons.length; i++) {
			favicons[i].href = favicons[i].href.replace("dark", "light");
		}

		for(let i = 0; i < themeToggles.length; i++) {
			themeToggles[i].classList.add("active");
		}

		localStorage.setItem("theme", "light");

		document.documentElement.classList.add("light");
		document.documentElement.classList.remove("dark");

		setBackground(applicationBackground, theme);
	} else {
		browserTheme.setAttribute("content", "#000000");

		for(let i = 0; i < favicons.length; i++) {
			favicons[i].href = favicons[i].href.replace("light", "dark");
		}

		for(let i = 0; i < themeToggles.length; i++) {
			themeToggles[i].classList.remove("active");
		}

		localStorage.setItem("theme", "dark");

		document.documentElement.classList.remove("light");
		document.documentElement.classList.add("dark");

		setBackground(applicationBackground, theme);
	}
}

function setBackground(background, theme) {
	let backgroundToggles = document.getElementsByClassName("toggle-wrapper background");

	if(background === "animated") {
		applicationBackground = "animated";

		for(let i = 0; i < backgroundToggles.length; i++) {
			backgroundToggles[i].classList.add("active");
		}

		localStorage.setItem("background", "animated");
		divAnimatedBackground.classList.remove("hidden");
		divStaticBackground.classList.add("hidden");
		particlesJS("animated-background", particlesConfig[theme]);
	} else {
		applicationBackground = "static";

		for(let i = 0; i < backgroundToggles.length; i++) {
			backgroundToggles[i].classList.remove("active");
		}

		localStorage.setItem("background", "static");
		divAnimatedBackground.innerHTML = "";
		divAnimatedBackground.classList.add("hidden");
		divStaticBackground.classList.remove("hidden");
		divStaticBackground.style.backgroundImage = theme === "light" ? `url("./assets/img/BG-White-Gold.png")` : `url("./assets/img/BG-Black-Gold.png")`;
	}
}

function setSounds(sounds) {
	let soundToggles = document.getElementsByClassName("toggle-wrapper sounds");

	if(sounds === "enabled") {
		applicationSounds = "enabled";

		for(let i = 0; i < soundToggles.length; i++) {
			soundToggles[i].classList.add("active");
		}

		localStorage.setItem("sounds", "enabled");
	} else {
		applicationSounds = "disabled";

		for(let i = 0; i < soundToggles.length; i++) {
			soundToggles[i].classList.remove("active");
		}

		localStorage.setItem("sounds", "disabled");
	}
}

function updatePasswordFields() {
	let wrappers = document.getElementsByClassName("input-password-wrapper");
	for(let i = 0; i < wrappers.length; i++) {
		let div = wrappers[i];
		let input = div.getElementsByTagName("input")[0];

		let button = document.createElement("button");
		button.setAttribute("class", "button-hide-password");
		button.innerHTML = `<svg width="1792" height="1792" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"><path d="M1664 960q-152-236-381-353 61 104 61 225 0 185-131.5 316.5t-316.5 131.5-316.5-131.5-131.5-316.5q0-121 61-225-229 117-381 353 133 205 333.5 326.5t434.5 121.5 434.5-121.5 333.5-326.5zm-720-384q0-20-14-34t-34-14q-125 0-214.5 89.5t-89.5 214.5q0 20 14 34t34 14 34-14 14-34q0-86 61-147t147-61q20 0 34-14t14-34zm848 384q0 34-20 69-140 230-376.5 368.5t-499.5 138.5-499.5-139-376.5-368q-20-35-20-69t20-69q140-229 376.5-368t499.5-139 499.5 139 376.5 368q20 35 20 69z"/></svg>`;

		button.addEventListener("click", () => {
			if(button.classList.contains("active")) {
				input.type = "password";
				button.classList.remove("active");
			} else {
				input.type = "text";
				button.classList.add("active");
			}
		});

		div.appendChild(button);
	}
}

function attemptLogin() {
	let userID = localStorage.getItem("userID");
	let token = localStorage.getItem("token");

	if(!empty(userID) && !empty(token)) {
		verifyToken(userID, token).then(result => {
			divLoading.classList.add("hidden");

			if("error" in result) {
				if(result.error.includes("Invalid")) {
					removeAccountInfo();
				}
				Notify.error({
					title: "Error",
					description: result.error,
					duration: 5000,
					background: "var(--accent-second)",
					color: "var(--accent-contrast)"
				});
			} else {
				setAccountInfo(result);
				showApp();
			}
		}).catch(error => {
			Notify.error({
				title: "Error",
				description: error,
				duration: 5000,
				background: "var(--accent-second)",
				color: "var(--accent-contrast)"
			});
		});
	} else {
		divLoading.classList.add("hidden");
	}
}

function finishLogout() {
	clearLogin();
	clearApp();

	removeAccountInfo();

	showLogin();

	Notify.success({
		title: "Logged Out",
		description: "You've been logged out of your account.",
		duration: 5000,
		background: "var(--accent-second)",
		color: "var(--accent-contrast)"
	});
}

// TODO: Decrypt key.
function setAccountInfo(info) {
	localStorage.setItem("userID", info.userID);
	localStorage.setItem("username", info.username);
	localStorage.setItem("token", info.token);
	localStorage.setItem("key", info.key);
}

function removeAccountInfo() {
	localStorage.removeItem("userID");
	localStorage.removeItem("username");
	localStorage.removeItem("token");
	localStorage.removeItem("key");
}

function clearLogin() {
	inputLoginUsername.value = "";
	inputLoginPassword.value = "";
	inputCreateUsername.value = "";
	inputCreatePassword.value = "";
	inputCreateRepeatPassword.value = "";
	buttonExistingAccount.click();
}

function showLogin() {
	clearLogin();
	clearApp();
	divPageLogin.classList.remove("hidden");
	divPageApp.classList.add("hidden");
}

function clearApp() {

}

function showApp() {
	clearLogin();
	clearApp();
	divPageLogin.classList.add("hidden");
	divPageApp.classList.remove("hidden");
}

function addNavbarEvents() {
	let items = divNavbar.getElementsByClassName("item");
	
	for(let i = 0; i < items.length; i++) {
		let item = items[i];

		item.addEventListener("click", () => {
			let page = item.id.replace("navbar-", "");
			setPage(page);
		});
	}
}

function clearActiveNavbarItem() {
	let items = divNavbar.getElementsByClassName("item");
	for(let i = 0; i < items.length; i++) {
		items[i].classList.remove("active");
	}
}

function clearActivePage() {
	let pages = divPageApp.getElementsByClassName("page");
	for(let i = 0; i < pages.length; i++) {
		pages[i].classList.add("hidden");
	}
}

function setPage(page) {
	clearActiveNavbarItem();
	clearActivePage();

	document.getElementById(`navbar-${page}`).classList.add("active");
	document.getElementById(`${page}-page`).classList.remove("hidden");

	switch(page) {
		case "chatbot":
			break;
		case "dashboard":
			break;
		case "market":
			break;
		case "holdings":
			break;
		case "activity":
			break;
		case "settings":
			break;
	}
}

function addSettingsNavbarEvents() {
	let items = divSettingsNavbar.getElementsByClassName("item");
	
	for(let i = 0; i < items.length; i++) {
		let item = items[i];

		item.addEventListener("click", () => {
			let page = item.id.replace("settings-navbar-", "");
			setSettingsPage(page);
		});
	}
}

function clearActiveSettingsNavbarItem() {
	let items = divSettingsNavbar.getElementsByClassName("item");
	for(let i = 0; i < items.length; i++) {
		items[i].classList.remove("active");
	}
}

function clearActiveSettingsPage() {
	let pages = divPageSettings.getElementsByClassName("settings-page");
	for(let i = 0; i < pages.length; i++) {
		pages[i].classList.add("hidden");
	}
}

function setSettingsPage(page) {
	clearActiveSettingsNavbarItem();
	clearActiveSettingsPage();

	document.getElementById(`settings-navbar-${page}`).classList.add("active");
	document.getElementById(`settings-page-${page}`).classList.remove("hidden");
}

function showLoading(limit, text = "") {
	hideLoading();

	let element = document.createElement("div");
	element.classList.add("loading-screen");
	element.innerHTML = '<div class="loading-icon"><div></div><div></div></div><span id="loading-text">' + text + '</span>';
	document.body.appendChild(element);

	setTimeout(() => {
		element.remove();
	}, limit);
}

function hideLoading() {
	for(let i = 0; i < document.getElementsByClassName("loading-screen").length; i++) {
		document.getElementsByClassName("loading-screen")[i].remove();
	}
}

function audibleElement(element) {
	let tags = ["svg", "path", "button"];
	let popType = ["item", "audible-pop"];
	let switchType = ["toggle-wrapper", "toggle-container", "audible-switch"];

	for(let i = 0; i < popType.length; i++) {
		if(element.classList.contains(popType[i]) || element.parentElement.classList.contains(popType[i])) {
			return { audible:true, type:"pop" };
		}
	}

	for(let i = 0; i < switchType.length; i++) {
		if(element.classList.contains(switchType[i]) || element.parentElement.classList.contains(switchType[i])) {
			return { audible:true, type:"switch" };
		}
	}
	
	for(let i = 0; i < tags.length; i++) {
		if(element.tagName.toLowerCase() === tags[i] || element.parentElement.tagName.toLowerCase() === tags[i]) {
			return { audible:true, type:"pop" };
		}
	}

	return { audible:false };
}