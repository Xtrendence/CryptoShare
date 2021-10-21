export default class Stock {
	stockID: number | undefined;
	assetID: string;
	assetSymbol: string;

	constructor(assetID: string, assetSymbol: string) {
		this.assetID = assetID;
		this.assetSymbol = assetSymbol;
	}
}