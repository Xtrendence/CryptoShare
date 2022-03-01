let socket = io.connect(urlBot);
attachSocketEvents(socket);

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

				Object.keys(messages).map(index => {
					let message = messages[index];
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
			errorNotification("Something went wrong...");
		}
	}
}

function sendMessage(message) {
	if(empty(message)) {
		return;
	}

	if(chatConnected()) {
		let userID = localStorage.getItem("userID");
		let token = localStorage.getItem("token");

		addMessage("user", message);

		setTimeout(() => {
			socket.emit("message", { userID:userID, token:token, message:message });
		}, 500);
	} else {
		errorNotification("You aren't connected to the chat bot.");
	}
}

function listMessage(from, message) {
	message = stripHTMLCharacters(message);
	
	let div = document.createElement("div");
	div.setAttribute("class", `chat-bubble-wrapper ${from}`);

	div.innerHTML = `<div class="chat-bubble"><span>${message}</span></div>`;

	divChatList.appendChild(div);
}

async function addMessage(from, message) {
	message = stripHTMLCharacters(message);

	clearChatOptions();

	listMessage(from, message);

	let userID = localStorage.getItem("userID");
	let token = localStorage.getItem("token");
	let key = localStorage.getItem("key");

	let json = JSON.stringify({ from:from, message:message });

	let encrypted = CryptoFN.encryptAES(json, key);

	await createMessage(token, userID, encrypted);
}

function determineIntent(processed) {
	try {
		let utterance = processed.utterance.toLowerCase();
		let category;
		let action;

		switch(utterance) {
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

async function processRequest(processedIntent) {
	try {
		console.log(processedIntent);

		
	} catch(error) {
		console.log(error);
		addMessage("bot", "Sorry, I couldn't process that request.");
	}
}

function processIntent(entities, intent) {
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
				if(getSettingsChoices().transactionsAffectHoldings === "disabled") {
					processHolding(entities, intent, details);
					return;
				} else {
					addMessage("bot", "Please set transactions to not affect holdings in the settings page first.");
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

function processOther(entities, intent, details) {
	if(intent.utterance.match("(help)")) {
		requireClarification("What are you trying to do?", {
			"Check Affordability": () => {
				addMessage("user", "See if I can afford something.");
			},
			"Set Income": () => {
				addMessage("user", "Set income.");
			},
			"Set Holding": () => {
				addMessage("user", "Set holding.");
			},
			"Record Transaction": () => {
				addMessage("user", "Record a transaction.");
			},
			"Record Activity": () => {
				addMessage("user", "Record an activity.");
			},
			"Edit Watchlist": () => {
				addMessage("user", "Edit my watchlist.");
			},
		});
	}
}

function processTransaction(entities, intent, details) {
	try {
		if(empty(details?.type)) {
			requireClarification("What budget category does this belong to?", {
				Food: () => {
					details.type = "food";
					addMessage("user", "Food.");
					processTransaction(entities, intent, details);
				},
				Housing: () => {
					details.type = "housing";
					addMessage("user", "Housing.");
					processTransaction(entities, intent, details);
				},
				Transport: () => {
					details.type = "transport";
					addMessage("user", "Transport.");
					processTransaction(entities, intent, details);
				},
				Entertainment: () => {
					details.type = "entertainment";
					addMessage("user", "Entertainment.");
					processTransaction(entities, intent, details);
				},
				Insurance: () => {
					details.type = "insurance";
					addMessage("user", "Insurance.");
					processTransaction(entities, intent, details);
				},
				Savings: () => {
					details.type = "savings";
					addMessage("user", "Savings.");
					processTransaction(entities, intent, details);
				},
				Other: () => {
					details.type = "other";
					addMessage("user", "Other.");
					processTransaction(entities, intent, details);
				},
			});

			return;
		}

		let numberOfEntities = entities.length;
		let lastEntity = entities[numberOfEntities - 1];

		if(intent.action.match("(buy|sell)") && intent.utterance.match("(for)")) {
			regex = /\w+(?=\s+((for )\$?[0-9]\d*\.?\d))/;
		}

		let match = intent.utterance.match(regex);

		details["item"] = match[0];

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

function processAfford(entities, intent, details) {
	try {
		let price = entities[0]?.resolution?.value;
		let item = intent.utterance.split(price)[1];
		
		details.price = price;
		details.item = item.replaceAll("?", "");

		if(empty(details?.type)) {
			requireClarification("What budget category does this belong to?", {
				Food: () => {
					details.type = "food";
					addMessage("user", "Food.");
					processAfford(entities, intent, details);
				},
				Housing: () => {
					details.type = "housing";
					addMessage("user", "Housing.");
					processAfford(entities, intent, details);
				},
				Transport: () => {
					details.type = "transport";
					addMessage("user", "Transport.");
					processAfford(entities, intent, details);
				},
				Entertainment: () => {
					details.type = "entertainment";
					addMessage("user", "Entertainment.");
					processAfford(entities, intent, details);
				},
				Insurance: () => {
					details.type = "insurance";
					addMessage("user", "Insurance.");
					processAfford(entities, intent, details);
				},
				Savings: () => {
					details.type = "savings";
					addMessage("user", "Savings.");
					processAfford(entities, intent, details);
				},
				Other: () => {
					details.type = "other";
					addMessage("user", "Other.");
					processAfford(entities, intent, details);
				},
			});
		}

		processRequest(details);
	} catch(error) {
		addMessage("bot", `Something went wrong. Please type "help" to learn how to use me.`);
		console.log(error);
	}
}

function processActivity(entities, intent, details) {
	try {
		if(empty(details?.type)) {
			requireClarification("Is this a crypto or stock?", {
				Crypto: () => {
					addMessage("user", "Crypto.");
					details.type = "crypto";
					processActivity(entities, intent, details);
				},
				Stock: () => {
					addMessage("user", "Stock.");
					details.type = "stock";
					processActivity(entities, intent, details);
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

		if(intent.action.match("(buy|sell)") && !intent.utterance.match("(at|@)") && !intent.utterance.match("(for)")) {
			regex = /(?<=bought [0-9]*.[0-9]* )\w+/gi;
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

function processHolding(entities, intent, details) {
	try {
		if(empty(details?.type)) {
			requireClarification("Is this a crypto or stock?", {
				Crypto: () => {
					addMessage("user", "Crypto.");
					details.type = "crypto";
					processHolding(entities, intent, details);
				},
				Stock: () => {
					addMessage("user", "Stock.");
					details.type = "stock";
					processHolding(entities, intent, details);
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

function processWatchlist(entities, intent, details) {
	try {
		if(empty(details?.type)) {
			requireClarification("Is this a crypto or stock?", {
				Crypto: () => {
					addMessage("user", "Crypto.");
					details.type = "crypto";
					processWatchlist(entities, intent, details);
				},
				Stock: () => {
					addMessage("user", "Stock.");
					details.type = "stock";
					processWatchlist(entities, intent, details);
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

function requireClarification(message, options) {
	addMessage("bot", message);

	clearChatOptions();

	options["Nevermind"] = () => {
		addMessage("user", "Nevermind.");
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

	socket.on("process", (data) => {
		let entities = data.processed.sourceEntities;
		let intent = determineIntent(data.processed);
		
		if(intent.category === "activity-or-transaction") {
			requireClarification("Is this activity an asset trade?", {
				Yes: () => {
					addMessage("user", "Yes.");
					intent.category = "activity";
					processIntent(entities, intent);
				},
				No: () => {
					addMessage("user", "No.");
					intent.category = "transaction";
					processIntent(entities, intent);
				}
			});

			return;
		}

		processIntent(entities, intent);
	});
}

function fetchMessage() {
	return new Promise(async (resolve, reject) => {
		try {
			let userID = localStorage.getItem("userID");
			let token = localStorage.getItem("token");
			let key = localStorage.getItem("key");

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