export default class Transaction {
	transactionID: string | undefined;
	userID: number;
	transactionType: string;
	transactionDate: string;
	transactionCategory: string;
	transactionAmount: string;
	transactionNotes: string;

	constructor(userID: number, transactionType: string, transactionDate: string, transactionCategory: string, transactionAmount: string, transactionNotes: string) {
		this.userID = userID;
		this.transactionType = transactionType;
		this.transactionDate = transactionDate;
		this.transactionCategory = transactionCategory;
		this.transactionAmount = transactionAmount;
		this.transactionNotes = transactionNotes;
	}
}