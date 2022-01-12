let ip = getIP();
let port = getPort();
let urlAPI = `${getProtocol()}//${ip}:${port}/graphql`;

function userExists(username) {
	let query = {
		query: `{ 
			userExists(username: "${username}") 
		}`
	};

	return request("POST", urlAPI, query);
}

function createAccount(username, password, key) {
	let query = {
		query: `mutation createUser($username: String!, $password: String!, $key: String!) {
			createUser(username: $username, password: $password, key: $key)
		}`,
		variables: {
			username: username,
			password: password,
			key: key
		}
	};

	return request("POST", urlAPI, query);
}

function login(username, password) {
	let body = {
		username: username,
		password: password
	};

	return request("POST", urlAPI.replace("graphql", "login"), body);
}

function logout(userID, token) {
	let body = {
		userID: userID,
		token: token
	};

	return request("POST", urlAPI.replace("graphql", "logout"), body);
}

function logoutEverywhere(userID, token) {
	let body = {
		userID: userID,
		token: token
	};

	return request("POST", urlAPI.replace("graphql", "logoutEverywhere"), body);
}

function verifyToken(userID, token) {
	let body = {
		userID: userID,
		token: token
	};

	return request("POST", urlAPI.replace("graphql", "verifyToken"), body);
}

function changePassword(userID, token, currentPassword, newPassword) {
	let body = {
		userID: userID,
		token: token,
		currentPassword: currentPassword,
		newPassword: newPassword
	};

	return request("POST", urlAPI.replace("graphql", "changePassword"), body);
}

function readSetting(token, userID) {
	let query = {
		query: `query readSetting($token: String!, $userID: Int!) {
			readSetting(token: $token, userID: $userID) {
				userSettings
			}
		}`,
		variables: {
			token: token,
			userID: parseInt(userID)
		}
	};

	return request("POST", urlAPI, query);
}

function updateSetting(token, userID, userSettings) {
	let query = {
		query: `mutation updateSetting($token: String!, $userID: Int!, $userSettings: String!) {
			updateSetting(token: $token, userID: $userID, userSettings: $userSettings)
		}`,
		variables: {
			token: token,
			userID: parseInt(userID),
			userSettings: userSettings
		}
	};

	return request("POST", urlAPI, query);
}

function request(method, url, body) {
	return new Promise((resolve, reject) => {
		try {
			let xhr = new XMLHttpRequest();

			xhr.addEventListener("readystatechange", () => {
				if(xhr.readyState === xhr.DONE) {
					if(validJSON(xhr.responseText)) {
						let response = JSON.parse(xhr.responseText);
						resolve(response);
					} else {
						if(empty(xhr.responseText)) {
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

const cryptoAPI = {
	getGlobal() {
		return request("GET", "https://api.coingecko.com/api/v3/global", null);
	},

	getCoins() {
		return request("GET", "https://api.coingecko.com/api/v3/coins/", null);
	},

	getCoinData(id) {
		return request("GET", "https://api.coingecko.com/api/v3/coins/" + id + "?localization=false&market_data=true", null);
	},

	getCoinDataByDate(id, date) {
		return request("GET", "https://api.coingecko.com/api/v3/coins/" + id + "/history?date=" + date, null);
	},

	getMarketByID(currency, ids) {
		return request("GET", "https://api.coingecko.com/api/v3/coins/markets?vs_currency=" + currency + "&ids=" + ids + "&order=market_cap_desc&per_page=250&page=1&sparkline=false", null);
	},

	getMarket(currency, amount, page) {
		return request("GET", "https://api.coingecko.com/api/v3/coins/markets?vs_currency=" + currency + "&order=market_cap_desc&per_page=" + amount + "&page=" + page + "&sparkline=false", null);
	},
};

function empty(value) {
	if(typeof value === "object" && value !== null && Object.keys(value).length === 0) {
		return true;
	}
		
	if(value === null || typeof value === "undefined" || value.toString().trim() === "") {
		return true;
	}

	return false;
}

function validJSON(json) {
	try {
		let object = JSON.parse(json);
		if(object && typeof object === "object") {
			return true;
		}
	}
	catch(e) { }
	return false;
}