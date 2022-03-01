import React, { useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { ImageBackground, Keyboard, Modal, ScrollView, Text, TextInput, ToastAndroid, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toggle from "react-native-toggle-element";
import Icon from "react-native-vector-icons/FontAwesome5";
import { useDispatch, useSelector } from "react-redux";
import ChoiceButton from "../components/ChoiceButton";
import { changeSetting } from "../store/reducers/settings";
import { switchTheme } from "../store/reducers/theme";
import { Colors } from "../styles/Global";
import styles from "../styles/Settings";
import Requests from "../utils/Requests";
import Utils from "../utils/Utils";
import Loading from "../components/Loading";
import CryptoFN from "../utils/CryptoFN";

export default function Settings({ navigation }: any) {
	const dispatch = useDispatch();
	const { theme } = useSelector((state: any) => state.theme);
	const { settings } = useSelector((state: any) => state.settings);

	const [loading, setLoading] = useState<boolean>(false);

	const [popup, setPopup] = useState<boolean>(false);
	const [popupContent, setPopupContent] = useState<any>(null);

	const popupRef = useRef<any>({
		currentPassword: "",
		newPassword: "",
		repeatPassword: "",
		stockAPIKey: ""
	});

	const [search, setSearch] = useState<string>("");
	
	useFocusEffect(Utils.backHandler(navigation));

	useEffect(() => {
		navigation.addListener("focus", () => {
			if(navigation.isFocused()) {
				setTimeout(() => {
					Utils.getSettings(dispatch);
				}, 500);
			}
		});
	}, []);

	return (
		<ImageBackground source={Utils.getBackground(theme)} resizeMethod="scale" resizeMode="cover">
			<ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent} showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false} nestedScrollEnabled={true}>
				<SafeAreaView style={styles.area}>
					<TextInput 
						placeholder="Search..." 
						selectionColor={Colors[theme].mainContrast} 
						placeholderTextColor={Colors[theme].mainContrastDarker} 
						style={[styles.search, styles[`search${theme}`]]} 
						onChangeText={(value) => setSearch(value)}
						value={search}
					/>
					<ScrollView style={[styles.wrapper, styles[`wrapper${theme}`]]} contentContainerStyle={styles.wrapperContent}>
						{ Utils.filterSettings(search).includes("appearance") &&
							<View style={[styles.section, styles[`section${theme}`], styles.inline]}>
								<View style={styles.sectionLeft}>
									<Text style={[styles.title, styles[`title${theme}`]]}>Application Theme</Text>
								</View>
								<View style={styles.sectionRight}>
									<Toggle
										style={styles.inlineRight}
										value={theme === "Dark" ? false : true}
										onPress={() => dispatch(switchTheme(theme === "Dark" ? "Light" : "Dark"))}
										thumbActiveComponent={
											<Icon name="sun" size={20} color={Colors[theme].Settings.accentFirst} style={{ padding:12, paddingLeft:13 }}/>
										}
										thumbInActiveComponent={
											<Icon name="moon" size={20} color={Colors[theme].Settings.accentFirst} style={{ padding:12 }}/>
										}
										trackBar={styles.trackBar}
										thumbButton={styles.thumbButton}
										animationDuration={250}
									/>
								</View>
							</View>
						}
						{ Utils.filterSettings(search).includes("account") &&
							<View style={[styles.section, styles[`section${theme}`]]}>
								<View style={styles.sectionTop}>
									<Text style={[styles.title, styles[`title${theme}`], styles.titleTop]}>Account</Text>
								</View>
								<View style={styles.sectionBottom}>
									<TouchableOpacity style={[styles.button, styles.actionButton, styles[`actionButton${theme}`]]} onPress={() => logout()}>
										<Text style={[styles.actionText, styles[`actionText${theme}`]]}>Logout</Text>
									</TouchableOpacity>
									<TouchableOpacity onPress={() => showConfirmationPopup("logoutEverywhere", null)} style={[styles.button, styles.actionButton, styles[`actionButton${theme}`]]}>
										<Text style={[styles.actionText, styles[`actionText${theme}`]]}>Logout Everywhere</Text>
									</TouchableOpacity>
									<TouchableOpacity onPress={() => showPasswordPopup()} style={[styles.button, styles.actionButton, styles[`actionButton${theme}`]]}>
										<Text style={[styles.actionText, styles[`actionText${theme}`]]}>Change Password</Text>
									</TouchableOpacity>
									<TouchableOpacity onPress={() => showDeleteAccountPopup(1)} style={[styles.button, styles.actionButton, styles[`actionButton${theme}`]]}>
										<Text style={[styles.actionText, styles[`actionText${theme}`]]}>Delete Account</Text>
									</TouchableOpacity>
								</View>
							</View>
						}
						{ Utils.filterSettings(search).includes("stockAPI") &&
							<View style={[styles.section, styles[`section${theme}`]]}>
								<View style={styles.sectionTop}>
									<Text style={[styles.title, styles[`title${theme}`], styles.titleTop]}>Stock API</Text>
								</View>
								<View style={styles.sectionBottom}>
									<TouchableOpacity style={[styles.button, styles.actionButton, styles[`actionButton${theme}`]]} onPress={() => showStockAPIPopup()}>
										<Text style={[styles.actionText, styles[`actionText${theme}`]]}>Set Key</Text>
									</TouchableOpacity>
								</View>
							</View>
						}
						{ Utils.filterSettings(search).includes("defaultPage") &&
							<View style={[styles.section, styles[`section${theme}`]]}>
								<View style={styles.sectionTop}>
									<Text style={[styles.title, styles[`title${theme}`], styles.titleTop]}>Default Page</Text>
								</View>
								<View style={styles.sectionBottom}>
									<ChoiceButton setting="Chat Bot" active={settings.defaultPage} text="Chat Bot" theme={theme} onPress={() => dispatch(changeSetting({ key:"defaultPage", value:"Chat Bot" }))}/>
									<ChoiceButton setting="Dashboard" active={settings.defaultPage} text="Dashboard" theme={theme} onPress={() => dispatch(changeSetting({ key:"defaultPage", value:"Dashboard" }))}/>
									<ChoiceButton setting="Market" active={settings.defaultPage} text="Market" theme={theme} onPress={() => dispatch(changeSetting({ key:"defaultPage", value:"Market" }))}/>
									<ChoiceButton setting="Holdings" active={settings.defaultPage} text="Holdings" theme={theme} onPress={() => dispatch(changeSetting({ key:"defaultPage", value:"Holdings" }))}/>
									<ChoiceButton setting="Activity" active={settings.defaultPage} text="Activity" theme={theme} onPress={() => dispatch(changeSetting({ key:"defaultPage", value:"Activity" }))}/>
									<ChoiceButton setting="Settings" active={settings.defaultPage} text="Settings" theme={theme} onPress={() => dispatch(changeSetting({ key:"defaultPage", value:"Settings" }))}/>
								</View>
							</View>
						}
						{ Utils.filterSettings(search).includes("transactionsAffectHoldings") &&
							<View style={[styles.section, styles[`section${theme}`]]}>
								<View style={styles.sectionTop}>
									<Text style={[styles.title, styles[`title${theme}`], styles.titleTop]}>Transactions Affect Holdings</Text>
								</View>
								<View style={styles.sectionBottom}>
									<ChoiceButton setting="disabled" active={settings.transactionsAffectHoldings} text="Disabled" theme={theme} onPress={() => dispatch(changeSetting({ key:"transactionsAffectHoldings", value:"disabled" }))}/>
									<ChoiceButton setting="enabled" active={settings.transactionsAffectHoldings} text="Enabled" theme={theme} onPress={() => dispatch(changeSetting({ key:"transactionsAffectHoldings", value:"enabled" }))}/>
								</View>
							</View>
						}
						{ Utils.filterSettings(search).includes("currency") &&
							<View style={[styles.section, styles[`section${theme}`]]}>
								<View style={styles.sectionTop}>
									<Text style={[styles.title, styles[`title${theme}`], styles.titleTop]}>Currency</Text>
								</View>
								<View style={styles.sectionBottom}>
									<ChoiceButton setting="USD" active={settings.currency} text="USD" theme={theme} onPress={() => dispatch(changeSetting({ key:"currency", value:"usd" }))}/>
									<ChoiceButton setting="GBP" active={settings.currency} text="GBP" theme={theme} onPress={() => dispatch(changeSetting({ key:"currency", value:"gbp" }))}/>
									<ChoiceButton setting="EUR" active={settings.currency} text="EUR" theme={theme} onPress={() => dispatch(changeSetting({ key:"currency", value:"eur" }))}/>
									<ChoiceButton setting="CHF" active={settings.currency} text="CHF" theme={theme} onPress={() => dispatch(changeSetting({ key:"currency", value:"chf" }))}/>
									<ChoiceButton setting="AUD" active={settings.currency} text="AUD" theme={theme} onPress={() => dispatch(changeSetting({ key:"currency", value:"aud" }))}/>
									<ChoiceButton setting="JPY" active={settings.currency} text="JPY" theme={theme} onPress={() => dispatch(changeSetting({ key:"currency", value:"jpy" }))}/>
									<ChoiceButton setting="CAD" active={settings.currency} text="CAD" theme={theme} onPress={() => dispatch(changeSetting({ key:"currency", value:"cad" }))}/>
								</View>
							</View>
						}
						{ Utils.filterSettings(search).includes("assetIconBackdrop") &&
							<View style={[styles.section, styles[`section${theme}`]]}>
								<View style={styles.sectionTop}>
									<Text style={[styles.title, styles[`title${theme}`], styles.titleTop]}>Asset Icon Backdrop</Text>
								</View>
								<View style={styles.sectionBottom}>
									<ChoiceButton setting="disabled" active={settings.assetIconBackdrop} text="Disabled" theme={theme} onPress={() => dispatch(changeSetting({ key:"assetIconBackdrop", value:"disabled" }))}/>
									<ChoiceButton setting="enabled" active={settings.assetIconBackdrop} text="Enabled" theme={theme} onPress={() => dispatch(changeSetting({ key:"assetIconBackdrop", value:"enabled" }))}/>
								</View>
							</View>
						}
						{ Utils.filterSettings(search).includes("dateFormat") &&
							<View style={[styles.section, styles[`section${theme}`]]}>
								<View style={styles.sectionTop}>
									<Text style={[styles.title, styles[`title${theme}`], styles.titleTop]}>Date Format</Text>
								</View>
								<View style={styles.sectionBottom}>
									<ChoiceButton setting="yyyy-mm-dd" active={settings.dateFormat} text="YYYY-MM-DD" theme={theme} onPress={() => dispatch(changeSetting({ key:"dateFormat", value:"yyyy-mm-dd" }))}/>
									<ChoiceButton setting="dd-mm-yyyy" active={settings.dateFormat} text="DD-MM-YYYY" theme={theme} onPress={() => dispatch(changeSetting({ key:"dateFormat", value:"dd-mm-yyyy" }))}/>
								</View>
							</View>
						}
					</ScrollView>
				</SafeAreaView>
			</ScrollView>
			<Modal visible={popup} onRequestClose={hidePopup} transparent={true}>
				<View style={styles.popup}>
					<TouchableOpacity onPress={() => hidePopup()} style={styles.popupBackground}></TouchableOpacity>
					<View style={styles.popupForeground}>
						<View style={[styles.popupWrapper, styles[`popupWrapper${theme}`]]}>{popupContent}</View>
					</View>
				</View>
			</Modal>
			<Loading active={loading} theme={theme} opaque={true}/>
		</ImageBackground>
	);

	function showPopup(content: any) {
		Keyboard.dismiss();
		setPopup(true);
		setPopupContent(content);
	}

	function hidePopup() {
		Keyboard.dismiss();
		setPopup(false);
		setPopupContent(null);
	}

	function showConfirmationPopup(action: string, args: any) {
		Keyboard.dismiss();
		setPopup(true);

		let content = () => {
			return (
				<View style={styles.popupContent}>
					<View style={[styles.modalSection, styles[`modalSection${theme}`], { backgroundColor:Colors[theme].mainThird }]}>
						<Text style={[styles.modalInfo, styles[`modalInfo${theme}`]]}>Are you sure?</Text>
					</View>
					<View style={styles.popupButtonWrapper}>
						<TouchableOpacity onPress={() => hidePopup()} style={[styles.button, styles.choiceButton, styles[`choiceButton${theme}`], styles.popupButton]}>
							<Text style={[styles.choiceText, styles[`choiceText${theme}`]]}>Cancel</Text>
						</TouchableOpacity>
						<TouchableOpacity onPress={() => processAction(action)} style={[styles.button, styles.actionButton, styles[`actionButton${theme}`], styles.popupButton]}>
							<Text style={[styles.actionText, styles[`actionText${theme}`]]}>Confirm</Text>
						</TouchableOpacity>
					</View>
				</View>
			);
		};

		setPopupContent(content);
	}

	async function processAction(action: string) {
		try {
			hidePopup();

			setLoading(true);

			let userID = await AsyncStorage.getItem("userID");
			let token = await AsyncStorage.getItem("token");
			let api = await AsyncStorage.getItem("api");

			let requests = new Requests(api);

			switch(action) {
				case "logoutEverywhere":
					await requests.logoutEverywhere(userID, token);
					finishLogout();
					break;
			}

			setLoading(false);
		} catch(error) {
			setLoading(false);
			console.log(error);
			ToastAndroid.show("Something went wrong...", 5000);
		}
	}

	function showDeleteAccountPopup(popupNumber: number) {
		Keyboard.dismiss();
		setPopup(true);

		let warning = popupNumber === 1 ? "Are you sure you want to delete your account?" : "Are you absolutely sure? All your data will be deleted.";

		let content = () => {
			return (
				<View style={styles.popupContent}>
					<View style={[styles.modalSection, styles[`modalSection${theme}`], { backgroundColor:Colors[theme].mainThird }]}>
						<Text style={[styles.modalInfo, styles[`modalInfo${theme}`]]}>{warning}</Text>
					</View>
					<View style={styles.popupButtonWrapper}>
						<TouchableOpacity onPress={() => hidePopup()} style={[styles.button, styles.choiceButton, styles[`choiceButton${theme}`], styles.popupButton]}>
							<Text style={[styles.choiceText, styles[`choiceText${theme}`]]}>Cancel</Text>
						</TouchableOpacity>
						<TouchableOpacity onPress={() => processAccountPopupAction(popupNumber)} style={[styles.button, styles.actionButton, styles[`actionButton${theme}`], styles.popupButton]}>
							<Text style={[styles.actionText, styles[`actionText${theme}`]]}>Delete</Text>
						</TouchableOpacity>
					</View>
				</View>
			);
		};

		async function processAccountPopupAction(popupNumber: number) {
			if(popupNumber === 1) {
				showDeleteAccountPopup(2);
			} else {
				try {
					setLoading(true);

					let userID = await AsyncStorage.getItem("userID");
					let token = await AsyncStorage.getItem("token");
					let api = await AsyncStorage.getItem("api");

					let requests = new Requests(api);

					await requests.deleteUser(token, userID);

					hidePopup();
					finishLogout();

					ToastAndroid.show("Your account has been deleted.", 5000);
				} catch(error) {
					setLoading(false);
					console.log(error);
					Utils.notify(theme, "Something went wrong...");
				}
			}
		}

		setPopupContent(content);
	}

	async function showPasswordPopup() {
		popupRef.current.currentPassword = "";
		popupRef.current.newPassword = "";
		popupRef.current.repeatPassword = "";

		let content = () => {
			return (
				<View style={styles.popupContent}>
					<View style={[styles.modalSection, styles[`modalSection${theme}`], { backgroundColor:Colors[theme].mainThird }]}>
						<Text style={[styles.modalInfo, styles[`modalInfo${theme}`]]}>Change Password</Text>
					</View>
					<View style={[styles.modalSection, styles[`modalSection${theme}`], { backgroundColor:Colors[theme].mainThird }]}>
						<TextInput 
							spellCheck={false}
							autoCorrect={false}
							placeholder="Current Password..." 
							selectionColor={Colors[theme].mainContrast} 
							placeholderTextColor={Colors[theme].mainContrastDarker} 
							style={[styles.popupInput, styles[`popupInput${theme}`]]} 
							onChangeText={(value) => popupRef.current.currentPassword = value}
							secureTextEntry
						/>
						<TextInput 
							spellCheck={false}
							autoCorrect={false}
							placeholder="New Password..." 
							selectionColor={Colors[theme].mainContrast} 
							placeholderTextColor={Colors[theme].mainContrastDarker} 
							style={[styles.popupInput, styles[`popupInput${theme}`]]} 
							onChangeText={(value) => popupRef.current.newPassword = value}
							secureTextEntry
						/>
						<TextInput 
							spellCheck={false}
							autoCorrect={false}
							placeholder="Repeat Password..." 
							selectionColor={Colors[theme].mainContrast} 
							placeholderTextColor={Colors[theme].mainContrastDarker} 
							style={[styles.popupInput, styles[`popupInput${theme}`], { marginBottom:0 }]} 
							onChangeText={(value) => popupRef.current.repeatPassword = value}
							secureTextEntry
						/>
					</View>
					<View style={styles.popupButtonWrapper}>
						<TouchableOpacity onPress={() => hidePopup()} style={[styles.button, styles.choiceButton, styles[`choiceButton${theme}`], styles.popupButton]}>
							<Text style={[styles.choiceText, styles[`choiceText${theme}`]]}>Cancel</Text>
						</TouchableOpacity>
						<TouchableOpacity onPress={() => changePassword()} style={[styles.button, styles.actionButton, styles[`actionButton${theme}`], styles.popupButton]}>
							<Text style={[styles.actionText, styles[`actionText${theme}`]]}>Confirm</Text>
						</TouchableOpacity>
					</View>
				</View>
			);
		};

		showPopup(content);
	}

	async function changePassword() {
		try {
			let currentPassword = popupRef.current.currentPassword;
			let newPassword = popupRef.current.newPassword;
			let repeatPassword = popupRef.current.repeatPassword;

			if(newPassword !== repeatPassword) {
				ToastAndroid.show("Passwords don't match.", 5000);
				return;
			}

			setLoading(true);

			let userID = await AsyncStorage.getItem("userID");
			let token = await AsyncStorage.getItem("token");
			let api = await AsyncStorage.getItem("api");

			let requests = new Requests(api);

			let key = await AsyncStorage.getItem("key") || "";

			if(Utils.empty(key)) {
				ToastAndroid.show("Couldn't change encryption key.", 5000);
				return;
			}

			let encrypted = CryptoFN.encryptAES(key, newPassword);

			let result: any = await requests.changePassword(userID, token, encrypted, currentPassword, newPassword);

			setLoading(false);

			if("error" in result) {
				ToastAndroid.show(result.error, 5000);
			} else {
				if("username" in result) {
					await requests.logoutEverywhere(userID, token);
					hidePopup();
					finishLogout();
					Utils.notify(theme, "Password has been changed.");
				}
			}
		} catch(error) {
			setLoading(false);
			console.log(error);
			ToastAndroid.show("Something went wrong...", 5000);
		}
	}

	async function showStockAPIPopup() {
		popupRef.current.stockAPIKey = await AsyncStorage.getItem("keyAPI") || "";

		let content = () => {
			return (
				<View style={styles.popupContent}>
					<View style={[styles.modalSection, styles[`modalSection${theme}`], { backgroundColor:Colors[theme].mainThird }]}>
						<Text style={[styles.modalInfo, styles[`modalInfo${theme}`]]}>Set Stock API Key</Text>
					</View>
					<View style={[styles.modalSection, styles[`modalSection${theme}`], { backgroundColor:Colors[theme].mainThird }]}>
						<TextInput 
							defaultValue={popupRef.current.stockAPIKey}
							spellCheck={false}
							autoCorrect={false}
							placeholder="API Key..." 
							selectionColor={Colors[theme].mainContrast} 
							placeholderTextColor={Colors[theme].mainContrastDarker} 
							style={[styles.popupInput, styles[`popupInput${theme}`], { marginBottom:0 }]} 
							onChangeText={(value) => popupRef.current.stockAPIKey = value}
						/>
					</View>
					<View style={styles.popupButtonWrapper}>
						<TouchableOpacity onPress={() => hidePopup()} style={[styles.button, styles.choiceButton, styles[`choiceButton${theme}`], styles.popupButton]}>
							<Text style={[styles.choiceText, styles[`choiceText${theme}`]]}>Cancel</Text>
						</TouchableOpacity>
						<TouchableOpacity onPress={() => setStockAPIKey(popupRef.current.stockAPIKey)} style={[styles.button, styles.actionButton, styles[`actionButton${theme}`], styles.popupButton]}>
							<Text style={[styles.actionText, styles[`actionText${theme}`]]}>Confirm</Text>
						</TouchableOpacity>
					</View>
				</View>
			);
		};

		showPopup(content);
	}

	async function setStockAPIKey(keyAPI: string) {
		hidePopup();

		if(!Utils.empty(keyAPI)) {
			await AsyncStorage.setItem("keyAPI", keyAPI);
			Utils.notify(theme, "Stock API key has been set.");
			return;
		}

		await AsyncStorage.removeItem("keyAPI");
		Utils.notify(theme, "Stock API key has been removed.");
	}

	async function logout() {
		let api = await AsyncStorage.getItem("api");
		let userID = await AsyncStorage.getItem("userID");
		let token = await AsyncStorage.getItem("token");

		let requests = new Requests(api);

		requests.logout(userID, token).then(result => {
			if("error" in result) {
				Utils.notify(theme, result.error);
			} else {
				finishLogout();
			}
		}).catch(error => {
			Utils.notify(theme, error);
		});
	}

	async function finishLogout() {
		await Utils.removeAccountInfo();
		navigation.navigate("Login");
	}
}