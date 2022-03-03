buttonWindowClose.addEventListener("click", () => {
	if(!empty(ipcRenderer)) {
		ipcRenderer.send("set-window-state", "closed");
	}
});

buttonWindowMinimize.addEventListener("click", () => {
	if(!empty(ipcRenderer)) {
		ipcRenderer.send("set-window-state", "minimized");
	}
});

buttonWindowMaximize.addEventListener("click", () => {
	if(!empty(ipcRenderer)) {
		ipcRenderer.send("set-window-state", "maximized");
	}
});

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

audioPop.addEventListener("canplay", () => {
	audioPlayable = true;
});

divSideMenuOverlay.addEventListener("click", () => {
	buttonSideMenuClose.click();
});

buttonSideMenuClose.addEventListener("click", () => {
	hideSideMenu();
});