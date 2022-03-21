// The app's platform ("web" or "app") depends on the ID of the document element.
const appPlatform = document.documentElement.id;

// In order to have the same codebase across the web and desktop app, there are a few empty variables that are only given a value when the app platform is set to "app".
let electron = null;
let ipcRenderer = null;

if(appPlatform !== "app" && typeof require === "undefined") {
	var require = () => { 
		return "";
	};
}

if(appPlatform === "app") {
	var sha256 = require("sha256");
	window.$ = window.jQuery = require("jquery");
	electron = require("electron");
	ipcRenderer = electron.ipcRenderer;
}

// On the desktop app, localStorage doesn't persist. Instead of using an if statement every time localStorage is used (or "electron-store" accessed through the "ipcRenderer" on the desktop app), an object called "appStorage" is used as a drop-in replacement for localStorage that takes care of everything.
const appStorage = {
	setItem(key, value) {
		return new Promise(async (resolve, reject) => {
			try {
				if(appPlatform === "web" || appBypass()) {
					localStorage.setItem(key, value);
					resolve();
				} else {
					ipcRenderer.invoke("setItem", { key:key, value:value }).then((response) => {
						resolve(response);
					}).catch(error => {
						reject(error);
					});
				}
			} catch(error) {
				reject(error);
			}
		});
	},

	getItem(key) {
		return new Promise(async (resolve, reject) => {
			try {
				if(appPlatform === "web" || appBypass()) {
					let data = localStorage.getItem(key) || "";
					resolve(data);
				} else {
					ipcRenderer.invoke("getItem", { key:key }).then((response) => {
						resolve(response);
					}).catch(error => {
						reject(error);
					});
				}
			} catch(error) {
				reject(error);
			}
		});
	},

	getAll() {
		return new Promise(async (resolve, reject) => {
			try {
				if(appPlatform === "web" || appBypass()) {
					let data = { ...localStorage };
					resolve(data);
				} else {
					ipcRenderer.invoke("getAll").then((response) => {
						resolve(response);
					}).catch(error => {
						reject(error);
					});
				}
			} catch(error) {
				reject(error);
			}
		});
	},

	removeItem(key) {
		return new Promise(async (resolve, reject) => {
			try {
				if(appPlatform === "web" || appBypass()) {
					localStorage.removeItem(key);
					resolve();
				} else {
					ipcRenderer.invoke("removeItem", { key:key }).then((response) => {
						resolve(response);
					}).catch(error => {
						reject(error);
					});
				}
			} catch(error) {
				reject(error);
			}
		});
	}
};

// Toggles between the web and desktop app.
function appToggle() {
	if(appBypass()) {
		document.documentElement.id = "web";
		document.documentElement.removeAttribute("data-bypass");
	} else {
		document.documentElement.id = "app";
		document.documentElement.setAttribute("data-bypass", "enabled");
	}
	
	divBackground.style.height = "0";

	setTimeout(() => {
		divBackground.style.height = "100%";
	}, 50);
}

// Determines whether or not the app bypass mode is enabled, which allows for easier debugging.
function appBypass() {
	return (document.documentElement.getAttribute("data-bypass") === "enabled");
}