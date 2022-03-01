let socket = io.connect(urlBot);
attachSocketEvents(socket);

async function populateChatList(recreate) {
	if(getActivePage().id === "chatbot-page") {
		if(recreate) {
			divChatList.removeAttribute("data-checksum");
			divChatList.innerHTML = `<div class="loading-icon"><div></div><div></div></div>`;
		}

		try {
			let messages = await fetchMessage() || "";
			let checksum = sha256(JSON.stringify(messages));

			console.log(messages);

			divChatList.setAttribute("data-checksum", checksum);
			divChatList.innerHTML = "";

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

function addMessage(from, message) {
	clearChatOptions();

	message = stripHTMLCharacters(message);
	
	let div = document.createElement("div");
	div.setAttribute("class", `chat-bubble-wrapper ${from}`);

	div.innerHTML = `<div class="chat-bubble"><span>${message}</span></div>`;

	divChatList.appendChild(div);
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
		}

		return { category:category, action:action, utterance:utterance };
	} catch(error) {
		return { error:error };
	}
}

function processRequest(processedIntent) {
	console.log(processedIntent);
}

function processIntent(entities, intent) {
	clearChatOptions();

	let details = {};
	details["category"] = intent.category;
	details["action"] = intent.action;
	details["type"] = null;

	switch(intent.category) {
		case "activity":
			processActivity(entities, intent, details);
			break;
		case "holding":
			processHolding(entities, intent, details);
			break;
		case "watchlist":
			processWatchlist(intent, details);
			break;
	}
}

function processActivity(entities, intent, details) {
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
	}

	if(!("date" in details)) {
		details["date"] = new Date().toISOString().split("T")[0]
	}

	processRequest(details);
}

function processHolding(entities, intent, details) {
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

	if(intent.utterance.match("(set)")) {
		match = intent.utterance.match(/\w+(?=\s+((holding)))/gi);
		details["amount"] = parseFloat(lastEntity.resolution.value);
	} else if(intent.utterance.match("(remove|delete)")) {
		match = intent.utterance.match(/\w+(?=\s+((from )))/);
		details["action"] = "delete";
	}

	let asset = match[0];
	details["asset"] = asset;

	processRequest(details);
}

function processWatchlist(intent, details) {
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
}

function requireClarification(message, options) {
	addMessage("bot", message);

	clearChatOptions();

	let choices = Object.keys(options);

	choices.map(choice => {
		let button = document.createElement("button");
		button.textContent = choice;
		button.setAttribute("class", "audible-pop");
		button.addEventListener("click", options[choice]);
		divChatOptions.classList.remove("hidden");
		divChatOptions.appendChild(button);
	});

	inputMessage.setAttribute("readonly", "true");

	if(divChatOptions.scrollWidth > divChatOptions.clientWidth) {
		divChatOptions.classList.add("scroll");
	}
}

function clearChatOptions() {
	inputMessage.removeAttribute("readonly");
	divChatOptions.innerHTML = "";
	divChatOptions.classList.add("hidden");
	divChatOptions.classList.remove("scroll");
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
				No: () => {
					addMessage("user", "No.");
					intent.category = "transaction";
					processIntent(entities, intent);
				},
				Yes: () => {
					addMessage("user", "Yes.");
					intent.category = "activity";
					processIntent(entities, intent);
				}
			});

			return;
		}
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
				messageData[decrypted.messageID] = decrypted;
			});

			resolve(messageData);
		} catch(error) {
			console.log(error);
			reject(error);
		}
	});
}