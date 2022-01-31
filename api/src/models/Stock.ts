export default class Stock {
	assetSymbol: string;
	historicalData: string;
	priceData: string;

	constructor(assetSymbol: string, historicalData: string, priceData: string) {
		this.assetSymbol = assetSymbol;
		this.historicalData = historicalData;
		this.priceData = priceData;
	}
}