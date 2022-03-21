import React, { useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { ImageBackground, Keyboard, Linking, Modal, ScrollView, Text, TextInput, ToastAndroid, TouchableOpacity, View } from "react-native";
import Clipboard from "@react-native-clipboard/clipboard";
import { SafeAreaView } from "react-native-safe-area-context";
import Toggle from "react-native-toggle-element";
import Icon from "react-native-vector-icons/FontAwesome5";
import DocumentPicker from "react-native-document-picker";
import CollapsibleView from "@eliav2/react-native-collapsible-view";
import { useDispatch, useSelector } from "react-redux";
import * as RNFS from "react-native-fs";
import ChoiceButton from "../components/ChoiceButton";
import { changeSetting } from "../store/reducers/settings";
import { switchTheme } from "../store/reducers/theme";
import { Colors } from "../styles/Global";
import styles from "../styles/Settings";
import Requests from "../utils/Requests";
import Utils from "../utils/Utils";
import Loading from "../components/Loading";
import CryptoFN from "../utils/CryptoFN";
import { windowHeight, windowWidth } from "../styles/NavigationBar";
import { fetchBudget, fetchTransaction, fetchWatchlist, setDefaultBudgetData, watchlistExists } from "./Dashboard";
import { fetchActivity } from "./Activity";
import { assetHoldingExists } from "./Holdings";

// The "Settings" page of the app.
export default function Settings({ navigation }: any) {
	const dispatch = useDispatch();
	const { theme } = useSelector((state: any) => state.theme);
	const { settings } = useSelector((state: any) => state.settings);

	const alternateBackground = settings?.alternateBackground === "disabled" ? "" : "Alternate";

	const [loading, setLoading] = useState<boolean>(false);

	const [popup, setPopup] = useState<boolean>(false);
	const [popupContent, setPopupContent] = useState<any>(null);

	// Stores the "Settings" page's popup data.
	const popupRef = useRef<any>({
		currentPassword: "",
		newPassword: "",
		repeatPassword: "",
		stockAPIKey: ""
	});

	const [search, setSearch] = useState<string>("");
	
	// Used to handle back button events.
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
		<ImageBackground source={Utils.getBackground(theme, settings?.alternateBackground)} resizeMethod="scale" resizeMode="cover">
			<ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent} showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false} nestedScrollEnabled={true}>
				<SafeAreaView style={styles.area}>
					<TextInput 
						placeholder="Search..." 
						selectionColor={Colors[theme].mainContrast} 
						placeholderTextColor={Colors[theme].mainContrastDarker} 
						style={[styles.search, styles[`search${theme}`], styles[`search${theme + alternateBackground}`]]} 
						onChangeText={(value) => setSearch(value)}
						value={search}
					/>
					<ScrollView style={[styles.wrapper, styles[`wrapper${theme}`], styles[`wrapper${theme + alternateBackground}`]]} contentContainerStyle={styles.wrapperContent}>
						{ Utils.filterSettings(search).includes("appearance") &&
							<View style={[styles.section, styles[`section${theme}`], styles.inline]}>
								<View style={styles.sectionLeft}>
									<Text style={[styles.title, styles[`title${theme}`]]}>Application Theme</Text>
								</View>
								<View style={styles.sectionRight}>
									<Toggle
										style={styles.inlineRight}
										value={theme === "Dark" ? false : true}
										onPress={() => dispatch(switchTheme({ theme:theme === "Dark" ? "Light" : "Dark", alternateBackground:settings?.alternateBackground }))}
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
						{ Utils.filterSettings(search).includes("activitiesAffectHoldings") &&
							<View style={[styles.section, styles[`section${theme}`]]}>
								<View style={styles.sectionTop}>
									<Text style={[styles.title, styles[`title${theme}`], styles.titleTop]}>Activities Affect Holdings</Text>
								</View>
								<View style={styles.sectionBottom}>
									<ChoiceButton setting="disabled" active={settings.activitiesAffectHoldings} text="Disabled" theme={theme} onPress={() => dispatch(changeSetting({ key:"activitiesAffectHoldings", value:"disabled" }))}/>
									<ChoiceButton setting="enabled" active={settings.activitiesAffectHoldings} text="Enabled" theme={theme} onPress={() => dispatch(changeSetting({ key:"activitiesAffectHoldings", value:"enabled" }))}/>
								</View>
							</View>
						}
						{ Utils.filterSettings(search).includes("currency") &&
							<View style={[styles.section, styles[`section${theme}`]]}>
								<View style={styles.sectionTop}>
									<Text style={[styles.title, styles[`title${theme}`], styles.titleTop]}>Currency</Text>
								</View>
								<View style={styles.sectionBottom}>
									<ChoiceButton setting="usd" active={settings.currency} text="USD" theme={theme} onPress={() => dispatch(changeSetting({ key:"currency", value:"usd" }))}/>
									<ChoiceButton setting="gbp" active={settings.currency} text="GBP" theme={theme} onPress={() => dispatch(changeSetting({ key:"currency", value:"gbp" }))}/>
									<ChoiceButton setting="eur" active={settings.currency} text="EUR" theme={theme} onPress={() => dispatch(changeSetting({ key:"currency", value:"eur" }))}/>
									<ChoiceButton setting="chf" active={settings.currency} text="CHF" theme={theme} onPress={() => dispatch(changeSetting({ key:"currency", value:"chf" }))}/>
									<ChoiceButton setting="aud" active={settings.currency} text="AUD" theme={theme} onPress={() => dispatch(changeSetting({ key:"currency", value:"aud" }))}/>
									<ChoiceButton setting="jpy" active={settings.currency} text="JPY" theme={theme} onPress={() => dispatch(changeSetting({ key:"currency", value:"jpy" }))}/>
									<ChoiceButton setting="cad" active={settings.currency} text="CAD" theme={theme} onPress={() => dispatch(changeSetting({ key:"currency", value:"cad" }))}/>
								</View>
							</View>
						}
						{ Utils.filterSettings(search).includes("alternateBackground") &&
							<View style={[styles.section, styles[`section${theme}`]]}>
								<View style={styles.sectionTop}>
									<Text style={[styles.title, styles[`title${theme}`], styles.titleTop]}>Alternate Background</Text>
								</View>
								<View style={styles.sectionBottom}>
									<ChoiceButton setting="disabled" active={settings.alternateBackground} text="Disabled" theme={theme} onPress={() => {
										dispatch(changeSetting({ key:"alternateBackground", value:"disabled" }));
										dispatch(switchTheme({ theme:theme, alternateBackground:"disabled" }));
									}}/>
									<ChoiceButton setting="enabled" active={settings.alternateBackground} text="Enabled" theme={theme} onPress={() => { 
										dispatch(changeSetting({ key:"alternateBackground", value:"enabled" }));dispatch(switchTheme({ theme:theme, alternateBackground:"enabled" }));
									}}/>
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
						{ Utils.filterSettings(search).includes("reset") &&
							<CollapsibleView 
								title={<Text style={[styles.collapsibleTitle, styles[`collapsibleTitle${theme}`]]}>Reset Data</Text>}
								style={[styles.collapsible, styles[`collapsible${theme}`]]}
								arrowStyling={{
									size: 24,
									thickness: 4,
									color: Colors[theme].Settings.accentFirst,
									rounded: true,
								}}
							>
								<View style={[styles.sectionBottom, styles.collapsibleContainer]}>
									<TouchableOpacity onPress={() => resetData("settings", true)} style={[styles.button, styles.actionButton, styles[`actionButton${theme}`], styles[`negative${theme}`]]}>
										<Text style={[styles.actionText, styles[`actionText${theme}`]]}>Settings</Text>
									</TouchableOpacity>
									<TouchableOpacity onPress={() => resetData("budget", true)} style={[styles.button, styles.actionButton, styles[`actionButton${theme}`], styles[`negative${theme}`]]}>
										<Text style={[styles.actionText, styles[`actionText${theme}`]]}>Budget</Text>
									</TouchableOpacity>
									<TouchableOpacity onPress={() => resetData("transactions", true)} style={[styles.button, styles.actionButton, styles[`actionButton${theme}`], styles[`negative${theme}`]]}>
										<Text style={[styles.actionText, styles[`actionText${theme}`]]}>Transactions</Text>
									</TouchableOpacity>
									<TouchableOpacity onPress={() => resetData("watchlist", true)} style={[styles.button, styles.actionButton, styles[`actionButton${theme}`], styles[`negative${theme}`]]}>
										<Text style={[styles.actionText, styles[`actionText${theme}`]]}>Watchlist</Text>
									</TouchableOpacity>
									<TouchableOpacity onPress={() => resetData("holdings", true)} style={[styles.button, styles.actionButton, styles[`actionButton${theme}`], styles[`negative${theme}`]]}>
										<Text style={[styles.actionText, styles[`actionText${theme}`]]}>Holdings</Text>
									</TouchableOpacity>
									<TouchableOpacity onPress={() => resetData("activities", true)} style={[styles.button, styles.actionButton, styles[`actionButton${theme}`], styles[`negative${theme}`]]}>
										<Text style={[styles.actionText, styles[`actionText${theme}`]]}>Activities</Text>
									</TouchableOpacity>
									<TouchableOpacity onPress={() => resetData("chatbot", true)} style={[styles.button, styles.actionButton, styles[`actionButton${theme}`], styles[`negative${theme}`]]}>
										<Text style={[styles.actionText, styles[`actionText${theme}`]]}>Chat Bot</Text>
									</TouchableOpacity>
								</View>
							</CollapsibleView>
						}
						{ Utils.filterSettings(search).includes("import") &&
							<CollapsibleView 
								title={<Text style={[styles.collapsibleTitle, styles[`collapsibleTitle${theme}`]]}>Import Data</Text>}
								style={[styles.collapsible, styles[`collapsible${theme}`]]}
								arrowStyling={{
									size: 24,
									thickness: 4,
									color: Colors[theme].Settings.accentFirst,
									rounded: true,
								}}
							>
								<View style={[styles.sectionBottom, styles.collapsibleContainer]}>
									<TouchableOpacity onPress={() => importData("settings")} style={[styles.button, styles.actionButton, styles[`actionButton${theme}`], styles[`positive${theme}`]]}>
										<Text style={[styles.actionText, styles[`actionText${theme}`]]}>Settings</Text>
									</TouchableOpacity>
									<TouchableOpacity onPress={() => importData("budget")} style={[styles.button, styles.actionButton, styles[`actionButton${theme}`], styles[`positive${theme}`]]}>
										<Text style={[styles.actionText, styles[`actionText${theme}`]]}>Budget</Text>
									</TouchableOpacity>
									<TouchableOpacity onPress={() => importData("transactions")} style={[styles.button, styles.actionButton, styles[`actionButton${theme}`], styles[`positive${theme}`]]}>
										<Text style={[styles.actionText, styles[`actionText${theme}`]]}>Transactions</Text>
									</TouchableOpacity>
									<TouchableOpacity onPress={() => importData("watchlist")} style={[styles.button, styles.actionButton, styles[`actionButton${theme}`], styles[`positive${theme}`]]}>
										<Text style={[styles.actionText, styles[`actionText${theme}`]]}>Watchlist</Text>
									</TouchableOpacity>
									<TouchableOpacity onPress={() => importData("holdings")} style={[styles.button, styles.actionButton, styles[`actionButton${theme}`], styles[`positive${theme}`]]}>
										<Text style={[styles.actionText, styles[`actionText${theme}`]]}>Holdings</Text>
									</TouchableOpacity>
									<TouchableOpacity onPress={() => importData("activities")} style={[styles.button, styles.actionButton, styles[`actionButton${theme}`], styles[`positive${theme}`]]}>
										<Text style={[styles.actionText, styles[`actionText${theme}`]]}>Activities</Text>
									</TouchableOpacity>
								</View>
							</CollapsibleView>
						}
						{ Utils.filterSettings(search).includes("export") &&
							<CollapsibleView 
								title={<Text style={[styles.collapsibleTitle, styles[`collapsibleTitle${theme}`]]}>Export Data</Text>}
								style={[styles.collapsible, styles[`collapsible${theme}`]]}
								arrowStyling={{
									size: 24,
									thickness: 4,
									color: Colors[theme].Settings.accentFirst,
									rounded: true,
								}}
							>
								<View style={[styles.sectionBottom, styles.collapsibleContainer]}>
									<TouchableOpacity onPress={() => exportData("settings")} style={[styles.button, styles.actionButton, styles[`actionButton${theme}`], styles[`neutral${theme}`]]}>
										<Text style={[styles.actionText, styles[`actionText${theme}`]]}>Settings</Text>
									</TouchableOpacity>
									<TouchableOpacity onPress={() => exportData("budget")} style={[styles.button, styles.actionButton, styles[`actionButton${theme}`], styles[`neutral${theme}`]]}>
										<Text style={[styles.actionText, styles[`actionText${theme}`]]}>Budget</Text>
									</TouchableOpacity>
									<TouchableOpacity onPress={() => exportData("transactions")} style={[styles.button, styles.actionButton, styles[`actionButton${theme}`], styles[`neutral${theme}`]]}>
										<Text style={[styles.actionText, styles[`actionText${theme}`]]}>Transactions</Text>
									</TouchableOpacity>
									<TouchableOpacity onPress={() => exportData("watchlist")} style={[styles.button, styles.actionButton, styles[`actionButton${theme}`], styles[`neutral${theme}`]]}>
										<Text style={[styles.actionText, styles[`actionText${theme}`]]}>Watchlist</Text>
									</TouchableOpacity>
									<TouchableOpacity onPress={() => exportData("holdings")} style={[styles.button, styles.actionButton, styles[`actionButton${theme}`], styles[`neutral${theme}`]]}>
										<Text style={[styles.actionText, styles[`actionText${theme}`]]}>Holdings</Text>
									</TouchableOpacity>
									<TouchableOpacity onPress={() => exportData("activities")} style={[styles.button, styles.actionButton, styles[`actionButton${theme}`], styles[`neutral${theme}`]]}>
										<Text style={[styles.actionText, styles[`actionText${theme}`]]}>Activities</Text>
									</TouchableOpacity>
								</View>
							</CollapsibleView>
						}
						{ Utils.filterSettings(search).includes("donate") &&
							<CollapsibleView 
								title={<Text style={[styles.collapsibleTitle, styles[`collapsibleTitle${theme}`]]}>Donate</Text>}
								style={[styles.collapsible, styles[`collapsible${theme}`]]}
								arrowStyling={{
									size: 24,
									thickness: 4,
									color: Colors[theme].Settings.accentFirst,
									rounded: true,
								}}
							>
								<View style={[styles.sectionBottom, styles.collapsibleContainer]}>
									<TouchableOpacity onPress={() => copyAddress("ADA")} style={[styles.button, styles.actionButton, styles[`actionButton${theme}`]]}>
										<Text style={[styles.actionText, styles[`actionText${theme}`]]}>ADA</Text>
									</TouchableOpacity>
									<TouchableOpacity onPress={() => copyAddress("XMR")} style={[styles.button, styles.actionButton, styles[`actionButton${theme}`]]}>
										<Text style={[styles.actionText, styles[`actionText${theme}`]]}>XMR</Text>
									</TouchableOpacity>
									<TouchableOpacity onPress={() => copyAddress("ETH")} style={[styles.button, styles.actionButton, styles[`actionButton${theme}`]]}>
										<Text style={[styles.actionText, styles[`actionText${theme}`]]}>ETH</Text>
									</TouchableOpacity>
									<TouchableOpacity onPress={() => copyAddress("BCH")} style={[styles.button, styles.actionButton, styles[`actionButton${theme}`]]}>
										<Text style={[styles.actionText, styles[`actionText${theme}`]]}>BCH</Text>
									</TouchableOpacity>
									<TouchableOpacity onPress={() => copyAddress("BTC")} style={[styles.button, styles.actionButton, styles[`actionButton${theme}`]]}>
										<Text style={[styles.actionText, styles[`actionText${theme}`]]}>BTC</Text>
									</TouchableOpacity>
									<TouchableOpacity onPress={() => copyAddress("LTC")} style={[styles.button, styles.actionButton, styles[`actionButton${theme}`]]}>
										<Text style={[styles.actionText, styles[`actionText${theme}`]]}>LTC</Text>
									</TouchableOpacity>
									<TouchableOpacity onPress={() => copyAddress("NANO")} style={[styles.button, styles.actionButton, styles[`actionButton${theme}`]]}>
										<Text style={[styles.actionText, styles[`actionText${theme}`]]}>NANO</Text>
									</TouchableOpacity>
									<TouchableOpacity onPress={() => copyAddress("DOT")} style={[styles.button, styles.actionButton, styles[`actionButton${theme}`]]}>
										<Text style={[styles.actionText, styles[`actionText${theme}`]]}>DOT</Text>
									</TouchableOpacity>
								</View>
							</CollapsibleView>
						}
						{ Utils.filterSettings(search).includes("contact") &&
							<View style={[styles.section, styles[`section${theme}`]]}>
								<View style={styles.sectionTop}>
									<Text style={[styles.title, styles[`title${theme}`], styles.titleTop]}>Contact</Text>
								</View>
								<View style={styles.sectionBottom}>
									<TouchableOpacity style={[styles.button, styles.actionButton, styles[`actionButton${theme}`]]} onPress={() => openURL("https://github.com/Xtrendence/CryptoShare")}>
										<Text style={[styles.actionText, styles[`actionText${theme}`]]}>GitHub</Text>
									</TouchableOpacity>
									<TouchableOpacity style={[styles.button, styles.actionButton, styles[`actionButton${theme}`]]} onPress={() => openURL("mailto:xtrendence@gmail.com")}>
										<Text style={[styles.actionText, styles[`actionText${theme}`]]}>Email</Text>
									</TouchableOpacity>
									<TouchableOpacity style={[styles.button, styles.actionButton, styles[`actionButton${theme}`]]} onPress={() => openURL("https://www.xtrendence.dev")}>
										<Text style={[styles.actionText, styles[`actionText${theme}`]]}>Website</Text>
									</TouchableOpacity>
								</View>
							</View>
						}
					</ScrollView>
				</SafeAreaView>
			</ScrollView>
			<Modal visible={popup} onRequestClose={hidePopup} transparent={true}>
				<View style={styles.popup}>
					<TouchableOpacity activeOpacity={1} onPress={() => hidePopup()} style={styles.popupBackground}></TouchableOpacity>
					<View style={styles.popupForeground}>
						<View style={[styles.popupWrapper, styles[`popupWrapper${theme}`]]}>{popupContent}</View>
					</View>
				</View>
			</Modal>
			<Loading active={loading} theme={theme} opaque={true}/>
		</ImageBackground>
	);

	// Opens a link with the user's default browser.
	function openURL(url: string) {
		Linking.openURL(url).catch(error => {
			console.log(error);
			ToastAndroid.show("Couldn't open URL.", 5000);
		});
	}

	// Prompts the user to pick a CSV or JSON file.
	function pickFile() {
		return new Promise((resolve, reject) => {
			try {
				DocumentPicker.pick({ type:["text/csv", "text/comma-separated-values", "text/plain", "application/json"], copyTo:"cachesDirectory" }).then(result => {
					let uri = result[0].fileCopyUri || "";
					RNFS.readFile(uri, "ascii").then(data => {
						resolve({ data:data });
					}).catch(error => {
						console.log(error);
						resolve({ error:error.toString() });
					});
				}).catch(error => {
					resolve({ error:"Couldn't open the file picker, or no file was selected..." });
				});
			} catch(error) {
				console.log(error);
				reject({ error:error });
			}
		});
	}

	// Resets the user's data for a given category.
	async function resetData(type: string, showConfirmation: boolean) {
		if(showConfirmation) {
			showConfirmationPopup("resetData", { type:type });
			return;
		}

		try {
			setLoading(true);

			let userID = await AsyncStorage.getItem("userID");
			let token = await AsyncStorage.getItem("token");
			let api = await AsyncStorage.getItem("api");

			let requests = new Requests(api);

			switch(type) {
				case "settings":
					dispatch(switchTheme({ theme:"Dark", alternateBackground:settings?.alternateBackground }));
					Utils.setSettings(dispatch, Utils.defaultSettings);
					break;
				case "budget":
					await setDefaultBudgetData();
					break;
				case "transactions":
					await requests.deleteTransactionAll(token, userID);
					break;
				case "watchlist":
					await requests.deleteWatchlistAll(token, userID);
					break;
				case "holdings":
					await requests.deleteHoldingAll(token, userID);
					break;
				case "activities":
					await requests.deleteActivityAll(token, userID);
					break;
				case "chatbot":
					await requests.deleteMessageAll(token, userID);
					break;
			}

			ToastAndroid.show(`${Utils.capitalizeFirstLetter(type)} data deleted.`, 5000);

			setLoading(false);
		} catch(error) {
			console.log(error);
			setLoading(false);
			ToastAndroid.show("Something went wrong... - EMRD", 5000);
		}
	}

	// Parses the content of a CSV or JSON file, and imports the relevant data.
	async function importData(type: string) {
		try {
			let file: any = await pickFile() || {};

			if("error" in file) {
				if(!(file.error.toLowerCase().match("(selected|canceled)"))) {
					ToastAndroid.show(file.error, 5000);
				}

				return;
			}

			if(Utils.empty(file) || !("data" in file) || Utils.empty(file.data)) {
				ToastAndroid.show("No data provided.", 5000);
				return;
			}

			let data = file.data;

			setLoading(true);

			let userID = await AsyncStorage.getItem("userID");
			let token = await AsyncStorage.getItem("token");
			let key = await AsyncStorage.getItem("key") || "";
			let api = await AsyncStorage.getItem("api");

			let requests = new Requests(api);

			switch(type) {
				case "settings":
					if(!Utils.validJSON(data)) {
						ToastAndroid.show("Invalid JSON.", 5000);
						return;
					}
					
					let parsed = JSON.parse(data);

					Utils.setSettings(dispatch, parsed);
					dispatch(switchTheme({ theme:parsed.theme, alternateBackground:settings?.alternateBackground }));

					break;
				case "budget":
					if(!Utils.validJSON(data)) {
						ToastAndroid.show("Invalid JSON.", 5000);
						return;
					}

					let budgetData = JSON.parse(data);

					let encrypted = CryptoFN.encryptAES(JSON.stringify(budgetData), key);

					await requests.updateBudget(token, userID, encrypted);

					break;
				case "transactions":
					let headersTransactions = "transactionID,transactionType,transactionDate,transactionCategory,transactionAmount,transactionNotes";

					let linesTransactions = data.split("\n");

					if(linesTransactions[0] !== headersTransactions) {
						ToastAndroid.show("Invalid headers.", 5000);
						return;
					}

					let transactions: any = await fetchTransaction() || {};

					linesTransactions.shift();

					linesTransactions.map(async (line: any) => {
						if(!Utils.empty(line)) {
							let parts = line.split(",");

							try {
								let encrypted = Utils.encryptObjectValues(key, {
									transactionType: parts[1],
									transactionDate: parts[2],
									transactionCategory: parts[3],
									transactionAmount: parts[4],
									transactionNotes: parts[5],
								});

								if(parts[0] in transactions) {
									await requests.updateTransaction(token, userID, parts[0], encrypted.transactionType, encrypted.transactionDate, encrypted.transactionCategory, encrypted.transactionAmount, encrypted.transactionNotes);
								} else {
									await requests.createTransaction(token, userID, encrypted.transactionType, encrypted.transactionDate, encrypted.transactionCategory, encrypted.transactionAmount, encrypted.transactionNotes);
								}
							} catch(error) {
								console.log(error);
							}
						}
					});

					break;
				case "watchlist":
					let headersWatchlist = "watchlistID,assetID,assetSymbol,assetType";

					let linesWatchlist = data.split("\n");

					if(linesWatchlist[0] !== headersWatchlist) {
						ToastAndroid.show("Invalid headers.", 5000);
						return;
					}

					let watchlist = await fetchWatchlist() || {};

					linesWatchlist.shift();

					linesWatchlist.map(async (line: any) => {
						if(!Utils.empty(line)) {
							let parts = line.split(",");

							try {
								if(!watchlistExists(watchlist, parts[1])) {
									let encrypted = Utils.encryptObjectValues(key, {
										assetID: parts[1],
										assetSymbol: parts[2],
										assetType: parts[3]
									});

									await requests.createWatchlist(token, userID, encrypted.assetID, encrypted.assetSymbol, encrypted.assetType);
								}
							} catch(error) {
								console.log(error);
							}
						}
					});

					break;
				case "holdings":
					let headersHoldings = "holdingID,holdingAssetID,holdingAssetSymbol,holdingAssetAmount,holdingAssetType";

					let linesHoldings = data.split("\n");

					if(linesHoldings[0] !== headersHoldings) {
						ToastAndroid.show("Invalid headers.", 5000);
						return;
					}

					linesHoldings.shift();

					linesHoldings.map(async (line: any) => {
						if(!Utils.empty(line)) {
							let parts = line.split(",");

							try {
								let exists: any = await assetHoldingExists(parts[1]);

								let encrypted = Utils.encryptObjectValues(key, {
									holdingAssetID: parts[1],
									holdingAssetSymbol: parts[2],
									holdingAssetAmount: parts[3],
									holdingAssetType: parts[4]
								});

								if(!exists.exists) {
									await requests.createHolding(token, userID, encrypted.holdingAssetID, encrypted.holdingAssetSymbol, encrypted.holdingAssetAmount, encrypted.holdingAssetType);
								} else {
									await requests.updateHolding(token, userID, exists.holdingID, encrypted.holdingAssetID, encrypted.holdingAssetSymbol, encrypted.holdingAssetAmount, encrypted.holdingAssetType);
								}
							} catch(error) {
								console.log(error);
							}
						}
					});

					break;
				case "activities":
					let headersActivities = "activityID,activityTransactionID,activityAssetID,activityAssetSymbol,activityAssetType,activityDate,activityType,activityAssetAmount,activityFee,activityNotes,activityExchange,activityPair,activityPrice,activityFrom,activityTo";

					let linesActivities = data.split("\n");

					if(linesActivities[0] !== headersActivities) {
						ToastAndroid.show("Invalid headers.", 5000);
						return;
					}

					let activities: any = await fetchActivity() || {};

					linesActivities.shift();

					linesActivities.map(async (line: any) => {
						if(!Utils.empty(line)) {
							let parts = line.split(",");

							try {
								let encrypted = Utils.encryptObjectValues(key, {
									activityAssetID: parts[2],
									activityAssetSymbol: parts[3],
									activityAssetType: parts[4],
									activityDate: parts[5],
									activityType: parts[6],
									activityAssetAmount: parts[7],
									activityFee: parts[8],
									activityNotes: parts[9],
									activityExchange: parts[10],
									activityPair: parts[11],
									activityPrice: parts[12],
									activityFrom: parts[13],
									activityTo: parts[14]
								});

								if(parts[1] in activities) {
									await requests.updateActivity(token, userID, parts[1], encrypted.activityAssetID, encrypted.activityAssetSymbol, encrypted.activityAssetType, encrypted.activityDate, encrypted.activityType, encrypted.activityAssetAmount, encrypted.activityFee, encrypted.activityNotes, encrypted.activityExchange, encrypted.activityPair, encrypted.activityPrice, encrypted.activityFrom, encrypted.activityTo);
								} else {
									await requests.createActivity(token, userID, encrypted.activityAssetID, encrypted.activityAssetSymbol, encrypted.activityAssetType, encrypted.activityDate, encrypted.activityType, encrypted.activityAssetAmount, encrypted.activityFee, encrypted.activityNotes, encrypted.activityExchange, encrypted.activityPair, encrypted.activityPrice, encrypted.activityFrom, encrypted.activityTo);
								}
							} catch(error) {
								console.log(error);
							}
						}
					});

					break;
			}

			ToastAndroid.show(`${Utils.capitalizeFirstLetter(type)} data imported.`, 5000);

			setLoading(false);
		} catch(error) {
			console.log(error);
			setLoading(false);
			ToastAndroid.show("Something went wrong... - EMID", 5000);
		}
	}

	// Fetches the user's data for a given category, and exports it as a CSV or JSON file.
	async function exportData(type: string) {
		try {
			setLoading(true);

			let date = Utils.formatDateHyphenatedHuman(new Date()) + "-" + Utils.formatSecondsHyphenated(new Date());
			let filename = "out.txt";
			let data = "";

			switch(type) {
				case "settings":
					filename = `${date}-CryptoShare-Mobile-Settings.json`;

					let currentSettings = await Utils.getSettings(dispatch);
					currentSettings.theme = theme;
					data = JSON.stringify(currentSettings, undefined, 4);

					break;
				case "budget":
					filename = `${date}-CryptoShare-Budget.json`;

					let budget = await fetchBudget() || {};

					if(Utils.empty(budget)) {
						Utils.notify(theme, "No data found.");
						return;
					}

					data = JSON.stringify(budget, undefined, 4);

					break;
				case "transactions":
					filename = `${date}-CryptoShare-Transactions.csv`;

					let transactions: any = await fetchTransaction() || {};

					if(Utils.empty(transactions)) {
						Utils.notify(theme, "No data found.");
						return;
					}

					let csvTransactions = "transactionID,transactionType,transactionDate,transactionCategory,transactionAmount,transactionNotes\n";

					let keysTransactions = Object.keys(transactions);
					keysTransactions.map(key => {
						let transaction = transactions[key];
						csvTransactions += `${transaction.transactionID},${transaction.transactionType},${transaction.transactionDate},${transaction.transactionCategory},${transaction.transactionAmount},${transaction.transactionNotes}\n`;
					});

					data = csvTransactions;

					break;
				case "watchlist":
					filename = `${date}-CryptoShare-Watchlist.csv`;

					let watchlist: any = await fetchWatchlist() || {};

					if(Utils.empty(watchlist)) {
						Utils.notify(theme, "No data found.");
						return;
					}

					let csvWatchlist = "watchlistID,assetID,assetSymbol,assetType\n";

					let keysWatchlist = Object.keys(watchlist);
					keysWatchlist.map(key => {
						let asset = watchlist[key];
						csvWatchlist += `${asset.watchlistID},${asset.assetID},${asset.assetSymbol},${asset.assetType}\n`;
					});

					data = csvWatchlist;

					break;
				case "holdings":
					filename = `${date}-CryptoShare-Holdings.csv`;

					let userID = await AsyncStorage.getItem("userID");
					let token = await AsyncStorage.getItem("token");
					let key = await AsyncStorage.getItem("key") || "";
					let api = await AsyncStorage.getItem("api");

					let requests = new Requests(api);

					let holdingsData: any = {};

					let holdings = await requests.readHolding(token, userID);

					let encrypted = holdings?.data?.readHolding;

					Object.keys(encrypted).map(index => {
						let decrypted = Utils.decryptObjectValues(key, encrypted[index]);
						decrypted.holdingID = encrypted[index].holdingID;
						holdingsData[decrypted.holdingAssetID] = decrypted;
					});

					if(Utils.empty(holdingsData)) {
						Utils.notify(theme, "No data found.");
						return;
					}

					let csvHoldings = "holdingID,holdingAssetID,holdingAssetSymbol,holdingAssetAmount,holdingAssetType\n";

					let keysHoldings = Object.keys(holdingsData);
					keysHoldings.map(key => {
						let holding = holdingsData[key];
						csvHoldings += `${holding.holdingID},${holding.holdingAssetID},${holding.holdingAssetSymbol},${holding.holdingAssetAmount},${holding.holdingAssetType}\n`;
					});

					data = csvHoldings;

					break;
				case "activities":
					filename = `${date}-CryptoShare-Activities.csv`;

					let activities: any = await fetchActivity() || {};

					if(Utils.empty(activities)) {
						Utils.notify(theme, "No data found.");
						return;
					}

					let csvActivities = "activityID,activityTransactionID,activityAssetID,activityAssetSymbol,activityAssetType,activityDate,activityType,activityAssetAmount,activityFee,activityNotes,activityExchange,activityPair,activityPrice,activityFrom,activityTo\n";

					let keysActivities = Object.keys(activities);
					keysActivities.map(key => {
						let activity = activities[key];
						csvActivities += `${activity.activityID},${activity.activityTransactionID},${activity.activityAssetID},${activity.activityAssetSymbol},${activity.activityAssetType},${activity.activityDate},${activity.activityType},${activity.activityAssetAmount},${activity.activityFee},${activity.activityNotes},${activity.activityExchange},${activity.activityPair},${activity.activityPrice},${activity.activityFrom},${activity.activityTo}\n`;
					});

					data = csvActivities;

					break;
			}

			let path = RNFS.DownloadDirectoryPath + "/" + filename;

			RNFS.writeFile(path, data, "utf8").then((success) => {
				ToastAndroid.showWithGravity("Data exported to: " + path, ToastAndroid.LONG, ToastAndroid.BOTTOM);
			}).catch((error) => {
				ToastAndroid.showWithGravity("Couldn't export data...", ToastAndroid.LONG, ToastAndroid.BOTTOM);
				console.log(error);
			});

			setLoading(false);
		} catch(error) {
			console.log(error);
			setLoading(false);
			ToastAndroid.show("Something went wrong... - EMED", 5000);
		}
	}

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

	// Shows a confirmation popup to avoid the user accidentally performing a "destructive" action.
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
						<TouchableOpacity onPress={() => processAction(action, args)} style={[styles.button, styles.actionButton, styles[`actionButton${theme}`], styles.popupButton]}>
							<Text style={[styles.actionText, styles[`actionText${theme}`]]}>Confirm</Text>
						</TouchableOpacity>
					</View>
				</View>
			);
		};

		setPopupContent(content);
	}

	// Processes a desired action, usually passed by a popup component.
	async function processAction(action: string, args: any) {
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
				case "resetData":
					resetData(args?.type, false);
			}

			setLoading(false);
		} catch(error) {
			setLoading(false);
			console.log(error);
			ToastAndroid.show("Something went wrong... - EM68", 5000);
		}
	}

	// Shows a popup to make sure the user actually wants to delete their account.
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

		// Processes the user's intent to delete their account. On the first try, it shows a confirmation popup, on the second, it deletes their account.
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
					Utils.notify(theme, "Something went wrong... - EM69");
				}
			}
		}

		setPopupContent(content);
	}

	// Shows a popup the user can change their password through.
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

	// Copies a crypto address to the user's clipboard.
	function copyAddress(symbol: string) {
		let addresses: any = {
			ADA: "addr1qyh9ejp2z7drzy8vzpyfeuvzuej5t5tnmjyfpfjn0vt722zqupdg44rqfw9fd8jruaez30fg9fxl34vdnncc33zqwhlqn37lz4",
			XMR: "49wDQf83p5tHibw9ay6fBvcv48GJynyjVE2V8EX8Vrtt89rPyECRm5zbBqng3udqrYHTjsZStSpnMCa8JRw7cfyGJwMPxDM",
			ETH: "0x40E1452025d7bFFDfa05d64C2d20Fb87c2b9C0be",
			BCH: "qrvyd467djuxtw5knjt3d50mqzspcf6phydmyl8ka0",
			BTC: "bc1qdy5544m2pwpyr6rhzcqwmerczw7e2ytjjc2wvj",
			LTC: "ltc1qq0ptdjsuvhw6gz9m4huwmhq40gpyljwn5hncxz",
			NANO: "nano_3ed4ip7cjkzkrzh9crgcdipwkp3h49cudxxz4t8x7pkb8rad7bckqfhzyadg",
			DOT: "12nGqTQsgEHwkAuHGNXpvzcfgtQkTeo3WCZgwrXLsiqs3KyA"
		};

		Clipboard.setString(addresses[symbol]);

		ToastAndroid.show("Copied " + symbol + " address to clipboard.", 5000);
	}

	// Changes the user's password.
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
			ToastAndroid.show("Something went wrong... - EM70", 5000);
		}
	}

	// Shows a popup that allows the user to set their stock API key.
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

	// Updates the user's stock API key.
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

	// Logs the user out of their account.
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

	// Finishes the logout procedure by removing the user's credentials, and navigating to the "Login" page.
	async function finishLogout() {
		await Utils.removeAccountInfo();
		navigation.navigate("Login");
	}
}