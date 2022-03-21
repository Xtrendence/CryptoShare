import Utils from "../src/utils/Utils";
// @ts-ignore
import CryptoFN from "../src/utils/CryptoFN";

let urlAPI = `http://localhost:${Utils.portAPI}/graphql`;
let urlBot = urlAPI.replace("graphql", "");

export const requests = {
	getPublicKey() {
		return new Promise(async (resolve, reject) => {
			try {
				let keyRSA: any = await request("GET", urlAPI.replace("graphql", "keyRSA"), null, null);
				resolve(keyRSA.publicKey);
			} catch(error) {
				console.log(error);
				reject(error);
			}
		});
	},

	userExists(username: string) {
		let query = {
			query: `{ 
				userExists(username: "${username}") 
			}`
		};

		return request("POST", urlAPI, query, null);
	},

	async createAccount(username: string, password: string, key: string) {
		let publicKey: any = await this.getPublicKey();
		let encryptedPassword = await CryptoFN.encryptRSA(password, publicKey);

		let query = {
			query: `mutation createUser($username: String!, $password: String!, $key: String!) {
				createUser(username: $username, password: $password, key: $key)
			}`,
			variables: {
				username: username,
				password: encryptedPassword,
				key: key
			}
		};

		return request("POST", urlAPI, query, null);
	},

	async login(username: string, password: string) {
		let publicKey: any = await this.getPublicKey();
		let encryptedPassword = await CryptoFN.encryptRSA(password, publicKey);

		let body = {
			username: username,
			password: encryptedPassword
		};

		return request("POST", urlAPI.replace("graphql", "login"), body, null);
	},

	logout(userID: any, token: string) {
		let body = {
			userID: userID,
			token: token
		};

		return request("POST", urlAPI.replace("graphql", "logout"), body, null);
	},

	logoutEverywhere(userID: any, token: string) {
		let body = {
			userID: userID,
			token: token
		};

		return request("POST", urlAPI.replace("graphql", "logoutEverywhere"), body, null);
	},

	verifyToken(userID: any, token: string) {
		let body = {
			userID: userID,
			token: token
		};

		return request("POST", urlAPI.replace("graphql", "verifyToken"), body, null);
	},

	async changePassword(userID: any, token: string, key: string, currentPassword: string, newPassword: string) {
		let publicKey: any = await this.getPublicKey();
		let encryptedCurrentPassword = await CryptoFN.encryptRSA(currentPassword, publicKey);
		let encryptedNewPassword = await CryptoFN.encryptRSA(newPassword, publicKey);

		let body = {
			userID: userID,
			token: token,
			key: key,
			currentPassword: encryptedCurrentPassword,
			newPassword: encryptedNewPassword
		};

		return request("POST", urlAPI.replace("graphql", "changePassword"), body, null);
	},

	async performAdminAction(token: string, userID: any, username: string, action: string) {
		let body = {
			token: token,
			userID: parseInt(userID),
			username: username,
			action: action
		};

		return request("POST", urlAPI.replace("graphql", "adminAction"), body, null);
	},

	readStockPrice(token: string, userID: any, keyAPI: string, symbols: any) {
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
	},

	readStockHistorical(token: string, userID: any, keyAPI: string, assetSymbol: string) {
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
	},

	readWatchlist(token: string, userID: any) {
		let query = {
			query: `query readWatchlist($token: String!, $userID: Int!) {
				readWatchlist(token: $token, userID: $userID) {
					watchlistID, assetID, assetSymbol, assetType
				}
			}`,
			variables: {
				token: token,
				userID: parseInt(userID)
			}
		};

		return request("POST", urlAPI, query, null);
	},

	readMessage(token: string, userID: any) {
		let query = {
			query: `query readMessage($token: String!, $userID: Int!) {
				readMessage(token: $token, userID: $userID) {
					messageID, message, messageDate
				}
			}`,
			variables: {
				token: token,
				userID: parseInt(userID)
			}
		};

		return request("POST", urlAPI, query, null);
	},

	readHolding(token: string, userID: any) {
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
	},

	readTransaction(token: string, userID: any) {
		let query = {
			query: `query readTransaction($token: String!, $userID: Int!) {
				readTransaction(token: $token, userID: $userID) {
					transactionID, transactionType, transactionDate, transactionCategory, transactionAmount, transactionNotes
				}
			}`,
			variables: {
				token: token,
				userID: parseInt(userID)
			}
		};

		return request("POST", urlAPI, query, null);
	},

	readActivity(token: string, userID: any) {
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
	},

	createWatchlist(token: string, userID: any, assetID: string, assetSymbol: string, assetType: string) {
		let query = {
			query: `mutation createWatchlist($token: String!, $userID: Int!, $assetID: String!, $assetSymbol: String!, $assetType: String!) {
				createWatchlist(token: $token, userID: $userID, assetID: $assetID, assetSymbol: $assetSymbol, assetType: $assetType)
			}`,
			variables: {
				token: token,
				userID: parseInt(userID),
				assetID: assetID,
				assetSymbol: assetSymbol,
				assetType: assetType
			}
		};

		return request("POST", urlAPI, query, null);
	},

	createMessage(token: string, userID: any, message: string) {
		let query = {
			query: `mutation createMessage($token: String!, $userID: Int!, $message: String!) {
				createMessage(token: $token, userID: $userID, message: $message)
			}`,
			variables: {
				token: token,
				userID: parseInt(userID),
				message: message,
			}
		};

		return request("POST", urlAPI, query, null);
	},

	createTransaction(token: string, userID: any, transactionType: string, transactionDate: string, transactionCategory: string, transactionAmount: string, transactionNotes: string) {
		let query = {
			query: `mutation createTransaction($token: String!, $userID: Int!, $transactionType: String!, $transactionDate: String!, $transactionCategory: String!, $transactionAmount: String!, $transactionNotes: String!) {
				createTransaction(token: $token, userID: $userID, transactionType: $transactionType, transactionDate: $transactionDate, transactionCategory: $transactionCategory, transactionAmount: $transactionAmount, transactionNotes: $transactionNotes)
			}`,
			variables: {
				token: token,
				userID: parseInt(userID),
				transactionType: transactionType,
				transactionDate: transactionDate,
				transactionCategory: transactionCategory,
				transactionAmount: transactionAmount,
				transactionNotes: transactionNotes
			}
		};

		return request("POST", urlAPI, query, null);
	},

	createHolding(token: string, userID: any, holdingAssetID: string, holdingAssetSymbol: string, holdingAssetAmount: string, holdingAssetType: string) {
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
	},

	createActivity(token: string, userID: any, activityAssetID: string, activityAssetSymbol: string, activityAssetType: string, activityDate: string, activityType: string, activityAssetAmount: string, activityFee: string, activityNotes: string, activityExchange: string, activityPair: string, activityPrice: string, activityFrom: string, activityTo: string) {
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
	},

	updateTransaction(token: string, userID: any, transactionID: string, transactionType: string, transactionDate: string, transactionCategory: string, transactionAmount: string, transactionNotes: string) {
		let query = {
			query: `mutation updateTransaction($token: String!, $userID: Int!, $transactionID: String!, $transactionType: String!, $transactionDate: String!, $transactionCategory: String!, $transactionAmount: String!, $transactionNotes: String!) {
				updateTransaction(token: $token, userID: $userID, transactionID: $transactionID, transactionType: $transactionType, transactionDate: $transactionDate, transactionCategory: $transactionCategory, transactionAmount: $transactionAmount, transactionNotes: $transactionNotes)
			}`,
			variables: {
				token: token,
				userID: parseInt(userID),
				transactionID: transactionID,
				transactionType: transactionType,
				transactionDate: transactionDate,
				transactionCategory: transactionCategory, 
				transactionAmount: transactionAmount, 
				transactionNotes: transactionNotes
			}
		};

		return request("POST", urlAPI, query, null);
	},

	updateHolding(token: string, userID: any, holdingID: string, holdingAssetID: string, holdingAssetSymbol: string, holdingAssetAmount: string, holdingAssetType: string) {
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
	},

	updateActivity(token: string, userID: any, activityTransactionID: string, activityAssetID: string, activityAssetSymbol: string, activityAssetType: string, activityDate: string, activityType: string, activityAssetAmount: string, activityFee: string, activityNotes: string, activityExchange: string, activityPair: string, activityPrice: string, activityFrom: string, activityTo: string) {
		let query = {
			query: `mutation updateActivity($token: String!, $userID: Int!, $activityTransactionID: String!, $activityAssetID: String!, $activityAssetSymbol: String!, $activityAssetType: String!, $activityDate: String!, $activityType: String!, $activityAssetAmount: String!, $activityFee: String!, $activityNotes: String!, $activityExchange: String!, $activityPair: String!, $activityPrice: String!, $activityFrom: String!, $activityTo: String!) {
				updateActivity(token: $token, userID: $userID, activityTransactionID: $activityTransactionID, activityAssetID: $activityAssetID, activityAssetSymbol: $activityAssetSymbol, activityAssetType: $activityAssetType, activityDate: $activityDate, activityType: $activityType, activityAssetAmount: $activityAssetAmount, activityFee: $activityFee, activityNotes: $activityNotes, activityExchange: $activityExchange, activityPair: $activityPair, activityPrice: $activityPrice, activityFrom: $activityFrom, activityTo: $activityTo)
			}`,
			variables: {
				token: token,
				userID: parseInt(userID),
				activityTransactionID: activityTransactionID,
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
	},

	deleteUser(token: string, userID: any) {
		let query = {
			query: `mutation deleteUser($token: String!, $userID: Int!) {
				deleteUser(token: $token, userID: $userID)
			}`,
			variables: {
				token: token,
				userID: parseInt(userID)
			}
		};

		return request("POST", urlAPI, query, null);
	},

	deleteTransaction(token: string, userID: any, transactionID: string) {
		let query = {
			query: `mutation deleteTransaction($token: String!, $userID: Int!, $transactionID: String!) {
				deleteTransaction(token: $token, userID: $userID, transactionID: $transactionID)
			}`,
			variables: {
				token: token,
				userID: parseInt(userID),
				transactionID: transactionID
			}
		};

		return request("POST", urlAPI, query, null);
	},

	deleteWatchlist(token: string, userID: any, watchlistID: any) {
		let query = {
			query: `mutation deleteWatchlist($token: String!, $userID: Int!, $watchlistID: Int!) {
				deleteWatchlist(token: $token, userID: $userID, watchlistID: $watchlistID)
			}`,
			variables: {
				token: token,
				userID: parseInt(userID),
				watchlistID: parseInt(watchlistID)
			}
		};

		return request("POST", urlAPI, query, null);
	},

	deleteMessage(token: string, userID: any, messageID: any) {
		let query = {
			query: `mutation deleteMessage($token: String!, $userID: Int!, $messageID: Int!) {
				deleteMessage(token: $token, userID: $userID, messageID: $messageID)
			}`,
			variables: {
				token: token,
				userID: parseInt(userID),
				messageID: parseInt(messageID)
			}
		};

		return request("POST", urlAPI, query, null);
	},

	deleteMessageAll(token: string, userID: any) {
		let query = {
			query: `mutation deleteMessageAll($token: String!, $userID: Int!) {
				deleteMessageAll(token: $token, userID: $userID)
			}`,
			variables: {
				token: token,
				userID: parseInt(userID)
			}
		};

		return request("POST", urlAPI, query, null);
	},

	deleteActivityAll(token: string, userID: any) {
		let query = {
			query: `mutation deleteActivityAll($token: String!, $userID: Int!) {
				deleteActivityAll(token: $token, userID: $userID)
			}`,
			variables: {
				token: token,
				userID: parseInt(userID)
			}
		};

		return request("POST", urlAPI, query, null);
	},

	deleteTransactionAll(token: string, userID: any) {
		let query = {
			query: `mutation deleteTransactionAll($token: String!, $userID: Int!) {
				deleteTransactionAll(token: $token, userID: $userID)
			}`,
			variables: {
				token: token,
				userID: parseInt(userID)
			}
		};

		return request("POST", urlAPI, query, null);
	},

	deleteHoldingAll(token: string, userID: any) {
		let query = {
			query: `mutation deleteHoldingAll($token: String!, $userID: Int!) {
				deleteHoldingAll(token: $token, userID: $userID)
			}`,
			variables: {
				token: token,
				userID: parseInt(userID)
			}
		};

		return request("POST", urlAPI, query, null);
	},

	deleteWatchlistAll(token: string, userID: any) {
		let query = {
			query: `mutation deleteWatchlistAll($token: String!, $userID: Int!) {
				deleteWatchlistAll(token: $token, userID: $userID)
			}`,
			variables: {
				token: token,
				userID: parseInt(userID)
			}
		};

		return request("POST", urlAPI, query, null);
	},

	deleteHolding(token: string, userID: any, holdingID: any) {
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
	},

	deleteActivity(token: string, userID: any, activityID: any) {
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
	},

	readCoin(token: string, userID: any, assetID: string, assetSymbol: string, currency: string) {
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
	},

	readSetting(token: string, userID: any) {
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
	},

	readBudget(token: string, userID: any) {
		let query = {
			query: `query readBudget($token: String!, $userID: Int!) {
				readBudget(token: $token, userID: $userID) {
					budgetData
				}
			}`,
			variables: {
				token: token,
				userID: parseInt(userID)
			}
		};

		return request("POST", urlAPI, query, null);
	},

	updateBudget(token: string, userID: any, budgetData: string) {
		let query = {
			query: `mutation updateBudget($token: String!, $userID: Int!, $budgetData: String!) {
				updateBudget(token: $token, userID: $userID, budgetData: $budgetData)
			}`,
			variables: {
				token: token,
				userID: parseInt(userID),
				budgetData: budgetData
			}
		};

		return request("POST", urlAPI, query, null);
	},

	updateSetting(token: string, userID: any, userSettings: string) {
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
	},
}

export const cryptoAPI = {
	getGlobal() {
		return request("GET", "https://api.coingecko.com/api/v3/global", null, null);
	},

	getCoinList() {
		return request("GET", "https://api.coingecko.com/api/v3/coins/list", null, null);
	},

	getExchangeRates() {
		return request("GET", "https://api.coingecko.com/api/v3/exchange_rates", null, null);
	},

	getCoinData(id: string) {
		return request("GET", "https://api.coingecko.com/api/v3/coins/" + id + "?localization=false&market_data=true", null, null);
	},

	getCoinDataByDate(id: string, date: string) {
		return request("GET", "https://api.coingecko.com/api/v3/coins/" + id + "/history?date=" + date, null, null);
	},

	getCoinHistoricalData(currency: string, id: string, from: string, to: string) {
		return request("GET", "https://api.coingecko.com/api/v3/coins/" + id + "/market_chart/range?vs_currency=" + currency + "&from=" + from + "&to=" + to, null, null);
	},

	getMarketByID(currency: string, ids: string) {
		return request("GET", "https://api.coingecko.com/api/v3/coins/markets?vs_currency=" + currency + "&ids=" + ids + "&order=market_cap_desc&per_page=250&page=1&sparkline=false", null, null);
	},

	getMarket(currency: string, amount: string, page: string) {
		return request("GET", "https://api.coingecko.com/api/v3/coins/markets?vs_currency=" + currency + "&order=market_cap_desc&per_page=" + amount + "&page=" + page + "&sparkline=false", null, null);
	},
};

function request(method: string, url: string, body: any, headers: any) {
	console.log("Request", url);

	return new Promise((resolve, reject) => {
		try {
			let XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
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

			xhr.addEventListener("error", (error: any) => {
				reject(error);
			});

			xhr.open(method, url, true);
			xhr.setRequestHeader("Content-Type", "application/json");

			if(!empty(headers)) {
				headers.map((header: any) => {
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

function empty(value: any) {
	if(typeof value === "object" && value !== null && Object.keys(value).length === 0) {
		return true;
	}
		
	if(value === null || typeof value === "undefined" || value.toString().trim() === "") {
		return true;
	}

	return false;
}

function validJSON(json: any) {
	try {
		let object = JSON.parse(json);
		if(object && typeof object === "object") {
			return true;
		}
	}
	catch(e) { }
	return false;
}