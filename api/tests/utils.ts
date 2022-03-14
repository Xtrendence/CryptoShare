let utils = {
	empty(value: any) {
		if(typeof value === "object" && value !== null && Object.keys(value).length === 0) {
			return true;
		}
			
		if(value === null || typeof value === "undefined" || value.toString().trim() === "") {
			return true;
		}

		return false;
	},

	validJSON(json: string) {
		try {
			let object = JSON.parse(json);
			if(object && typeof object === "object") {
				return true;
			}
		}
		catch(e) { }
		return false;
	},

	wait(duration: number) {
		return new Promise((resolve: any) => {
			setTimeout(() => {
				resolve();
			}, duration);
		});
	},

	request(method: string, url: string, body: any) {
		console.log("Request", url);

		return new Promise((resolve, reject) => {
			try {
				let XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
				let xhr = new XMLHttpRequest();

				xhr.addEventListener("readystatechange", () => {
					if(xhr.readyState === xhr.DONE) {
						if(this.validJSON(xhr.responseText)) {
							let response = JSON.parse(xhr.responseText);
							resolve(response);
						} else {
							if(this.empty(xhr.responseText)) {
								reject("Server error.");
							} else {
								reject("Invalid JSON.");
							}
						}
					}
				});

				xhr.addEventListener("error", (error: any) => {
					reject(error);
				});

				xhr.open(method, url, true);
				xhr.setRequestHeader("Content-Type", "application/json");
				xhr.send(JSON.stringify(body));
			} catch(error) {
				console.log(error);
				reject(error);
			}
		});
	}
}

export default utils;