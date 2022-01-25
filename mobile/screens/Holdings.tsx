import { useFocusEffect } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import { FlatList, Image, ImageBackground, ScrollView, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Utils from "../utils/Utils";
import { SafeAreaView } from "react-native-safe-area-context";
import styles from "../styles/Holdings";
import { useDispatch, useSelector } from "react-redux";
import LinearGradient from "react-native-linear-gradient";
import { Colors } from "../styles/Global";
import { TouchableOpacity } from "react-native-gesture-handler";
import Requests, { cryptoAPI } from "../utils/Requests";
import { fetchActivity } from "./Activity";
import store from "../store/store";

export default function Holdings({ navigation }: any) {
	const dispatch = useDispatch();
	const { theme } = useSelector((state: any) => state.theme);
	const { settings } = useSelector((state: any) => state.settings);

	const [loading, setLoading] = useState<boolean>(false);

	const [popup, setPopup] = useState<boolean>(false);
	const [popupContent, setPopupContent] = useState<any>(null);

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
			<TouchableOpacity onPress={() => showModal(info.coinID, info.symbol, info.price, info)} style={[styles.itemCard, styles[`itemCard${theme}`]]}>
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
						<Text style={[styles.itemText, styles[`itemText${theme}`]]} numberOfLines={1} ellipsizeMode="tail">Amount: {info.amount}</Text>
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
					<TouchableOpacity>
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
					<TouchableOpacity style={[styles.button, styles.actionButton, styles[`actionButton${theme}`]]}>
						<Text style={[styles.actionText, styles[`actionText${theme}`]]}>Add Crypto</Text>
					</TouchableOpacity>
					<TouchableOpacity style={[styles.button, styles.actionButton, styles[`actionButton${theme}`]]}>
						<Text style={[styles.actionText, styles[`actionText${theme}`]]}>Add Stock</Text>
					</TouchableOpacity>
				</View>
			</SafeAreaView>
		</ImageBackground>
	);

	function showPopup() {

	}

	function hidePopup() {

	}

	function showModal(assetID: string, assetSymbol: string, currentPrice: number, info: any) {

	}

	function hideModal() {

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

				// TODO: Add message about no holdings being found.
				if(Utils.empty(holdings?.data?.readHolding)) {
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

				// TODO: Add message about no activities being found.
				if(Utils.empty(holdingsData)) {
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

				let amount = parseFloat(holding.holdingAssetAmount);
				let value = parseFloat((amount * price).toFixed(2));

				if(amount <= 0) {
					continue;
				}

				let info = { coinID:coinID, price:price, icon:icon, priceChangeDay:priceChangeDay, name:name, symbol:symbol, rank:rank, holding:holding, amount:amount, value:value };

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
}