let socket = io.connect(urlBot);
attachSocketEvents(socket);

async function populateChatList(recreate) {
	if(getActivePage().id === "chatbot-page") {
		if(recreate) {
			divChatList.innerHTML = `<div class="loading-icon"><div></div><div></div></div>`;
		}

		divChatList.innerHTML = "";

		scrollChatToBottom();
	}
}

function sendMessage(message) {
	if(chatConnected()) {
		addMessage("user", message);

		setTimeout(() => {
			socket.emit("message", message);
		}, 500);
	} else {
		errorNotification("You aren't connected to the chat bot.");
	}
}

function addMessage(from, message) {
	let div = document.createElement("div");
	div.setAttribute("class", `chat-bubble-wrapper ${from}`);

	div.innerHTML = `<div class="chat-bubble"><span>${message}</span></div>`;

	divChatList.appendChild(div);
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
		console.log(data);
	});
}