const appPlatform = document.documentElement.id;

let electron = null;
let ipcRenderer = null;

if(appPlatform === "app") {
	electron = require("electron");
	ipcRenderer = electron.ipcRenderer;
}

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

function appToggle() {
	if(appBypass()) {
		document.documentElement.id = "web";
		document.documentElement.removeAttribute("data-bypass");
	} else {
		document.documentElement.id = "app";
		document.documentElement.setAttribute("data-bypass", "enabled");
	}
}

function appBypass() {
	return (document.documentElement.getAttribute("data-bypass") === "enabled");
}