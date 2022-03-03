const appPlatform = document.documentElement.id;

const appStorage = {
	setItem(key, value) {
		return new Promise(async (resolve, reject) => {
			try {
				if(appPlatform === "web") {
					localStorage.setItem(key, value);
				} else {
					await Neutralino.storage.setData(key, value);
				}

				resolve();
			} catch(error) {
				reject(error);
			}
		});
	},

	getItem(key) {
		return new Promise(async (resolve, reject) => {
			try {
				if(appPlatform === "web") {
					let data = localStorage.getItem(key) || "";
					resolve(data);
				} else {
					let data = await Neutralino.storage.getData(key) || "";
					resolve(data);
				}
			} catch(error) {
				reject(error);
			}
		});
	},

	removeItem(key) {
		return new Promise(async (resolve, reject) => {
			try {
				if(appPlatform === "web") {
					localStorage.removeItem(key);
				} else {
					await Neutralino.storage.setData(key, null);
				}

				resolve();
			} catch(error) {
				reject(error);
			}
		});
	}
};