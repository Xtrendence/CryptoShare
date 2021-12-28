export default class Requests {
	constructor(urlAPI) {
		this.urlAPI = urlAPI;
	}

	userExists(username) {
		let query = {
			query: `{ 
				userExists(username: "${username}") 
			}`
		};

		return this.request("POST", this.urlAPI, query);
	}

	// TODO: Generate key.
	createAccount(username, password) {
		let query = {
			query: `mutation createUser($username: String!, $password: String!, $key: String!) {
				createUser(username: $username, password: $password, key: $key)
			}`,
			variables: {
				username: username,
				password: password,
				key: "-"
			}
		};

		return this.request("POST", this.urlAPI, query);
	}

	login(username, password) {
		let body = {
			username: username,
			password: password
		};

		return this.request("POST", this.urlAPI.replace("graphql", "login"), body);
	}

	logout(userID, token) {
		let body = {
			userID: userID,
			token: token
		};

		return this.request("POST", this.urlAPI.replace("graphql", "logout"), body);
	}

	logoutEverywhere(userID, token) {
		let body = {
			userID: userID,
			token: token
		};

		return this.request("POST", this.urlAPI.replace("graphql", "logoutEverywhere"), body);
	}

	verifyToken(userID, token) {
		let body = {
			userID: userID,
			token: token
		};

		return this.request("POST", this.urlAPI.replace("graphql", "verifyToken"), body);
	}

	changePassword(userID, token, currentPassword, newPassword) {
		let body = {
			userID: userID,
			token: token,
			currentPassword: currentPassword,
			newPassword: newPassword
		};

		return this.request("POST", this.urlAPI.replace("graphql", "changePassword"), body);
	}

	request(method, url, body) {
		return new Promise((resolve, reject) => {
			try {
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

				xhr.addEventListener("error", (error) => {
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

	empty(value) {
		if(typeof value === "object" && value !== null && Object.keys(value).length === 0) {
			return true;
		}
		
		if(value === null || typeof value === "undefined" || value.toString().trim() === "") {
			return true;
		}

		return false;
	}

	validJSON(json) {
		try {
			let object = JSON.parse(json);
			if(object && typeof object === "object") {
				return true;
			}
		}
		catch(e) { }
		return false;
	}
}