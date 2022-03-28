import React, { useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { FlatList, ImageBackground, Keyboard, Modal, ScrollView, Text, TextInput, ToastAndroid, TouchableOpacity, View } from "react-native";
import HTML from "react-native-render-html";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/FontAwesome5";
import { useDispatch, useSelector } from "react-redux";
import Item from "../components/ActivityItem";
import ActivityPopup from "../components/ActivityPopup";
import Loading from "../components/Loading";
import MatchList from "../components/MatchList";
import store from "../store/store";
import styles from "../styles/Activity";
import { Colors } from "../styles/Global";
import { screenWidth } from "../styles/NavigationBar";
import CryptoFinder from "../utils/CryptoFinder";
import Requests, { cryptoAPI } from "../utils/Requests";
import Stock from "../utils/Stock";
import Utils from "../utils/Utils";

// The "Activity" page of the app.
export default function Activity({ navigation }: any) {
	const dispatch = useDispatch();
	const { theme } = useSelector((state: any) => state.theme);
	const { settings } = useSelector((state: any) => state.settings);

	const alternateBackground = settings?.alternateBackground === "disabled" ? "" : "Alternate";

	// Used to search through activities.
	const [query, setQuery] = useState<string>("");

	const [loading, setLoading] = useState<boolean>(false);

	const [popup, setPopup] = useState<boolean>(false);
	const [popupContent, setPopupContent] = useState<any>(null);
	const [popupType, setPopupType] = useState<any>(null);

	const [activityRows, setActivityRows] = useState<any>({});
	const [activityHeader, setActivityHeader] = useState<any>(null);

	// Used instead of "activityRows" when the "query" variable isn't empty to show only certain rows.
	const [filteredRows, setFilteredRows] = useState<any>({});

	// Used to store popup data.
	const popupRef = useRef<any>({
		staking: {
			symbol: "",
			amount: "",
			apy: ""
		},
		mining: {
			symbol: "",
			equipmentCost: "",
			amount: "",
			powerCost: ""
		},
		dividends: {
			shares: "",
			dividend: "",
		},
		mortgage: {
			price: "",
			deposit: "",
			term: "",
			interest: ""
		},
		tax: {
			income: ""
		},
		activity: {
			activityID: "", 
			activityTransactionID: "",
			activityAssetID: "", 
			activityAssetSymbol: "", 
			activityAssetType: "crypto", 
			activityDate: "", 
			activityType: "buy", 
			activityAssetAmount: "", 
			activityFee: "", 
			activityNotes: "", 
			activityExchange: "", 
			activityPair: "", 
			activityPrice: "", 
			activityFrom: "", 
			activityTo: ""
		}
	});

	// The components rendered by the activity "FlatList".
	const renderItem = ({ item }: any) => {
		let settings: any = store.getState().settings.settings;

		let info = activityRows[item];

		return (
			<Item info={info} showActivityPopup={showActivityPopup} theme={theme} dateFormat={settings?.dateFormat}/>
		);
	}
	
	// Used to handle what happens when the user uses the back button.
	useFocusEffect(Utils.backHandler(navigation));

	useEffect(() => {
		navigation.addListener("focus", () => {
			if(navigation.isFocused()) {
				setTimeout(() => {
					populateActivityList();
				}, 500);
			}
		});
		
		let refresh = setInterval(() => {
			if(navigation.isFocused()) {
				populateActivityList();
			}
		}, 15000);

		return () => {
			setFilteredRows({});
			clearInterval(refresh);
		};
	}, []);

	// When the "query" variable's value is changed, the activities are automatically searched through if there are less than 100 of them.
	useEffect(() => {
		if(Object.keys(activityRows).length < 100 || Utils.empty(query)) {
			searchActivity(query);
		}
	}, [query]);

	return (
		<ImageBackground source={Utils.getBackground(theme, settings?.alternateBackground)} resizeMethod="scale" resizeMode="cover">
			<SafeAreaView style={styles.area}>
				<View style={[styles.areaSearchWrapper, styles[`areaSearchWrapper${theme}`], styles[`areaSearchWrapper${theme + alternateBackground}`]]}>
					<TextInput 
						spellCheck={false}
						placeholder="Search..." 
						selectionColor={Colors[theme].mainContrast} 
						placeholderTextColor={Colors[theme].mainContrastDarker} 
						style={[styles.inputSearch, styles[`inputSearch${theme}`]]} 
						onChangeText={(value) => setQuery(value)}
						value={query}
						onSubmitEditing={() => searchActivity(query)}
					/>
					<TouchableOpacity onPress={() => searchActivity(query)} style={[styles.button, styles.buttonSearch, styles[`buttonSearch${theme}`]]}>
						<Text style={[styles.searchText, styles[`searchText${theme}`]]}>Search</Text>
					</TouchableOpacity>
				</View>
				<FlatList
					contentContainerStyle={{ paddingTop:10 }}
					data={getRows(filteredRows, activityRows, query)}
					renderItem={renderItem}
					keyExtractor={item => activityRows[item].activityTransactionID}
					style={[styles.wrapper, styles[`wrapper${theme}`], styles[`wrapper${theme + alternateBackground}`]]}
					ListHeaderComponent={activityHeader}
					ListHeaderComponentStyle={styles.header}
				/>
				<View style={[styles.areaActionsWrapper, styles[`areaActionsWrapper${theme}`], styles[`areaActionsWrapper${theme + alternateBackground}`]]}>
					<TouchableOpacity onPress={() => showHelpPopup()} style={[styles.button, styles.iconButton, styles[`iconButton`]]}>
						<Icon
							name="question" 
							size={18} 
							color={Colors[theme].accentContrast}
						/>
					</TouchableOpacity>
					<TouchableOpacity onPress={() => showToolsPopup()} style={[styles.button, styles.actionButton, styles[`actionButton${theme}`], styles.smallerButton]}>
						<Text style={[styles.actionText, styles[`actionText${theme}`]]}>Tools</Text>
					</TouchableOpacity>
					<TouchableOpacity onPress={() => showActivityPopup("createActivity", {})} style={[styles.button, styles.actionButton, styles[`actionButton${theme}`], styles.smallerButton]}>
						<Text style={[styles.actionText, styles[`actionText${theme}`]]}>Add Activity</Text>
					</TouchableOpacity>
				</View>
			</SafeAreaView>
			<Modal visible={popup} onRequestClose={hidePopup} transparent={true}>
				<View style={styles.popup}>
					<TouchableOpacity activeOpacity={1} onPress={() => hidePopup()} style={styles.popupBackground}></TouchableOpacity>
					<View style={styles.popupForeground}>
						<View style={[styles.popupWrapper, styles[`popupWrapper${theme}`], { padding:0 }]}>{popupContent}</View>
					</View>
				</View>
			</Modal>
			<Loading active={loading} theme={theme} opaque={true}/>
		</ImageBackground>
	);

	// Returns either all activities, or a limited number of them based on whether or not the user is searching for any.
	function getRows(filteredRows: any, activityRows: any, query: any) {
		if(!Utils.empty(query) && Utils.empty(filteredRows)) {
			return null;
		}

		if(!Utils.empty(query) && Object.keys(filteredRows).length > 0) {
			return Object.keys(filteredRows).reverse();
		}
		
		return Object.keys(activityRows).reverse();
	}

	// Fetches the user's activity data and displays it. 
	async function populateActivityList() {
		let activityData = await fetchActivity();

		if(Utils.empty(activityData)) {
			setActivityHeader(<View style={styles.listTextWrapper}><Text style={[styles.listText, styles[`listText${theme}`]]}>No Activity Found</Text></View>);
			setActivityRows({});
			return;
		}

		setActivityHeader(null);
		setActivityRows(activityData);
	}

	// Searches the user's activity data based on a given query.
	function searchActivity(query: string) {
		let settings: any = store.getState().settings.settings;

		if(Utils.empty(query)) {
			setFilteredRows(activityRows);
			return;
		}

		query = query.toLowerCase();

		let filtered: any = {};

		Object.keys(activityRows).map(txID => {
			let activity = activityRows[txID];

			let date = settings?.dateFormat === "dd-mm-yyyy" ? Utils.formatDateHyphenatedHuman(new Date(Date.parse(activity.activityDate))) : Utils.formatDateHyphenated(new Date(Date.parse(activity.activityDate)));

			let data = [date, activity.activityType, activity.activityAssetSymbol, activity.activityAssetAmount, activity.activityAssetType];

			if(data.join("|").toLowerCase().includes(query)) {
				filtered[txID] = activity;
			}
		});

		setFilteredRows(filtered);
	}

	// Shows a popup to avoid the user accidentally performing a "destructive" action.
	function showConfirmationPopup(action: string, args: any) {
		Keyboard.dismiss();
		hidePopup();

		let content = () => {
			return (
				<View style={[styles.popupContent, { paddingTop:20, paddingBottom:20 }]}>
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

		showPopup(content);
	}

	// Shows the popup through which users can create or update activities. 
	function showActivityPopup(action: string, info: any) {
		try {
			popupRef.current.activity = {
				activityID: info.activityID || "", 
				activityTransactionID: info.activityTransactionID || "",
				activityAssetID: info.activityAssetID || "", 
				activityAssetSymbol: Utils.empty(info.activityAssetSymbol) ? "" : info.activityAssetSymbol.toUpperCase(), 
				activityAssetType: info.activityAssetType || "crypto", 
				activityDate: info.activityDate || Utils.formatDateHyphenated(new Date()), 
				activityType: info.activityType || "buy", 
				activityAssetAmount: info.activityAssetAmount || "", 
				activityFee: info.activityFee || "", 
				activityNotes: info.activityNotes || "", 
				activityExchange: info.activityExchange || "", 
				activityPair: info.activityPair || "", 
				activityPrice: info.activityPrice || "", 
				activityFrom: info.activityFrom || "", 
				activityTo: info.activityTo || ""
			};

			let data = popupRef.current.activity;

			hidePopup();

			let content = () => {
				return <ActivityPopup action={action} theme={theme} popupRef={popupRef} data={data} hidePopup={hidePopup} showActivityPopup={showActivityPopup} showConfirmationPopup={showConfirmationPopup} processAction={processAction}/>
			};

			showPopup(content);
			setPopupType("activity");
		} catch(error) {
			console.log(error);
			Utils.notify(theme, "Something went wrong... - EM3");
		}
	}

	// Used to perform a desired action passed by a popup component.
	function processAction(action: string) {
		try {
			let data = popupRef.current.activity;

			switch(action) {
				case "createActivity":
					createActivity({ symbol:data.activityAssetSymbol });
					break;
				case "updateActivity":
					updateActivity({ symbol:data.activityAssetSymbol });
					break;
				case "deleteActivity":
					deleteActivity(data.activityID);
					break;
			}
			
			hidePopup();
		} catch(error) {
			console.log(error);
			Utils.notify(theme, "Something went wrong... - EM4");
		}
	}

	// Creates an activity once a matching asset is chosen.
	function selectMatchCreate(id: string) {
		hidePopup();
		createActivity({ id:id });
	}

	// Updates an activity once a matching asset is chosen.
	function selectMatchUpdate(id: string) {
		hidePopup();
		updateActivity({ id:id });
	}

	// Creates an activity.
	async function createActivity(args: any) {
		try {
			let settings: any = store.getState().settings.settings;

			setLoading(true);

			let assetSymbol: string;
			let asset: any;
			
			// Activity data is validated before being created.
			let data = validateActivityData(popupRef.current.activity);

			if(data?.activityAssetType === "crypto") {
				if("symbol" in args) {
					assetSymbol = args.symbol.toLowerCase();
					asset = await CryptoFinder.getCoin({ symbol:assetSymbol });
				} else {
					asset = await CryptoFinder.getCoin({ id:args.id });
					assetSymbol = asset.symbol;
				}

				if("error" in data) {
					setLoading(false);
					Utils.notify(theme, data.error);
					return;
				}

				if("matches" in asset) {
					let content = () => {
						return (
							<View style={[styles.popupContent, { padding:20 }]}>
								<MatchList onPress={selectMatchCreate} theme={theme} matches={asset.matches}/>
								<TouchableOpacity onPress={() => hidePopup()} style={[styles.button, styles.choiceButton, styles[`choiceButton${theme}`], { marginTop:20 }]}>
									<Text style={[styles.choiceText, styles[`choiceText${theme}`]]}>Cancel</Text>
								</TouchableOpacity>
							</View>
						);
					}

					showPopup(content);

					setLoading(false);

					return;
				}
			} else {
				assetSymbol = data?.activityAssetSymbol.toUpperCase();
				asset = { id:"stock-" + assetSymbol, symbol:assetSymbol };
				let stock = await Stock.fetchStockPrice(settings.currency, [assetSymbol]);

				if("error" in stock) {
					ToastAndroid.show(stock.error, 4000);
				}

				if(Utils.empty(stock) || !(assetSymbol in stock)) {
					setLoading(false);
					Utils.notify(theme, "Asset not found.");
					return;
				}
			}

			let userID = await AsyncStorage.getItem("userID");
			let token = await AsyncStorage.getItem("token");
			let key = await AsyncStorage.getItem("key") || "";
			let api = await AsyncStorage.getItem("api");

			let requests = new Requests(api);

			data.activityAssetID = asset.id;
			data.activityAssetSymbol = asset.symbol.toUpperCase();

			let encrypted = Utils.encryptObjectValues(key, data);

			await requests.createActivity(token, userID, encrypted.activityAssetID, encrypted.activityAssetSymbol, encrypted.activityAssetType, encrypted.activityDate, encrypted.activityType, encrypted.activityAssetAmount, encrypted.activityFee, encrypted.activityNotes, encrypted.activityExchange, encrypted.activityPair, encrypted.activityPrice, encrypted.activityFrom, encrypted.activityTo);

			setTimeout(() => {
				populateActivityList();
				setLoading(false);
			}, 500);
		} catch(error) {
			setLoading(false);
			console.log(error);
			Utils.notify(theme, "Something went wrong... - EM5");
		}
	}

	// Updates an activity.
	async function updateActivity(args: any) {
		try {
			setLoading(true);

			let assetSymbol: string;
			let asset: any;

			if("symbol" in args) {
				assetSymbol = args.symbol.toLowerCase();
				asset = await CryptoFinder.getCoin({ symbol:assetSymbol });
			} else {
				asset = await CryptoFinder.getCoin({ id:args.id });
				assetSymbol = asset.symbol;
			}

			// Activity data is validated before being updated.
			let data = validateActivityData(popupRef.current.activity);

			if("error" in data) {
				setLoading(false);
				Utils.notify(theme, data.error);
				return;
			}

			if("matches" in asset) {
				let content = () => {
					return (
						<View style={[styles.popupContent, { padding:20 }]}>
							<MatchList onPress={selectMatchUpdate} theme={theme} matches={asset.matches}/>
							<TouchableOpacity onPress={() => hidePopup()} style={[styles.button, styles.choiceButton, styles[`choiceButton${theme}`], { marginTop:20 }]}>
								<Text style={[styles.choiceText, styles[`choiceText${theme}`]]}>Cancel</Text>
							</TouchableOpacity>
						</View>
					);
				}

				showPopup(content);

				setLoading(false);

				return;
			}

			let userID = await AsyncStorage.getItem("userID");
			let token = await AsyncStorage.getItem("token");
			let key = await AsyncStorage.getItem("key") || "";
			let api = await AsyncStorage.getItem("api");

			let requests = new Requests(api);

			data.activityAssetID = asset.id;
			data.activityAssetSymbol = asset.symbol.toUpperCase();

			let encrypted = Utils.encryptObjectValues(key, data);

			await requests.updateActivity(token, userID, data.activityTransactionID, encrypted.activityAssetID, encrypted.activityAssetSymbol, encrypted.activityAssetType, encrypted.activityDate, encrypted.activityType, encrypted.activityAssetAmount, encrypted.activityFee, encrypted.activityNotes, encrypted.activityExchange, encrypted.activityPair, encrypted.activityPrice, encrypted.activityFrom, encrypted.activityTo);

			setTimeout(() => {
				populateActivityList();
				setLoading(false);
			}, 500);
		} catch(error) {
			setLoading(false);
			console.log(error);
			Utils.notify(theme, "Something went wrong... - EM6");
		}
	}

	// Deletes an activity.
	async function deleteActivity(activityID: number) {
		try {
			setLoading(true);

			let userID = await AsyncStorage.getItem("userID");
			let token = await AsyncStorage.getItem("token");
			let api = await AsyncStorage.getItem("api");

			let requests = new Requests(api);
			await requests.deleteActivity(token, userID, activityID);

			setTimeout(() => {
				populateActivityList();
				setLoading(false);
			}, 500);
		} catch(error) {
			setLoading(false);
			console.log(error);
			Utils.notify(theme, "Something went wrong... - EM7");
		}
	}

	// Shows a popup containing helpful information for the user.
	function showHelpPopup() {
		setPopupType("help");

		let content = () => {
			return (
				<View style={[styles.popupContent, { paddingLeft:20, paddingRight:20 }]}>
					<ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent} showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false}>
						<View style={[styles.modalSection, styles[`modalSection${theme}`], { backgroundColor:Colors[theme].mainThird, marginTop:20 }]}>
							<Text style={[styles.modalInfo, styles[`modalInfo${theme}`]]}>Help</Text>
						</View>
						<View style={[styles.modalSection, styles[`modalSection${theme}`], { backgroundColor:Colors[theme].mainThird }]}>
							<Text style={[styles.modalInfo, styles[`modalInfo${theme}`]]}>An activity represents an event where a crypto or stock asset was bought, sold, or transferred. The settings page includes an option where activities can be set to affect holdings, which means your portfolio would be based on activities you record. For users who simply wish to track their assets without having to record each trade, the aforementioned option can be turned off, and holdings can be added directly through the holdings page.</Text>
						</View>
						<View style={[styles.modalSection, styles[`modalSection${theme}`], { backgroundColor:Colors[theme].mainThird }]}>
							<Text style={[styles.modalInfo, styles[`modalInfo${theme}`]]}>Adding a plus (+) sign to the "From" or "To" fields of a "Transfer" activity would cause the asset to get added to your holdings, whereas adding a minus (-) would subtract the amount.</Text>
						</View>
						<View style={[styles.modalSection, styles[`modalSection${theme}`], { backgroundColor:Colors[theme].mainThird }]}>
							<Text style={[styles.modalInfo, styles[`modalInfo${theme}`]]}>To decrease ambiguity, the preferred date format when recording activities is YYYY-MM-DD. However, the format of the date shown once the activity has been recorded can be changed through the settings page.</Text>
						</View>
						<View style={[styles.modalSection, styles[`modalSection${theme}`], { backgroundColor:Colors[theme].mainThird }]}>
							<Text style={[styles.modalInfo, styles[`modalInfo${theme}`]]}>Only the asset symbol, asset type, amount, date, and activity type need to be provided. The rest of the fields can be left empty.</Text>
						</View>
						<TouchableOpacity onPress={() => hidePopup()} style={[styles.button, styles.choiceButton, styles[`choiceButton${theme}`], { marginBottom:20 }]}>
							<Text style={[styles.choiceText, styles[`choiceText${theme}`]]}>Dismiss</Text>
						</TouchableOpacity>
					</ScrollView>
				</View>
			);
		};

		showPopup(content);
	}

	// Shows a popup that offers multiple tools and calculators the user might find useful.
	function showToolsPopup() {
		setPopupType("tools");

		let content = () => {
			return (
				<View style={styles.popupContent}>
					<ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent} showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false}>
						<View style={[styles.modalSection, styles[`modalSection${theme}`], { backgroundColor:Colors[theme].mainThird }]}>
							<Text style={[styles.modalInfo, styles[`modalInfo${theme}`]]}>Tools</Text>
						</View>
						<View style={[styles.modalSection, styles[`modalSection${theme}`], { backgroundColor:Colors[theme].mainThird }]}>
							<TouchableOpacity onPress={() => showStakingPopup()} style={[styles.button, styles.actionButton, styles[`actionButton${theme}`], styles.popupButton, styles.sectionButton]}>
								<Text style={[styles.actionText, styles[`actionText${theme}`]]}>Staking Calculator</Text>
							</TouchableOpacity>
							<TouchableOpacity onPress={() => showMiningPopup()} style={[styles.button, styles.actionButton, styles[`actionButton${theme}`], styles.popupButton, styles.sectionButton]}>
								<Text style={[styles.actionText, styles[`actionText${theme}`]]}>Mining Calculator</Text>
							</TouchableOpacity>
							<TouchableOpacity onPress={() => showDividendsPopup()} style={[styles.button, styles.actionButton, styles[`actionButton${theme}`], styles.popupButton, styles.sectionButton]}>
								<Text style={[styles.actionText, styles[`actionText${theme}`]]}>Dividends Calculator</Text>
							</TouchableOpacity>
							<TouchableOpacity onPress={() => showMortgagePopup()} style={[styles.button, styles.actionButton, styles[`actionButton${theme}`], styles.popupButton, styles.sectionButton]}>
								<Text style={[styles.actionText, styles[`actionText${theme}`]]}>Mortgage Calculator</Text>
							</TouchableOpacity>
							<TouchableOpacity onPress={() => showTaxPopup()} style={[styles.button, styles.actionButton, styles[`actionButton${theme}`], styles.popupButton, styles.sectionButton, { marginBottom:0 }]}>
								<Text style={[styles.actionText, styles[`actionText${theme}`]]}>Tax Calculator</Text>
							</TouchableOpacity>
						</View>
						<TouchableOpacity onPress={() => hidePopup()} style={[styles.button, styles.choiceButton, styles[`choiceButton${theme}`]]}>
							<Text style={[styles.choiceText, styles[`choiceText${theme}`]]}>Dismiss</Text>
						</TouchableOpacity>
					</ScrollView>
				</View>
			);
		};

		showPopup(content);
	}

	// Shows the staking calculator.
	function showStakingPopup() {
		setPopupType("tools");

		popupRef.current.staking = {
			symbol: "",
			amount: "",
			apy: ""
		};

		hidePopup();

		let content = () => {
			return (
				<View style={styles.popupContent}>
					<ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent} showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false}>
						<View style={[styles.modalSection, styles[`modalSection${theme}`], { backgroundColor:Colors[theme].mainThird }]}>
							<Text style={[styles.modalInfo, styles[`modalInfo${theme}`]]}>Staking Calculator</Text>
						</View>
						<View style={[styles.modalSection, styles[`modalSection${theme}`], { backgroundColor:Colors[theme].mainThird }]}>
							<Text style={[styles.labelInput, styles[`labelInput${theme}`]]}>Symbol</Text>
							<TextInput 
								spellCheck={false}
								autoCorrect={false}
								autoCapitalize="characters"
								placeholder="Symbol..." 
								selectionColor={Colors[theme].mainContrast} 
								placeholderTextColor={Colors[theme].mainContrastDarker} 
								style={[styles.popupInput, styles[`popupInput${theme}`]]} 
								onChangeText={(value) => popupRef.current.staking.symbol = value}
							/>
							<Text style={[styles.labelInput, styles[`labelInput${theme}`]]}>Amount</Text>
							<TextInput 
								spellCheck={false}
								keyboardType="decimal-pad"
								autoCorrect={false}
								placeholder="Amount..." 
								selectionColor={Colors[theme].mainContrast} 
								placeholderTextColor={Colors[theme].mainContrastDarker} 
								style={[styles.popupInput, styles[`popupInput${theme}`]]} 
								onChangeText={(value) => popupRef.current.staking.amount = value}
							/>
							<Text style={[styles.labelInput, styles[`labelInput${theme}`]]}>APY</Text>
							<TextInput 
								spellCheck={false}
								keyboardType="decimal-pad"
								autoCorrect={false}
								placeholder="APY..." 
								selectionColor={Colors[theme].mainContrast} 
								placeholderTextColor={Colors[theme].mainContrastDarker} 
								style={[styles.popupInput, styles[`popupInput${theme}`], { marginBottom:0 }]} 
								onChangeText={(value) => popupRef.current.staking.apy = value}
							/>
						</View>
						<View style={styles.popupButtonWrapper}>
							<TouchableOpacity onPress={() => hidePopup()} style={[styles.button, styles.choiceButton, styles[`choiceButton${theme}`], styles.popupButton]}>
								<Text style={[styles.choiceText, styles[`choiceText${theme}`]]}>Cancel</Text>
							</TouchableOpacity>
							<TouchableOpacity onPress={() => showStakingOutput({})} style={[styles.button, styles.actionButton, styles[`actionButton${theme}`], styles.popupButton]}>
								<Text style={[styles.actionText, styles[`actionText${theme}`]]}>Calculate</Text>
							</TouchableOpacity>
						</View>
					</ScrollView>
				</View>
			);
		};

		showPopup(content);
	}

	// Used to calculate staking rewards once a matching asset has been chosen.
	function selectStakingMatch(id: string) {
		hidePopup();
		showStakingOutput({ id:id });
	}

	// Used to calculate mining rewards once a matching asset has been chosen.
	function selectMiningMatch(id: string) {
		hidePopup();
		showMiningOutput({ id:id });
	}

	// Calculates staking reward.
	async function showStakingOutput(args: any) {
		try {
			let settings: any = store.getState().settings.settings;
			
			let { symbol, amount, apy } = popupRef.current.staking;

			if(!Utils.empty(symbol) && !Utils.empty(amount) && !isNaN(amount) && amount > 0 && !isNaN(apy) && apy > 0) {
				let assetSymbol: string;
				let asset: any;

				if("id" in args) {
					asset = await CryptoFinder.getCoin({ id:args.id });
					assetSymbol = asset.symbol;
				} else {
					assetSymbol = symbol.toLowerCase();
					asset = await CryptoFinder.getCoin({ symbol:assetSymbol });
				}

				if("matches" in asset) {
					let content = () => {
						return (
							<View style={[styles.popupContent, { padding:20 }]}>
								<MatchList onPress={selectStakingMatch} theme={theme} matches={asset.matches}/>
								<TouchableOpacity onPress={() => hidePopup()} style={[styles.button, styles.choiceButton, styles[`choiceButton${theme}`], { marginTop:20 }]}>
									<Text style={[styles.choiceText, styles[`choiceText${theme}`]]}>Cancel</Text>
								</TouchableOpacity>
							</View>
						);
					}

					showPopup(content);

					setLoading(false);

					return;
				}

				let marketData = await cryptoAPI.getMarketByID(settings.currency, asset.id);
				let price = marketData[0].current_price;
				let results = calculateStakingRewards(settings.currency, symbol, amount, apy, price);

				showPopup(outputHTML(`<span>${results}</span>`));
			}
		} catch(error) {
			setLoading(false);
			console.log(error);
			Utils.notify(theme, "Something went wrong... - EM8");
		}
	}

	// Shows the mining calculator.
	function showMiningPopup() {
		setPopupType("tools");

		popupRef.current.mining = {
			symbol: "",
			equipmentCost: "",
			amount: "",
			powerCost: ""
		};

		hidePopup();

		let content = () => {
			return (
				<View style={styles.popupContent}>
					<ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent} showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false}>
						<View style={[styles.modalSection, styles[`modalSection${theme}`], { marginTop:20, backgroundColor:Colors[theme].mainThird }]}>
							<Text style={[styles.modalInfo, styles[`modalInfo${theme}`]]}>Mining Calculator</Text>
						</View>
						<View style={[styles.modalSection, styles[`modalSection${theme}`], { backgroundColor:Colors[theme].mainThird }]}>
							<Text style={[styles.labelInput, styles[`labelInput${theme}`]]}>Symbol</Text>
							<TextInput 
								spellCheck={false}
								autoCorrect={false}
								autoCapitalize="characters"
								placeholder="Symbol..." 
								selectionColor={Colors[theme].mainContrast} 
								placeholderTextColor={Colors[theme].mainContrastDarker} 
								style={[styles.popupInput, styles[`popupInput${theme}`]]} 
								onChangeText={(value) => popupRef.current.mining.symbol = value}
							/>
							<Text style={[styles.labelInput, styles[`labelInput${theme}`]]}>Equipment Cost</Text>
							<TextInput 
								spellCheck={false}
								keyboardType="decimal-pad"
								autoCorrect={false}
								placeholder="Equipment Cost..." 
								selectionColor={Colors[theme].mainContrast} 
								placeholderTextColor={Colors[theme].mainContrastDarker} 
								style={[styles.popupInput, styles[`popupInput${theme}`]]} 
								onChangeText={(value) => popupRef.current.mining.equipmentCost = value}
							/>
							<Text style={[styles.labelInput, styles[`labelInput${theme}`]]}>Daily Amount</Text>
							<TextInput 
								spellCheck={false}
								keyboardType="decimal-pad"
								autoCorrect={false}
								placeholder="Daily Amount..." 
								selectionColor={Colors[theme].mainContrast} 
								placeholderTextColor={Colors[theme].mainContrastDarker} 
								style={[styles.popupInput, styles[`popupInput${theme}`]]} 
								onChangeText={(value) => popupRef.current.mining.amount = value}
							/>
							<Text style={[styles.labelInput, styles[`labelInput${theme}`]]}>Power Cost</Text>
							<TextInput 
								spellCheck={false}
								keyboardType="decimal-pad"
								autoCorrect={false}
								placeholder="Power Cost..." 
								selectionColor={Colors[theme].mainContrast} 
								placeholderTextColor={Colors[theme].mainContrastDarker} 
								style={[styles.popupInput, styles[`popupInput${theme}`], { marginBottom:0 }]} 
								onChangeText={(value) => popupRef.current.mining.powerCost = value}
							/>
						</View>
						<View style={[styles.popupButtonWrapper, { marginBottom:20 }]}>
							<TouchableOpacity onPress={() => hidePopup()} style={[styles.button, styles.choiceButton, styles[`choiceButton${theme}`], styles.popupButton]}>
								<Text style={[styles.choiceText, styles[`choiceText${theme}`]]}>Cancel</Text>
							</TouchableOpacity>
							<TouchableOpacity onPress={() => showMiningOutput({})} style={[styles.button, styles.actionButton, styles[`actionButton${theme}`], styles.popupButton]}>
								<Text style={[styles.actionText, styles[`actionText${theme}`]]}>Calculate</Text>
							</TouchableOpacity>
						</View>
					</ScrollView>
				</View>
			);
		};

		showPopup(content);
	}

	// Calculates mining reward.
	async function showMiningOutput(args: any) {
		try {
			let settings: any = store.getState().settings.settings;
			
			let { symbol, equipmentCost, amount, powerCost } = popupRef.current.mining;

			if(!Utils.empty(symbol) && !isNaN(equipmentCost) && equipmentCost > 0 && !isNaN(amount) && amount > 0 && !isNaN(powerCost)) {
				let assetSymbol: string;
				let asset: any;

				if("id" in args) {
					asset = await CryptoFinder.getCoin({ id:args.id });
					assetSymbol = asset.symbol;
				} else {
					assetSymbol = symbol.toLowerCase();
					asset = await CryptoFinder.getCoin({ symbol:assetSymbol });
				}

				if("matches" in asset) {
					let content = () => {
						return (
							<View style={[styles.popupContent, { padding:20 }]}>
								<MatchList onPress={selectMiningMatch} theme={theme} matches={asset.matches}/>
								<TouchableOpacity onPress={() => hidePopup()} style={[styles.button, styles.choiceButton, styles[`choiceButton${theme}`], { marginTop:20 }]}>
									<Text style={[styles.choiceText, styles[`choiceText${theme}`]]}>Cancel</Text>
								</TouchableOpacity>
							</View>
						);
					}

					showPopup(content);

					setLoading(false);

					return;
				}

				let marketData = await cryptoAPI.getMarketByID(settings.currency, asset.id);
				let price = marketData[0].current_price;
				let results = calculateMiningRewards(settings.currency, symbol, price, equipmentCost, amount, powerCost);

				showPopup(outputHTML(`<span>${results}</span>`));
			}
		} catch(error) {
			setLoading(false);
			console.log(error);
			Utils.notify(theme, "Something went wrong... - EM9");
		}
	}

	// Shows the dividend calculator.
	function showDividendsPopup() {
		setPopupType("tools");

		popupRef.current.dividends = {
			shares: "",
			dividend: ""
		};

		hidePopup();

		let content = () => {
			return (
				<View style={styles.popupContent}>
					<View style={[styles.modalSection, styles[`modalSection${theme}`], { marginTop:20, backgroundColor:Colors[theme].mainThird }]}>
						<Text style={[styles.modalInfo, styles[`modalInfo${theme}`]]}>Dividends Calculator</Text>
					</View>
					<View style={[styles.modalSection, styles[`modalSection${theme}`], { backgroundColor:Colors[theme].mainThird }]}>
						<Text style={[styles.labelInput, styles[`labelInput${theme}`]]}>Number Of Shares</Text>
						<TextInput 
							spellCheck={false}
							keyboardType="decimal-pad"
							autoCorrect={false}
							placeholder="Number Of Shares..." 
							selectionColor={Colors[theme].mainContrast} 
							placeholderTextColor={Colors[theme].mainContrastDarker} 
							style={[styles.popupInput, styles[`popupInput${theme}`]]} 
							onChangeText={(value) => popupRef.current.dividends.shares = value}
						/>
						<Text style={[styles.labelInput, styles[`labelInput${theme}`]]}>Dividend Per Share</Text>
						<TextInput 
							spellCheck={false}
							keyboardType="decimal-pad"
							autoCorrect={false}
							placeholder="Dividend Per Share..." 
							selectionColor={Colors[theme].mainContrast} 
							placeholderTextColor={Colors[theme].mainContrastDarker} 
							style={[styles.popupInput, styles[`popupInput${theme}`], { marginBottom:0 }]} 
							onChangeText={(value) => popupRef.current.dividends.dividend = value}
						/>
					</View>
					<View style={[styles.popupButtonWrapper, { marginBottom:20 }]}>
						<TouchableOpacity onPress={() => hidePopup()} style={[styles.button, styles.choiceButton, styles[`choiceButton${theme}`], styles.popupButton]}>
							<Text style={[styles.choiceText, styles[`choiceText${theme}`]]}>Cancel</Text>
						</TouchableOpacity>
						<TouchableOpacity onPress={() => showDividendsOutput({})} style={[styles.button, styles.actionButton, styles[`actionButton${theme}`], styles.popupButton]}>
							<Text style={[styles.actionText, styles[`actionText${theme}`]]}>Calculate</Text>
						</TouchableOpacity>
					</View>
				</View>
			);
		};

		showPopup(content);
	}

	// Calculates dividend rewards.
	async function showDividendsOutput(args: any) {
		try {
			let settings: any = store.getState().settings.settings;
			
			let { shares, dividend } = popupRef.current.dividends;

			if(!Utils.empty(shares) && !Utils.empty(dividend) && !isNaN(shares) && shares > 0 && !isNaN(dividend) && dividend > 0) {
				let results = calculateDividendRewards(settings.currency, shares, dividend);

				showPopup(outputHTML(`<span>${results}</span>`));
			}
		} catch(error) {
			setLoading(false);
			console.log(error);
			Utils.notify(theme, "Something went wrong... - EM10");
		}
	}

	// Shows the mortgage calculator. 
	function showMortgagePopup() {
		setPopupType("tools");

		popupRef.current.mortgage = {
			price: "",
			deposit: "",
			term: "",
			interest: ""
		};

		hidePopup();

		let content = () => {
			return (
				<View style={styles.popupContent}>
					<ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent} showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false}>
						<View style={[styles.modalSection, styles[`modalSection${theme}`], { marginTop:20, backgroundColor:Colors[theme].mainThird }]}>
							<Text style={[styles.modalInfo, styles[`modalInfo${theme}`]]}>Mortgage Calculator</Text>
						</View>
						<View style={[styles.modalSection, styles[`modalSection${theme}`], { backgroundColor:Colors[theme].mainThird }]}>
							<Text style={[styles.labelInput, styles[`labelInput${theme}`]]}>Price</Text>
							<TextInput 
								spellCheck={false}
								keyboardType="decimal-pad"
								autoCorrect={false}
								placeholder="Price..." 
								selectionColor={Colors[theme].mainContrast} 
								placeholderTextColor={Colors[theme].mainContrastDarker} 
								style={[styles.popupInput, styles[`popupInput${theme}`]]} 
								onChangeText={(value) => popupRef.current.mortgage.price = value}
							/>
							<Text style={[styles.labelInput, styles[`labelInput${theme}`]]}>Deposit</Text>
							<TextInput 
								spellCheck={false}
								keyboardType="decimal-pad"
								autoCorrect={false}
								placeholder="Deposit..." 
								selectionColor={Colors[theme].mainContrast} 
								placeholderTextColor={Colors[theme].mainContrastDarker} 
								style={[styles.popupInput, styles[`popupInput${theme}`]]} 
								onChangeText={(value) => popupRef.current.mortgage.deposit = value}
							/>
							<Text style={[styles.labelInput, styles[`labelInput${theme}`]]}>Term</Text>
							<TextInput 
								spellCheck={false}
								keyboardType="decimal-pad"
								autoCorrect={false}
								placeholder="Term..." 
								selectionColor={Colors[theme].mainContrast} 
								placeholderTextColor={Colors[theme].mainContrastDarker} 
								style={[styles.popupInput, styles[`popupInput${theme}`]]} 
								onChangeText={(value) => popupRef.current.mortgage.term = value}
							/>
							<Text style={[styles.labelInput, styles[`labelInput${theme}`]]}>Interest</Text>
							<TextInput 
								spellCheck={false}
								keyboardType="decimal-pad"
								autoCorrect={false}
								placeholder="Interest..." 
								selectionColor={Colors[theme].mainContrast} 
								placeholderTextColor={Colors[theme].mainContrastDarker} 
								style={[styles.popupInput, styles[`popupInput${theme}`], { marginBottom:0 }]} 
								onChangeText={(value) => popupRef.current.mortgage.interest = value}
							/>
						</View>
						<View style={[styles.popupButtonWrapper, { marginBottom:20 }]}>
							<TouchableOpacity onPress={() => hidePopup()} style={[styles.button, styles.choiceButton, styles[`choiceButton${theme}`], styles.popupButton]}>
								<Text style={[styles.choiceText, styles[`choiceText${theme}`]]}>Cancel</Text>
							</TouchableOpacity>
							<TouchableOpacity onPress={() => showMortgageOutput({})} style={[styles.button, styles.actionButton, styles[`actionButton${theme}`], styles.popupButton]}>
								<Text style={[styles.actionText, styles[`actionText${theme}`]]}>Calculate</Text>
							</TouchableOpacity>
						</View>
					</ScrollView>
				</View>
			);
		};

		showPopup(content);
	}

	// Calculates mortgage payments.
	async function showMortgageOutput(args: any) {
		try {
			let settings: any = store.getState().settings.settings;
			
			let { price, deposit, term, interest } = popupRef.current.mortgage;

			price = parseFloat(price);
			deposit = parseFloat(deposit);
			term = parseFloat(term);
			interest = parseFloat(interest);

			if(!isNaN(price) && price > 0 && !isNaN(deposit) && deposit > 0 && !isNaN(term) && term > 0 && !isNaN(interest) && interest > 0) {
				let results = calculateMortgage(settings.currency, price, deposit, term, interest);

				showPopup(outputHTML(`<span>${results}</span>`));
			}
		} catch(error) {
			setLoading(false);
			console.log(error);
			Utils.notify(theme, "Something went wrong... - EM11");
		}
	}

	// Shows the tax calculator.
	function showTaxPopup() {
		setPopupType("tools");

		popupRef.current.tax = {
			income: ""
		};

		hidePopup();

		let content = () => {
			return (
				<View style={styles.popupContent}>
					<View style={[styles.modalSection, styles[`modalSection${theme}`], { marginTop:20, backgroundColor:Colors[theme].mainThird }]}>
						<Text style={[styles.modalInfo, styles[`modalInfo${theme}`]]}>Tax Calculator</Text>
					</View>
					<View style={[styles.modalSection, styles[`modalSection${theme}`], { backgroundColor:Colors[theme].mainThird }]}>
						<Text style={[styles.labelInput, styles[`labelInput${theme}`]]}>Income</Text>
						<TextInput 
							spellCheck={false}
							keyboardType="decimal-pad"
							autoCorrect={false}
							placeholder="Income..." 
							selectionColor={Colors[theme].mainContrast} 
							placeholderTextColor={Colors[theme].mainContrastDarker} 
							style={[styles.popupInput, styles[`popupInput${theme}`], { marginBottom:0 }]} 
							onChangeText={(value) => popupRef.current.tax.income = value}
						/>
					</View>
					<View style={[styles.popupButtonWrapper, { marginBottom:20 }]}>
						<TouchableOpacity onPress={() => hidePopup()} style={[styles.button, styles.choiceButton, styles[`choiceButton${theme}`], styles.popupButton]}>
							<Text style={[styles.choiceText, styles[`choiceText${theme}`]]}>Cancel</Text>
						</TouchableOpacity>
						<TouchableOpacity onPress={() => showTaxOutput({})} style={[styles.button, styles.actionButton, styles[`actionButton${theme}`], styles.popupButton]}>
							<Text style={[styles.actionText, styles[`actionText${theme}`]]}>Calculate</Text>
						</TouchableOpacity>
					</View>
				</View>
			);
		};

		showPopup(content);
	}

	// Calculates tax.
	async function showTaxOutput(args: any) {
		try {
			let settings: any = store.getState().settings.settings;
			
			let { income } = popupRef.current.tax;

			income = parseFloat(income);

			if(!isNaN(income) && income > 0) {
				let results = calculateTax(settings.currency, income);

				showPopup(outputHTML(`<span>${results}</span>`));
			}
		} catch(error) {
			setLoading(false);
			console.log(error);
			Utils.notify(theme, "Something went wrong... - EM12");
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
		setPopupType(null);
	}

	// Outputs a component with rendered HTML content.
	function outputHTML(html: string) {
		return (
			<View style={[styles.popupContent, { padding:20 }]}>
				<HTML 
					contentWidth={screenWidth - 40}
					source={{ html:html }} 
					tagsStyles={{ 
						span: { 
							color: Colors[theme].mainContrast, 
							fontSize: 16 
						}
					}}
				/>
			</View>
		);
	}
}

function calculateStakingRewards(currency: string, symbol: string, amount: number, apy: number, price: number) {
	let currencySymbol = Utils.currencySymbols[currency];

	let yearlyAmount = amount * (apy / 100);
	let yearlyValue = parseFloat((yearlyAmount * price).toFixed(3));

	let monthlyAmount = (yearlyAmount / 12).toFixed(3);
	let monthlyValue = parseFloat((yearlyValue / 12).toFixed(3));

	let weeklyAmount = (yearlyAmount / (365 / 7)).toFixed(3);
	let weeklyValue = parseFloat((yearlyValue / (365 / 7)).toFixed(3));

	let dailyAmount = (yearlyAmount / 365).toFixed(3);
	let dailyValue = parseFloat((yearlyValue / 365).toFixed(3));

	return `
		If ${symbol.toUpperCase()} remains at its current price of ${currencySymbol + Utils.separateThousands(price)}:<br><br>
		Yearly Amount: ${yearlyAmount} ${symbol.toUpperCase()}<br>
		Yearly Value: ${currencySymbol + Utils.separateThousands(yearlyValue)}<br><br>
		Monthly Amount: ${monthlyAmount} ${symbol.toUpperCase()}<br>
		Monthly Value: ${currencySymbol + Utils.separateThousands(monthlyValue)}<br><br>
		Weekly Amount: ${weeklyAmount} ${symbol.toUpperCase()}<br>
		Weekly Value: ${currencySymbol + Utils.separateThousands(weeklyValue)}<br><br>
		Daily Amount: ${dailyAmount} ${symbol.toUpperCase()}<br>
		Daily Value: ${currencySymbol + Utils.separateThousands(dailyValue)}
	`;
}

function calculateMiningRewards(currency: string, symbol: string, price: number, equipmentCost: number, dailyAmount: number, dailyPowerCost: number) {
	let currencySymbol = Utils.currencySymbols[currency];

	let dailyValue = (dailyAmount * price) - dailyPowerCost;
	
	let weeklyAmount = dailyAmount * 7;
	let weeklyValue = dailyValue * 7;

	let monthlyAmount = dailyAmount * 30;
	let monthlyValue = dailyValue * 30;

	let yearlyAmount = dailyAmount * 365;
	let yearlyValue = dailyValue * 365;

	let roi = equipmentCost / monthlyValue;

	return `
		If ${symbol.toUpperCase()} remains at its current price of ${currencySymbol + Utils.separateThousands(price)}:<br><br>
		Yearly Amount: ${yearlyAmount} ${symbol.toUpperCase()}<br>
		Yearly Value: ${currencySymbol + Utils.separateThousands(yearlyValue)}<br><br>
		Monthly Amount: ${monthlyAmount} ${symbol.toUpperCase()}<br>
		Monthly Value: ${currencySymbol + Utils.separateThousands(monthlyValue)}<br><br>
		Weekly Amount: ${weeklyAmount} ${symbol.toUpperCase()}<br>
		Weekly Value: ${currencySymbol + Utils.separateThousands(weeklyValue)}<br><br>
		Daily Amount: ${dailyAmount} ${symbol.toUpperCase()}<br>
		Daily Value: ${currencySymbol + Utils.separateThousands(dailyValue)}<br><br>
		Your ROI (Return on Investment) would be ${roi.toFixed(2)} months.
	`;
}

function calculateDividendRewards(currency: string, amount: number, dividend: number) {
	let currencySymbol = Utils.currencySymbols[currency];

	let yearlyValue = parseFloat((amount * dividend).toFixed(3));

	let monthlyValue = parseFloat((yearlyValue / 12).toFixed(3));

	let weeklyValue = parseFloat((yearlyValue / (365 / 7)).toFixed(3));

	let dailyValue = parseFloat((yearlyValue / 365).toFixed(3));

	return `
		Yearly Value: ${currencySymbol + Utils.separateThousands(yearlyValue)}<br>
		Monthly Value: ${currencySymbol + Utils.separateThousands(monthlyValue)}<br>
		Weekly Value: ${currencySymbol + Utils.separateThousands(weeklyValue)}<br>
		Daily Value: ${currencySymbol + Utils.separateThousands(dailyValue)}
	`;
}

function calculateMortgage(currency: string, price: number, deposit: number, term: number, interest: number) {
	let currencySymbol = Utils.currencySymbols[currency];

	let toPay = price - deposit;
	let interestAmount = (toPay * interest) / 100;
	let total = price + interestAmount;

	let yearly = parseFloat((total / term).toFixed(0));
	let monthly = parseFloat((yearly / 12).toFixed(0));

	return `
		This is a rough estimate, and likely only applicable in the UK:<br><br>
		Yearly Payment: ${currencySymbol + Utils.separateThousands(yearly)}<br>
		Monthly Payment: ${currencySymbol + Utils.separateThousands(monthly)}<br>
		Total Interest: ${currencySymbol + Utils.separateThousands(interestAmount)}<br>
		Total Cost: ${currencySymbol + Utils.separateThousands(total)}
	`;
}

function calculateTax(currency: string, income: number) {
	let currencySymbol = Utils.currencySymbols[currency];

	let brackets = {
		personalAllowance: {
			from: 0,
			to: 12570,
			rate: 0
		},
		basicRate: {
			from: 12571,
			to: 50270,
			rate: 20
		},
		higherRate: {
			from: 50271,
			to: 150000,
			rate: 40
		},
		additionalRate: {
			from: 150001,
			to: Number.MAX_SAFE_INTEGER,
			rate: 45
		}
	};

	let output = `This may not be accurate, and would only be applicable in the UK:`;

	let taxableBasic = 0, taxableHigher = 0, taxableAdditional = 0;

	let toPay = 0;

	let taxBracket = "";

	if(income <= brackets.personalAllowance.to) {
		// Personal Allowance.
		taxBracket = "You aren't in any tax bracket. You don't need to pay tax.";

		toPay = 0;
	} else if(income >= brackets.basicRate.from && income <= brackets.basicRate.to) {
		// Basic Rate.
		taxBracket = "You are in the basic tax bracket.";

		taxableBasic = income - brackets.personalAllowance.to;
		let amountBasic = parseFloat(((taxableBasic * brackets.basicRate.rate) / 100).toFixed(2));
		toPay += amountBasic;
	} else if(income >= brackets.higherRate.from && income <= brackets.higherRate.to) {
		// Higher Rate.
		taxBracket = "You are in the higher tax bracket.";

		taxableBasic = brackets.basicRate.to - brackets.personalAllowance.to;
		let amountBasic = parseFloat(((taxableBasic * brackets.basicRate.rate) / 100).toFixed(2));
		toPay += amountBasic;

		taxableHigher = income - brackets.basicRate.to;
		let amountHigher = parseFloat(((taxableHigher * brackets.higherRate.rate) / 100).toFixed(2));
		toPay += amountHigher;
	} else {
		// Additional Rate.
		taxBracket = "You are in the additional tax bracket.";

		taxableBasic = brackets.basicRate.to - brackets.personalAllowance.to;
		let amountBasic = parseFloat(((taxableBasic * brackets.basicRate.rate) / 100).toFixed(2));
		toPay += amountBasic;

		taxableHigher = brackets.higherRate.to - brackets.basicRate.to;
		let amountHigher = parseFloat(((taxableHigher * brackets.higherRate.rate) / 100).toFixed(2));
		toPay += amountHigher;

		taxableAdditional = income - brackets.higherRate.to;
		let amountAdditional = parseFloat(((taxableAdditional * brackets.additionalRate.rate) / 100).toFixed(2));
		toPay += amountAdditional;
	}

	output += "<br><br>" + taxBracket;

	output += "<br><br>Total Tax To Pay: ";

	output += currencySymbol + Utils.separateThousands(toPay) + "<br><br>";

	output += `Taxable Basic: ${currencySymbol + Utils.separateThousands(taxableBasic)}<br>`;
	output += `Taxable Higher: ${currencySymbol + Utils.separateThousands(taxableHigher)}<br>`;
	output += `Taxable Additional: ${currencySymbol + Utils.separateThousands(taxableAdditional)}`;

	return output;
}

// Fetches, decrypts, sorts, and returns the user's activity data.
export function fetchActivity() {
	return new Promise(async (resolve, reject) => {
		try {
			let userID = await AsyncStorage.getItem("userID");
			let token = await AsyncStorage.getItem("token");
			let key = await AsyncStorage.getItem("key") || "";
			let api = await AsyncStorage.getItem("api");

			let requests = new Requests(api);

			let activity = await requests.readActivity(token, userID);

			if(Utils.empty(activity?.data?.readActivity)) {
				resolve(null);
				return;
			}

			let activityData: any = {};
	
			let encrypted = activity?.data?.readActivity;
	
			Object.keys(encrypted).map(index => {
				let decrypted = Utils.decryptObjectValues(key, encrypted[index]);
				decrypted.activityID = encrypted[index].activityID;
				decrypted.activityTransactionID = encrypted[index].activityTransactionID;
				activityData[decrypted.activityTransactionID] = decrypted;
			});

			let sortedByDate = sortActivityDataByDate(activityData);

			resolve(sortedByDate);
		} catch(error) {
			console.log(error);
			reject(error);
		}
	});
}

// Sorts the user's activity data based on the date of each activity.
export function sortActivityDataByDate(activityData: any) {
	let sorted: any = {};
	let array: any = [];

	for(let activity in activityData) {
		array.push([activity, activityData[activity].activityDate]);
	}

	array.sort(function(a: any, b: any) {
		return new Date(a[1]).getTime() - new Date(b[1]).getTime();
	});

	array.map((item: any) => {
		sorted[item[0]] = activityData[item[0]];
	});

	return sorted;
}

// Separates activities by type (crypto or stock).
export function filterActivitiesByType(activityData: any) {
	let activitiesCrypto: any = {};
	let activitiesStocks: any = {};

	let ids = Object.keys(activityData);
	ids.map(id => {
		let activity = activityData[id];
		if(activity.activityAssetType === "crypto") {
			activitiesCrypto[id] = activity;
		} else {
			activitiesStocks[id] = activity;
		}
	});

	return { crypto:activitiesCrypto, stocks:activitiesStocks };
}

// Validates activity popup data before creating or updating an activity.
export function validateActivityData(values: any) {
	try {
		values.activityAssetAmount = parseFloat(values.activityAssetAmount);

		if(Utils.empty(values.activityFee)) {
			values.activityFee = 0;
		}

		if(Utils.empty(values.activityPrice)) {
			values.activityFee = 0;
		}

		if(isNaN(values.activityAssetAmount) || isNaN(values.activityFee) || isNaN(values.activityPrice)) {
			return { error:"The values of the amount, fee, and price fields must be numbers."};
		}

		if(values.activityAssetAmount <= 0) {
			return { error:"Amount must be greater than zero." };
		}

		try {
			new Date(Date.parse(values.activityDate));
		} catch(error) {
			return { error:"Invalid date." };
		}

		if(Utils.empty(values.activityAssetSymbol) || Utils.empty(values.activityAssetType) || Utils.empty(values.activityAssetAmount) || Utils.empty(values.activityDate) || Utils.empty(values.activityType)) {
			return { error:"At minimum, the symbol, asset type, amount, date, and activity type must be specified." };
		}

		if(values.activityType === "buy" || values.activityType === "sell") {
			if(Utils.empty(values.activityExchange)) {
				values.activityExchange = "";
			}

			if(Utils.empty(values.activityPair)) {
				values.activityPair = "";
			}

			values.activityFrom = "";
			values.activityTo = "";
		} else {
			if(Utils.empty(values.activityFrom)) {
				values.activityFrom = "";
			}

			if(Utils.empty(values.activityTo)) {
				values.activityTo = "";
			}

			values.activityExchange = "";
			values.activityPair = "";
			values.activityPrice = 0;
		}

		if(Utils.empty(values.activityNotes)) {
			values.activityNotes = "-";
		}

		return values;
	} catch(error) {
		console.log(error);
		return { error:"Something went wrong... - EM13" };
	}
}