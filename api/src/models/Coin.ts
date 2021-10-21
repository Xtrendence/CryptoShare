export default class Coin {
	coinID: number | undefined;
	assetID: string;
	assetSymbol: string;

	constructor(assetID: string, assetSymbol: string) {
		this.assetID = assetID;
		this.assetSymbol = assetSymbol;
	}
}