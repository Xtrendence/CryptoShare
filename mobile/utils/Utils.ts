import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback } from "react";
import { BackHandler } from "react-native";
import { showMessage } from "react-native-flash-message";
import { changeSetting } from "../store/reducers/settings";
import { Colors } from "../styles/Global";
import CryptoFN from "./CryptoFN";
import Requests from "./Requests";
export default class Utils {
	static defaultSettings: any = {
		defaultPage: "Dashboard",
		currency: "usd",
		transactionsAffectHoldings: "disabled",
		assetIconBackdrop: "disabled",
	}

	static currencySymbols: any = {
		usd: "$",
		gbp: "£",
		eur: "€",
		chf: "Fr ",
		aud: "$",
		jpy: "¥",
		cad: "$"
	};

	static getBackground(theme: string) {
		let background = require("../assets/img/BG-Black.png");
		if(theme === "Light") {
			background = require("../assets/img/BG-White.png");
		}
		return background;
	}

	static async setAccountInfo(info: any, updateKey: boolean) {
		return new Promise(async (resolve, reject) => {
			try {
				if(updateKey) {
					await AsyncStorage.setItem("key", info?.key.toString());
				}
				
				await AsyncStorage.setItem("token", info?.token.toString());
				await AsyncStorage.setItem("userID", info?.userID.toString());
				await AsyncStorage.setItem("username", info?.username.toString());
				resolve(null);
			} catch(error) {
				console.log(error);
				reject(error);
			}
		});
	}

	static async removeAccountInfo() {
		return new Promise(async (resolve, reject) => {
			try {
				await AsyncStorage.removeItem("key");
				await AsyncStorage.removeItem("token");
				await AsyncStorage.removeItem("userID");
				await AsyncStorage.removeItem("username");
				resolve(null);
			} catch(error) {
				console.log(error);
				reject(error);
			}
		});
	}

	static backHandler(navigation: any) {
		return useCallback(() => {
			function onBackPress(): boolean {
				let routes = navigation.getState()?.routes;
				let previous = routes[routes.length - 2];
				
				if(previous?.name === "Login") {
					BackHandler.exitApp();
					return true;
				}

				return false;
			}

			BackHandler.addEventListener("hardwareBackPress", onBackPress);

			return () => BackHandler.removeEventListener("hardwareBackPress", onBackPress);
		}, []);
	}

	static getCurrency() {
		return new Promise(async (resolve, reject) => {
			try {
				let currency = await AsyncStorage.getItem("currency");
				if(this.empty(currency)) {
					currency = this.defaultSettings.currency;
				}

				resolve(currency);
			} catch(error) {
				console.log(error);
				resolve(this.defaultSettings.currency);
			}
		});
	}

	static async getSettings(dispatch: any) {
		let settings = this.defaultSettings;

		let defaultPage = await AsyncStorage.getItem("defaultPage");
		if(!this.empty(defaultPage)) {
			settings.defaultPage = defaultPage;
			dispatch(changeSetting({ key:"defaultPage", value:defaultPage }));
		}

		let transactionsAffectHoldings = await AsyncStorage.getItem("transactionsAffectHoldings");
		if(!this.empty(transactionsAffectHoldings)) {
			settings.transactionsAffectHoldings = transactionsAffectHoldings;
			dispatch(changeSetting({ key:"transactionsAffectHoldings", value:transactionsAffectHoldings }));
		}

		let assetIconBackdrop = await AsyncStorage.getItem("assetIconBackdrop");
		if(!this.empty(assetIconBackdrop)) {
			settings.assetIconBackdrop = assetIconBackdrop;
			dispatch(changeSetting({ key:"assetIconBackdrop", value:assetIconBackdrop }));
		}

		return settings;
	}

	static async setSettings(dispatch: any, settings: any) {
		if(this.empty(settings)) {
			settings = this.defaultSettings;
		}

		Object.keys(settings).map(async key => {
			let value = settings[key];

			await AsyncStorage.setItem(key, value);
			dispatch(changeSetting({ key:key, value:value }));
		});
	}

	static filterSettings(query: string) {
		let content: any = {
			appearance: ["theme", "dark", "light", "mode", "appearance", "looks"],
			account: ["logout", "token", "user", "account"],
			defaultPage: ["page", "default", "login", "area", "section", "load"],
			transactionsAffectHoldings: ["transactions", "affect", "holdings", "activity", "record", "base"],
			assetIconBackdrop: ["backdrop", "icon", "asset", "market", "crypto", "stock"],
		};

		if(!this.empty(query)) {
			query = query.toLowerCase();
			let result: string[] = [];

			Object.keys(content).map(section => {
				let tags = content[section];

				tags.map((tag: string) => {
					if(tag.includes(query)) {
						result.push(section);
					}
				});
			});

			return result;
		}

		return Object.keys(content);
	}

	static encryptObjectValues(password: string, object: any) {
		let encrypted: any = {};
		let keys = Object.keys(object);

		keys.map(key => {
			let value = object[key].toString();
			let ciphertext = CryptoFN.encryptAES(value, password);
			encrypted[key] = ciphertext;
		});

		return encrypted;
	}

	static decryptObjectValues(password: string, object: any) {
		let decrypted: any = {};
		let keys = Object.keys(object);

		keys.map(key => {
			let value = object[key];

			try {
				let plaintext = CryptoFN.decryptAES(value, password);
				decrypted[key] = plaintext;
			} catch(error) {
				decrypted[key] = value;
			}
		});

		return decrypted;
	}

	static notify(theme: string, message: string) {
		showMessage({
			message: message,
			type: "info",
			floating: true,
			hideStatusBar: true,
			backgroundColor: Colors[theme].accentSecond,
			color: Colors[theme].accentContrast
		});
	}

	static empty(value: any) {
		if(typeof value === "object" && value !== null && Object.keys(value).length === 0) {
			return true;
		}
		
		if(value === null || typeof value === "undefined" || value.toString().trim() === "") {
			return true;
		}

		return false;
	}

	static validJSON(json: any) {
		try {
			let object = JSON.parse(json);
			if(object && typeof object === "object") {
				return true;
			}
		}
		catch(e) { }
		return false;
	}

	static wait(duration: number) {
		return new Promise((resolve: any) => {
			setTimeout(() => {
				resolve();
			}, duration);
		});
	}

	static formatPercentage(number: number) {
		if(!this.empty(number)) {
			return number.toFixed(2).includes("-") ? number.toFixed(2) : "+" + number.toFixed(2);
		} else {
			return "-";
		}
	}

	static formatHour(date: Date) {
		let hours = ("00" + date.getHours()).slice(-2);
		let minutes = ("00" + date.getMinutes()).slice(-2);
		return hours + ":" + minutes;
	}

	static formatDate(date: Date) {
		let day = date.getDate();
		let month = date.getMonth() + 1;
		let year = date.getFullYear();
		return year + " / " + month + " / " + day;
	}

	static formatDateHuman(date: Date) {
		let day = date.getDate();
		let month = date.getMonth() + 1;
		let year = date.getFullYear();
		return day + " / " + month + " / " + year;
	}

	static formatDateHyphenated(date: Date) {
		let day = date.getDate();
		let month = date.getMonth() + 1;
		let year = date.getFullYear();
		return year + "-" + month + "-" + day;
	}

	static addDays(date: Date, days: number) {
		date.setDate(date.getDate() + days);
		return date;
	}

	static dayRangeArray(from: Date, to: Date) {
		let dayInSeconds = 86400 * 1000;
		let fromTime = from.getTime();
		let toTime = to.getTime();
		let days = [];

		for(let i = fromTime; i < toTime; i += dayInSeconds) {
			let date = this.formatDateHyphenated(new Date(i));
			days.push(date);
		}

		days.length = 365;

		return days;
	}

	static previousYear(date: Date) {
		let day = date.getDate();
		let month = date.getMonth() + 1;
		let year = date.getFullYear() - 1;
		return new Date(Date.parse(year + "-" + month + "-" + day));
	}

	static previousMonth(date: Date) {
		return new Date(date.getTime() - 2592000 * 1000);
	}

	static previousWeek(date: Date) {
		return new Date(date.getTime() - (60 * 60 * 24 * 6 * 1000));
	}

	static isEven(n: any) {
		return /^-?\d*[02468]$/.test(n);
	}

	static randomBetween(min: number, max: number) {
		return min + Math.floor(Math.random() * (max - min + 1));
	}

	static refetchRequired(time: string) {
		let refetchTime = 86400;
		return (Math.floor(new Date().getTime() / 1000)) - refetchTime > parseInt(time);
	}

	static separateThousands(number: number) {
		try {
			let parts = number.toString().split(".");
			parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
			return parts.join(".");
		} catch(error) {
			return "0";
		}
	}

	static abbreviateNumber(num: number, digits: number) {
		let si = [
			{ value: 1, symbol: "" },
			{ value: 1E3, symbol: "k" },
			{ value: 1E6, symbol: "M" },
			{ value: 1E9, symbol: "B" },
			{ value: 1E12, symbol: "T" },
			{ value: 1E15, symbol: "P" },
			{ value: 1E18, symbol: "E" }
		];
		let rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
		let i;
		for(i = si.length - 1; i > 0; i--) {
			if(num >= si[i].value) {
				break;
			}
		}
		return (num / si[i].value).toFixed(digits).replace(rx, "$1") + si[i].symbol;
	}

	static sortLabels(currency: string, labels: any) {
		let floats: any = [];
		let sorted: any = [];

		labels = labels.slice(-5);

		labels.map((label: any) => {
			let float = parseFloat(label);
			if(float < 1) {
				floats.push(float);
			} else if(float > 100) {
				floats.push(parseFloat(float.toFixed(0)));
			} else if(float > 1 && float < 10) {
				floats.push(parseFloat(float.toFixed(4)));
			} else {
				floats.push(parseFloat(float.toFixed(2)));
			}
		});

		floats.sort().reverse();

		floats.map((float: any) => {
			let format = this.currencySymbols[currency] + Utils.separateThousands(float);
			sorted.push(format);
		});
		
		return sorted;
	}

	static rgbToHex(rgb: string) {
		let numbers = rgb.split("(")[1].split(")")[0].split(",");
		let hexArray = numbers.map((number) => {
			number = parseInt(number).toString(16);
			return (number.length === 1) ? "0" + number : number;
		});
		return "#" + hexArray.join("");
	}

	static replaceAll(find: string, replace: string, string: string, ignore: boolean = false) {
		return string.replace(new RegExp(find.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g,"\\$&"),(ignore?"gi":"g")),(typeof(replace)=="string")?replace.replace(/\$/g,"$$$$"):replace);
	}
}