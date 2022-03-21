// Close window (desktop app only).
buttonWindowClose.addEventListener("click", () => {
	if(!empty(ipcRenderer)) {
		ipcRenderer.send("set-window-state", "closed");
	}
});

// Minimize window (desktop app only).
buttonWindowMinimize.addEventListener("click", () => {
	if(!empty(ipcRenderer)) {
		ipcRenderer.send("set-window-state", "minimized");
	}
});

// Maximize window (desktop app only).
buttonWindowMaximize.addEventListener("click", () => {
	if(!empty(ipcRenderer)) {
		ipcRenderer.send("set-window-state", "maximized");
	}
});

// Used to enable "desktop" mode, and play sounds when buttons are clicked on.
document.addEventListener("click", (event) => {
	clickTargets.push(event.target.id);
	clickTargets = clickTargets.slice(-3);

	if(clickTargets.join("-") === "span-login-title-span-login-title-span-login-title") {
		clickTargets = [];
		appToggle();
	}

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

// Handle "Enter" and "Escape" key presses.
document.addEventListener("keydown", (event) => {
	if(event.key.toLowerCase() === "enter") {
		if(document.getElementById("popup-button-confirm")) {
			event.preventDefault();
			document.getElementById("popup-button-confirm").click();
		} else {
			if(document.getElementById("popup-button-cancel")) {
				event.preventDefault();
				document.getElementById("popup-button-cancel").click();
			}
		}
	}

	if(event.key.toLowerCase() === "escape") {
		if(document.getElementById("popup-button-cancel")) {
			event.preventDefault();
			document.getElementById("popup-button-cancel").click();
		}
	}
});

// Check if audio file can be played.
audioPop.addEventListener("canplay", () => {
	audioPlayable = true;
});

// Close the side menu when the empty area outside it is clicked.
divSideMenuOverlay.addEventListener("click", () => {
	buttonSideMenuClose.click();
});

// Close side menu.
buttonSideMenuClose.addEventListener("click", () => {
	hideSideMenu();
});