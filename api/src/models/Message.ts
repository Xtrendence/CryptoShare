export default class Message {
	messageID: number | undefined;
	userID: number;
	message: string;
	messageDate: string;

	constructor(userID: number, message: string, messageDate: string) {
		this.userID = userID;
		this.message = message;
		this.messageDate = messageDate;
	}
}