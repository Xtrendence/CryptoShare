import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback } from "react";
import { BackHandler } from "react-native";
import { showMessage } from "react-native-flash-message";
import { Colors } from "../styles/Global";

export default class Utils {
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

	static async setAccountInfo(info: any) {
		return new Promise(async (resolve, reject) => {
			try {
				await AsyncStorage.setItem("key", info?.key.toString());
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
		}, [])
	}

	static async getSettings() {
		let settings: any = {
			defaultPage: "Dashboard"
		};

		let defaultPage = await AsyncStorage.getItem("defaultPage");
		if(!this.empty(defaultPage)) {
			settings.defaultPage = defaultPage;
		}

		return settings;
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