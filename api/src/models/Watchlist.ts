export default class Watchlist {
	watchlistID: string | undefined;
	userID: number;
	assetID: string;
	assetSymbol: string;
	assetType: string;

	constructor(userID: number, assetID: string, assetSymbol: string, assetType: string) {
		this.userID = userID;
		this.assetID = assetID;
		this.assetSymbol = assetSymbol;
		this.assetType = assetType;
	}
}