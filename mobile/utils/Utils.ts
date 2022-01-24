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
		currency: "usd"
	}

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
			defaultPage: ["page", "default", "login", "area", "section", "load"]
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

	static replaceAll(find: string, replace: string, string: string, ignore: boolean = false) {
		return string.replace(new RegExp(find.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g,"\\$&"),(ignore?"gi":"g")),(typeof(replace)=="string")?replace.replace(/\$/g,"$$$$"):replace);
	}
}