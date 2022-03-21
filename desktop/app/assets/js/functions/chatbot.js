// Populates chat list with messages.
async function populateChatList(recreate) {
	if(getActivePage().id === "chatbot-page") {
		if(recreate) {
			dismissChatOptions();
			clearChatOptions();
			divChatList.removeAttribute("data-checksum");
			divChatList.innerHTML = `<div class="loading-icon"><div></div><div></div></div>`;
		}

		try {
			let messages = await fetchMessage() || "";
			let checksum = sha256(JSON.stringify(messages));
			
			if(divChatList.getElementsByClassName("loading-icon").length > 0 || divChatList.getAttribute("data-checksum") !== checksum) {
				divChatList.innerHTML = "";

				let sorted = sortMessages(messages);

				sorted.keys.map(index => {
					let message = sorted.messages[index];
					let text = message.message;

					if(validJSON(text)) {
						let parsed = JSON.parse(text);
						let from = parsed.from;
						let content = parsed.message;
						listMessage(from, content);
					}
				});
			}

			divChatList.setAttribute("data-checksum", checksum);

			scrollChatToBottom();
		} catch(error) {
			console.log(error);
			errorNotification("Something went wrong... - EW22");
		}
	}
}

// Sorts messages by date.
function sortMessages(messages) {
	let sorted = {};
	let sortedKeys = [];
	let array = [];

	for(let message in messages) {
		array.push([message, messages[message].messageDate]);
	}

	array.sort(function(a, b) {
		return new Date(a[1]).getTime() - new Date(b[1]).getTime();
	});

	array.map(item => {
		sorted[item[0]] = messages[item[0]];
		sortedKeys.push(item[0]);
	});

	return { messages:sorted, keys:sortedKeys };
}

// Sends a message to the chat bot.
async function sendMessage(message) {
	if(empty(message)) {
		return;
	}

	if(chatConnected()) {
		try {
			let userID = await appStorage.getItem("userID");
			let token = await appStorage.getItem("token");

			await addMessage("user", message);

			setTimeout(async () => {
				let publicKey = await getPublicKey();
				let encryptedMessage = await CryptoFN.encryptRSA(message, publicKey);
				socket.emit("message", { userID:userID, token:token, message:encryptedMessage });
			}, 500);
		} catch(error) {
			errorNotification("Something went wrong... - EW23");
			console.log(error);
		}
	} else {
		errorNotification("You aren't connected to the chat bot.");
	}
}

// Adds chat bubble to the chat list.
function listMessage(from, message) {
	message = stripHTMLCharacters(message);
	
	let div = document.createElement("div");
	div.setAttribute("class", `chat-bubble-wrapper ${from}`);

	div.innerHTML = `<div class="chat-bubble"><span>${message}</span></div>`;

	divChatList.appendChild(div);
}

// Creates a message.
async function addMessage(from, message) {
	return new Promise(async (resolve, reject) => {
		try {
			message = stripHTMLCharacters(message);

			clearChatOptions();

			let userID = await appStorage.getItem("userID");
			let token = await appStorage.getItem("token");
			let key = await appStorage.getItem("key");

			let json = JSON.stringify({ from:from, message:message });

			let encrypted = CryptoFN.encryptAES(json, key);

			await createMessage(token, userID, encrypted);
			
			listMessage(from, message);

			resolve(null);
		} catch(error) {
			console.log(error);
			reject(error);
		}
	});
}

// Determines what the user intends to do.
function determineIntent(processed) {
	try {
		let utterance = processed.utterance.toLowerCase();
		let category;
		let action;

		switch(utterance) {
			case utterance.match("(rent|mortgage|bill|fuel|gas|insurance|spent)")?.input:
				category = "transaction";
				action = "buy";
				break;
			case utterance.match("(bought|buy)")?.input:
				category = "activity-or-transaction";
				action = "buy";
				break;
			case utterance.match("(sold|sell)")?.input:
				category = "activity-or-transaction";
				action = "sell";
				break;
			case utterance.match("(transfer|transferred|sent|send|received)")?.input:
				category = "activity-or-transaction";
				action = "transfer";
				break;
			case utterance.match("(holding|amount)")?.input:
				category = "holding";
				action = "update";
				break;
			case utterance.match("(watch)")?.input:
				category = "watchlist";

				if(utterance.match("(start|add)")) {
					action = "create";
				} else if(utterance.match("(stop|remove|delete)")) {
					action = "delete";
				}
				break;
			case utterance.match("(income|yearly|salary)")?.input:
				category = "income";
				action = "update";
				break;
			case utterance.match("(afford)")?.input:
				category = "afford";
				action = "read";
				break;
		}

		return { category:category, action:action, utterance:utterance };
	} catch(error) {
		return { error:error };
	}
}

// Processes the user's request based on what their intent is.
function processRequest(processedIntent) {
	try {
		switch(processedIntent.category) {
			case "transaction":
				botFunctions.createTransaction(processedIntent);
				break;
			case "activity":
				botFunctions.createActivity(processedIntent);
				break;
			case "holding":
				botFunctions.updateHolding(processedIntent);
				break;
			case "watchlist":
				processedIntent.action === "delete" ? botFunctions.deleteWatchlist(processedIntent) : botFunctions.createWatchlist(processedIntent);
				break;
			case "income":
				botFunctions.updateIncome(processedIntent);
				break;
			case "afford":
				botFunctions.checkAffordability(processedIntent);
				break;
		}
	} catch(error) {
		console.log(error);
		addMessage("bot", "Sorry, I couldn't process that request.");
	}
}

// Since the bot needs to extract data from user messages, it requires modified versions of each function it can perform. The "botFunctions" object contains functions that expect the output of a processed intent (for example, from the "processTransaction" function). So once the user has sent a message, the "process" event of the socket is triggered, which calls the "determineIntent" function. Once the user's initial intention has been determined, their intent is processed using the "processIntent" function, which, depending on the intent, calls different functions (such as "processTransaction" or "processOther"). Finally, these circumstantial functions call the "processRequest" function, which calls a function in the "botFunctions" object.
let botFunctions = {
	async createTransaction(details) {
		try {
			let userID = await appStorage.getItem("userID");
			let token = await appStorage.getItem("token");
			let key = await appStorage.getItem("key");

			let data = validateTransactionData(details.price, "spent", details.type, details.date, details.item);

			if("error" in data) {
				addMessage("bot", data.error);
				return;
			}

			let encrypted = encryptObjectValues(key, data);

			await createTransaction(token, userID, encrypted.transactionType, encrypted.transactionDate, encrypted.transactionCategory, encrypted.transactionAmount, encrypted.transactionNotes);

			addMessage("bot", "I've recorded that transaction.");
		} catch(error) {
			console.log(error);
		}
	},

	async createActivity(details) {
		try {
			let userID = await appStorage.getItem("userID");
			let token = await appStorage.getItem("token");
			let key = await appStorage.getItem("key");

			let currency = await getCurrency();
			let symbol = details.asset;

			let amount = details.amount;
			let type = details.type;
			let date = details.date;
			let action = details.action;

			let values = {
				activityAssetSymbol: symbol,
				activityAssetType: type,
				activityAssetAmount: amount,
				activityDate: date,
				activityFee: "",
				activityNotes: "",
				activityType: action,
				activityExchange: "",
				activityPair: "",
				activityPrice: details?.price || "",
				activityFrom: "",
				activityTo: ""
			};

			let data = validateActivityData(values);

			if(type === "crypto") {
				let result = await getCoin({ symbol:symbol });

				if("id" in details) {
					result.id = details.id;
				}

				if("id" in result) {
					let id = result.id;

					data.activityAssetID = id;

					let encrypted = encryptObjectValues(key, data);

					await createActivity(token, userID, encrypted.activityAssetID, encrypted.activityAssetSymbol, encrypted.activityAssetType, encrypted.activityDate, encrypted.activityType, encrypted.activityAssetAmount, encrypted.activityFee, encrypted.activityNotes, encrypted.activityExchange, encrypted.activityPair, encrypted.activityPrice, encrypted.activityFrom, encrypted.activityTo);

					addMessage("bot", "I've recorded that activity.");
				} else {
					let clarification = {};

					Object.keys(result.matches).map(index => {
						let match = result.matches[index];
						let symbol = Object.keys(match)[0];
						let id = match[symbol];

						clarification[id] = async () => {
							details.id = id;
							await addMessage("user", id);
							botFunctions.createActivity(details);
						}
					});

					requireClarification("I found multiple assets with that symbol. Please choose one.", clarification);

					return;
				}
			} else {
				symbol = symbol.toUpperCase();

				let resultPrice = await fetchStockPrice(currency, [symbol], true);

				if("error" in resultPrice) {
					addMessage("bot", resultPrice.error);
					return;
				}

				let id = "stock-" + symbol;

				data.activityAssetID = id;

				let encrypted = encryptObjectValues(key, data);

				await createActivity(token, userID, encrypted.activityAssetID, encrypted.activityAssetSymbol, encrypted.activityAssetType, encrypted.activityDate, encrypted.activityType, encrypted.activityAssetAmount, encrypted.activityFee, encrypted.activityNotes, encrypted.activityExchange, encrypted.activityPair, encrypted.activityPrice, encrypted.activityFrom, encrypted.activityTo);

				addMessage("bot", "I've recorded that activity.");
			}
		} catch(error) {
			console.log(error);
		}
	},

	async updateHolding(details) {
		try {
			let userID = await appStorage.getItem("userID");
			let token = await appStorage.getItem("token");
			let key = await appStorage.getItem("key");

			let currency = await getCurrency();
			let symbol = details.asset;

			let amount = details.amount;
			let type = details.type;

			if(type === "crypto") {
				let result = await getCoin({ symbol:symbol });

				if("id" in details) {
					result.id = details.id;
				}

				if("id" in result) {
					let id = result.id;

					let exists = await assetHoldingExists(id);

					let encrypted = encryptObjectValues(key, {
						holdingAssetID: id,
						holdingAssetSymbol: symbol,
						holdingAssetAmount: amount,
						holdingAssetType: type
					});

					if(exists.exists) {
						await updateHolding(token, userID, exists.holdingID, encrypted.holdingAssetID, encrypted.holdingAssetSymbol, encrypted.holdingAssetAmount, encrypted.holdingAssetType);
					} else {
						await createHolding(token, userID, encrypted.holdingAssetID, encrypted.holdingAssetSymbol, encrypted.holdingAssetAmount, encrypted.holdingAssetType);
					}

					addMessage("bot", "I've updated your holdings.");
				} else {
					let clarification = {};

					Object.keys(result.matches).map(index => {
						let match = result.matches[index];
						let symbol = Object.keys(match)[0];
						let id = match[symbol];

						clarification[id] = async () => {
							details.id = id;
							await addMessage("user", id);
							botFunctions.updateHolding(details);
						}
					});

					requireClarification("I found multiple assets with that symbol. Please choose one.", clarification);

					return;
				}
			} else {
				symbol = symbol.toUpperCase();

				let resultPrice = await fetchStockPrice(currency, [symbol], true);

				if("error" in resultPrice) {
					addMessage("bot", resultPrice.error);
					return;
				}

				let id = "stock-" + symbol;

				let exists = await assetHoldingExists(id);

				let encrypted = encryptObjectValues(key, {
					holdingAssetID: id,
					holdingAssetSymbol: symbol,
					holdingAssetAmount: amount,
					holdingAssetType: type
				});

				if(exists.exists) {
					await updateHolding(token, userID, exists.holdingID, encrypted.holdingAssetID, encrypted.holdingAssetSymbol, encrypted.holdingAssetAmount, encrypted.holdingAssetType);
				} else {
					await createHolding(token, userID, encrypted.holdingAssetID, encrypted.holdingAssetSymbol, encrypted.holdingAssetAmount, encrypted.holdingAssetType);
				}

				addMessage("bot", "I've updated your holdings.");
			}
		} catch(error) {
			console.log(error);
		}
	},

	async createWatchlist(details) {
		try {
			let userID = await appStorage.getItem("userID");
			let token = await appStorage.getItem("token");
			let key = await appStorage.getItem("key");

			let currency = await getCurrency();
			let symbol = details.asset;

			let watchlist = await fetchWatchlist() || {};

			let type = details.type;

			if(type === "crypto") {
				let result = await getCoin({ symbol:symbol });

				if("id" in details) {
					result.id = details.id;
				}

				if("id" in result) {
					let id = result.id;

					if(watchlistExists(watchlist, id)) {
						addMessage("bot", "Asset already in watchlist.");
						return;
					}

					let encrypted = encryptObjectValues(key, {
						assetID: id.toLowerCase(),
						assetSymbol: symbol.toUpperCase(),
						assetType: "crypto",
					});

					await createWatchlist(token, userID, encrypted.assetID, encrypted.assetSymbol, encrypted.assetType);

					addMessage("bot", "I've added that asset to your watchlist.");
				} else {
					let clarification = {};

					Object.keys(result.matches).map(index => {
						let match = result.matches[index];
						let symbol = Object.keys(match)[0];
						let id = match[symbol];

						clarification[id] = async () => {
							details.id = id;
							await addMessage("user", id);
							botFunctions.createWatchlist(details);
						}
					});

					requireClarification("I found multiple assets with that symbol. Please choose one.", clarification);

					return;
				}
			} else {
				symbol = symbol.toUpperCase();

				let resultPrice = await fetchStockPrice(currency, [symbol], true);

				if("error" in resultPrice) {
					addMessage("bot", resultPrice.error);
					return;
				}

				let id = "stock-" + symbol;

				if(watchlistExists(watchlist, id)) {
					addMessage("bot", "Asset already in watchlist.");
					return;
				}

				let encrypted = encryptObjectValues(key, {
					assetID: id,
					assetSymbol: symbol,
					assetType: "stock",
				});

				await createWatchlist(token, userID, encrypted.assetID, encrypted.assetSymbol, encrypted.assetType);

				addMessage("bot", "I've added that asset to your watchlist.");
			}
		} catch(error) {
			console.log(error);
		}
	},

	async deleteWatchlist(details) {
		try {
			let userID = await appStorage.getItem("userID");
			let token = await appStorage.getItem("token");

			let watchlist = await fetchWatchlist() || {};

			let find = getWatchlistIDBySymbol(watchlist, details.asset, details.type);

			if(find.exists === true) {
				await deleteWatchlist(token, userID, find.id);
				addMessage("bot", "I've removed that asset from your watchlist.");
			} else {
				addMessage("bot", "I couldn't find that asset in your watchlist.");
			}
		} catch(error) {
			console.log(error);
		}
	},

	async updateIncome(details) {
		try {
			let userID = await appStorage.getItem("userID");
			let token = await appStorage.getItem("token");
			let key = await appStorage.getItem("key");

			let income = details.income;
			
			let currency = await getCurrency();

			let budgetData = await fetchBudget();

			if(empty(budgetData)) {
				await setDefaultBudgetData();
				budgetData = await fetchBudget();
			}

			if(isNaN(income) || parseFloat(income) < 0) {
				errorNotification("Income has to be zero or greater.");
				return;
			}

			budgetData.income = parseFloat(income);

			let encrypted = CryptoFN.encryptAES(JSON.stringify(budgetData), key);

			await updateBudget(token, userID, encrypted);

			addMessage("bot", `Your yearly income has been set to ${currencySymbols[currency] + separateThousands(budgetData.income)}.`);
		} catch(error) {
			console.log(error);
		}
	},

	async checkAffordability(details) {
		try {
			let budgetData = await fetchBudget() || {};
			let transactionData = await fetchTransaction() || {};

			let currentDate = new Date();
			let currentMonth = currentDate.getMonth();
			let currentYear = currentDate.getFullYear();

			transactionData = filterTransactionsByMonth(transactionData, currentMonth, currentYear);

			let parsed = parseTransactionData(transactionData);
		
			let categories = budgetData.categories;
			let income = budgetData.income;

			let category = details.type;

			let percentage = categories[category];
			let amount = parseFloat((((percentage * income) / 100) / 12).toFixed(0));
			let remaining = amount - parsed[category];
			let remainingPercentage = parseFloat(((remaining * 100) / amount).toFixed(0));
			let used = amount - remaining;
			let usedPercentage = 100 - remainingPercentage;

			if(usedPercentage > 100) {
				usedPercentage = 100;
			}

			let currency = await getCurrency();

			let price = parseFloat(details.price);

			if(remaining >= price) {
				addMessage("bot", `You've used ${usedPercentage}% (${currencySymbols[currency] + used}) of your ${category} budget this month, so you can afford to buy that.`);
			} else {
				addMessage("bot", `You've used ${usedPercentage}% (${currencySymbols[currency] + used}) of your ${category} budget this month, so you cannot afford to buy that.`);
			}
		} catch(error) {
			console.log(error);
		}
	}
};

// Narrows down the user's intent based on its category.
async function processIntent(entities, intent) {
	try {
		clearChatOptions();

		let details = {};
		details["category"] = intent.category;
		details["action"] = intent.action;
		details["type"] = null;

		switch(intent.category) {
			case "transaction":
				processTransaction(entities, intent, details);
				return;
			case "activity":
				processActivity(entities, intent, details);
				return;
			case "holding":
				let choices = await getSettingsChoices();
				if(choices.activitiesAffectHoldings === "disabled") {
					processHolding(entities, intent, details);
					return;
				} else {
					addMessage("bot", "Please set activities to not affect holdings in the settings page first.");
					return;
				}
			case "watchlist":
				processWatchlist(entities, intent, details);
				return;
			case "income":
				processIncome(entities, intent, details);
				return;
			case "afford":
				processAfford(entities, intent, details);
				return;
		}

		processOther(entities, intent, details);
	} catch(error) {
		console.log(error);
	}
}

async function processOther(entities, intent, details) {
	if(intent.utterance.match("(help)")) {
		let currency = await getCurrency();
		let currencySymbol = currencySymbols[currency];

		requireClarification("What are you trying to do?", {
			"Check Affordability": async () => {
				await addMessage("user", "See if I can afford something.");
				await addMessage("bot", `Example: Can I afford a ${currencySymbol}20 pizza?`);
			},
			"Set Income": async () => {
				await addMessage("user", "Set income.");
				await addMessage("bot", `Example: Set my income to ${currencySymbol}50000.`);
			},
			"Set Holding": async () => {
				await addMessage("user", "Set holding.");
				await addMessage("bot", `Example: Set my BTC holdings to 5.`);
			},
			"Record Transaction": async () => {
				await addMessage("user", "Record a transaction.");
				await addMessage("bot", `Example: I bought a train ticket for $50 yesterday.`);
			},
			"Record Activity": async () => {
				await addMessage("user", "Record an activity.");
				await addMessage("bot", `Example: I bought 2 BTC today.`);
			},
			"Edit Watchlist": async () => {
				await addMessage("user", "Edit my watchlist.");
				await addMessage("bot", `Example: Add BTC to my watchlist.`);
				await addMessage("bot", `Example: Remove BTC from my watchlist.`);
			},
		});
	}
}

// Extract transaction data.
function processTransaction(entities, intent, details) {
	try {
		if(intent.utterance.match("(rent|gas|fuel|mortgage)")) {
			if(intent.utterance.match("(rent)")) {
				details["item"] = "Rent";
				details["type"] = "housing";
			} else if(intent.utterance.match("(gas)")) {
				details["item"] = "Gas";
				details["type"] = "transport";
			} else if(intent.utterance.match("(fuel)")) {
				details["item"] = "Fuel";
				details["type"] = "transport";
			} else if(intent.utterance.match("(mortgage)")) {
				details["item"] = "Mortgage";
				details["type"] = "housing";
			} else if(intent.utterance.match("(insurance)")) {
				details["item"] = "Insurance";
				details["type"] = "insurance";
			}
		}

		if(empty(details?.type)) {
			requireClarification("What budget category does this belong to?", {
				Food: async () => {
					try {
						details.type = "food";
						await addMessage("user", "Food.");
						processTransaction(entities, intent, details);
					} catch(error) {
						errorNotification("Something went wrong... - EW24");
						console.log(error);
					}
				},
				Housing: async () => {
					try {
						details.type = "housing";
						await addMessage("user", "Housing.");
						processTransaction(entities, intent, details);
					} catch(error) {
						errorNotification("Something went wrong... - EW25");
						console.log(error);
					}
				},
				Transport: async () => {
					try {
						details.type = "transport";
						await addMessage("user", "Transport.");
						processTransaction(entities, intent, details);
					} catch(error) {
						errorNotification("Something went wrong... - EW26");
						console.log(error);
					}
				},
				Entertainment: async () => {
					try {
						details.type = "entertainment";
						await addMessage("user", "Entertainment.");
						processTransaction(entities, intent, details);
					} catch(error) {
						errorNotification("Something went wrong... - EW27");
						console.log(error);
					}
				},
				Insurance: async () => {
					try {
						details.type = "insurance";
						await addMessage("user", "Insurance.");
						processTransaction(entities, intent, details);
					} catch(error) {
						errorNotification("Something went wrong... - EW28");
						console.log(error);
					}
				},
				Savings: async () => {
					try {
						details.type = "savings";
						await addMessage("user", "Savings.");
						processTransaction(entities, intent, details);
					} catch(error) {
						errorNotification("Something went wrong... - EW29");
						console.log(error);
					}
				},
				Other: async () => {
					try {
						details.type = "other";
						await addMessage("user", "Other.");
						processTransaction(entities, intent, details);
					} catch(error) {
						errorNotification("Something went wrong... - EW30");
						console.log(error);
					}
				},
			});

			return;
		}

		let numberOfEntities = entities.length;
		let lastEntity = entities[numberOfEntities - 1];

		if(!("item" in details) || empty(details?.item)) {
			let start = intent.utterance.split("bought")[1];
			let item = start.split("for")[0].replaceAll(" a ", "");
			details["item"] = titleCase(item).trim();
			// let regex = /\w+(?=\s+((for )\$?[0-9]\d*\.?\d))/;
			// let match = intent.utterance.match(regex);
			// details["item"] = match[0];
		}

		if(entities[0]?.typeName.includes("number")) {
			details["price"] = parseFloat(entities[0].resolution.value);
		}

		if(entities[1]?.typeName.includes("number")) {
			details["price"] = parseFloat(entities[1].resolution.value);

			if(!empty(lastEntity) && lastEntity?.typeName.includes("date")) {
				details["date"] = lastEntity.resolution.values[0].value;
			}
		} else if(entities[1]?.typeName.includes("date")) {
			details["date"] = entities[1].resolution.values[0].value;
		} else if(lastEntity?.typeName.includes("date")) {
			details["date"] = lastEntity.resolution.values[0].value;
		}

		if(!("date" in details)) {
			details["date"] = new Date().toISOString().split("T")[0]
		}

		processRequest(details);
	} catch(error) {
		addMessage("bot", `Something went wrong. Please type "help" to learn how to use me.`);
		console.log(error);
	}
}

// Extract income data.
function processIncome(entities, intent, details) {
	try {
		let income = entities[0]?.resolution?.value;
		details.income = income;
		processRequest(details);
	} catch(error) {
		addMessage("bot", `Something went wrong. Please type "help" to learn how to use me.`);
		console.log(error);
	}
}

// Extract affordability data.
function processAfford(entities, intent, details) {
	try {
		let price = entities[0]?.resolution?.value;
		let item = intent.utterance.split(price)[1];
		
		details.price = price;
		details.item = item.replaceAll("?", "").toLowerCase().trim();

		if(defaultFood.includes(details.item)) {
			details.type = "food";
		}

		if(empty(details?.type)) {
			requireClarification("What budget category does this belong to?", {
				Food: async () => {
					try {
						details.type = "food";
						await addMessage("user", "Food.");
						processAfford(entities, intent, details);
					} catch(error) {
						errorNotification("Something went wrong... - EW31");
						console.log(error);
					}
				},
				Housing: async () => {
					try {
						details.type = "housing";
						await addMessage("user", "Housing.");
						processAfford(entities, intent, details);
					} catch(error) {
						errorNotification("Something went wrong... - EW32");
						console.log(error);
					}
				},
				Transport: async () => {
					try {
						details.type = "transport";
						await addMessage("user", "Transport.");
						processAfford(entities, intent, details);
					} catch(error) {
						errorNotification("Something went wrong... - EW33");
						console.log(error);
					}
				},
				Entertainment: async () => {
					try {
						details.type = "entertainment";
						await addMessage("user", "Entertainment.");
						processAfford(entities, intent, details);
					} catch(error) {
						errorNotification("Something went wrong... - EW34");
						console.log(error);
					}
				},
				Insurance: async () => {
					try {
						details.type = "insurance";
						await addMessage("user", "Insurance.");
						processAfford(entities, intent, details);
					} catch(error) {
						errorNotification("Something went wrong... - EW35");
						console.log(error);
					}
				},
				Savings: async () => {
					try {
						details.type = "savings";
						await addMessage("user", "Savings.");
						processAfford(entities, intent, details);
					} catch(error) {
						errorNotification("Something went wrong... - EW36");
						console.log(error);
					}
				},
				Other: async () => {
					try {
						details.type = "other";
						await addMessage("user", "Other.");
						processAfford(entities, intent, details);
					} catch(error) {
						errorNotification("Something went wrong... - EW37");
						console.log(error);
					}
				},
			});

			return;
		}

		processRequest(details);
	} catch(error) {
		addMessage("bot", `Something went wrong. Please type "help" to learn how to use me.`);
		console.log(error);
	}
}

// Extract activity data.
function processActivity(entities, intent, details) {
	try {
		if(empty(details?.type)) {
			requireClarification("Is this a crypto or stock?", {
				Crypto: async () => {
					try {
						await addMessage("user", "Crypto.");
						details.type = "crypto";
						processActivity(entities, intent, details);
					} catch(error) {
						errorNotification("Something went wrong... - EW38");
						console.log(error);
					}
				},
				Stock: async () => {
					try {
						await addMessage("user", "Stock.");
						details.type = "stock";
						processActivity(entities, intent, details);
					} catch(error) {
						errorNotification("Something went wrong... - EW39");
						console.log(error);
					}
				}
			});

			return;
		}

		let numberOfEntities = entities.length;
		let lastEntity = entities[numberOfEntities - 1];

		let valueGiven = false;

		let regex = /\w+(?=\s+((at |@ )\$?[0-9]\d*\.?\d))/;

		if(intent.action.match("(buy|sell)") && !intent.utterance.match("(at|@)") && intent.utterance.match("(for)")) {
			regex = /\w+(?=\s+((for )\$?[0-9]\d*\.?\d))/;
			valueGiven = true;
		}

		if(intent.action.match("(buy)") && !intent.utterance.match("(at|@)") && !intent.utterance.match("(for)")) {
			regex = /(?<=bought [0-9]*.[0-9]* )\w+/gi;
			valueGiven = true;
		}

		if(intent.action.match("(sell)") && !intent.utterance.match("(at|@)") && !intent.utterance.match("(for)")) {
			regex = /(?<=sold [0-9]*.[0-9]* )\w+/gi;
			valueGiven = true;
		}

		if(intent.action === "transfer") {
			regex = /(transfer |transferred |send |sent |received )\$?\d*\.?\d\s+[A-Z]*/gi;
		}

		let match = intent.utterance.match(regex);

		let asset = match[0];
		if(intent.action === "transfer") {
			asset = match[0].split(" ").pop();

			if(intent.utterance.includes("from")) {
				let from = intent.utterance.match(/(from )+[A-Z]*/gi)[0].split(" ")[1];
				details["from"] = capitalizeFirstLetter(from);
				details["to"] = "Me";
			} else if(intent.utterance.includes("to")) {
				let to = intent.utterance.match(/(to )+[A-Z]*/gi)[0].split(" ")[1];
				details["from"] = "Me";
				details["to"] = capitalizeFirstLetter(to);
			}
		}

		details["amount"] = parseFloat(entities[0].resolution.value);
		details["asset"] = asset;

		if(entities[1]?.typeName.includes("number")) {
			if(intent.action !== "transfer") {
				if(valueGiven) {
					details["price"] = parseFloat(entities[1].resolution.value) / details.amount;
				} else {
					details["price"] = parseFloat(entities[1].resolution.value);
				}
			}

			if(!empty(lastEntity) && lastEntity?.typeName.includes("date")) {
				details["date"] = lastEntity.resolution.values[0].value;
			}
		} else if(entities[1]?.typeName.includes("date")) {
			details["date"] = entities[1].resolution.values[0].value;
		} else if(lastEntity?.typeName.includes("date")) {
			details["date"] = lastEntity.resolution.values[0].value;
		}

		if(!("date" in details)) {
			details["date"] = new Date().toISOString().split("T")[0]
		}

		processRequest(details);
	} catch(error) {
		addMessage("bot", `Something went wrong. Please type "help" to learn how to use me.`);
		console.log(error);
	}
}

// Extract holding data.
function processHolding(entities, intent, details) {
	try {
		if(empty(details?.type)) {
			requireClarification("Is this a crypto or stock?", {
				Crypto: async () => {
					try {
						await addMessage("user", "Crypto.");
						details.type = "crypto";
						processHolding(entities, intent, details);
					} catch(error) {
						errorNotification("Something went wrong... - EW40");
						console.log(error);
					}
				},
				Stock: async () => {
					try {
						await addMessage("user", "Stock.");
						details.type = "stock";
						processHolding(entities, intent, details);
					} catch(error) {
						errorNotification("Something went wrong... - EW41");
						console.log(error);
					}
				}
			});

			return;
		}

		let numberOfEntities = entities.length;
		let lastEntity = entities[numberOfEntities - 1];

		let match;

		if(intent.utterance.match("(set|add)")) {
			match = intent.utterance.match(/\w+(?=\s+((holding)))/gi);
			details["amount"] = parseFloat(lastEntity.resolution.value);
		} else if(intent.utterance.match("(remove|delete)")) {
			match = intent.utterance.match(/\w+(?=\s+((from )))/);
			details["action"] = "delete";
		}

		let asset = match[0];
		details["asset"] = asset;

		processRequest(details);
	} catch(error) {
		addMessage("bot", `Something went wrong. Please type "help" to learn how to use me.`);
		console.log(error);
	}
}

// Extract watchlist data.
function processWatchlist(entities, intent, details) {
	try {
		if(empty(details?.type)) {
			requireClarification("Is this a crypto or stock?", {
				Crypto: async () => {
					try {
						await addMessage("user", "Crypto.");
						details.type = "crypto";
						processWatchlist(entities, intent, details);
					} catch(error) {
						errorNotification("Something went wrong... - EW42");
						console.log(error);
					}
				},
				Stock: async () => {
					try {
						await addMessage("user", "Stock.");
						details.type = "stock";
						processWatchlist(entities, intent, details);
					} catch(error) {
						errorNotification("Something went wrong... - EW43");
						console.log(error);
					}
				}
			});

			return;
		}

		let match;

		if(intent.utterance.match("(add|set)")) {
			match = intent.utterance.match(/\w+(?=\s+((to )))/gi);
		} else if(intent.utterance.match("(remove|delete)")) {
			match = intent.utterance.match(/\w+(?=\s+((from )))/gi);
		}

		let asset = match[0];
		details["asset"] = asset;

		processRequest(details);
	} catch(error) {
		addMessage("bot", `Something went wrong. Please type "help" to learn how to use me.`);
		console.log(error);
	}
}

// Used when the chat bot requires clarification on something, such as the asset type when creating a transaction.
async function requireClarification(message, options) {
	try {
		await addMessage("bot", message);

		clearChatOptions();

		options["Nevermind"] = async () => {
			await addMessage("user", "Nevermind.");
			clearChatOptions();
		}

		let choices = Object.keys(options);

		choices.map(choice => {
			let button = document.createElement("button");
			button.textContent = choice;
			button.setAttribute("class", "audible-pop");
			button.addEventListener("click", options[choice]);
			divChatOptions.classList.remove("hidden");
			divChatOptions.appendChild(button);
		});

		divChatList.classList.add("options");

		inputMessage.setAttribute("readonly", "true");

		if(divChatOptions.scrollWidth > divChatOptions.clientWidth) {
			divPageChatBot.classList.add("scroll-options");
		}

		scrollChatToBottom();
	} catch(error) {
		errorNotification("Something went wrong... - EW44");
		console.log(error);
	}
}

function dismissChatOptions() {
	let options = divChatOptions.getElementsByTagName("button");
	for(let i = 0; i < options.length; i++) {
		let option = options[i];
		if(option.textContent === "Nevermind") {
			option.click();
		}
	}
}

function clearChatOptions() {
	divChatList.classList.remove("options");
	divPageChatBot.classList.remove("scroll-options");
	inputMessage.removeAttribute("readonly");
	divChatOptions.innerHTML = "";
	divChatOptions.classList.add("hidden");
	scrollChatToBottom();
}

function chatConnected() {
	return divChatStatus.classList.contains("active");
}

function setStatus(status) {
	if(status === "Connected") {
		divChatStatus.classList.add("active");
	} else {
		divChatStatus.classList.remove("active");
	}
}

function scrollChatToBottom() {
	setTimeout(() => {
		divChatList.scrollTop = divChatList.scrollHeight;
	}, 100);
}

function attachSocketEvents(socket) {
	socket.on("connect", () => {
		setStatus("Connected");
	});

	socket.on("disconnect", () => {
		setStatus("Disconnected");
	});

	socket.on("reconnection_attempt", () => {
		setStatus("Reconnecting");
	});

	socket.on("reconnect", () => {
		setStatus("Connected");
	});

	socket.on("response", (response) => {
		let message = response.message;
		addMessage("bot", message);
	});

	// Once the server has processed the user's message using NLP, it is further processed on the client side.
	socket.on("process", (data) => {
		let entities = data.processed.sourceEntities;
		let intent = determineIntent(data.processed);
		
		if(intent.category === "activity-or-transaction") {
			requireClarification("Is this activity an asset trade?", {
				Yes: async () => {
					try {
						await addMessage("user", "Yes.");
						intent.category = "activity";
						processIntent(entities, intent);
					} catch(error) {
						errorNotification("Something went wrong... - EW45");
						console.log(error);
					}
				},
				No: async () => {
					try {
						await addMessage("user", "No.");
						intent.category = "transaction";
						processIntent(entities, intent);
					} catch(error) {
						errorNotification("Something went wrong... - EW46");
						console.log(error);
					}
				}
			});

			return;
		}

		processIntent(entities, intent);
	});
}

// Fetches, decrypts, and returns messages.
function fetchMessage() {
	return new Promise(async (resolve, reject) => {
		try {
			let userID = await appStorage.getItem("userID");
			let token = await appStorage.getItem("token");
			let key = await appStorage.getItem("key");

			let message = await readMessage(token, userID);

			if(empty(message?.data?.readMessage)) {
				resolve();
				return;
			}

			let messageData = {};
	
			let encrypted = message?.data?.readMessage;
	
			Object.keys(encrypted).map(index => {
				let decrypted = decryptObjectValues(key, encrypted[index]);
				decrypted.messageID = encrypted[index].messageID;
				decrypted.messageDate = encrypted[index].messageDate;
				messageData[decrypted.messageID] = decrypted;
			});

			resolve(messageData);
		} catch(error) {
			console.log(error);
			reject(error);
		}
	});
}