import { useFocusEffect } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import { FlatList, Image, ImageBackground, Keyboard, Modal, ScrollView, Text, TextInput, View, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Utils from "../utils/Utils";
import { SafeAreaView } from "react-native-safe-area-context";
import styles, { gradientColor } from "../styles/Holdings";
import { useDispatch, useSelector } from "react-redux";
import LinearGradient from "react-native-linear-gradient";
import { Colors } from "../styles/Global";
import Requests, { cryptoAPI } from "../utils/Requests";
import { fetchActivity } from "./Activity";
import store from "../store/store";
import Loading from "../components/Loading";
import { screenWidth } from "../styles/NavigationBar";
import Chart from "../components/Charts/Chart";
import CryptoFinder from "../utils/CryptoFinder";
import MatchList from "../components/MatchList";

export default function Holdings({ navigation }: any) {
	const dispatch = useDispatch();
	const { theme } = useSelector((state: any) => state.theme);
	const { settings } = useSelector((state: any) => state.settings);

	const [loading, setLoading] = useState<boolean>(false);

	const [popup, setPopup] = useState<boolean>(false);
	const [popupContent, setPopupContent] = useState<any>(null);

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
	const [holdingsTotalValue, setHoldingsTotalValue] = useState<string>("-");

	const Item = ({ info }: any) => {
		return (
			<TouchableOpacity 
				onPress={() => {
					let settings: any = store.getState().settings.settings;
					if(settings.transactionsAffectHoldings === "enabled") {
						showHoldingChart(info);
					} else {
						showHoldingPopup("crypto", "updateHolding", info);
					}
				}}
				style={[styles.itemCard, styles[`itemCard${theme}`]]}
			>
				<View style={styles.itemTop}>
					<View style={[styles.itemIconWrapper, settings.assetIconBackdrop === "enabled" ? styles.itemIconWrapperBackdrop : null]}>
						<Image source={{ uri:info.icon }} style={styles.itemIcon}/>
					</View>
					<Text style={[styles.itemText, styles.itemTextName, styles[`itemTextName${theme}`]]} numberOfLines={1} ellipsizeMode="tail">{info.name} ({info.symbol.toUpperCase()})</Text>
				</View>
				<View style={styles.itemBottom}>
					<ScrollView style={[styles.itemScrollView]} contentContainerStyle={styles.itemScrollViewContent} horizontal={true} showsHorizontalScrollIndicator={true} showsVerticalScrollIndicator={false} nestedScrollEnabled={true}>
						<Text style={[styles.itemText, styles[`itemText${theme}`], styles.itemTextRank, styles[`itemTextRank${theme}`]]} numberOfLines={1} ellipsizeMode="tail">#{info.rank}</Text>
						<Text style={[styles.itemText, styles[`itemText${theme}`]]} numberOfLines={1} ellipsizeMode="tail">24h: {info.priceChangeDay}%</Text>
						<Text style={[styles.itemText, styles[`itemText${theme}`]]} numberOfLines={1} ellipsizeMode="tail">Price: {Utils.currencySymbols[settings.currency] + Utils.separateThousands(info.price)}</Text>
					</ScrollView>
					<ScrollView style={[styles.itemScrollView, { marginBottom:10 }]} contentContainerStyle={styles.itemScrollViewContent} horizontal={true} showsHorizontalScrollIndicator={true} showsVerticalScrollIndicator={false} nestedScrollEnabled={true}>
						<Text style={[styles.itemText, styles[`itemText${theme}`]]} numberOfLines={1} ellipsizeMode="tail">Value: {Utils.currencySymbols[settings.currency] + Utils.separateThousands(info.value)}</Text>
						<Text style={[styles.itemText, styles[`itemText${theme}`]]} numberOfLines={1} ellipsizeMode="tail">Amount: {Utils.separateThousands(info.amount)}</Text>
					</ScrollView>
				</View>
			</TouchableOpacity>
		);
	}

	const renderItem = ({ item }: any) => {
		let info = holdingsRows[item];

		return (
			<Item info={info}/>
		);
	}
	
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
		<ImageBackground source={Utils.getBackground(theme)} resizeMethod="scale" resizeMode="cover">
			<SafeAreaView style={styles.area}>
				<View style={[styles.areaCardWrapper, styles[`areaCardWrapper${theme}`]]}>
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
					keyExtractor={item => holdingsRows[item].coinID}
					style={[styles.wrapper, styles[`wrapper${theme}`]]
				}/>
				<View style={[styles.areaActionsWrapper, styles[`areaActionsWrapper${theme}`]]}>
					<TouchableOpacity onPress={() => showHoldingPopup("crypto", "createHolding", undefined)} style={[styles.button, styles.actionButton, styles[`actionButton${theme}`]]}>
						<Text style={[styles.actionText, styles[`actionText${theme}`]]}>Add Crypto</Text>
					</TouchableOpacity>
					<TouchableOpacity style={[styles.button, styles.actionButton, styles[`actionButton${theme}`]]}>
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
					<TouchableOpacity onPress={() => hidePopup()} style={styles.popupBackground}></TouchableOpacity>
					<View style={styles.popupForeground}>
						<View style={[styles.popupWrapper, styles[`popupWrapper${theme}`]]}>{popupContent}</View>
					</View>
				</View>
			</Modal>
			<Loading active={loading} theme={theme} opaque={true}/>
		</ImageBackground>
	);

	function selectMatch(id: string) {
		hidePopup();
		let data = popupRef.current;
		createHolding(parseFloat(data.assetAmount), data.assetType, { id:id });
	}

	async function createHolding(holdingAssetAmount: number, holdingAssetType: string, args: any) {
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

			let userID = await AsyncStorage.getItem("userID");
			let token = await AsyncStorage.getItem("token");
			let key = await AsyncStorage.getItem("key") || "";
			let api = await AsyncStorage.getItem("api");

			let requests = new Requests(api);

			let exists: any = await cryptoHoldingExists(asset.id);

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

			populateHoldingsList();

			setLoading(false);
		} catch(error) {
			setLoading(false);
			console.log(error);
			Utils.notify(theme, "Something went wrong...");
		}
	}

	async function deleteHolding(holdingID: number) {
		try {
			setLoading(true);

			let userID = await AsyncStorage.getItem("userID");
			let token = await AsyncStorage.getItem("token");
			let api = await AsyncStorage.getItem("api");

			let requests = new Requests(api);
			await requests.deleteHolding(token, userID, holdingID);

			populateHoldingsList();

			setLoading(false);
		} catch(error) {
			setLoading(false);
			console.log(error);
			Utils.notify(theme, "Something went wrong...");
		}
	}

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

			populateHoldingsList();

			setLoading(false);
		} catch(error) {
			setLoading(false);
			console.log(error);
			Utils.notify(theme, "Something went wrong...");
		}
	}

	function showHoldingPopup(assetType: string, action: string, info: any = {}) {
		popupRef.current.assetID = info.coinID;
		popupRef.current.assetSymbol = info.symbol;
		popupRef.current.assetAmount = info.amount;
		popupRef.current.assetType = assetType;
		popupRef.current.holdingID = info.holdingID;

		let content = () => {
			return (
				<View style={styles.popupContent}>
					<View style={[styles.modalSection, styles[`modalSection${theme}`], { backgroundColor:Colors[theme].mainThird }]}>
						<Text style={[styles.modalInfo, styles[`modalInfo${theme}`]]}>
							{ action === "createHolding" ? "Add Asset" : `Update Asset (${info.symbol.toUpperCase()})` }
						</Text>
					</View>
					<View style={[styles.modalSection, styles[`modalSection${theme}`], { backgroundColor:Colors[theme].mainThird }]}>
						{ action === "createHolding" &&
							<TextInput 
								autoCorrect={false}
								autoCapitalize="characters"
								placeholder="Symbol..." 
								selectionColor={Colors[theme].mainContrast} 
								placeholderTextColor={Colors[theme].mainContrastDarker} 
								style={[styles.popupInput, styles[`popupInput${theme}`]]} 
								onChangeText={(value) => popupRef.current.assetSymbol = value}
							/>
						}
						<TextInput 
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

	function processAction(action: string) {
		try {
			let data = popupRef.current;

			switch(action) {
				case "createHolding":
					createHolding(parseFloat(data.assetAmount), data.assetType, { symbol:data.assetSymbol });
					break;
				case "updateHolding":
					updateHolding(data.holdingID, data.assetID, data.assetSymbol, data.assetAmount, data.assetType);
					break;
				case "deleteHolding":
					deleteHolding(data.holdingID);
					break;
			}
			
			hidePopup();
		} catch(error) {
			console.log(error);
			Utils.notify(theme, "Something went wrong...");
		}
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

	async function showPortfolioChart() {
		let days = Utils.dayRangeArray(Utils.previousYear(new Date()), new Date());

		let data: any = await fetchHoldingsHistoricalData(undefined);

		let prices = data.prices;
		let activities = data.activities;

		setLoading(true);

		let dates = await parseActivityAsDatedValue(days, prices, activities);

		showModal(dates, undefined);
	}

	async function showHoldingChart(info: any) {
		try {
			let days = Utils.dayRangeArray(Utils.previousYear(new Date()), new Date());

			let data: any = await fetchHoldingsHistoricalData([info.coinID]);

			let prices = data.prices;
			let activities = filterActivitiesByAssetID(data.activities, info.coinID);

			setLoading(true);

			let dates = await parseActivityAsDatedValue(days, prices, activities);

			showModal(dates, { symbol:info.symbol });
		} catch(error) {
			setLoading(false);
			console.log(error);
			Utils.notify(theme, "Something went wrong...");
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
			Utils.notify(theme, "Something went wrong...");
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

	async function populateHoldingsList() {
		try {
			let settings: any = store.getState().settings.settings;

			let userID = await AsyncStorage.getItem("userID");
			let token = await AsyncStorage.getItem("token");
			let key = await AsyncStorage.getItem("key") || "";
			let api = await AsyncStorage.getItem("api");

			let currency = settings.currency;

			let holdingsData: any = {};

			let requests = new Requests(api);
			
			if(settings.transactionsAffectHoldings === "disabled") {
				let holdings = await requests.readHolding(token, userID);

				if(Utils.empty(holdings?.data?.readHolding)) {
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
				holdingsData = parsedData.holdingsData;

				if(Utils.empty(holdingsData)) {
					setHoldingsRows({});
					setHoldingsTotalValue(Utils.currencySymbols[settings.currency] + "0");
					return;
				}
			}

			let ids = Object.keys(holdingsData);

			let marketData = await cryptoAPI.getMarketByID(currency, ids.join(","));

			let sortedHoldingsData = sortHoldingsDataByValue(holdingsData, marketData);

			holdingsData = sortedHoldingsData.holdingsData;

			let parsed = createHoldingsListCryptoRows(marketData, holdingsData, sortedHoldingsData.order, currency);

			let rows = parsed.rows;
			let totalValue = parseFloat(parsed.totalValue.toFixed(2));

			setHoldingsRows(rows);
			setHoldingsTotalValue(`${Utils.currencySymbols[currency] + Utils.separateThousands(totalValue)}`);
		} catch(error) {
			console.log(error);
			Utils.notify(theme, "Something went wrong...");
		}
	}

	function createHoldingsListCryptoRows(marketData: any, holdingsData: any, order: any, currency: string) {
		let output: any = { rows:[], totalValue:0 };

		let ids = order;

		marketData = sortMarketDataByCoinID(marketData);

		for(let i = 0; i < ids.length; i++) {
			try {
				let id = ids[i];

				let coin = marketData[id];

				let coinID = coin.id;
				let price = coin.current_price;
				let icon = coin.image;
				let priceChangeDay = Utils.formatPercentage(coin.market_cap_change_percentage_24h);
				let name = coin.name;
				let symbol = coin.symbol;
				let rank = coin.market_cap_rank;

				let holding = holdingsData[coinID];

				let holdingID = parseFloat(holding.holdingID);
				let amount = parseFloat(holding.holdingAssetAmount);
				let value = parseFloat((amount * price).toFixed(2));

				if(amount <= 0) {
					continue;
				}

				let info = { holdingID:holdingID, coinID:coinID, price:price, icon:icon, priceChangeDay:priceChangeDay, name:name, symbol:symbol, rank:rank, holding:holding, amount:amount, value:value };

				output.rows.push(info);

				output.totalValue += value;
			} catch(error) {
				console.log(error);
			}
		}

		return output;
	}

	function sortMarketDataByCoinID(marketData: any) {
		let prices: any = {};

		Object.keys(marketData).map(index => {
			let coin = marketData[index];
			prices[coin.id] = coin;
		});

		return prices;
	}

	function sortHoldingsDataByValue(holdingsData: any, marketData: any) {
		let sorted: any = {};
		let array: any = [];
		let order: any = [];

		marketData = sortMarketDataByCoinID(marketData);

		for(let holding in holdingsData) {
			let value = holdingsData[holding].holdingAssetAmount * marketData[holding].current_price;

			if(value > 0) {
				array.push([holding, value]);
			}
		}

		array.sort(function(a: any, b: any) {
			return a[1] - b[1];
		});

		array.reverse().map((item: any) => {
			order.push(item[0]);
			sorted[item[0]] = holdingsData[item[0]];
		});

		return { holdingsData:sorted, order:order };
	}

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

	async function cryptoHoldingExists(id: string) {
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

	function fetchHoldingsHistoricalData(ids: any = null) {
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
				let holdings: any = parsedData.holdingsData;

				let coinIDs: any = Object.keys(holdings);
				if(!Utils.empty(ids)) {
					coinIDs = ids;
				}

				for(let i = 0; i < coinIDs.length; i++) {
					setTimeout(async () => {
						setLoading(true);

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
						dates[day].holdings[assetID] = { amount:amount };
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

	function parseActivityAsDatedValue(days: any, prices: any, activities: any) {
		return new Promise(async (resolve, reject) => {
			try {
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
							let value = parseFloat((price * amount).toFixed(3));

							// If the asset doesn't already exist, then its values are set directly instead of being incremented or decremented.
							if(!(assetID in dates[day].holdings)) {
								dates[day].holdings[assetID] = {
									amount: amount,
									value: value,
									price: price
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
						let value =  dates[day].holdings[id].amount * price;
						dates[day].holdings[id].value = value;
						total += value;
					}

					dates[day].totalValue = total;
				}

				// If the current day's data isn't found in the "dates" object, then the current prices are fetched, and the data is added.
				let today = Utils.formatDateHyphenated(new Date());
				if(!(today in dates)) {
					let settings: any = store.getState().settings.settings;
					let currency = settings.currency;
					let keys = Object.keys(dates);
					let previous = dates[keys[keys.length - 1]];
					dates[today] = JSON.parse(JSON.stringify(previous));
					dates[today].totalValue = 0;
					let ids = Object.keys(dates[today].holdings);
					let marketData = await cryptoAPI.getMarketByID(currency, ids.join(","));
					let currentPrices = sortMarketDataByCoinID(marketData);
					Object.keys(dates[today].holdings).map(assetID => {
						let amount = dates[today].holdings[assetID].amount;
						let value = amount * currentPrices[assetID].current_price;
						dates[today].holdings[assetID].value = value;
						dates[today].totalValue += value;
					});
				}

				resolve(dates);
			} catch(error) {
				console.log(error);
				Utils.notify(theme, "Something went wrong...");
				reject(error);
			}
		});
	}

	function filterHoldingsPerformanceData(dates: any) {
		Object.keys(dates).map(date => {
			let day = dates[date];
			if(!day.modified) {
				delete dates[date];
			}
		});

		return dates;
	}

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

	function filterActivitiesByAssetID(activities: any, assetID: any) {
		Object.keys(activities).map(txID => {
			if(activities[txID].activityAssetID !== assetID) {
				delete activities[txID];
			}
		});

		return activities;
	}
}