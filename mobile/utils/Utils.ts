import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback } from "react";
import { BackHandler } from "react-native";
import { showMessage } from "react-native-flash-message";
import { changeSetting } from "../store/reducers/settings";
import { Colors } from "../styles/Global";
import { statusBarHeight } from "../styles/NavigationBar";
import CryptoFN from "./CryptoFN";

// A class with helper functions and commonly used variables and values.
export default class Utils {
	// Default user settings (for the mobile app only).
	static defaultSettings: any = {
		defaultPage: "Dashboard",
		currency: "usd",
		activitiesAffectHoldings: "disabled",
		alternateBackground: "enabled",
		assetIconBackdrop: "disabled",
		dateFormat: "yyyy-mm-dd"
	}

	// Default budget data.
	static defaultBudgetData: any = {
		categories: {
			food: 15,
			housing: 30,
			transport: 10,
			entertainment: 10,
			insurance: 15,
			savings: 10,
			other: 10
		},
		income: 40000,
		savings: 0
	};

	// Fiat currency symbols.
	static currencySymbols: any = {
		usd: "$",
		gbp: "£",
		eur: "€",
		chf: "Fr ",
		aud: "$",
		jpy: "¥",
		cad: "$"
	};

	// The names of each month.
	static monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

	// Returns the path to the appropriate background image given the app theme and whether or not the alternate background is enabled.
	static getBackground(theme: string, alternateBackground: string) {
		if(alternateBackground === "disabled") {
			let background = require("../assets/img/BG-Black.png");
			
			if(theme === "Light") {
				background = require("../assets/img/BG-White.png");
			}

			return background;
		}

		return require("../assets/img/BG-Alt.png");
	}

	// Sets the user's credentials.
	static async setAccountInfo(info: any, updateKey: boolean) {
		return new Promise(async (resolve, reject) => {
			try {
				if(updateKey) {
					await AsyncStorage.setItem("key", info?.key.toString());
				}

				let keyAPI = await AsyncStorage.getItem("keyAPI");
				if(Utils.empty(keyAPI)) {
					await AsyncStorage.setItem("keyAPI", "-");
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

	// Removes the user's credentials.
	static async removeAccountInfo() {
		return new Promise(async (resolve, reject) => {
			try {
				await AsyncStorage.removeItem("key");
				await AsyncStorage.removeItem("token");
				await AsyncStorage.removeItem("userID");
				await AsyncStorage.removeItem("username");
				await AsyncStorage.removeItem("keyAPI");
				resolve(null);
			} catch(error) {
				console.log(error);
				reject(error);
			}
		});
	}

	// Handles back button presses. If the last page was the "Login" page, the app is closed.
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

	// Returns the ticker of the active fiat currency.
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

	// Sets and returns the user's settings.
	static async getSettings(dispatch: any) {
		let settings = this.defaultSettings;

		let username = await AsyncStorage.getItem("username");
		if(!this.empty(username)) {
			settings.username = username;
			dispatch(changeSetting({ key:"username", value:username }));
		}

		let defaultPage = await AsyncStorage.getItem("defaultPage");
		if(!this.empty(defaultPage)) {
			settings.defaultPage = defaultPage;
			dispatch(changeSetting({ key:"defaultPage", value:defaultPage }));
		}

		let activitiesAffectHoldings = await AsyncStorage.getItem("activitiesAffectHoldings");
		if(!this.empty(activitiesAffectHoldings)) {
			settings.activitiesAffectHoldings = activitiesAffectHoldings;
			dispatch(changeSetting({ key:"activitiesAffectHoldings", value:activitiesAffectHoldings }));
		}

		let currency = await AsyncStorage.getItem("currency");
		if(!this.empty(currency)) {
			settings.currency = currency;
			dispatch(changeSetting({ key:"currency", value:currency }));
		}

		let alternateBackground = await AsyncStorage.getItem("alternateBackground");
		if(!this.empty(alternateBackground)) {
			settings.alternateBackground = alternateBackground;
			dispatch(changeSetting({ key:"alternateBackground", value:alternateBackground }));
		}

		let assetIconBackdrop = await AsyncStorage.getItem("assetIconBackdrop");
		if(!this.empty(assetIconBackdrop)) {
			settings.assetIconBackdrop = assetIconBackdrop;
			dispatch(changeSetting({ key:"assetIconBackdrop", value:assetIconBackdrop }));
		}

		let dateFormat = await AsyncStorage.getItem("dateFormat");
		if(!this.empty(dateFormat)) {
			settings.dateFormat = dateFormat;
			dispatch(changeSetting({ key:"dateFormat", value:dateFormat }));
		}

		return settings;
	}

	// Sets the user's settings.
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

	// Filters through the different sections of the "Settings" page.
	static filterSettings(query: string) {
		let content: any = {
			appearance: ["theme", "dark", "light", "mode", "appearance", "looks"],
			account: ["logout", "token", "user", "account"],
			stockAPI: ["stock", "api", "key", "set", "change", "input"],
			defaultPage: ["page", "default", "login", "area", "section", "load"],
			activitiesAffectHoldings: ["transactions", "activities", "affect", "holdings", "activity", "record", "base"],
			currency: ["currency", "fiat", "money", "cash", "region"],
			alternateBackground: ["background", "appearance", "theme", "color", "wallpaper"],
			assetIconBackdrop: ["backdrop", "icon", "asset", "market", "crypto", "stock"],
			dateFormat: ["date", "format", "time", "activity", "transaction"],
			reset: ["reset", "data", "delete", "user"],
			import: ["import", "data", "csv", "upload", "user", "json"],
			export: ["export", "data", "csv", "download", "user", "json"],
			donate: ["donate", "support", "money", "cash", "dev"],
			contact: ["contact", "developer", "github", "email", "message", "support", "help"]
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

	// Encrypts the values of an object.
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

	// Decrypts the values of an object.
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

	// Function to simplify showing the user a notification.
	static notify(theme: string, message: string, duration: number = 4000) {
		showMessage({
			message: message,
			type: "info",
			floating: true,
			hideStatusBar: false,
			backgroundColor: Colors[theme].accentSecond,
			color: Colors[theme].accentContrast,
			duration: duration,
			statusBarHeight: statusBarHeight
		});
	}

	// Gets the previous non-null value in an object given a starting index.
	static previousValueInObject(object: any, start: number) {
		let keys = Object.keys(object);

		for(let i = start; i >= 0; i--) {
			try {
				if(!Utils.empty(object[keys[i]])) {
					return object[keys[i]];
				}
			} catch(error) {
				continue;
			}
		}
	}

	// Gets the next non-null value in an object given a starting index.
	static nextValueInObject(object: any, start: number) {
		let keys = Object.keys(object);

		for(let i = start; i < keys.length; i++) {
			try {
				if(!Utils.empty(object[keys[i]])) {
					return object[keys[i]];
				}
			} catch(error) {
				continue;
			}
		}
	}

	// Converts HTML tags to avoid them being rendered. Prevents XSS attacks.
	static stripHTMLCharacters(string: string) {
		string = Utils.replaceAll("<", "&lt;", string);
		string = Utils.replaceAll(">", "&gt;", string);
		return string;
	}

	// Checks if a variable is empty.
	static empty(value: any) {
		if(typeof value === "object" && value !== null && Object.keys(value).length === 0) {
			return true;
		}
		
		if(value === null || typeof value === "undefined" || value.toString().trim() === "") {
			return true;
		}

		return false;
	}

	// Checks if a string is valid JSON.
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

	// Waits for a set duration.
	static wait(duration: number) {
		return new Promise((resolve: any) => {
			setTimeout(() => {
				resolve();
			}, duration);
		});
	}

	// Formats percentages to two decimal places, and adds a "+" prefix if the number isn't negative.
	static formatPercentage(number: number) {
		if(!this.empty(number)) {
			return number.toFixed(2).includes("-") ? number.toFixed(2) : "+" + number.toFixed(2);
		} else {
			return "-";
		}
	}

	// Returns the hour in the format "HH-MM-SS".
	static formatSecondsHyphenated(date: Date) {
		let hours = ("00" + date.getHours()).slice(-2);
		let minutes = ("00" + date.getMinutes()).slice(-2);
		let seconds = ("00" + date.getSeconds()).slice(-2);
		return hours + "-" + minutes + "-" + seconds;
	}

	// Returns the hour in the format "HH:MM".
	static formatHour(date: Date) {
		let hours = ("00" + date.getHours()).slice(-2);
		let minutes = ("00" + date.getMinutes()).slice(-2);
		return hours + ":" + minutes;
	}

	// Returns the date in SQL format.
	static formatDateSQL(date: Date) {
		return date.toISOString().split("T")[0] + " " + date.toTimeString().split(" ")[0];
	}

	// Returns the date in the format "YYYY / MM / DD".
	static formatDate(date: Date) {
		let day = date.getDate();
		let month = date.getMonth() + 1;
		let year = date.getFullYear();
		return year + " / " + ("0" + month).slice(-2) + " / " + ("0" + day).slice(-2);
	}

	// Returns the date in the format "DD / MM / YYYY".
	static formatDateHuman(date: Date) {
		let day = date.getDate();
		let month = date.getMonth() + 1;
		let year = date.getFullYear();
		return ("0" + day).slice(-2) + " / " + ("0" + month).slice(-2) + " / " + year;
	}

	// Returns the date in the format "YYYY-MM-DD".
	static formatDateHyphenated(date: Date) {
		let day = date.getDate();
		let month = date.getMonth() + 1;
		let year = date.getFullYear();
		return year + "-" + ("0" + month).slice(-2) + "-" + ("0" + day).slice(-2);
	}

	// Returns the date in the format "DD-MM-YYYY".
	static formatDateHyphenatedHuman(date: Date) {
		let day = date.getDate();
		let month = date.getMonth() + 1;
		let year = date.getFullYear();
		return ("0" + day).slice(-2) + "-" + ("0" + month).slice(-2) + "-" + year;
	}

	// Adds a given number of days to a date.
	static addDays(date: Date, days: number) {
		date.setDate(date.getDate() + days);
		return date;
	}

	// Returns an array containing the dates of days within a given range in the format "YYYY-MM-DD".
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

	// Returns the date of a year before a given date.
	static previousYear(date: Date) {
		let day = date.getDate();
		let month = date.getMonth() + 1;
		let year = date.getFullYear() - 1;
		return new Date(Date.parse(year + "-" + month + "-" + day));
	}

	// Returns the date of a month before a given date.
	static previousMonth(date: Date) {
		return new Date(date.getTime() - 2592000 * 1000);
	}

	// Returns the date of a week before a given date.
	static previousWeek(date: Date) {
		return new Date(date.getTime() - (60 * 60 * 24 * 6 * 1000));
	}

	// Checks if a number is even.
	static isEven(n: any) {
		return /^-?\d*[02468]$/.test(n);
	}

	// Generates a random number within a given range.
	static randomBetween(min: number, max: number) {
		return min + Math.floor(Math.random() * (max - min + 1));
	}

	// Checks if a UNIX timestamp is older than 24 hours.
	static refetchRequired(time: string) {
		let refetchTime = 86400;
		return (Math.floor(new Date().getTime() / 1000)) - refetchTime > parseInt(time);
	}

	// Separates a number by thousands.
	static separateThousands(number: number) {
		try {
			let parts = number.toString().split(".");
			parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
			return parts.join(".");
		} catch(error) {
			return "0";
		}
	}

	// Abbreviates a number.
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

	// Sorts chart labels.
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

		floats.sort(function(a: number, b: number) {
			return a - b;
		});

		floats.reverse().map((float: any) => {
			let format = this.currencySymbols[currency] + Utils.separateThousands(float);
			sorted.push(format);
		});
		
		return sorted;
	}

	// Capitalizes the first letter of a string.
	static capitalizeFirstLetter(string: string) {
		return string.charAt(0).toUpperCase() + string.slice(1);
	}

	// Capitalizes the first letter of every word in a string.
	static titleCase(string: string) {
		return string.replace(/(^\w|\s\w)/g, m => m.toUpperCase());
	}

	// Converts an RGB value to hex.
	static rgbToHex(rgb: string) {
		let numbers = rgb.split("(")[1].split(")")[0].split(",");
		let hexArray = numbers.map((number) => {
			number = parseInt(number).toString(16);
			return (number.length === 1) ? "0" + number : number;
		});
		return "#" + hexArray.join("");
	}

	// Replaces all occurrences of a string in a given string with another string.
	static replaceAll(find: string, replace: string, string: string, ignore: boolean = false) {
		return string.replace(new RegExp(find.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g,"\\$&"),(ignore?"gi":"g")),(typeof(replace)=="string")?replace.replace(/\$/g,"$$$$"):replace);
	}
}