export default class Coin {
	assetID: string;
	assetSymbol: string;
	data: string;

	constructor(assetID: string, assetSymbol: string, data: string) {
		this.assetID = assetID;
		this.assetSymbol = assetSymbol;
		this.data = data;
	}
}