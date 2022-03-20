import AsyncStorage from "@react-native-async-storage/async-storage";
import { cryptoAPI } from "./Requests";
import Utils from "./Utils";

export default class CryptoFinder {
	// Returns a crypto asset's ID or a list of matching assets.
	static async getCoin(args: any) {
		return new Promise(async (resolve, reject) => {
			try {
				let list = await this.fetchCoinList();

				let coin;

				if((Utils.empty(args.id) && Utils.empty(args.symbol)) || (!Utils.empty(args.id) && !Utils.empty(args.symbol))) {
					reject("Only symbol or ID must be provided, not both.");
					return;
				} else if(!Utils.empty(args.symbol)) {
					coin = this.findCryptoBySymbol(list, args.symbol.toLowerCase(), true);
				} else if(!Utils.empty(args.id)) {
					coin = this.findCryptoByID(list, args.id.toLowerCase(), true);
				}

				resolve(coin);
			} catch(error) {
				console.log(error);
				reject(error);
			}
		});
	}

	// Fetches every crypto's symbol and ID.
	static async fetchCoinList() {
		return new Promise(async (resolve, reject) => {
			try {
				let current: string = await AsyncStorage.getItem("coinList") || "";
			
				if(Utils.empty(current) || !Utils.validJSON(current) || Utils.refetchRequired(JSON.parse(current).time)) {
					let list = await cryptoAPI.getCoinList();

					let pairs: any = [];

					Object.keys(list).map(coin => {
						let symbol = list[coin].symbol.toLowerCase();
						let pair = { [symbol]:list[coin].id };
						pairs.push(pair);
					});

					let coinList = {
						time: Math.floor(new Date().getTime() / 1000),
						data: pairs
					};

					await AsyncStorage.setItem("coinList", JSON.stringify(coinList));

					resolve(pairs);
				} else {
					resolve(JSON.parse(current).data);
				}
			} catch(error) {
				console.log(error);
				reject(error);
			}
		});
	}

	// Finds a crypto asset using its symbol.
	static findCryptoBySymbol(coins: any, symbol: string, retry: boolean): any {
		let matches: any = [];

		coins.map((coin: any) => {
			if(Object.keys(coin)[0] === symbol) {
				matches.push(coin);
			}
		});

		if(matches.length === 1) {
			return { id:matches[0][symbol], symbol:symbol };
		} else if(Utils.empty(matches)) {
			if(retry) {
				return this.findCryptoByID(coins, symbol, false);
			} else {
				return { error:"No coins were found with that symbol." };
			}
		} else {
			return { matches:matches };
		}
	}

	// Finds a crypto asset using its ID.
	static findCryptoByID(coins: any, id: string, retry: boolean): any {
		let values = Object.values(coins);
		let symbols: any = {};
		let ids: any = [];

		values.map((value: any) => {
			ids.push(value[Object.keys(value)[0]]);
			symbols[value[Object.keys(value)[0]]] = Object.keys(value)[0];
		});

		if(ids.includes(id)) {
			return { id:id, symbol:symbols[id] };
		} else {
			if(retry) {
				return this.findCryptoBySymbol(coins, id, false);
			} else {
				return { error:"No coins were found with that symbol." };
			}
		}
	}
}