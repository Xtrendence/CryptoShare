export default class Holding {
	holdingID: number | undefined;
	userID: number;
	holdingAssetID: string;
	holdingAssetSymbol: string;
	holdingAssetAmount: string;
	holdingAssetType: string;

	constructor(userID: number, holdingAssetID: string, holdingAssetSymbol: string, holdingAssetAmount: string, holdingAssetType: string) {
		this.userID = userID;
		this.holdingAssetID = holdingAssetID;
		this.holdingAssetSymbol = holdingAssetSymbol;
		this.holdingAssetAmount = holdingAssetAmount;
		this.holdingAssetType = holdingAssetType;
	}
}