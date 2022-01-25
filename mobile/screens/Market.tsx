import { useFocusEffect } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import { FlatList, Image, ImageBackground, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/FontAwesome5";
import Utils from "../utils/Utils";
import { SafeAreaView } from "react-native-safe-area-context";
import HTML from "react-native-render-html";
import styles, { gradientColor } from "../styles/Market";
import { useDispatch, useSelector } from "react-redux";
import { Colors } from "../styles/Global";
import Requests, { cryptoAPI } from "../utils/Requests";
import Chart from "../components/Charts/Chart";
import { screenWidth } from "../styles/NavigationBar";
import Loading from "../components/Loading";

export default function Market({ navigation }: any) {
	const dispatch = useDispatch();
	const { theme } = useSelector((state: any) => state.theme);
	const { settings } = useSelector((state: any) => state.settings);

	const [loading, setLoading] = useState<boolean>(false);

	const [symbol, setSymbol] = useState<string>("");
	const [type, setType] = useState<string>("crypto");

	const [modal, setModal] = useState<boolean>(false);
	const [modalDescription, setModalDescription] = useState<string>("");

	const labelsRef = useRef<any>(null);

	const [chartLabels, setChartLabels] = useState<any>();
	const [chartVerticalLabels, setChartVerticalLabels] = useState<any>([]);
	const [chartData, setChartData] = useState<any>();
	const [chartSegments, setChartSegments] = useState<any>(1);

	const [firstFetch, setFirstFetch] = useState<boolean>(true);
	const [marketRowsCrypto, setMarketRowsCrypto] = useState<any>({});

	// TODO: Add "onPress" functionality.
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
						<Text style={[styles.itemText, styles[`itemText${theme}`]]} numberOfLines={1} ellipsizeMode="tail">Volume: {Utils.currencySymbols[settings.currency] + Utils.abbreviateNumber(info.volume, 2)}</Text>
					</ScrollView>
					<ScrollView style={[styles.itemScrollView, { marginBottom:10 }]} contentContainerStyle={styles.itemScrollViewContent} horizontal={true} showsHorizontalScrollIndicator={true} showsVerticalScrollIndicator={false} nestedScrollEnabled={true}>
						<Text style={[styles.itemText, styles[`itemText${theme}`]]} numberOfLines={1} ellipsizeMode="tail">Price: {Utils.currencySymbols[settings.currency] + Utils.separateThousands(info.price)}</Text>
						<Text style={[styles.itemText, styles[`itemText${theme}`]]} numberOfLines={1} ellipsizeMode="tail">Market Cap: {Utils.currencySymbols[settings.currency] + Utils.abbreviateNumber(info.marketCap, 2)}</Text>
					</ScrollView>
				</View>
			</TouchableOpacity>
		);
	}

	const renderItem = ({ item }: any) => {
		let info = marketRowsCrypto[item];

		return (
			<Item info={info}/>
		);
	}
	
	useFocusEffect(Utils.backHandler(navigation));

	useEffect(() => {
		if(firstFetch) {
			populateMarketListCrypto();
			setFirstFetch(false);
		}

		navigation.addListener("focus", () => {
			if(navigation.isFocused()) {
				setTimeout(() => {
					if(!firstFetch) {
						populateMarketListCrypto();
					}
				}, 500);
			}
		});
		
		let refresh = setInterval(() => {
			if(navigation.isFocused()) {

			}
		}, 15000);

		return () => {
			setFirstFetch(true);
			setChartVerticalLabels([]);
			labelsRef.current = [];
			clearInterval(refresh);
		};
	}, []);

	return (
		<ImageBackground source={Utils.getBackground(theme)} resizeMethod="scale" resizeMode="cover">
			<SafeAreaView style={styles.area}>
				<View style={[styles.areaSearchWrapper, styles[`areaSearchWrapper${theme}`]]}>
					<TextInput
						placeholder="Symbol..." 
						selectionColor={Colors[theme].mainContrast} 
						placeholderTextColor={Colors[theme].mainContrastDarker} 
						style={[styles.inputSearch, styles[`inputSearch${theme}`]]} 
						onChangeText={(value) => setSymbol(value)}
						value={symbol}
					/>
					<TouchableOpacity style={[styles.button, styles.buttonSearch, styles[`buttonSearch${theme}`]]}>
						<Text style={[styles.searchText, styles[`searchText${theme}`]]}>Search</Text>
					</TouchableOpacity>
				</View>
				{ type === "crypto" &&
					<FlatList
						contentContainerStyle={{ paddingTop:10 }}
						data={Object.keys(marketRowsCrypto)}
						renderItem={renderItem}
						keyExtractor={item => marketRowsCrypto[item].coinID}
						style={[styles.wrapper, styles[`wrapper${theme}`]]
					}/>
				}
				<View style={[styles.areaActionsWrapper, styles[`areaActionsWrapper${theme}`]]}>
					<TouchableOpacity style={[styles.button, styles.iconButton, styles[`iconButton`]]}>
						<Icon
							name="chart-line" 
							size={24} 
							color={Colors[theme].accentContrast}
						/>
					</TouchableOpacity>
					<TouchableOpacity onPress={() => changeType("crypto")} style={[styles.button, styles.choiceButton, styles[`choiceButton${theme}`], type === "crypto" ? styles[`choiceButtonActive${theme}`] : null]}>
						<Text style={[styles.choiceText, styles[`choiceText${theme}`], type === "crypto" ? styles[`choiceTextActive${theme}`] : null]}>Crypto</Text>
					</TouchableOpacity>
					<TouchableOpacity onPress={() => changeType("stocks")} style={[styles.button, styles.choiceButton, styles[`choiceButton${theme}`], type === "stocks" ? styles[`choiceButtonActive${theme}`] : null]}>
						<Text style={[styles.choiceText, styles[`choiceText${theme}`], type === "stocks" ? styles[`choiceTextActive${theme}`] : null]}>Stocks</Text>
					</TouchableOpacity>
				</View>
			</SafeAreaView>
			<Modal style={styles.modal} visible={modal} onRequestClose={hideModal} transparent={true}>
				<View style={[styles.modalOverlay, loading ? { opacity:0 } : null]}></View>
				<View style={[styles.modalWrapper, loading ? { opacity:0 } : null]}>
					<View style={[styles.modalChartWrapper, styles[`modalChartWrapper${theme}`]]}>
						<View style={[styles.modalChartLeft, styles[`modalChartLeft${theme}`]]}>
							{
								sortLabels(chartVerticalLabels).map((label: any) => {
									return (
										<Text key={`label-${chartVerticalLabels.indexOf(label) + Utils.randomBetween(0, 9999999)}`} style={[styles.modalChartText, styles[`modalChartText${theme}`]]}>{Utils.currencySymbols[settings.currency] + Utils.separateThousands(parseFloat(label))}</Text>
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
										decimalPlaces: 2,
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
						<View style={[styles.modalSection, styles[`modalSection${theme}`]]}>
							<HTML 
								contentWidth={screenWidth - 40}
								source={{ html:modalDescription }} 
								tagsStyles={{ 
									a: { 
										color: Colors[theme].Market.accentFirst,
										textDecorationLine: "none",
										fontSize: 16
									}, 
									span: { 
										color: Colors[theme].mainContrast, 
										fontSize: 16 
									}
								}}
							/>
						</View>
					</ScrollView>
				</View>
			</Modal>
			<Loading active={loading} theme={theme} opaque={true}/>
		</ImageBackground>
	);

	async function showModal(assetID: string, assetSymbol: string, currentPrice: number, info: any) {
		try {
			setLoading(true);

			labelsRef.current = [];

			let api = await AsyncStorage.getItem("api");
			let userID = await AsyncStorage.getItem("userID");
			let token = await AsyncStorage.getItem("token");

			let requests = new Requests(api);
			let marketData =  await requests.readCoin(token, userID, assetID, assetSymbol, settings.currency);

			let historicalData = JSON.parse(marketData?.data?.readCoin?.data)?.historicalData;

			let data = parseMarketData(historicalData, new Date().getTime(), currentPrice);

			let months = data.months;
			let prices = data.prices;

			setChartVerticalLabels([]);

			setChartLabels(months);
			setChartData(prices);
			setChartSegments(4);

			let coinData = await cryptoAPI.getCoinData(assetID);
			let description = Utils.empty(coinData?.description?.en) ? "<span>No description found.</span>" : `<span>${coinData?.description?.en}</span>`;

			setModalDescription(description);

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
		labelsRef.current = [];
		setChartVerticalLabels([]);
		setModalDescription("");
		setModal(false);
	}

	function changeType(type: string) {
		setType(type);
	}

	async function populateMarketListCrypto() {
		try {
			let marketData = await cryptoAPI.getMarket(settings.currency, 100, 1);

			let rows: any = {};

			let ids = Object.keys(marketData);

			for(let i = 0; i < 100; i++) {
				try {
					let id = ids[i];
				
					let rank = i + 1;
	
					let coin = marketData[id];
	
					let coinID = coin.id;
					let price = coin.current_price;
					let icon = coin.image;
					let marketCap = coin.market_cap;
					let priceChangeDay = Utils.formatPercentage(coin.market_cap_change_percentage_24h);
					let athChange = Utils.formatPercentage(coin.ath_change_percentage);
					let ath = coin.ath;
					let high24h = coin.high_24h;
					let low24h = coin.low_24h;
					let volume = coin.total_volume;
					let supply = coin.circulating_supply;
					let name = coin.name;
					let symbol = coin.symbol;
	
					let info = { coinID:coinID, currency:settings.currency, icon:icon, marketCap:marketCap, price:price, ath:ath, priceChangeDay:priceChangeDay, athChange:athChange, high24h:high24h, low24h:low24h, volume:volume, supply:supply, name:name, symbol:symbol, rank:rank };

					rows[i] = info;
				} catch(error) {
					console.log(error);
				}
			}

			setMarketRowsCrypto(rows);
		} catch(error) {
			console.log(error);
			Utils.notify(theme, "Something went wrong...");
		}
	}

	function parseMarketData(data: any, currentTime: any, currentPrice: any) {
		let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
		let prices = data.prices;

		prices.push([currentTime, currentPrice]);

		let parsed: any = {
			labels: [],
			tooltips: [],
			prices: [],
			months: []
		};

		Object.keys(prices).map((key: any) => {
			let time = prices[key][0];
			let price = parseFloat(prices[key][1]);

			parsed.labels.push(new Date(time));
			parsed.tooltips.push(Utils.formatDateHuman(new Date(time)));
			parsed.prices.push(price);

			let date = new Date(time);
			let month = date.getMonth();
			let monthName = months[month];

			let lastMonth = parsed.months.slice(key - 31, key);
			if(key - 31 < 0) {
				lastMonth = parsed.months.slice(0, key);
			}

			if(!lastMonth.includes(monthName)) {
				parsed.months.push(monthName);
			} else {
				parsed.months.push("");
			}
		});

		return parsed;
	}

	function sortLabels(labels: any) {
		let floats: any = [];

		labels = labels.slice(-5);

		labels.map((label: any) => {
			floats.push(parseFloat(label));
		});

		floats.sort().reverse();
		
		return floats;
	}
}