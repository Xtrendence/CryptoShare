import React, { useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { FlatList, ImageBackground, Keyboard, Modal, Text, TextInput, ToastAndroid, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/FontAwesome5";
import { useDispatch, useSelector } from "react-redux";
import Loading from "../components/Loading";
import CryptoItem from "../components/MarketItem";
import MarketPopup from "../components/MarketPopup";
import MatchList from "../components/MatchList";
import StockItem from "../components/WatchlistItem";
import store from "../store/store";
import { Colors } from "../styles/Global";
import styles from "../styles/Market";
import CryptoFinder from "../utils/CryptoFinder";
import Requests, { cryptoAPI } from "../utils/Requests";
import Stock from "../utils/Stock";
import Utils from "../utils/Utils";
import { createWatchlistListRows, fetchWatchlist, filterWatchlistByType, getWatchlistSymbols } from "./Dashboard";

// The "Market" page of the app.
export default function Market({ navigation }: any) {
	const dispatch = useDispatch();
	const { theme } = useSelector((state: any) => state.theme);
	const { settings } = useSelector((state: any) => state.settings);

	const alternateBackground = settings?.alternateBackground === "disabled" ? "" : "Alternate";

	const [loading, setLoading] = useState<boolean>(false);

	const [popup, setPopup] = useState<boolean>(false);
	const [popupContent, setPopupContent] = useState<any>(null);

	const [symbol, setSymbol] = useState<string>("");
	const [type, setType] = useState<string>("crypto");

	const [modal, setModal] = useState<boolean>(false);
	const [modalData, setModalData] = useState<any>({});
	const [modalType, setModalType] = useState<string>("");
	const [modalInfo, setModalInfo] = useState<any>(null);
	const [modalDescription, setModalDescription] = useState<string>("");

	const labelsRef = useRef<any>(null);

	const [chartLabels, setChartLabels] = useState<any>();
	const [chartVerticalLabels, setChartVerticalLabels] = useState<any>([]);
	const [chartData, setChartData] = useState<any>();
	const [chartSegments, setChartSegments] = useState<any>(1);

	const [marketRowsCrypto, setMarketRowsCrypto] = useState<any>({});
	const [marketRowsStocks, setMarketRowsStocks] = useState<any>({});
	const [marketHeader, setMarketHeader] = useState<any>(null);

	// Component rendered by the crypto market "FlatList".
	const renderItemCrypto = ({ item }: any) => {
		let info = marketRowsCrypto[item];

		return (
			<CryptoItem info={info} showModal={showModal} theme={theme} settings={settings}/>
		);
	}

	// Component rendered by the stock market "FlatList".
	const renderItemStock = ({ item }: any) => {
		let info = marketRowsStocks[item];

		return (
			<StockItem info={info} theme={theme} settings={settings} page="Market" onPress={() => showModal(info.id, info.symbol.toUpperCase(), info.price, info, info.type)}/>
		);
	}
	
	// Used to handle back button events.
	useFocusEffect(Utils.backHandler(navigation));

	useEffect(() => {
		navigation.addListener("focus", () => {
			if(navigation.isFocused()) {
				setTimeout(() => {
					populateMarketListCrypto();
					populateMarketListStocks();
				}, 500);
			}
		});
		
		let refresh = setInterval(() => {
			if(navigation.isFocused()) {
				populateMarketListCrypto();
				populateMarketListStocks();
			}
		}, 15000);

		return () => {
			setChartVerticalLabels([]);
			labelsRef.current = [];
			clearInterval(refresh);
		};
	}, []);

	useEffect(() => {
		if(type === "crypto") {
			populateMarketListCrypto();
		} else {
			populateMarketListStocks();
		}
	}, [type]);

	return (
		<ImageBackground source={Utils.getBackground(theme, settings?.alternateBackground)} resizeMethod="scale" resizeMode="cover">
			<SafeAreaView style={styles.area}>
				<View style={[styles.areaSearchWrapper, styles[`areaSearchWrapper${theme}`], styles[`areaSearchWrapper${theme + alternateBackground}`]]}>
					<TextInput
						spellCheck={false}
						placeholder="Symbol..." 
						selectionColor={Colors[theme].mainContrast} 
						placeholderTextColor={Colors[theme].mainContrastDarker} 
						style={[styles.inputSearch, styles[`inputSearch${theme}`]]} 
						onChangeText={(value) => setSymbol(value)}
						value={symbol}
						onSubmitEditing={() => {
							if(!Utils.empty(symbol)) { 
								showSearchPopup();
							}
						}}
					/>
					<TouchableOpacity 
						onPress={() => { 
							if(!Utils.empty(symbol)) { 
								showSearchPopup();
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
						renderItem={renderItemCrypto}
						keyExtractor={item => marketRowsCrypto[item].coinID}
						style={[styles.wrapper, styles[`wrapper${theme}`], styles[`wrapper${theme + alternateBackground}`]]}
					/>
				}
				{ type === "stocks" &&
					<FlatList
						contentContainerStyle={{ paddingTop:10 }}
						data={Object.keys(marketRowsStocks)}
						renderItem={renderItemStock}
						keyExtractor={item => marketRowsStocks[item].symbol}
						style={[styles.wrapper, styles[`wrapper${theme}`], styles[`wrapper${theme + alternateBackground}`]]}
						ListHeaderComponent={marketHeader}
						ListHeaderComponentStyle={styles.header}
					/>
				}
				<View style={[styles.areaActionsWrapper, styles[`areaActionsWrapper${theme}`], styles[`areaActionsWrapper${theme + alternateBackground}`]]}>
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
			<MarketPopup modal={modal} hideModal={hideModal} loading={loading} setLoading={setLoading} theme={theme} settings={settings} chartVerticalLabels={chartVerticalLabels} chartData={chartData} chartLabels={chartLabels} chartSegments={chartSegments} labelsRef={labelsRef} modalInfo={modalInfo} modalType={modalType} modalDescription={modalDescription} page="Market" watchlistData={modalData} populateList={populateMarketListStocks}/>
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

	// Shows a popup with the crypto market's global data.
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
							<Text style={[styles.modalInfo, styles[`modalInfo${theme}`]]}>Global Crypto Market Data</Text>
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
			Utils.notify(theme, "Something went wrong... - EM63");
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

	// Lets the user choose a matching asset when searching for a crypto asset.
	function selectMatch(id: string) {
		hidePopup();
		searchMarket({ type:"crypto", id:id });
	}

	// Shows a popup that allows the user to search for a crypto or stock asset.
	function showSearchPopup() {
		Keyboard.dismiss();
		hidePopup();

		let content = () => {
			return (
				<View style={styles.popupContent}>
					<View style={[styles.modalSection, styles[`modalSection${theme}`], { backgroundColor:Colors[theme].mainThird }]}>
						<Text style={[styles.modalInfo, styles[`modalInfo${theme}`], { lineHeight:25 }]}>What type of asset are you searching for?</Text>
					</View>
					<View style={styles.popupButtonWrapper}>
						<TouchableOpacity onPress={() => searchMarket({ type:"crypto", symbol:symbol })} style={[styles.button, styles.actionButton, styles[`actionButton${theme}`], styles.popupButton]}>
							<Text style={[styles.actionText, styles[`actionText${theme}`]]}>Crypto</Text>
						</TouchableOpacity>
						<TouchableOpacity onPress={() => searchMarket({ type:"stock", symbol:symbol })} style={[styles.button, styles.actionButton, styles[`actionButton${theme}`], styles.popupButton]}>
							<Text style={[styles.actionText, styles[`actionText${theme}`]]}>Stock</Text>
						</TouchableOpacity>
					</View>
				</View>
			);
		};

		showPopup(content);
	}

	// Searches the crypto or stock market for an asset's historical and current market data.
	async function searchMarket(args: any) {
		try {
			hidePopup();

			setLoading(true);

			setSymbol("");

			if(args?.type === "crypto") {
				showCryptoPopup(args);
			} else {
				showStockPopup(args);
			}
		} catch(error) {
			setLoading(false);
			console.log(error);
			Utils.notify(theme, "Something went wrong... - EM64");
		}
	}

	// Shows a crypto asset's historical and current market data.
	async function showCryptoPopup(args: any) {
		let settings: any = store.getState().settings.settings;

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

		let rank = data?.market_cap_rank || "";
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

		showModal(coinID, symbol, price, info, "crypto");
	}

	// Shows a stock's historical and current market data.
	async function showStockPopup(args: any) {
		let settings: any = store.getState().settings.settings;

		let currency = settings.currency;

		let resultPrice = await Stock.fetchStockPrice(currency, [args?.symbol]);

		if("error" in resultPrice) {
			Utils.notify(theme, resultPrice.error);
			return;
		}

		let info = resultPrice[Object.keys(resultPrice)[0]].priceData;
		info.currency = currency;

		showModal(args?.symbol, args?.symbol, info.price, info, "stock");
	}

	async function showModal(assetID: string, assetSymbol: string, currentPrice: number, info: any, type: string) {
		Keyboard.dismiss();

		try {
			setModalType(type);

			let settings: any = store.getState().settings.settings;

			setLoading(true);

			labelsRef.current = [];

			let api = await AsyncStorage.getItem("api");
			let userID = await AsyncStorage.getItem("userID");
			let token = await AsyncStorage.getItem("token");

			let data;

			if(type === "crypto") {
				let requests = new Requests(api);
				let marketData =  await requests.readCoin(token, userID, assetID, assetSymbol, settings.currency);

				let historicalData = JSON.parse(marketData?.data?.readCoin?.data)?.historicalData;

				data = parseMarketData(historicalData, new Date().getTime(), currentPrice);
			} else {
				let resultHistorical = await Stock.fetchStockHistorical(settings.currency, assetSymbol);

				if("error" in resultHistorical) {
					Utils.notify(theme, resultHistorical.error);
					setLoading(false);
					return;
				}

				let infoHistorical = resultHistorical.data.historicalData.chart.result[0];
				infoHistorical.currency = settings.currency;

				let timestamps = infoHistorical.timestamp;
				let prices = infoHistorical.indicators.quote[0].close;

				data = Stock.parseHistoricalStockData(timestamps, prices);

				setModalDescription("");
			}
			
			let months = data?.months;
			let prices = data?.prices;

			setChartVerticalLabels([]);

			setChartLabels(months);
			setChartData(prices);
			setChartSegments(4);

			if(type === "crypto") {
				let coinData = await cryptoAPI.getCoinData(assetID);
				let description = Utils.empty(coinData?.description?.en) ? "<span>No description found.</span>" : `<span>${coinData?.description?.en}</span>`;

				setModalDescription(description);
			}
			
			info.id = assetID;

			setModalInfo(info);

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
			ToastAndroid.show("Something went wrong... - EM65", 5000);
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
		populateMarketListStocks();
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
			Utils.notify(theme, "Something went wrong... - EM66");
		}
	}

	async function populateMarketListStocks() {
		try {
			let settings: any = store.getState().settings.settings;

			let currency = settings.currency;
			
			let watchlistData: any = await fetchWatchlist();
			
			setModalData(watchlistData);

			if(Utils.empty(watchlistData)) {
				setMarketRowsStocks({});
				setMarketHeader(<View style={styles.listTextWrapper}><Text style={[styles.listText, styles[`listText${theme}`]]}>No Assets In Watchlist</Text></View>);
				return;
			}

			let filteredWatchlist = filterWatchlistByType(watchlistData);

			let watchlistStockSymbols = getWatchlistSymbols(filteredWatchlist.stocks);

			let marketStocksData = !Utils.empty(watchlistStockSymbols) ? await Stock.fetchStockPrice(currency, watchlistStockSymbols) : {};
			if("error" in marketStocksData) {
				marketStocksData = {};
				watchlistStockSymbols = [];
				filteredWatchlist.stocks = {};
			}

			let rows: any = createWatchlistListRows({}, marketStocksData, watchlistData, currency);

			if(Utils.empty(rows)) {
				setMarketRowsStocks({});
				setMarketHeader(<View style={styles.listTextWrapper}><Text style={[styles.listText, styles[`listText${theme}`]]}>No Assets In Watchlist</Text></View>);
				return;
			}

			setMarketHeader(null);
			setMarketRowsStocks(rows);
		} catch(error) {
			if(error !== "Timeout.") {
				Utils.notify(theme, "Something went wrong... - EM67");
				console.log(error);
			}
		}
	}
}

// Generates chart data for an asset.
export function parseMarketData(data: any, currentTime: any, currentPrice: any) {
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