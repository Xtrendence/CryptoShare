import { useFocusEffect } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import { FlatList, Image, ImageBackground, Keyboard, Linking, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
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
import CryptoFinder from "../utils/CryptoFinder";
import MatchList from "../components/MatchList";
import store from "../store/store";
import Item from "../components/MarketItem";

export default function Market({ navigation }: any) {
	const dispatch = useDispatch();
	const { theme } = useSelector((state: any) => state.theme);
	const { settings } = useSelector((state: any) => state.settings);

	const [loading, setLoading] = useState<boolean>(false);

	const [popup, setPopup] = useState<boolean>(false);
	const [popupContent, setPopupContent] = useState<any>(null);

	const [symbol, setSymbol] = useState<string>("");
	const [type, setType] = useState<string>("crypto");

	const [modal, setModal] = useState<boolean>(false);
	const [modalInfo, setModalInfo] = useState<any>(null);
	const [modalDescription, setModalDescription] = useState<string>("");

	const labelsRef = useRef<any>(null);

	const [chartLabels, setChartLabels] = useState<any>();
	const [chartVerticalLabels, setChartVerticalLabels] = useState<any>([]);
	const [chartData, setChartData] = useState<any>();
	const [chartSegments, setChartSegments] = useState<any>(1);

	const [marketRowsCrypto, setMarketRowsCrypto] = useState<any>({});

	const renderItem = ({ item }: any) => {
		let info = marketRowsCrypto[item];

		return (
			<Item info={info} showModal={showModal} theme={theme} settings={settings}/>
		);
	}
	
	useFocusEffect(Utils.backHandler(navigation));

	useEffect(() => {
		navigation.addListener("focus", () => {
			if(navigation.isFocused()) {
				setTimeout(() => {
					populateMarketListCrypto();
				}, 500);
			}
		});
		
		let refresh = setInterval(() => {
			if(navigation.isFocused()) {
				populateMarketListCrypto();
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
				<View style={[styles.areaSearchWrapper, styles[`areaSearchWrapper${theme}`]]}>
					<TextInput
						placeholder="Symbol..." 
						selectionColor={Colors[theme].mainContrast} 
						placeholderTextColor={Colors[theme].mainContrastDarker} 
						style={[styles.inputSearch, styles[`inputSearch${theme}`]]} 
						onChangeText={(value) => setSymbol(value)}
						value={symbol}
					/>
					<TouchableOpacity 
						onPress={() => { 
							if(!Utils.empty(symbol)) { 
								searchMarket({ symbol:symbol })
							}
						}} 
						style={[styles.button, styles.buttonSearch, styles[`buttonSearch${theme}`]]}
					>
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
					<TouchableOpacity onPress={() => showGlobal()} style={[styles.button, styles.iconButton, styles[`iconButton`]]}>
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
						<View style={[styles.modalSection, styles[`modalSection${theme}`]]}>
							{ !Utils.empty(modalInfo) &&
								<View style={styles.modalInfoWrapper}>
									<Text style={[styles.modalInfo, styles[`modalInfo${theme}`]]}>
										Name: {modalInfo.name} ({modalInfo.symbol.toUpperCase()})
									</Text>
									<Text style={[styles.modalInfo, styles[`modalInfo${theme}`]]}>
										Rank: #{modalInfo.rank}
									</Text>
									<Text style={[styles.modalInfo, styles[`modalInfo${theme}`]]}>
										Market Cap: {Utils.currencySymbols[settings.currency] + Utils.separateThousands(modalInfo.marketCap)}
									</Text>
									<Text style={[styles.modalInfo, styles[`modalInfo${theme}`]]}>
										Volume: {Utils.currencySymbols[settings.currency] + Utils.separateThousands(modalInfo.volume)}
									</Text>
									<Text style={[styles.modalInfo, styles[`modalInfo${theme}`]]}>
										Supply: {Utils.separateThousands(modalInfo.supply)}
									</Text>
									<Text style={[styles.modalInfo, styles[`modalInfo${theme}`]]}>
										ATH: {Utils.currencySymbols[settings.currency] + Utils.separateThousands(modalInfo.ath)}
									</Text>
									<Text style={[styles.modalInfo, styles[`modalInfo${theme}`]]}>
										ATH Change: {modalInfo.athChange}%
									</Text>
									<Text style={[styles.modalInfo, styles[`modalInfo${theme}`]]}>
										24h High: {Utils.currencySymbols[settings.currency] + Utils.separateThousands(modalInfo.high24h)}
									</Text>
									<Text style={[styles.modalInfo, styles[`modalInfo${theme}`]]}>
										24h Low: {Utils.currencySymbols[settings.currency] + Utils.separateThousands(modalInfo.low24h)}
									</Text>
									<Text style={[styles.modalInfo, styles[`modalInfo${theme}`]]}>
										24h Change: {modalInfo.priceChangeDay}%
									</Text>
								</View>
							}
						</View>
						<View style={[styles.modalSection, styles[`modalSection${theme}`]]}>
							<HTML 
								renderersProps={{
									a: {
										onPress(event: any, url: any, htmlAttribs: any, target: any) {
											Linking.openURL(url);
										}
									}
								}}
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

	async function showGlobal() {
		try {
			let settings: any = store.getState().settings.settings;
			
			setLoading(true);

			let data = await cryptoAPI.getGlobal();

			let volume = parseFloat(data.data.total_volume[settings.currency].toFixed(0));
			let marketCap = parseFloat(data.data.total_market_cap[settings.currency].toFixed(0));
			let marketCapChangeDay = Utils.formatPercentage(data.data.market_cap_change_percentage_24h_usd);

			let content = () => {
				return (
					<View style={styles.popupContent}>
						<View style={[styles.modalSection, styles[`modalSection${theme}`], { backgroundColor:Colors[theme].mainThird }]}>
							<Text style={[styles.modalInfo, styles[`modalInfo${theme}`]]}>Global Market Data</Text>
						</View>
						<View style={[styles.modalSection, styles[`modalSection${theme}`], { backgroundColor:Colors[theme].mainThird }]}>
							<Text style={[styles.modalInfo, styles[`modalInfo${theme}`]]}>Volume: {Utils.currencySymbols[settings.currency] + Utils.separateThousands(volume)}</Text>
							<Text style={[styles.modalInfo, styles[`modalInfo${theme}`]]}>Market Cap: {Utils.currencySymbols[settings.currency] + Utils.separateThousands(marketCap)}</Text>
							<Text style={[styles.modalInfo, styles[`modalInfo${theme}`]]}>24 Change: {marketCapChangeDay}%</Text>
						</View>
						<TouchableOpacity onPress={() => hidePopup()} style={[styles.button, styles.choiceButton, styles[`choiceButton${theme}`]]}>
							<Text style={[styles.choiceText, styles[`choiceText${theme}`]]}>Dismiss</Text>
						</TouchableOpacity>
					</View>
				);
			};

			showPopup(content);
			setLoading(false);
		} catch(error) {
			setLoading(false);
			console.log(error);
			Utils.notify(theme, "Something went wrong...");
		}
	}

	function hidePopup() {
		Keyboard.dismiss();
		setPopup(false);
		setPopupContent(null);
	}

	function showPopup(content: any) {
		Keyboard.dismiss();
		setPopup(true);
		setPopupContent(content);
	}

	function selectMatch(id: string) {
		hidePopup();
		searchMarket({ id:id });
	}

	async function searchMarket(args: any) {
		try {
			let settings: any = store.getState().settings.settings;

			setLoading(true);

			setSymbol("");

			let assetSymbol: string;
			let asset: any;

			if("symbol" in args) {
				assetSymbol = args.symbol.toLowerCase();
				asset = await CryptoFinder.getCoin({ symbol:assetSymbol });
			} else {
				asset = await CryptoFinder.getCoin({ id:args.id });
				assetSymbol = asset.symbol;
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

			let coinID = asset.id;

			let data: any = await cryptoAPI.getCoinData(coinID);

			let marketData = data?.market_data;
			
			let rank = data?.market_cap_rank;
			let price = marketData?.current_price[settings.currency];
			let icon = data?.image;
			let marketCap = marketData?.market_cap[settings.currency];
			let priceChangeDay = Utils.formatPercentage(marketData?.market_cap_change_percentage_24h);
			let athChange = Utils.formatPercentage(marketData?.ath_change_percentage[settings.currency]);
			let ath = marketData?.ath[settings.currency];
			let high24h = marketData?.high_24h[settings.currency];
			let low24h = marketData?.low_24h[settings.currency];
			let volume = marketData?.total_volume[settings.currency];
			let supply = marketData?.circulating_supply;
			let name = data?.name;
			let symbol = data?.symbol;
	
			let info = { coinID:coinID, currency:settings.currency, icon:icon, marketCap:marketCap, price:price, ath:ath, priceChangeDay:priceChangeDay, athChange:athChange, high24h:high24h, low24h:low24h, volume:volume, supply:supply, name:name, symbol:symbol, rank:rank };

			showModal(coinID, symbol, price, info);
		} catch(error) {
			setLoading(false);
			console.log(error);
			Utils.notify(theme, "Something went wrong...");
		}
	}

	async function showModal(assetID: string, assetSymbol: string, currentPrice: number, info: any) {
		Keyboard.dismiss();

		try {
			let settings: any = store.getState().settings.settings;

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

			setModalInfo(info);
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
		Keyboard.dismiss();
		labelsRef.current = [];
		setChartVerticalLabels([]);
		setChartLabels(null);
		setChartData(null);
		setChartSegments(1);
		setModalDescription("");
		setModalInfo(null);
		setModal(false);
	}

	function changeType(type: string) {
		setType(type);
	}

	async function populateMarketListCrypto() {
		try {
			let settings: any = store.getState().settings.settings;

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
}