let ip = getIP();
let port = getPort();
let urlAPI = `${getProtocol()}//${ip}:${port}/graphql`;
let urlBot = `${getProtocol()}//${ip}:${port + 1}`;

function userExists(username) {
	let query = {
		query: `{ 
			userExists(username: "${username}") 
		}`
	};

	return request("POST", urlAPI, query, null);
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

	return request("POST", urlAPI, query, null);
}

function login(username, password) {
	let body = {
		username: username,
		password: password
	};

	return request("POST", urlAPI.replace("graphql", "login"), body, null);
}

function logout(userID, token) {
	let body = {
		userID: userID,
		token: token
	};

	return request("POST", urlAPI.replace("graphql", "logout"), body, null);
}

function logoutEverywhere(userID, token) {
	let body = {
		userID: userID,
		token: token
	};

	return request("POST", urlAPI.replace("graphql", "logoutEverywhere"), body, null);
}

function verifyToken(userID, token) {
	let body = {
		userID: userID,
		token: token
	};

	return request("POST", urlAPI.replace("graphql", "verifyToken"), body, null);
}

function changePassword(userID, token, currentPassword, newPassword) {
	let body = {
		userID: userID,
		token: token,
		currentPassword: currentPassword,
		newPassword: newPassword
	};

	return request("POST", urlAPI.replace("graphql", "changePassword"), body, null);
}

async function performAdminAction(token, userID, username, action) {
	let body = {
		token: token,
		userID: parseInt(userID),
		username: username,
		action: action
	};

	return request("POST", urlAPI.replace("graphql", "adminAction"), body, null);
}

function readStockPrice(token, userID, keyAPI, symbols) {
	let query = {
		query: `query readStockPrice($token: String!, $userID: Int!, $keyAPI: String!, $symbols: [String]!) {
			readStockPrice(token: $token, userID: $userID, keyAPI: $keyAPI, symbols: $symbols) {
				priceData, historicalData
			}
		}`,
		variables: {
			token: token,
			userID: parseInt(userID),
			keyAPI: keyAPI,
			symbols: symbols
		}
	};

	return request("POST", urlAPI, query, null);
}

function readStockHistorical(token, userID, keyAPI, assetSymbol) {
	let query = {
		query: `query readStockHistorical($token: String!, $userID: Int!, $keyAPI: String!, $assetSymbol: String!) {
			readStockHistorical(token: $token, userID: $userID, keyAPI: $keyAPI, assetSymbol: $assetSymbol) {
				priceData, historicalData
			}
		}`,
		variables: {
			token: token,
			userID: parseInt(userID),
			keyAPI: keyAPI,
			assetSymbol: assetSymbol
		}
	};

	return request("POST", urlAPI, query, null);
}

function readHolding(token, userID) {
	let query = {
		query: `query readHolding($token: String!, $userID: Int!) {
			readHolding(token: $token, userID: $userID) {
				holdingID, holdingAssetID, holdingAssetType, holdingAssetSymbol, holdingAssetAmount
			}
		}`,
		variables: {
			token: token,
			userID: parseInt(userID)
		}
	};

	return request("POST", urlAPI, query, null);
}

function readActivity(token, userID) {
	let query = {
		query: `query readActivity($token: String!, $userID: Int!) {
			readActivity(token: $token, userID: $userID) {
				activityID, activityTransactionID, activityAssetID, activityAssetSymbol, activityAssetType, activityDate, activityType, activityAssetAmount, activityFee, activityNotes, activityExchange, activityPair, activityPrice, activityFrom, activityTo
			}
		}`,
		variables: {
			token: token,
			userID: parseInt(userID)
		}
	};

	return request("POST", urlAPI, query, null);
}

function createHolding(token, userID, holdingAssetID, holdingAssetSymbol, holdingAssetAmount, holdingAssetType) {
	let query = {
		query: `mutation createHolding($token: String!, $userID: Int!, $holdingAssetID: String!, $holdingAssetSymbol: String!, $holdingAssetAmount: String!, $holdingAssetType: String!) {
			createHolding(token: $token, userID: $userID, holdingAssetID: $holdingAssetID, holdingAssetSymbol: $holdingAssetSymbol, holdingAssetAmount: $holdingAssetAmount, holdingAssetType: $holdingAssetType)
		}`,
		variables: {
			token: token,
			userID: parseInt(userID),
			holdingAssetID: holdingAssetID,
			holdingAssetSymbol: holdingAssetSymbol,
			holdingAssetAmount: holdingAssetAmount,
			holdingAssetType: holdingAssetType
		}
	};

	return request("POST", urlAPI, query, null);
}

function createActivity(token, userID, activityAssetID, activityAssetSymbol, activityAssetType, activityDate, activityType, activityAssetAmount, activityFee, activityNotes, activityExchange, activityPair, activityPrice, activityFrom, activityTo) {
	let query = {
		query: `mutation createActivity($token: String!, $userID: Int!, $activityAssetID: String!, $activityAssetSymbol: String!, $activityAssetType: String!, $activityDate: String!, $activityType: String!, $activityAssetAmount: String!, $activityFee: String!, $activityNotes: String!, $activityExchange: String!, $activityPair: String!, $activityPrice: String!, $activityFrom: String!, $activityTo: String!) {
			createActivity(token: $token, userID: $userID, activityAssetID: $activityAssetID, activityAssetSymbol: $activityAssetSymbol, activityAssetType: $activityAssetType, activityDate: $activityDate, activityType: $activityType, activityAssetAmount: $activityAssetAmount, activityFee: $activityFee, activityNotes: $activityNotes, activityExchange: $activityExchange, activityPair: $activityPair, activityPrice: $activityPrice, activityFrom: $activityFrom, activityTo: $activityTo)
		}`,
		variables: {
			token: token,
			userID: parseInt(userID),
			activityAssetID: activityAssetID, 
			activityAssetSymbol: activityAssetSymbol, 
			activityAssetType: activityAssetType, 
			activityDate: activityDate, 
			activityType: activityType, 
			activityAssetAmount: activityAssetAmount, 
			activityFee: activityFee, 
			activityNotes: activityNotes, 
			activityExchange: activityExchange, 
			activityPair: activityPair, 
			activityPrice: activityPrice, 
			activityFrom: activityFrom, 
			activityTo: activityTo  
		}
	};

	return request("POST", urlAPI, query, null);
}

function updateHolding(token, userID, holdingID, holdingAssetID, holdingAssetSymbol, holdingAssetAmount, holdingAssetType) {
	let query = {
		query: `mutation updateHolding($token: String!, $userID: Int!, $holdingID: Int!, $holdingAssetID: String!, $holdingAssetSymbol: String!, $holdingAssetAmount: String!, $holdingAssetType: String!) {
			updateHolding(token: $token, userID: $userID, holdingID: $holdingID, holdingAssetID: $holdingAssetID, holdingAssetSymbol: $holdingAssetSymbol, holdingAssetAmount: $holdingAssetAmount, holdingAssetType: $holdingAssetType)
		}`,
		variables: {
			token: token,
			userID: parseInt(userID),
			holdingID: parseInt(holdingID),
			holdingAssetID: holdingAssetID,
			holdingAssetSymbol: holdingAssetSymbol,
			holdingAssetAmount: holdingAssetAmount,
			holdingAssetType: holdingAssetType
		}
	};

	return request("POST", urlAPI, query, null);
}

function updateActivity(token, userID, activityID, activityAssetID, activityAssetSymbol, activityAssetType, activityDate, activityType, activityAssetAmount, activityFee, activityNotes, activityExchange, activityPair, activityPrice, activityFrom, activityTo) {
	let query = {
		query: `mutation updateActivity($token: String!, $userID: Int!, $activityID: Int!, $activityAssetID: String!, $activityAssetSymbol: String!, $activityAssetType: String!, $activityDate: String!, $activityType: String!, $activityAssetAmount: String!, $activityFee: String!, $activityNotes: String!, $activityExchange: String!, $activityPair: String!, $activityPrice: String!, $activityFrom: String!, $activityTo: String!) {
			updateActivity(token: $token, userID: $userID, activityID: $activityID, activityAssetID: $activityAssetID, activityAssetSymbol: $activityAssetSymbol, activityAssetType: $activityAssetType, activityDate: $activityDate, activityType: $activityType, activityAssetAmount: $activityAssetAmount, activityFee: $activityFee, activityNotes: $activityNotes, activityExchange: $activityExchange, activityPair: $activityPair, activityPrice: $activityPrice, activityFrom: $activityFrom, activityTo: $activityTo)
		}`,
		variables: {
			token: token,
			userID: parseInt(userID),
			activityID: parseInt(activityID),
			activityAssetID: activityAssetID, 
			activityAssetSymbol: activityAssetSymbol, 
			activityAssetType: activityAssetType, 
			activityDate: activityDate, 
			activityType: activityType, 
			activityAssetAmount: activityAssetAmount, 
			activityFee: activityFee, 
			activityNotes: activityNotes, 
			activityExchange: activityExchange, 
			activityPair: activityPair, 
			activityPrice: activityPrice, 
			activityFrom: activityFrom, 
			activityTo: activityTo  
		}
	};

	return request("POST", urlAPI, query, null);
}

function deleteHolding(token, userID, holdingID) {
	let query = {
		query: `mutation deleteHolding($token: String!, $userID: Int!, $holdingID: Int!) {
			deleteHolding(token: $token, userID: $userID, holdingID: $holdingID)
		}`,
		variables: {
			token: token,
			userID: parseInt(userID),
			holdingID: parseInt(holdingID)
		}
	};

	return request("POST", urlAPI, query, null);
}

function deleteActivity(token, userID, activityID) {
	let query = {
		query: `mutation deleteActivity($token: String!, $userID: Int!, $activityID: Int!) {
			deleteActivity(token: $token, userID: $userID, activityID: $activityID)
		}`,
		variables: {
			token: token,
			userID: parseInt(userID),
			activityID: parseInt(activityID)
		}
	};

	return request("POST", urlAPI, query, null);
}

function readCoin(token, userID, assetID, assetSymbol, currency) {
	let query = {
		query: `query readCoin($token: String!, $userID: Int!, $assetID: String!, $assetSymbol: String!, $currency: String!) {
			readCoin(token: $token, userID: $userID, assetID: $assetID, assetSymbol: $assetSymbol, currency: $currency) {
				data
			}
		}`,
		variables: {
			token: token,
			userID: parseInt(userID),
			assetID: assetID,
			assetSymbol: assetSymbol,
			currency: currency
		}
	};

	return request("POST", urlAPI, query, null);
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

	return request("POST", urlAPI, query, null);
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

	return request("POST", urlAPI, query, null);
}

function request(method, url, body, headers) {
	console.log("Request", url);

	return new Promise((resolve, reject) => {
		try {
			setTimeout(() => {
				reject("Timeout.");
			}, 5000);

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

			if(!empty(headers)) {
				headers.map(header => {
					let key = header[0];
					let value = header[1];
					xhr.setRequestHeader(key, value);
				});
			}

			xhr.send(JSON.stringify(body));
		} catch(error) {
			console.log(error);
			reject(error);
		}
	});
}

const cryptoAPI = {
	getGlobal() {
		return request("GET", "https://api.coingecko.com/api/v3/global", null, null);
	},

	getCoinList() {
		return request("GET", "https://api.coingecko.com/api/v3/coins/list", null, null);
	},

	getExchangeRates() {
		return request("GET", "https://api.coingecko.com/api/v3/exchange_rates", null, null);
	},

	getCoinData(id) {
		return request("GET", "https://api.coingecko.com/api/v3/coins/" + id + "?localization=false&market_data=true", null, null);
	},

	getCoinDataByDate(id, date) {
		return request("GET", "https://api.coingecko.com/api/v3/coins/" + id + "/history?date=" + date, null, null);
	},

	getCoinHistoricalData(currency, id, from, to) {
		return request("GET", "https://api.coingecko.com/api/v3/coins/" + id + "/market_chart/range?vs_currency=" + currency + "&from=" + from + "&to=" + to, null, null);
	},

	getMarketByID(currency, ids) {
		return request("GET", "https://api.coingecko.com/api/v3/coins/markets?vs_currency=" + currency + "&ids=" + ids + "&order=market_cap_desc&per_page=250&page=1&sparkline=false", null, null);
	},

	getMarket(currency, amount, page) {
		return request("GET", "https://api.coingecko.com/api/v3/coins/markets?vs_currency=" + currency + "&order=market_cap_desc&per_page=" + amount + "&page=" + page + "&sparkline=false", null, null);
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