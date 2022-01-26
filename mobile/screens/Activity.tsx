import { useFocusEffect } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import { FlatList, ImageBackground, Keyboard, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
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

export default function Activity({ navigation }: any) {
	const dispatch = useDispatch();
	const { theme } = useSelector((state: any) => state.theme);
	const { settings } = useSelector((state: any) => state.settings);

	const [query, setQuery] = useState<string>("");

	const [loading, setLoading] = useState<boolean>(false);

	const [popup, setPopup] = useState<boolean>(false);
	const [popupContent, setPopupContent] = useState<any>(null);

	const [activityRows, setActivityRows] = useState<any>({});
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
		let info = activityRows[item];

		return (
			<Item info={info} showActivityPopup={showActivityPopup} theme={theme}/>
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
					data={Object.keys(filteredRows).length > 0 ? Object.keys(filteredRows).reverse() : Object.keys(activityRows).reverse()}
					renderItem={renderItem}
					keyExtractor={item => activityRows[item].activityTransactionID}
					style={[styles.wrapper, styles[`wrapper${theme}`]]}
				/>
				<View style={[styles.areaActionsWrapper, styles[`areaActionsWrapper${theme}`]]}>
					<TouchableOpacity style={[styles.button, styles.iconButton, styles[`iconButton`]]}>
						<Icon
							name="question" 
							size={24} 
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
						<View style={[styles.popupWrapper, styles[`popupWrapper${theme}`]]}>{popupContent}</View>
					</View>
				</View>
			</Modal>
			<Loading active={loading} theme={theme} opaque={true}/>
		</ImageBackground>
	);

	async function populateActivityList() {
		let activityData = await fetchActivity();

		if(Utils.empty(activityData)) {
			setActivityRows({});
			return;
		}

		setActivityRows(activityData);
	}

	function searchActivity(query: string) {
		if(Utils.empty(query)) {
			setFilteredRows(activityRows);
			return;
		}

		query = query.toLowerCase();

		let filtered: any = {};

		Object.keys(activityRows).map(txID => {
			let activity = activityRows[txID];
			let data = [activity.activityDate, activity.activityType, activity.activityAssetSymbol, activity.activityAssetAmount];

			if(data.join("|").toLowerCase().includes(query)) {
				filtered[txID] = activity;
			}
		});

		setFilteredRows(filtered);
	}

	function showActivityPopup(action: string, info: any) {
		try {
			popupRef.current.activity = {
				activityID: info.activityID, 
				activityAssetID: info.activityAssetID, 
				activityAssetSymbol: info.activityAssetSymbol, 
				activityAssetType: info.activityAssetType || "crypto", 
				activityDate: info.activityDate, 
				activityType: info.activityType || "buy", 
				activityAssetAmount: info.activityAssetAmount, 
				activityFee: info.activityFee, 
				activityNotes: info.activityNotes, 
				activityExchange: info.activityExchange, 
				activityPair: info.activityPair, 
				activityPrice: info.activityPrice, 
				activityFrom: info.activityFrom, 
				activityTo: info.activityTo
			};

			let data = popupRef.current.activity;

			hidePopup();

			let content = () => {
				return <ActivityPopup action={action} theme={theme} popupRef={popupRef} data={data} hidePopup={hidePopup} showActivityPopup={showActivityPopup} processAction={processAction}/>
			};

			showPopup(content);
		} catch(error) {
			console.log(error);
			Utils.notify(theme, "Something went wrong...");
		}
	}

	function processAction(action: string) {

	}

	function showToolsPopup() {
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
						<TextInput 
							autoCorrect={false}
							autoCapitalize="characters"
							placeholder="Symbol..." 
							selectionColor={Colors[theme].mainContrast} 
							placeholderTextColor={Colors[theme].mainContrastDarker} 
							style={[styles.popupInput, styles[`popupInput${theme}`]]} 
							onChangeText={(value) => popupRef.current.staking.symbol = value}
						/>
						<TextInput 
							keyboardType="decimal-pad"
							autoCorrect={false}
							placeholder="Amount..." 
							selectionColor={Colors[theme].mainContrast} 
							placeholderTextColor={Colors[theme].mainContrastDarker} 
							style={[styles.popupInput, styles[`popupInput${theme}`]]} 
							onChangeText={(value) => popupRef.current.staking.amount = value}
						/>
						<TextInput 
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
						<TextInput 
							autoCorrect={false}
							autoCapitalize="characters"
							placeholder="Symbol..." 
							selectionColor={Colors[theme].mainContrast} 
							placeholderTextColor={Colors[theme].mainContrastDarker} 
							style={[styles.popupInput, styles[`popupInput${theme}`]]} 
							onChangeText={(value) => popupRef.current.mining.symbol = value}
						/>
						<TextInput 
							keyboardType="decimal-pad"
							autoCorrect={false}
							placeholder="Equipment Cost..." 
							selectionColor={Colors[theme].mainContrast} 
							placeholderTextColor={Colors[theme].mainContrastDarker} 
							style={[styles.popupInput, styles[`popupInput${theme}`]]} 
							onChangeText={(value) => popupRef.current.mining.equipmentCost = value}
						/>
						<TextInput 
							keyboardType="decimal-pad"
							autoCorrect={false}
							placeholder="Daily Amount..." 
							selectionColor={Colors[theme].mainContrast} 
							placeholderTextColor={Colors[theme].mainContrastDarker} 
							style={[styles.popupInput, styles[`popupInput${theme}`]]} 
							onChangeText={(value) => popupRef.current.mining.amount = value}
						/>
						<TextInput 
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

	// TODO: Add functionality.
	function showDividendsPopup() {
		hidePopup();
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