buttonChatMenu.addEventListener("click", () => {
	let html = `
		<button class="action-button block" id="popup-button-clear">Clear Messages</button>
	`;

	let popup = new Popup(250, "auto", "Chat Actions", html, { cancelText:"Dismiss", confirmText:"-", page:"chatbot" });
	popup.show();
	popup.updateHeight();

	document.getElementById("popup-button-clear").addEventListener("click", () => {
		popup.hide();

		let userID = localStorage.getItem("userID");
		let token = localStorage.getItem("token");

		popup = new Popup(300, "auto", "Delete Messages", `<span>Are you sure you want to delete all messages?</span>`, { page:"chatbot" });
		popup.show();
		popup.updateHeight();

		popup.on("confirm", async () => {
			try {
				showLoading(1500, "Deleting...");

				await deleteMessageAll(token, userID);

				divChatList.removeAttribute("data-checksum");
				divChatList.innerHTML = "";
				clearChatOptions();

				populateChatList(true);

				hideLoading();

				popup.hide();
			} catch(error) {
				console.log(error);
				errorNotification("Couldn't delete messages.");
			}
		});
	});
});

inputMessage.addEventListener("keydown", (event) => {
	if(event.key.toLowerCase() === "enter") {
		buttonMessageSend.click();
	}
});

buttonMessageSend.addEventListener("click", () => {
	let message = inputMessage.value;

	sendMessage(message);

	inputMessage.value = "";
});