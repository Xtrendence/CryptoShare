import React, { useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { FlatList, ImageBackground, Keyboard, Modal, ScrollView, Text, TextInput, ToastAndroid, TouchableOpacity, View } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/FontAwesome5";
import { useDispatch, useSelector } from "react-redux";
import Chart from "../components/Charts/Chart";
import Item from "../components/HoldingItem";
import Loading from "../components/Loading";
import MatchList from "../components/MatchList";
import store from "../store/store";
import { Colors } from "../styles/Global";
import styles, { gradientColor } from "../styles/Holdings";
import { screenWidth } from "../styles/NavigationBar";
import CryptoFinder from "../utils/CryptoFinder";
import Requests, { cryptoAPI } from "../utils/Requests";
import Stock from "../utils/Stock";
import Utils from "../utils/Utils";
import { fetchActivity, filterActivitiesByType } from "./Activity";

// The "Holdings" page of the app.
export default function Holdings({ navigation }: any) {
	const dispatch = useDispatch();
	const { theme } = useSelector((state: any) => state.theme);
	const { settings } = useSelector((state: any) => state.settings);

	const alternateBackground = settings?.alternateBackground === "disabled" ? "" : "Alternate";

	const [loading, setLoading] = useState<boolean>(false);
	const [loadingText, setLoadingText] = useState<string>("");

	const [popup, setPopup] = useState<boolean>(false);
	const [popupContent, setPopupContent] = useState<any>(null);

	// Stores the popup data when creating/updating holdings.
	const popupRef = useRef<any>({
		holdingID: null,
		assetID: "",
		assetSymbol: "",
		assetAmount: "",
		assetType: ""
	});

	const [modal, setModal] = useState<boolean>(false);
	const [modalStats, setModalStats] = useState<any>(null);

	const labelsRef = useRef<any>(null);

	const [chartLabels, setChartLabels] = useState<any>();
	const [chartVerticalLabels, setChartVerticalLabels] = useState<any>([]);
	const [chartData, setChartData] = useState<any>();
	const [chartSegments, setChartSegments] = useState<any>(1);

	const [holdingsRows, setHoldingsRows] = useState<any>({});
	const [holdingsHeader, setHoldingsHeader] = useState<any>(null);
	const [holdingsTotalValue, setHoldingsTotalValue] = useState<string>("-");

	// Component rendered by the holdings "FlatList".
	const renderItem = ({ item }: any) => {
		let info = holdingsRows[item];

		return (
			<Item info={info} showHoldingChart={showHoldingChart} showHoldingPopup={showHoldingPopup} theme={theme} settings={settings}/>
		);
	}
	
	// Used to handle back button events.
	useFocusEffect(Utils.backHandler(navigation));

	useEffect(() => {
		navigation.addListener("focus", () => {
			if(navigation.isFocused()) {
				setTimeout(() => {
					populateHoldingsList();
				}, 500);
			}
		});
		
		let refresh = setInterval(() => {
			if(navigation.isFocused()) {
				populateHoldingsList();
			}
		}, 15000);

		return () => {
			setChartVerticalLabels([]);
			labelsRef.current = [];
			clearInterval(refresh);
		};
	}, []);

	return (
		<ImageBackground source={Utils.getBackground(theme, settings?.alternateBackground)} resizeMethod="scale" resizeMode="cover">
			<SafeAreaView style={styles.area}>
				<View style={[styles.areaCardWrapper, styles[`areaCardWrapper${theme}`], styles[`areaCardWrapper${theme + alternateBackground}`]]}>
					<TouchableOpacity onPress={() => showPortfolioChart()}>
						<LinearGradient
							style={styles.areaCard}
							colors={Colors[theme].oceanGradient}
							useAngle={true}
							angle={300}
						>
							<Text style={[styles.areaCardText, styles[`areaCardText${theme}`]]}>{holdingsTotalValue}</Text>
						</LinearGradient>
					</TouchableOpacity>
				</View>
				<FlatList
					contentContainerStyle={{ paddingTop:10 }}
					data={Object.keys(holdingsRows)}
					renderItem={renderItem}
					keyExtractor={item => holdingsRows[item].assetID}
					style={[styles.wrapper, styles[`wrapper${theme}`], styles[`wrapper${theme + alternateBackground}`]]}
					ListHeaderComponent={holdingsHeader}
					ListHeaderComponentStyle={styles.header}
				/>
				<View style={[styles.areaActionsWrapper, styles[`areaActionsWrapper${theme}`], styles[`areaActionsWrapper${theme + alternateBackground}`]]}>
					<TouchableOpacity onPress={() => showPortfolioChart()} style={[styles.button, styles.iconButton, styles[`iconButton`]]}>
						<Icon
							name="chart-area" 
							size={24} 
							color={Colors[theme].accentContrast}
						/>
					</TouchableOpacity>
					<TouchableOpacity onPress={() => showHoldingPopup("crypto", "createHolding", undefined)} style={[styles.button, styles.actionButton, styles[`actionButton${theme}`], styles.smallerButton]}>
						<Text style={[styles.actionText, styles[`actionText${theme}`]]}>Add Crypto</Text>
					</TouchableOpacity>
					<TouchableOpacity onPress={() => showHoldingPopup("stock", "createHolding", undefined)} style={[styles.button, styles.actionButton, styles[`actionButton${theme}`], styles.smallerButton]}>
						<Text style={[styles.actionText, styles[`actionText${theme}`]]}>Add Stock</Text>
					</TouchableOpacity>
				</View>
			</SafeAreaView>
			<Modal style={styles.modal} visible={modal} onRequestClose={hideModal} transparent={true}>
				<View style={[styles.modalOverlay, loading ? { opacity:0 } : null]}></View>
				<View style={[styles.modalWrapper, loading ? { opacity:0 } : null]}>
					<View style={[styles.modalChartWrapper, styles[`modalChartWrapper${theme}`]]}>
						<View style={[styles.modalChartLeft, styles[`modalChartLeft${theme}`]]}>
							{
								Utils.sortLabels(settings.currency, chartVerticalLabels).map((label: any) => {
									return (
										<Text key={`label-${chartVerticalLabels.indexOf(label) + Utils.randomBetween(0, 9999999)}`} style={[styles.modalChartText, styles[`modalChartText${theme}`]]}>{label}</Text>
									);
								})
							}
						</View>
						<ScrollView horizontal={true} style={[styles.modalScrollView, styles[`modalScrollView${theme}`]]}>
							{ !Utils.empty(chartData) && !Utils.empty(chartLabels) ? 
								<Chart
									data={{ labels:chartLabels, datasets:[{ data:chartData }]}}
									width={1400}
									height={300}
									segments={chartSegments}
									withHorizontalLines={true}
									withVerticalLines={false}
									withVerticalLabels={true}
									yAxisInterval={500}
									formatYLabel={(label): any => {
										if(Utils.empty(labelsRef.current)) {
											labelsRef.current = [];
										}
										let current = labelsRef.current;
										current.push(label);
										labelsRef.current = current;
										return "";
									}}
									withShadow={false}
									chartConfig={{
										backgroundColor: "rgba(0,0,0,0)",
										backgroundGradientFrom: "rgba(0,0,0,0)",
										backgroundGradientTo: "rgba(0,0,0,0)",
										decimalPlaces: 6,
										color: () => "url(#gradient)",
										labelColor: () => Colors[theme].mainContrast,
										style: {
											borderRadius: 0
										},
										propsForDots: {
											r: "0",
											strokeWidth: "2",
											stroke: Colors[theme].mainFifth
										},
										propsForVerticalLabels: {
											fontSize: 12,
											rotation: 0,
											fontWeight: "bold",
										},
										propsForBackgroundLines: {
											strokeWidth: 2,
											stroke: Colors[theme].mainSecond
										}
									}}
									bezier
									style={{
										backgroundColor: "rgba(255,255,255,0)",
									}}
									// @ts-ignore
									gradient={gradientColor()}
								/>
							: 
								<View style={{ height:320, width:screenWidth }}></View>
							}
						</ScrollView>
					</View>
					<ScrollView style={[styles.modalWrapperScrollView, styles[`modalWrapperScrollView${theme}`]]} contentContainerStyle={styles.modalWrapperScrollViewContent} showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={true} nestedScrollEnabled={true}>
						<View style={[styles.modalSection, styles[`modalSection${theme}`]]}>{modalStats}</View>
					</ScrollView>
				</View>
			</Modal>
			<Modal visible={popup} onRequestClose={hidePopup} transparent={true}>
				<View style={styles.popup}>
					<TouchableOpacity activeOpacity={1} onPress={() => hidePopup()} style={styles.popupBackground}></TouchableOpacity>
					<View style={styles.popupForeground}>
						<View style={[styles.popupWrapper, styles[`popupWrapper${theme}`]]}>{popupContent}</View>
					</View>
				</View>
			</Modal>
			<Loading active={loading} theme={theme} opaque={true} text={loadingText}/>
		</ImageBackground>
	);

	// Used to choose a matching asset when creating a holding.
	function selectMatch(id: string) {
		hidePopup();
		let data = popupRef.current;
		createHolding(parseFloat(data.assetAmount), data.assetType, { id:id });
	}

	// Creates a holding.
	async function createHolding(holdingAssetAmount: number, holdingAssetType: string, args: any) {
		try {
			setLoading(true);

			let assetSymbol: string;
			let asset: any;

			if(holdingAssetType === "crypto") {
				if("symbol" in args) {
					assetSymbol = args.symbol.toLowerCase();
					asset = await CryptoFinder.getCoin({ symbol:assetSymbol });
				} else {
					asset = await CryptoFinder.getCoin({ id:args.id });
					assetSymbol = asset.symbol;
				}

				if(Utils.empty(assetSymbol) || Utils.empty(holdingAssetAmount) || isNaN(holdingAssetAmount) || holdingAssetAmount < 0) {
					setLoading(false);
					Utils.notify(theme, "Invalid data.");
					return;
				}

				if("matches" in asset) {
					let content = () => {
						return (
							<View style={styles.popupContent}>
								<MatchList onPress={selectMatch} theme={theme} matches={asset.matches}/>
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
				assetSymbol = args.symbol.toUpperCase();
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

			let exists: any = await assetHoldingExists(asset.id);

			let encrypted = Utils.encryptObjectValues(key, {
				holdingAssetID: asset.id,
				holdingAssetSymbol: assetSymbol,
				holdingAssetAmount: holdingAssetAmount.toString(),
				holdingAssetType: holdingAssetType
			});

			if(exists.exists) {
				await requests.updateHolding(token, userID, exists.holdingID, encrypted.holdingAssetID, encrypted.holdingAssetSymbol, encrypted.holdingAssetAmount, encrypted.holdingAssetType);

				Utils.notify(theme, "Asset was already part of your holdings, but the amount was updated.");
			} else {
				await requests.createHolding(token, userID, encrypted.holdingAssetID, encrypted.holdingAssetSymbol, encrypted.holdingAssetAmount, encrypted.holdingAssetType);
			}

			setTimeout(() => {
				populateHoldingsList();
				setLoading(false);
			}, 500);
		} catch(error) {
			setLoading(false);
			console.log(error);
			Utils.notify(theme, "Something went wrong... - EM51");
		}
	}

	// Deletes a holding.
	async function deleteHolding(holdingID: number) {
		try {
			setLoading(true);

			let userID = await AsyncStorage.getItem("userID");
			let token = await AsyncStorage.getItem("token");
			let api = await AsyncStorage.getItem("api");

			let requests = new Requests(api);
			await requests.deleteHolding(token, userID, holdingID);

			setTimeout(() => {
				populateHoldingsList();
				setLoading(false);
			}, 500);
		} catch(error) {
			setLoading(false);
			console.log(error);
			Utils.notify(theme, "Something went wrong... - EM52");
		}
	}

	// Updates a holding.
	async function updateHolding(holdingID: number, holdingAssetID: string, holdingAssetSymbol: string, holdingAssetAmount: number, holdingAssetType: string) {
		try {
			setLoading(true);

			if(Utils.empty(holdingAssetID) || Utils.empty(holdingAssetSymbol) || Utils.empty(holdingAssetAmount) || isNaN(holdingAssetAmount) || holdingAssetAmount < 0) {
				setLoading(false);
				Utils.notify(theme, "Invalid data.");
				return;
			}

			let userID = await AsyncStorage.getItem("userID");
			let token = await AsyncStorage.getItem("token");
			let key = await AsyncStorage.getItem("key") || "";
			let api = await AsyncStorage.getItem("api");

			let requests = new Requests(api);

			let encrypted = Utils.encryptObjectValues(key, {
				holdingAssetID: holdingAssetID,
				holdingAssetSymbol: holdingAssetSymbol,
				holdingAssetAmount: holdingAssetAmount.toString(),
				holdingAssetType: holdingAssetType
			});

			await requests.updateHolding(token, userID, holdingID, encrypted.holdingAssetID, encrypted.holdingAssetSymbol, encrypted.holdingAssetAmount, encrypted.holdingAssetType);

			setTimeout(() => {
				populateHoldingsList();
				setLoading(false);
			}, 500);
		} catch(error) {
			setLoading(false);
			console.log(error);
			Utils.notify(theme, "Something went wrong... - EM53");
		}
	}

	// Shows the holding popup used to create or update a holding.
	function showHoldingPopup(assetType: string, action: string, info: any = {}) {
		let settings: any = store.getState().settings.settings;

		if(settings.activitiesAffectHoldings === "enabled") {
			Utils.notify(theme, "Activities cannot be affecting holdings.");
			return;
		}

		popupRef.current.assetID = info?.holding?.holdingAssetID;

		if(!("holding" in info)) {
			popupRef.current.assetID = info?.assetID;
		}

		popupRef.current.assetSymbol = info.symbol;
		popupRef.current.assetAmount = info.amount;
		popupRef.current.assetType = assetType;
		popupRef.current.holdingID = info.holdingID;

		let content = () => {
			return (
				<View style={styles.popupContent}>
					<View style={[styles.modalSection, styles[`modalSection${theme}`], { backgroundColor:Colors[theme].mainThird }]}>
						<Text style={[styles.modalInfo, styles[`modalInfo${theme}`]]}>
							{ action === "createHolding" ? `Add ${Utils.capitalizeFirstLetter(assetType)}` : `Update Asset (${info.symbol.toUpperCase()})` }
						</Text>
					</View>
					<View style={[styles.modalSection, styles[`modalSection${theme}`], { backgroundColor:Colors[theme].mainThird }]}>
						{ action === "createHolding" &&
							<View>
								<Text style={[styles.labelInput, styles[`labelInput${theme}`]]}>Symbol</Text>
								<TextInput 
									spellCheck={false}
									autoCorrect={false}
									autoCapitalize="characters"
									placeholder="Symbol..." 
									selectionColor={Colors[theme].mainContrast} 
									placeholderTextColor={Colors[theme].mainContrastDarker} 
									style={[styles.popupInput, styles[`popupInput${theme}`]]} 
									onChangeText={(value) => popupRef.current.assetSymbol = value}
								/>
							</View>
						}
						<Text style={[styles.labelInput, styles[`labelInput${theme}`]]}>Amount</Text>
						<TextInput 
							spellCheck={false}
							defaultValue={info?.amount?.toString()}
							autoCorrect={false}
							keyboardType="decimal-pad"
							placeholder="Amount..." 
							selectionColor={Colors[theme].mainContrast} 
							placeholderTextColor={Colors[theme].mainContrastDarker} 
							style={[styles.popupInput, styles[`popupInput${theme}`], { marginBottom:0 }]} 
							onChangeText={(value) => popupRef.current.assetAmount = value}
						/>
						{ action === "updateHolding" &&
							<TouchableOpacity onPress={() => showConfirmationPopup("deleteHolding", { holdingID:info.holdingID })} style={[styles.button, styles.actionButton, styles[`actionButton${theme}`], styles.popupButton, styles.dangerButton, styles[`dangerButton${theme}`]]}>
								<Text style={[styles.actionText, styles[`actionText${theme}`]]}>Delete Asset</Text>
							</TouchableOpacity>
						}
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

	// Processes a desired action passed by a popup component.
	function processAction(action: string) {
		try {
			let data = popupRef.current;

			switch(action) {
				case "createHolding":
					createHolding(parseFloat(data.assetAmount), data.assetType, { symbol:data.assetSymbol });
					break;
				case "updateHolding":
					updateHolding(data.holdingID, data.assetID, data.assetSymbol, parseFloat(data.assetAmount), data.assetType);
					break;
				case "deleteHolding":
					deleteHolding(data.holdingID);
					break;
			}
			
			hidePopup();
		} catch(error) {
			console.log(error);
			Utils.notify(theme, "Something went wrong... - EM54");
		}
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
						<TouchableOpacity onPress={() => processAction(action)} style={[styles.button, styles.actionButton, styles[`actionButton${theme}`], styles.popupButton]}>
							<Text style={[styles.actionText, styles[`actionText${theme}`]]}>Confirm</Text>
						</TouchableOpacity>
					</View>
				</View>
			);
		};

		setPopupContent(content);
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

	// Shows a popup with the performance of the user's entire portfolio.
	async function showPortfolioChart() {
		try {
			let settings: any = store.getState().settings.settings;

			if(settings.activitiesAffectHoldings !== "enabled") {
				Utils.notify(theme, "Activities need to be affecting holdings.", 5000);
				return;
			}

			setLoadingText("This might take a while...");

			let activityData = await fetchActivity();
			if(Utils.empty(activityData)) {
				Utils.notify(theme, "No activities found.");
				return;
			}
			
			let days = Utils.dayRangeArray(Utils.previousYear(new Date()), new Date());

			let dataCrypto: any = await fetchHoldingsCryptoHistoricalData(undefined);
			let dataStocks: any = await fetchHoldingsStocksHistoricalData(days, undefined, undefined);

			if("error" in dataStocks) {
				dataStocks = null;
			}

			let pricesCrypto = dataCrypto?.prices;
			let activitiesCrypto = dataCrypto?.activities;

			let pricesStocks = dataStocks?.prices;
			let activitiesStocks = dataStocks?.activities;

			let pricesCombined = { ...pricesCrypto, ...pricesStocks };
			let activitiesCombined = { ...activitiesCrypto, ...activitiesStocks };

			let dates;
			if(!Utils.empty(dataStocks)) {
				dates = await parseActivityAsDatedValue(days, pricesCombined, activitiesCombined);
			} else {
				dates = await parseActivityAsDatedValue(days, pricesCrypto, activitiesCrypto);
			}

			setLoading(true);
			setLoadingText("");

			showModal(dates, undefined);
		} catch(error) {
			setLoading(false);
			console.log(error);
			Utils.notify(theme, "Something went wrong... - EM55");
		}
	}

	// Shows a popup with the performance of a single holding.
	async function showHoldingChart(info: any) {
		try {
			let days = Utils.dayRangeArray(Utils.previousYear(new Date()), new Date());

			let data: any = {};
			
			if(info.type === "crypto") {
				data = await fetchHoldingsCryptoHistoricalData([info.assetID]);
			} else {
				data = await fetchHoldingsStocksHistoricalData(days, [info.assetID], [info.symbol]);
			}

			let prices = data.prices;
			let activities = filterActivitiesByAssetID(data.activities, info.assetID);

			setLoading(true);

			let dates = await parseActivityAsDatedValue(days, prices, activities);

			showModal(dates, { symbol:info.symbol });
		} catch(error) {
			setLoading(false);
			console.log(error);
			Utils.notify(theme, "Something went wrong... - EM56");
		}
	}

	function showModal(dates: any, args: any) {
		Keyboard.dismiss();

		try {
			dates = filterHoldingsPerformanceData(dates);

			let parsed = parseHoldingsDateData(dates);

			setChartVerticalLabels([]);

			setChartLabels(parsed.months);
			setChartData(parsed.values);
			setChartSegments(4);

			getModalStats(parsed.values);

			let check = setInterval(() => {
				if(!Utils.empty(labelsRef.current)) {
					labelsRef.current.length = 5;
					setTimeout(() => {
						setChartVerticalLabels(labelsRef.current);
						clearInterval(check);
						setLoading(false);
					}, 250);
				}
			}, 100);

			setModal(true);
		} catch(error) {
			setLoading(false);
			console.log(error);
			Utils.notify(theme, "Something went wrong... - EM57");
		}
	}

	function hideModal() {
		Keyboard.dismiss();
		labelsRef.current = [];
		setChartVerticalLabels([]);
		setChartLabels(null);
		setChartData(null);
		setChartSegments(1);
		setModalStats(null);
		setModal(false);
	}

	// Shows the profit and loss performance of the user's portfolio (or a single holding) in multiple timeframes.
	function getModalStats(values: any) {
		let settings: any = store.getState().settings.settings;

		let currentValue = values[values.length - 1];

		let value0d = values.length >= 1 ? values[values.length - 1] : "-";
		let value1d = values.length >= 2 ? values[values.length - 2] : "-";
		let value1w = values.length >= 7 ? values[values.length - 8] : "-";
		let value1m = values.length >= 30 ? values[values.length - 31] : "-";
		let value3m = values.length >= 90 ? values[values.length - 91] : "-";
		let value6m = values.length >= 180 ? values[values.length - 181] : "-";
		let value1y = values.length >= 365 ? values[values.length - 366] : "-";

		let stats = [];

		if(!isNaN(value0d) && value0d > 1) {
			value0d = Utils.separateThousands(value0d.toFixed(2));
			stats.push(
				<View style={[styles.modalInfoWrapper, styles[`modalInfoWrapper${theme}`]]} key="value0d">
					<Text style={[styles.modalInfo, styles[`modalInfo${theme}`]]}>Current ({Utils.currencySymbols[settings.currency]}): {value0d}</Text>
				</View>
			);
		}
		if(!isNaN(value1d) && value1d > 1) {
			let style = (currentValue - value1d) === 0 ? "" : (currentValue - value1d) > 0 ? "Positive" : "Negative";
			value1d = Utils.separateThousands(parseFloat((currentValue - value1d).toFixed(2)));
			stats.push(
				<View style={[styles.modalInfoWrapper, styles[`modalInfoWrapper${theme}`]]} key="value1d">
					<Text style={[styles.modalInfo, styles[`modalInfo${theme}`], styles[`modalInfo${style + theme}`]]}>1D ({Utils.currencySymbols[settings.currency]}): {value1d}</Text>
				</View>
			);
		}
		if(!isNaN(value1w) && value1w > 1) {
			let style = (currentValue - value1w) === 0 ? "" : (currentValue - value1w) > 0 ? "Positive" : "Negative";
			value1w = Utils.separateThousands(parseFloat((currentValue - value1w).toFixed(2)));
			stats.push(
				<View style={[styles.modalInfoWrapper, styles[`modalInfoWrapper${theme}`]]} key="value1w">
					<Text style={[styles.modalInfo, styles[`modalInfo${theme}`], styles[`modalInfo${style + theme}`]]}>1W ({Utils.currencySymbols[settings.currency]}): {value1w}</Text>
				</View>
			);
		}
		if(!isNaN(value1m) && value1m > 1) {
			let style = (currentValue - value1m) === 0 ? "" : (currentValue - value1m) > 0 ? "Positive" : "Negative";
			value1m = Utils.separateThousands(parseFloat((currentValue - value1m).toFixed(2)));
			stats.push(
				<View style={[styles.modalInfoWrapper, styles[`modalInfoWrapper${theme}`]]} key="value1m">
					<Text style={[styles.modalInfo, styles[`modalInfo${theme}`], styles[`modalInfo${style + theme}`]]}>1M ({Utils.currencySymbols[settings.currency]}): {value1m}</Text>
				</View>
			);
		}
		if(!isNaN(value3m) && value3m > 1) {
			let style = (currentValue - value3m) === 0 ? "" : (currentValue - value3m) > 0 ? "Positive" : "Negative";
			value3m = Utils.separateThousands(parseFloat((currentValue - value3m).toFixed(2)));
			stats.push(
				<View style={[styles.modalInfoWrapper, styles[`modalInfoWrapper${theme}`]]} key="value3m">
					<Text style={[styles.modalInfo, styles[`modalInfo${theme}`], styles[`modalInfo${style + theme}`]]}>3M ({Utils.currencySymbols[settings.currency]}): {value3m}</Text>
				</View>
			);
		}
		if(!isNaN(value6m) && value6m > 1) {
			let style = (currentValue - value6m) === 0 ? "" : (currentValue - value6m) > 0 ? "Positive" : "Negative";
			value6m = Utils.separateThousands(parseFloat((currentValue - value6m).toFixed(2)));
			stats.push(
				<View style={[styles.modalInfoWrapper, styles[`modalInfoWrapper${theme}`]]} key="value6m">
					<Text style={[styles.modalInfo, styles[`modalInfo${theme}`], styles[`modalInfo${style + theme}`]]}>6M ({Utils.currencySymbols[settings.currency]}): {value6m}</Text>
				</View>
			);
		}
		if(!isNaN(value1y) && value1y > 1) {
			let style = (currentValue - value1y) === 0 ? "" : (currentValue - value1y) > 0 ? "Positive" : "Negative";
			value1y = Utils.separateThousands(parseFloat((currentValue - value1y).toFixed(2)));
			stats.push(
				<View style={[styles.modalInfoWrapper, styles[`modalInfoWrapper${theme}`]]} key="value1y">
					<Text style={[styles.modalInfo, styles[`modalInfo${theme}`], styles[`modalInfo${style + theme}`]]}>1Y ({Utils.currencySymbols[settings.currency]}): {value1y}</Text>
				</View>
			);
		}

		setModalStats(stats);
	}

	// Populates the holdings "FlatList".
	async function populateHoldingsList() {
		// Used to tell the user their stock API key doesn't work.
		let errorRow = false;

		try {
			let settings: any = store.getState().settings.settings;

			let userID = await AsyncStorage.getItem("userID");
			let token = await AsyncStorage.getItem("token");
			let key = await AsyncStorage.getItem("key") || "";
			let api = await AsyncStorage.getItem("api");

			let currency = settings.currency;

			let holdingsData: any = {};

			let requests = new Requests(api);
			
			if(settings.activitiesAffectHoldings === "disabled") {
				let holdings = await requests.readHolding(token, userID);

				if(Utils.empty(holdings?.data?.readHolding)) {
					setHoldingsHeader(<Text style={[styles.listText, styles[`listText${theme}`]]}>No Holdings Found</Text>);
					setHoldingsRows({});
					setHoldingsTotalValue(Utils.currencySymbols[settings.currency] + "0");
					return;
				}

				let encrypted = holdings?.data?.readHolding;

				Object.keys(encrypted).map(index => {
					let decrypted = Utils.decryptObjectValues(key, encrypted[index]);
					decrypted.holdingID = encrypted[index].holdingID;
					holdingsData[decrypted.holdingAssetID] = decrypted;
				});
			} else {
				let parsedData: any = await parseActivityAsHoldings();
				holdingsData = parsedData?.holdingsData;

				if(Utils.empty(holdingsData)) {
					setHoldingsHeader(<Text style={[styles.listText, styles[`listText${theme}`]]}>No Holdings Found</Text>);
					setHoldingsRows({});
					setHoldingsTotalValue(Utils.currencySymbols[settings.currency] + "0");
					return;
				}
			}

			// Separate crypto and stock holdings.
			let filteredHoldings = filterHoldingsByType(holdingsData);

			// Get holding IDs and symbols.
			let holdingCryptoIDs = Object.keys(filteredHoldings.crypto);
			let holdingStockSymbols = getHoldingSymbols(filteredHoldings.stocks);

			// Get market data based on holding IDs and symbols.
			let marketCryptoData = !Utils.empty(holdingCryptoIDs) ? await cryptoAPI.getMarketByID(currency, holdingCryptoIDs.join(",")) : {};

			let marketStocksData = !Utils.empty(holdingStockSymbols) ? await Stock.fetchStockPrice(currency, holdingStockSymbols) : {};

			if("error" in marketStocksData) {
				errorRow = true;
				marketStocksData = {};
				holdingStockSymbols = [];
				filteredHoldings.stocks = {};
			}

			// Combine and sort holdings data.
			let sortedHoldingsData = sortHoldingsDataByValue(filteredHoldings.crypto, filteredHoldings.stocks, marketCryptoData, marketStocksData);

			// Get sorted holding data.
			let sortedData = sortedHoldingsData.holdingsData;
			let sortedOrder = sortedHoldingsData.order;

			let parsed = createHoldingsListRows(marketCryptoData, marketStocksData, sortedData, sortedOrder, currency);

			let rows = parsed.rows;

			if(errorRow) {
				rows.unshift({ assetID:"error", error:"Stock API Limit Exceeded" });
			}

			let totalValue = parseFloat(parsed.totalValue.toFixed(2));

			setHoldingsHeader(null);
			setHoldingsRows(rows);
			setHoldingsTotalValue(`${Utils.currencySymbols[currency] + Utils.separateThousands(totalValue)}`);
		} catch(error) {
			if(error !== "Timeout.") {
				Utils.notify(theme, "Something went wrong... - EM58");
				console.log(error);
			}
		}
	}

	// Generates rows to be rendered by the holdings "FlatList".
	function createHoldingsListRows(marketCryptoData: any, marketStocksData: any, sortedData: any, sortedOrder: any, currency: string) {
		let output: any = { rows:[], totalValue:0 };

		let ids = sortedOrder;

		marketCryptoData = sortMarketDataByCoinID(marketCryptoData);

		for(let i = 0; i < ids.length; i++) {
			try {
				let id = ids[i];
			
				let holding = sortedData[id];

				let value = 0;

				if(holding.holdingAssetType === "crypto") {
					let coin = marketCryptoData[id];

					let coinID = coin.id;
					let price = coin.current_price;
					let icon = coin.image;
					let priceChangeDay = Utils.formatPercentage(coin.market_cap_change_percentage_24h);
					let name = coin.name;
					let symbol = coin.symbol;
					let rank = coin.market_cap_rank || "";

					let holding = sortedData[coinID];

					let holdingID = parseFloat(holding.holdingID);
					let amount = parseFloat(holding.holdingAssetAmount);
					value = parseFloat((amount * price).toFixed(2));

					if(amount <= 0) {
						continue;
					}

					let info = { holdingID:holdingID, assetID:coinID, price:price, icon:icon, priceChangeDay:priceChangeDay, name:name, symbol:symbol, rank:rank, holding:holding, amount:amount, value:value, type:"crypto" };

					output.rows.push(info);
				} else {
					let symbol = holding.holdingAssetSymbol.toUpperCase();

					let stock = marketStocksData[symbol].priceData;

					let shortName = stock.shortName;
					let price = stock.price;
					let priceChangeDay = Utils.formatPercentage(stock.change);

					let holdingID = parseFloat(holding.holdingID);
					let amount = parseFloat(holding.holdingAssetAmount);
					value = parseFloat((amount * price).toFixed(2));

					if(amount <= 0) {
						continue;
					}

					let info = { holdingID:holdingID, assetID:"stock-" + symbol, symbol:symbol, price:price, shortName:shortName, priceChangeDay:priceChangeDay, amount:amount, value:value, type:"stock" };

					output.rows.push(info);
				}
			
				output.totalValue += value;
			} catch(error) {
				console.log(error);
			}
		}

		return output;
	}

	// Filters holdings by the asset type (crypto or stock).
	function filterHoldingsByType(holdingsData: any) {
		let holdingsCrypto: any = {};
		let holdingsStocks: any = {};

		let ids = Object.keys(holdingsData);
		ids.map(id => {
			let holding = holdingsData[id];
			if(holding.holdingAssetType === "crypto") {
				holdingsCrypto[id] = holding;
			} else {
				holdingsStocks[id] = holding;
			}
		});

		return { crypto:holdingsCrypto, stocks:holdingsStocks };
	}

	// Returns the symbol of every holding.
	function getHoldingSymbols(holdings: any) {
		let symbols: any = [];

		Object.keys(holdings).map(id => {
			symbols.push(holdings[id].holdingAssetSymbol);
		});

		return symbols;
	}

	// Sorts holdings by their value (price multiplied by amount).
	function sortHoldingsDataByValue(holdingsCryptoData: any, holdingsStocksData: any, marketCryptoData: any, marketStocksData: any) {
		let combined = { ...holdingsCryptoData, ...holdingsStocksData };
		let sorted: any = {};
		let array = [];
		let order: any = [];

		marketCryptoData = sortMarketDataByCoinID(marketCryptoData);

		for(let holding in holdingsCryptoData) {
			let value = holdingsCryptoData[holding].holdingAssetAmount * marketCryptoData[holding].current_price;

			if(value > 0) {
				array.push([holding, value]);
			}
		}
	
		for(let holding in holdingsStocksData) {
			let symbol = holdingsStocksData[holding].holdingAssetSymbol.toUpperCase();
			let value = holdingsStocksData[holding].holdingAssetAmount * marketStocksData[symbol].priceData.price;

			if(value > 0) {
				array.push([holding, value]);
			}
		}

		array.sort(function(a: any, b: any) {
			return a[1] - b[1];
		});

		array.reverse().map((item: any) => {
			order.push(item[0]);
			sorted[item[0]] = combined[item[0]];
		});

		return { holdingsData:sorted, order:order };
	}

	// Converts activity data to holdings.
	function parseActivityAsHoldings() {
		return new Promise(async (resolve, reject) => {
			try {
				let activityData: any = await fetchActivity();

				if(Utils.empty(activityData)) {
					resolve(null);
					return;
				}

				let transactionIDs = Object.keys(activityData);
				let holdings: any = {};

				for(let i = 0; i < transactionIDs.length; i++) {
					let activity = activityData[transactionIDs[i]];

					let activityAssetID = activity.activityAssetID;
					let activityAssetSymbol = activity.activityAssetSymbol;
					let activityAssetAmount = parseFloat(activity.activityAssetAmount);
					let activityAssetType = activity.activityAssetType;
					let activityType = activity.activityType;
					let activityFrom = activity.activityFrom;
					let activityTo = activity.activityTo;
					let activityFromAndTo = activityFrom + activityTo;

					if(!(activityAssetID in holdings) && (activityType !== "transfer" || (activityType === "transfer" && activityFromAndTo.match(/(\+|\-)/gi)))) {
						holdings[activityAssetID] = {
							holdingAssetAmount: activityAssetAmount,
							holdingAssetID: activityAssetID,
							holdingAssetSymbol: activityAssetSymbol,
							holdingAssetType: activityAssetType,
							holdingID: "-"
						};

						if(activityType === "sell") {
							holdings[activityAssetID].holdingAssetAmount = -activityAssetAmount;
						}

						if(activityFromAndTo.match(/(\+)/gi)) {
							holdings[activityAssetID].holdingAssetAmount = activityAssetAmount;
						} else if(activityFromAndTo.match(/\-/gi)) {
							holdings[activityAssetID].holdingAssetAmount = -activityAssetAmount;
						}

						continue;
					}

					if(activityType === "sell") {
						holdings[activityAssetID].holdingAssetAmount -= activityAssetAmount;
					} else if(activityType === "buy") {
						holdings[activityAssetID].holdingAssetAmount += activityAssetAmount;
					} else if(activityType === "transfer") {
						if(activityFromAndTo.match(/(\+)/gi)) {
							holdings[activityAssetID].holdingAssetAmount += activityAssetAmount;
						} else if(activityFromAndTo.match(/\-/gi)) {
							holdings[activityAssetID].holdingAssetAmount -= activityAssetAmount;
						}
					}
				}

				resolve({ holdingsData:holdings, activityData:activityData });
			} catch(error) {
				console.log(error);
				reject(error);
			}
		});
	}

	// Loops over the user's stock holdings and fetches their historical market data.
	function fetchHoldingsStocksHistoricalData(days: any, ids: any = null, symbols: any = null) {
		return new Promise(async (resolve, reject) => {
			try {
				let settings: any = store.getState().settings.settings;

				let currency = settings.currency;

				let prices: any = {};
				let parsedData: any = await parseActivityAsHoldings();
				parsedData.activityData = filterActivitiesByType(parsedData.activityData).stocks;
				let holdings = filterHoldingsByType(parsedData.holdingsData).stocks;

				let assetIDs = Object.keys(holdings);
				let assetSymbols: any = [];
			
				assetIDs.map((id: any) => {
					assetSymbols.push(holdings[id].holdingAssetSymbol.toUpperCase());
				});

				if(!Utils.empty(ids)) {
					assetIDs = ids;
				} else {
					resolve({});
					return;
				}

				if(!Utils.empty(symbols)) {
					assetSymbols = symbols;
				} else {
					resolve({});
					return;
				}

				let cancelled = false;

				for(let i = 0; i < assetSymbols.length; i++) {
					setTimeout(async () => {
						if(!cancelled) {
							setLoading(true);
							setLoadingText(`Getting Stocks Data... (${i + 1}/${assetSymbols.length})`);

							let assetID = "stock-" + assetSymbols[i];

							let request: any = await Stock.fetchStockHistorical(currency, assetSymbols[i]);

							if("error" in request) {
								resolve({ error:request.error });
								setLoading(false);
								cancelled = true;
								return;
							}

							let historicalData = request?.data?.historicalData?.chart?.result[0];

							prices[assetID] = Stock.parseStockHistoricalDataAsCrypto(days, historicalData);

							if(Object.keys(prices).length === assetIDs.length) {
								resolve({ assetIDs:assetIDs, prices:prices, holdings:holdings, activities:parsedData.activityData });
							}
						}
					}, i * 2000);
				}
			} catch(error) {
				console.log(error);
				reject(error);
			}
		});
	}

	// Loops over the user's crypto holdings and fetches their historical market data.
	function fetchHoldingsCryptoHistoricalData(ids: any = null) {
		return new Promise(async (resolve, reject) => {
			try {
				let settings: any = store.getState().settings.settings;

				let userID = await AsyncStorage.getItem("userID");
				let token = await AsyncStorage.getItem("token");
				let api = await AsyncStorage.getItem("api");

				let requests = new Requests(api);

				let currency = settings.currency;

				let prices: any = {};
				let parsedData: any = await parseActivityAsHoldings();
				parsedData.activityData = filterActivitiesByType(parsedData.activityData).crypto;
				let holdings = filterHoldingsByType(parsedData.holdingsData).crypto;

				let coinIDs: any = Object.keys(holdings);
				if(!Utils.empty(ids)) {
					coinIDs = ids;
				}

				for(let i = 0; i < coinIDs.length; i++) {
					setTimeout(async () => {
						setLoading(true);
						setLoadingText(`Getting Crypto Data... (${i + 1}/${coinIDs.length})`);

						let holding = holdings[coinIDs[i]];

						let request = await requests.readCoin(token, userID, coinIDs[i], holding.holdingAssetSymbol, currency);

						let historicalData = request?.data?.readCoin?.data;

						if(Utils.validJSON(historicalData)) {
							historicalData = JSON.parse(historicalData)?.historicalData?.prices;
							prices[coinIDs[i]] = historicalData;
						}

						if(Object.keys(prices).length === coinIDs.length) {
							setLoading(false);
							resolve({ coinIDs:coinIDs, prices:prices, holdings:holdings, activities:parsedData.activityData });
						}
					}, i * 2000);
				}
			} catch(error) {
				console.log(error);
				reject(error);
			}
		});
	}

	// Gets the user's holding data on the earliest activity date.
	function getInitialDatedValue(activities: any, futureDays: any) {
		let transactionIDs = Object.keys(activities);

		let firstActivity = activities[transactionIDs[0]];
		let firstDate = new Date(Date.parse(firstActivity.activityDate));

		let days = Utils.dayRangeArray(firstDate, Utils.addDays(Utils.previousYear(new Date()), 1));

		let dates: any = { [days[0]]:{ holdings:{} }};

		for(let i = 0; i < days.length; i++) {
			let day = days[i];

			if(i - 1 >= 0) {
				let previous = JSON.parse(JSON.stringify(dates[days[i - 1]]));
				dates[day] = previous;
			}

			for(let j = 0; j < transactionIDs.length; j++) {
				let txID = transactionIDs[j];
				let activity = activities[txID];

				let activityType = activity.activityType;
				let activityFromAndTo = activity.activityFrom + activity.activityTo;

				let activityDate = Utils.formatDateHyphenated(new Date(Date.parse(activity.activityDate)));

				if(day === activityDate) {
					let assetID = activity.activityAssetID;
					let amount = parseFloat(activity.activityAssetAmount);

					if(!(assetID in dates[day].holdings)) {
						dates[day].holdings[assetID] = { 
							amount: amount, 
							symbol: activity.activityAssetSymbol,
							holdingAssetType: activity.activityAssetType 
						};
						continue;
					}

					if(activityType === "sell") {
						subtract();
					} else if(activityType === "buy") {
						add();
					} else if(activityType === "transfer") {
						if(activityFromAndTo.match(/(\+)/gi)) {
							add();
						} else if(activityFromAndTo.match(/\-/gi)) {
							subtract();
						}
					}

					function add() {
						dates[day].holdings[assetID].amount += amount;
					}

					function subtract() {
						dates[day].holdings[assetID].amount -= amount;
					}
				}
			}
		}

		let last = dates[futureDays[0]]

		return last;
	}

	// Loops over every day of the past year (or since the first activity's date), and determines which assets the user had on each day, and how much they were worth on said day.
	function parseActivityAsDatedValue(days: any, prices: any, activities: any) {
		return new Promise(async (resolve, reject) => {
			try {
				let settings: any = store.getState().settings.settings;

				let dates: any = {
					[days[0]]: {
						holdings: {},
						totalValue: 0,
						modified: false
					}
				};

				let transactionIDs = Object.keys(activities);
			
				// If the first activity was more than a year ago, then activities before then must be taken into account.
				if(new Date(Date.parse(activities[transactionIDs[0]].activityDate)) < Utils.previousYear(new Date())) {
					dates = {
						[days[0]]: {
							...getInitialDatedValue(activities, days),
							totalValue: 0,
							modified: true
						}
					};
				}

				// Loop over days.
				for(let i = 0; i < days.length; i++) {
					let day = days[i];

					// Copy the previous day's data to the current one so it can build up over time to the current day.
					if(i - 1 >= 0) {
						// Object must be copied by value rather than reference, otherwise the content would be the same throughout.
						let previous = JSON.parse(JSON.stringify(dates[days[i - 1]]));
						dates[day] = previous;
					}

					// Loop over activities in case there's one on the day being looped over.
					for(let j = 0; j < transactionIDs.length; j++) {
						let txID = transactionIDs[j];
						let activity = activities[txID];

						let activityType = activity.activityType;
						let activityFromAndTo = activity.activityFrom + activity.activityTo;

						// Format the activity's date to be the same as the ones stored in the "dates" object.
						let activityDate = Utils.formatDateHyphenated(new Date(Date.parse(activity.activityDate)));

						// To prevent activities outside the desired date range from being added.
						if(day === activityDate) {
							let assetID = activity.activityAssetID;
							let amount = parseFloat(activity.activityAssetAmount);
							let price = prices[assetID][i][1];

							if(!Utils.empty(activity.activityPrice) && parseFloat(activity.activityPrice) > 0) {
								price = parseFloat(activity.activityPrice);
							}

							let value = parseFloat((price * amount).toFixed(3));

							// If the asset doesn't already exist, then its values are set directly instead of being incremented or decremented.
							if(!(assetID in dates[day].holdings)) {
								dates[day].holdings[assetID] = {
									amount: amount,
									value: value,
									price: price,
									symbol: activity.activityAssetSymbol,
									holdingAssetType: activity.activityAssetType
								};

								dates[day].modified = true;

								continue;
							}

							if(activityType === "sell") {
								subtract();
							} else if(activityType === "buy") {
								add();
							} else if(activityType === "transfer") {
								if(activityFromAndTo.match(/(\+)/gi)) {
									add();
								} else if(activityFromAndTo.match(/\-/gi)) {
									subtract();
								}
							}

							function add() {
								dates[day].holdings[assetID].amount += amount;
								dates[day].modified = true;
							}

							function subtract() {
								dates[day].holdings[assetID].amount -= amount;
								dates[day].modified = true;
							}
						}
					}

					// Update the total value on each date.
					let ids = Object.keys(dates[day].holdings);
					let total = 0;
					for(let j = 0; j < ids.length; j++) {
						let id = ids[j];
						let price = prices[id][i][1];
						let value = dates[day].holdings[id].amount * price;
						dates[day].holdings[id].value = value;
						total += value;
					}

					dates[day].totalValue = total;
				}

				// If the current day's data isn't found in the "dates" object, then the current prices are fetched, and the data is added.
				let today = Utils.formatDateHyphenated(new Date());
				if(!(today in dates)) {
					let currency = settings.currency;

					// Get yesterday's holdings.
					let keys = Object.keys(dates);
					let previous = dates[keys[keys.length - 1]];

					// Set the initial value of today's holdings to that of yesterday's.
					dates[today] = JSON.parse(JSON.stringify(previous));
					dates[today].totalValue = 0;

					// Get today's holdings.
					let holdingsToday = dates[today].holdings;

					let filtered = filterHoldingsByType(holdingsToday);

					let idsCrypto = Object.keys(filtered.crypto);

					if(!Utils.empty(idsCrypto)) {
						// Get crypto market data for today's holdings.
						let marketData = await cryptoAPI.getMarketByID(currency, idsCrypto.join(","));
						let currentPrices = sortMarketDataByCoinID(marketData);

						Object.keys(filtered.crypto).map(assetID => {
							let amount = dates[today].holdings[assetID].amount;
							let value = amount * currentPrices[assetID].current_price;

							dates[today].holdings[assetID].value = value;
							dates[today].totalValue += value;
						});
					}

					let idsStocks = Object.keys(filtered.stocks);

					if(!Utils.empty(idsStocks)) {
						let symbolsStock: any = [];
						idsStocks.map(assetID => {
							symbolsStock.push(filtered.stocks[assetID].symbol.toUpperCase());
						});

						// Get stock market data for today's holdings.
						let priceData = await Stock.fetchStockPrice(currency, symbolsStock);

						idsStocks.map(assetID => {
							let symbol = assetID.replace("stock-", "").toUpperCase();
							let amount = dates[today].holdings[assetID].amount;
							let value = amount * priceData[symbol].priceData.price;

							dates[today].holdings[assetID].value = value;
							dates[today].totalValue += value;
						});
					}
				}

				resolve(dates);
			} catch(error) {
				console.log(error);
				Utils.notify(theme, "Something went wrong... - EM59");
				reject(error);
			}
		});
	}

	// Initially, when the days of the past year (or since the first activity's date) are generated, they have a property called "modified" that is set to false. When the data of each day is updated, their "modified" property is set to true. Days with no data would not be modified, and are therefore removed from the chart data to avoid missing data.
	function filterHoldingsPerformanceData(dates: any) {
		Object.keys(dates).map(date => {
			let day = dates[date];
			if(!day.modified) {
				delete dates[date];
			}
		});

		return dates;
	}

	// Generates holdings chart data.
	function parseHoldingsDateData(data: any) {
		let monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

		let labels: any = [];
		let tooltips: any = [];
		let values: any = [];
		let months: any = [];

		let dates = Object.keys(data);

		let day = 0;

		dates.map((date: any) => {
			let dateObject = new Date(Date.parse(date));

			labels.push(dateObject);
			tooltips.push(Utils.formatDateHuman(new Date(Date.parse(date))));
			values.push(data[date].totalValue);

			let month = dateObject.getMonth();
			let monthName = monthNames[month];

			let lastMonth = months.slice(day - 31, day);
			if(day - 31 < 0) {
				lastMonth = months.slice(0, day);
			}

			if(!lastMonth.includes(monthName)) {
				months.push(monthName);
			} else {
				months.push("");
			}

			day++;
		});

		return { labels:labels, tooltips:tooltips, values:values, months:months };
	}

	// Returns all activities with a given asset ID.
	function filterActivitiesByAssetID(activities: any, assetID: any) {
		Object.keys(activities).map(txID => {
			if(activities[txID].activityAssetID !== assetID) {
				delete activities[txID];
			}
		});

		return activities;
	}
}

// The crypto market data is initially indexed using numbers. This function indexes each coin's data using its symbol.
export function sortMarketDataByCoinID(marketData: any) {
	let prices: any = {};

	Object.keys(marketData).map(index => {
		let coin = marketData[index];
		prices[coin.id] = coin;
	});

	return prices;
}

// Checks whether or not an asset is in the user's holdings.
export async function assetHoldingExists(id: string) {
	let userID = await AsyncStorage.getItem("userID");
	let token = await AsyncStorage.getItem("token");
	let key = await AsyncStorage.getItem("key") || "";
	let api = await AsyncStorage.getItem("api");

	return new Promise(async (resolve, reject) => {
		try {
			let requests = new Requests(api);
			let holdings = await requests.readHolding(token, userID);

			if(Utils.empty(holdings) || holdings?.data?.readHolding.length === 0) {
				resolve({ exists:false });
			} else {
				let encrypted = holdings?.data?.readHolding;

				Object.keys(encrypted).map(index => {
					let decrypted = Utils.decryptObjectValues(key, encrypted[index]);

					if(decrypted.holdingAssetID === id) {
						resolve({ exists:true, holdingID:encrypted[index].holdingID });
						return;
					}
				});

				resolve({ exists:false });
			}
		} catch(error) {
			console.log(error);
			reject(error);
		}
	});
}