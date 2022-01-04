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
		defaultPage: "Dashboard"
	}

	static getBackground(theme: string, type: string) {
		switch(theme) {
			case "Light":
				switch(type) {
					case "static":
						return require("../assets/img/BG-White-Gold.png");
					case "simple":
						return require("../assets/img/BG-White.png");
				}
				break;
			case "Dark":
				switch(type) {
					case "static":
						return require("../assets/img/BG-Black-Gold.png");
					case "simple":
						return require("../assets/img/BG-Black.png");
				}
				break;
		}
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

	static async syncSettings() {
		let theme: any = await AsyncStorage.getItem("theme");
		let url = await AsyncStorage.getItem("api");
		let userID = await AsyncStorage.getItem("userID");
		let token = await AsyncStorage.getItem("token");

		let key: any = await AsyncStorage.getItem("key");

		let settings = JSON.stringify({
			theme: await AsyncStorage.getItem("theme"),
			defaultPage: await AsyncStorage.getItem("defaultPage"),
		});

		let encrypted = CryptoFN.encryptAES(settings, key);

		new Requests(url).updateSetting(token, userID, encrypted).then(result => {
			if(!("data" in result) && !("updateSetting" in result.data) && result.data.updateSetting !== "Done") {
				Utils.notify(theme, "Couldn't update / sync setting.");
				console.log(result);
			}
		}).catch(error => {
			Utils.notify(theme, error);
			console.log(error);
		});
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

	static replaceAll(find: string, replace: string, string: string, ignore: boolean = false) {
		return string.replace(new RegExp(find.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g,"\\$&"),(ignore?"gi":"g")),(typeof(replace)=="string")?replace.replace(/\$/g,"$$$$"):replace);
	}
}