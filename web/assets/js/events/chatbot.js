// TODO: Add functionality.
buttonChatMenu.addEventListener("click", () => {
	let html = `
		<button class="action-button block" id="popup-button-clear">Clear Messages</button>
	`;

	let popup = new Popup(250, "auto", "Chat Actions", html, { cancelText:"Dismiss", confirmText:"-" });
	popup.show();
	popup.updateHeight();

	document.getElementById("popup-button-clear").addEventListener("click", () => {
		popup.hide();
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