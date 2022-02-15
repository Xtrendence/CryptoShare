async function populateChatList(recreate) {
	if(getActivePage().id === "chatbot-page") {
		if(recreate) {
			divChatList.innerHTML = `<div class="loading-icon"><div></div><div></div></div>`;
		}

		

		scrollChatToBottom();
	}
}

function scrollChatToBottom() {
	setTimeout(() => {
		divChatList.scrollTop = divChatList.scrollHeight;
	}, 100);
}