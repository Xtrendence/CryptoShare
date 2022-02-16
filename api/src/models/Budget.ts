export default class Budget {
	budgetID: number | undefined;
	userID: number;
	budgetData: string;

	constructor(userID: number, budgetData: string) {
		this.userID = userID;
		this.budgetData = budgetData;
	}
}