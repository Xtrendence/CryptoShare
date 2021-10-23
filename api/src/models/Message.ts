export default class Message {
	messageID: number | undefined;
	userID: number;
	userMessage: string;
	botMessage: string | undefined;
	messageDate: string;

	constructor(userID: number, userMessage: string, botMessage: string | undefined, messageDate: string) {
		this.userID = userID;
		this.userMessage = userMessage;
		this.botMessage = botMessage;
		this.messageDate = messageDate;
	}
}