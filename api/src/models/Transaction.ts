export default class Transaction {
	transactionID: string | undefined;
	userID: number;
	transactionType: string;
	transactionCategory: string;
	transactionAmount: string;
	transactionNotes: string;

	constructor(userID: number, transactionType: string, transactionCategory: string, transactionAmount: string, transactionNotes: string) {
		this.userID = userID;
		this.transactionType = transactionType;
		this.transactionCategory = transactionCategory;
		this.transactionAmount = transactionAmount;
		this.transactionNotes = transactionNotes;
	}
}