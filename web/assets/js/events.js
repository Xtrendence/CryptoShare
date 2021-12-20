let resizeTimeout;
window.addEventListener("resize", () => {
	clearTimeout(resizeTimeout);
	resizeTimeout = setTimeout(() => {
		particlesJS("animated-background", particlesConfig[applicationTheme]);
	}, 250);
});

// TODO: Remove after development.
document.addEventListener("click", (event) => {
	// console.log(event.target);
});

buttonNewAccount.addEventListener("click", () => {
	divPageLogin.classList.remove("login");
	divPageLogin.classList.add("create");
});

buttonLoginAccount.addEventListener("click", () => {
	login(inputLoginUsername.value, inputLoginPassword.value).then(result => {
		if("error" in result) {
			Notify.error({
				title: "Error",
				description: result.error.replaceAll("!", ""),
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

settingsToggleTheme.addEventListener("click", () => {
	if(settingsToggleTheme.classList.contains("active")) {
		setTheme("dark");
	} else {
		setTheme("light");
	}
});

settingsToggleBackground.addEventListener("click", () => {
	if(settingsToggleBackground.classList.contains("active")) {
		applicationBackground = "static";
		setBackground("static", applicationTheme);
	} else {
		applicationBackground = "animated";
		setBackground("animated", applicationTheme);
	}
});

// TODO: Add logout functionality.
buttonSettingsLogout.addEventListener("click", () => {
	let userID = localStorage.getItem("userID");
	let token = localStorage.getItem("token");

	logout(userID, token).then(result => {
		if("error" in result) {
			Notify.error({
				title: "Error",
				description: result.error,
				duration: 5000,
				background: "var(--accent-second)",
				color: "var(--accent-contrast)"
			});
		} else {
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
	}).catch(error => {
		Notify.error({
			title: "Error",
			description: error,
			duration: 5000,
			background: "var(--accent-second)",
			color: "var(--accent-contrast)"
		});
	});
});