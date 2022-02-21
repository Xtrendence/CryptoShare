import { useFocusEffect } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import { FlatList, ImageBackground, Keyboard, Modal, ScrollView, Text, TextInput, ToastAndroid, TouchableOpacity, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Utils from "../utils/Utils";
import { SafeAreaView } from "react-native-safe-area-context";
import styles from "../styles/Activity";
import Icon from "react-native-vector-icons/FontAwesome5";
import { useDispatch, useSelector } from "react-redux";
import HTML from "react-native-render-html";
import LinearGradient from "react-native-linear-gradient";
import { Colors } from "../styles/Global";
import Requests, { cryptoAPI } from "../utils/Requests";
import Loading from "../components/Loading";
import Item from "../components/ActivityItem";
import CryptoFinder from "../utils/CryptoFinder";
import MatchList from "../components/MatchList";
import store from "../store/store";
import { screenWidth } from "../styles/NavigationBar";
import ActivityPopup from "../components/ActivityPopup";
import Stock from "../utils/Stock";

export default function Activity({ navigation }: any) {
	const dispatch = useDispatch();
	const { theme } = useSelector((state: any) => state.theme);
	const { settings } = useSelector((state: any) => state.settings);

	const [query, setQuery] = useState<string>("");

	const [loading, setLoading] = useState<boolean>(false);

	const [popup, setPopup] = useState<boolean>(false);
	const [popupContent, setPopupContent] = useState<any>(null);
	const [popupType, setPopupType] = useState<any>(null);

	const [activityRows, setActivityRows] = useState<any>({});
	const [activityHeader, setActivityHeader] = useState<any>(null);
	const [filteredRows, setFilteredRows] = useState<any>({});

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
		activity: {
			activityID: "", 
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

	const renderItem = ({ item }: any) => {
		let settings: any = store.getState().settings.settings;

		let info = activityRows[item];

		return (
			<Item info={info} showActivityPopup={showActivityPopup} theme={theme} dateFormat={settings?.dateFormat}/>
		);
	}
	
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

	useEffect(() => {
		if(Object.keys(activityRows).length < 100 || Utils.empty(query)) {
			searchActivity(query);
		}
	}, [query]);

	return (
		<ImageBackground source={Utils.getBackground(theme)} resizeMethod="scale" resizeMode="cover">
			<SafeAreaView style={styles.area}>
				<View style={[styles.areaSearchWrapper, styles[`areaSearchWrapper${theme}`]]}>
					<TextInput 
						spellCheck={false}
						placeholder="Query..." 
						selectionColor={Colors[theme].mainContrast} 
						placeholderTextColor={Colors[theme].mainContrastDarker} 
						style={[styles.inputSearch, styles[`inputSearch${theme}`]]} 
						onChangeText={(value) => setQuery(value)}
						value={query}
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
					style={[styles.wrapper, styles[`wrapper${theme}`]]}
					ListHeaderComponent={activityHeader}
					ListHeaderComponentStyle={styles.header}
				/>
				<View style={[styles.areaActionsWrapper, styles[`areaActionsWrapper${theme}`]]}>
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
					<TouchableOpacity onPress={() => hidePopup()} style={styles.popupBackground}></TouchableOpacity>
					<View style={styles.popupForeground}>
						<View style={[styles.popupWrapper, styles[`popupWrapper${theme}`], ["activity", "help"].includes(popupType) ? { padding:0 } : null]}>{popupContent}</View>
					</View>
				</View>
			</Modal>
			<Loading active={loading} theme={theme} opaque={true}/>
		</ImageBackground>
	);

	function getRows(filteredRows: any, activityRows: any, query: any) {
		if(!Utils.empty(query) && Utils.empty(filteredRows)) {
			return null;
		}

		if(!Utils.empty(query) && Object.keys(filteredRows).length > 0) {
			return Object.keys(filteredRows).reverse();
		}
		
		return Object.keys(activityRows).reverse();
	}

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

	function showConfirmationPopup(action: string, args: any) {
		Keyboard.dismiss();
		hidePopup();

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

		showPopup(content);
	}

	function showActivityPopup(action: string, info: any) {
		try {
			popupRef.current.activity = {
				activityID: info.activityID || "", 
				activityAssetID: info.activityAssetID || "", 
				activityAssetSymbol: Utils.empty(info.activityAssetSymbol) ? "" : info.activityAssetSymbol.toUpperCase(), 
				activityAssetType: info.activityAssetType || "crypto", 
				activityDate: info.activityDate || "", 
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
			Utils.notify(theme, "Something went wrong...");
		}
	}

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
			Utils.notify(theme, "Something went wrong...");
		}
	}

	function selectMatchCreate(id: string) {
		hidePopup();
		createActivity({ id:id });
	}

	function selectMatchUpdate(id: string) {
		hidePopup();
		updateActivity({ id:id });
	}

	async function createActivity(args: any) {
		try {
			let settings: any = store.getState().settings.settings;

			setLoading(true);

			let assetSymbol: string;
			let asset: any;
			
			let data = parseActivityPopupData(popupRef.current.activity);

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
							<View style={styles.popupContent}>
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
			Utils.notify(theme, "Something went wrong...");
		}
	}

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

			let data = parseActivityPopupData(popupRef.current.activity);

			if("error" in data) {
				setLoading(false);
				Utils.notify(theme, data.error);
				return;
			}

			if("matches" in asset) {
				let content = () => {
					return (
						<View style={styles.popupContent}>
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

			await requests.updateActivity(token, userID, data.activityID, encrypted.activityAssetID, encrypted.activityAssetSymbol, encrypted.activityAssetType, encrypted.activityDate, encrypted.activityType, encrypted.activityAssetAmount, encrypted.activityFee, encrypted.activityNotes, encrypted.activityExchange, encrypted.activityPair, encrypted.activityPrice, encrypted.activityFrom, encrypted.activityTo);

			setTimeout(() => {
				populateActivityList();
				setLoading(false);
			}, 500);
		} catch(error) {
			setLoading(false);
			console.log(error);
			Utils.notify(theme, "Something went wrong...");
		}
	}

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
			Utils.notify(theme, "Something went wrong...");
		}
	}

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
							<Text style={[styles.modalInfo, styles[`modalInfo${theme}`]]}>An activity represents an event where a crypto or stock asset was bought, sold, or transferred. The settings page includes an option where transactions can be set to affect holdings, which means your portfolio would be based on activities you record. For users who simply wish to track their assets without having to record each trade, the aforementioned option can be turned off, and holdings can be added directly through the holdings page.</Text>
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

	function showToolsPopup() {
		setPopupType("tools");

		let content = () => {
			return (
				<View style={styles.popupContent}>
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
						<TouchableOpacity onPress={() => showDividendsPopup()} style={[styles.button, styles.actionButton, styles[`actionButton${theme}`], styles.popupButton, styles.sectionButton, { marginBottom:0 }]}>
							<Text style={[styles.actionText, styles[`actionText${theme}`]]}>Dividends Calculator</Text>
						</TouchableOpacity>
					</View>
					<TouchableOpacity onPress={() => hidePopup()} style={[styles.button, styles.choiceButton, styles[`choiceButton${theme}`]]}>
						<Text style={[styles.choiceText, styles[`choiceText${theme}`]]}>Dismiss</Text>
					</TouchableOpacity>
				</View>
			);
		};

		showPopup(content);
	}

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
				</View>
			);
		};

		showPopup(content);
	}

	function selectStakingMatch(id: string) {
		hidePopup();
		showStakingOutput({ id:id });
	}

	function selectMiningMatch(id: string) {
		hidePopup();
		showMiningOutput({ id:id });
	}

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
							<View style={styles.popupContent}>
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
			Utils.notify(theme, "Something went wrong...");
		}
	}

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
					<View style={[styles.modalSection, styles[`modalSection${theme}`], { backgroundColor:Colors[theme].mainThird }]}>
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
					<View style={styles.popupButtonWrapper}>
						<TouchableOpacity onPress={() => hidePopup()} style={[styles.button, styles.choiceButton, styles[`choiceButton${theme}`], styles.popupButton]}>
							<Text style={[styles.choiceText, styles[`choiceText${theme}`]]}>Cancel</Text>
						</TouchableOpacity>
						<TouchableOpacity onPress={() => showMiningOutput({})} style={[styles.button, styles.actionButton, styles[`actionButton${theme}`], styles.popupButton]}>
							<Text style={[styles.actionText, styles[`actionText${theme}`]]}>Calculate</Text>
						</TouchableOpacity>
					</View>
				</View>
			);
		};

		showPopup(content);
	}

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
							<View style={styles.popupContent}>
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
			Utils.notify(theme, "Something went wrong...");
		}
	}

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
					<View style={[styles.modalSection, styles[`modalSection${theme}`], { backgroundColor:Colors[theme].mainThird }]}>
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
					<View style={styles.popupButtonWrapper}>
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
			Utils.notify(theme, "Something went wrong...");
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

	function parseActivityPopupData(values: any) {
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
			return { error:"Something went wrong..." };
		}
	}

	function outputHTML(html: string) {
		return (
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