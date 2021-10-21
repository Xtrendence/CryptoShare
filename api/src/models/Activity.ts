export default class Activity {
	activityID: number | undefined;
	userID: number;
	activityTransactionID: string;
	activityAssetID: string;
	activityAssetSymbol: string;
	activityAssetType: string;
	activityDate: string;
	activityType: string;
	activityAssetAmount: number;
	activityFee: number;
	activityNotes: string;
	activityExchange: string;
	activityPair: string;
	activityPrice: number;
	activityFrom: string;
	activityTo: string;

	constructor(userID: number, activityTransactionID: string, activityAssetID: string, activityAssetSymbol: string, activityAssetType: string, activityDate: string, activityType: string, activityAssetAmount: number, activityFee: number, activityNotes: string, activityExchange: string, activityPair: string, activityPrice: number, activityFrom: string, activityTo: string) {
		this.userID = userID;
		this.activityTransactionID = activityTransactionID;
		this.activityAssetID = activityAssetID;
		this.activityAssetSymbol = activityAssetSymbol;
		this.activityAssetType = activityAssetType;
		this.activityDate = activityDate;
		this.activityType = activityType;
		this.activityAssetAmount = activityAssetAmount;
		this.activityFee = activityFee;
		this.activityNotes = activityNotes;
		this.activityExchange = activityExchange;
		this.activityPair = activityPair;
		this.activityPrice = activityPrice;
		this.activityFrom = activityFrom;
		this.activityTo = activityTo;
	}
}