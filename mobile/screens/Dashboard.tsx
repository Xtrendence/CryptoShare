import React, { useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { FlatList, ImageBackground, Keyboard, Modal, ScrollView, Text, TextInput, ToastAndroid, TouchableOpacity, View } from "react-native";
import Pie from "react-native-pie";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import BudgetStats from "../components/BudgetStats";
import Loading from "../components/Loading";
import MarketPopup from "../components/MarketPopup";
import TransactionItem from "../components/TransactionItem";
import TransactionPopup from "../components/TransactionPopup";
import WatchlistItem from "../components/WatchlistItem";
import store from "../store/store";
import styles from "../styles/Dashboard";
import { Colors } from "../styles/Global";
import CryptoFN from "../utils/CryptoFN";
import Requests, { cryptoAPI } from "../utils/Requests";
import Stock from "../utils/Stock";
import Utils from "../utils/Utils";
import { sortMarketDataByCoinID } from "./Holdings";
import { parseMarketData } from "./Market";
import { actionBarHeight, barHeight, screenHeight, statusBarHeight } from "../styles/NavigationBar";

// The app's "Dashboard" page.
export default function Dashboard({ navigation }: any) {
	const dispatch = useDispatch();
	const { theme } = useSelector((state: any) => state.theme);
	const { settings } = useSelector((state: any) => state.settings);

	const alternateBackground = settings?.alternateBackground === "disabled" ? "" : "Alternate";

	const [loading, setLoading] = useState<boolean>(false);
	const [loadingText, setLoadingText] = useState<string>("");

	const [popup, setPopup] = useState<boolean>(false);
	const [popupContent, setPopupContent] = useState<any>(null);

	// Used to store the popup data.
	const popupRef = useRef<any>({
		budget: {
			food: "",
			housing: "",
			transport: "",
			entertainment: "",
			insurance: "",
			savings: "",
			other: "",
		},
		income: {
			income: ""
		},
		transaction: {
			transactionID: "",
			amount: "",
			type: "",
			category: "Food",
			date: "",
			notes: "",
			showDatePicker: false,
			action: "create",
		}
	});

	// Used to determine which month's budget data is displayed.
	const dateRef = useRef<any>({
		month: new Date().getMonth(),
		year: new Date().getFullYear()
	});

	const [list, setList] = useState<string>("budget");

	const defaultBudgetStats = null;

	const [budgetChart, setBudgetChart] = useState<any>(null);
	const [budgetStats, setBudgetStats] = useState<any>(defaultBudgetStats);
	const [budgetSummary, setBudgetSummary] = useState<any>(null);

	const [watchlistRows, setWatchlistRows] = useState<any>({});
	const [watchlistHeader, setWatchlistHeader] = useState<any>(null);

	const [query, setQuery] = useState<string>("");

	const [modal, setModal] = useState<boolean>(false);
	const [transactionRows, setTransactionRows] = useState<any>({});
	const [transactionHeader, setTransactionHeader] = useState<any>(null);
	const [filteredRows, setFilteredRows] = useState<any>({});

	const [marketModal, setMarketModal] = useState<boolean>(false);
	const [modalData, setModalData] = useState<any>({});
	const [modalType, setModalType] = useState<string>("");
	const [modalInfo, setModalInfo] = useState<any>(null);
	const [modalDescription, setModalDescription] = useState<string>("");

	const labelsRef = useRef<any>(null);

	const [chartLabels, setChartLabels] = useState<any>();
	const [chartVerticalLabels, setChartVerticalLabels] = useState<any>([]);
	const [chartData, setChartData] = useState<any>();
	const [chartSegments, setChartSegments] = useState<any>(1);

	// Component rendered by the transaction "FlatList".
	const renderItemTransaction = ({ item }: any) => {
		let info = transactionRows[item];
		info.showDatePicker = popupRef.current.transaction.showDatePicker;

		return (
			<TransactionItem info={info} theme={theme} settings={settings} setLoading={setLoading} showPopup={showPopup} hidePopup={hidePopup} popupRef={popupRef} listTransactions={listTransactions} showTransactionPopup={showTransactionPopup}/>
		);
	}

	// Component rendered by the watchlist "FlatList".
	const renderItemWatchlist = ({ item }: any) => {
		let info = watchlistRows[item];

		return (
			<WatchlistItem info={info} theme={theme} settings={settings} page="Dashboard" onPress={() => showMarketModal(info.id, info.symbol.toUpperCase(), info.price, info, info.type)}/>
		);
	}
	
	// Used to handle back button events.
	useFocusEffect(Utils.backHandler(navigation));

	useEffect(() => {
		navigation.addListener("focus", () => {
			if(navigation.isFocused()) {
				setBudgetChart(null);
				setBudgetStats(null);
				setBudgetSummary(null);
				setTransactionRows({});
				
				setTimeout(() => {
					populateBudgetList(false);
					populateWatchlist();
					listTransactions();
				}, 500);
			}
		});
		
		let refresh = setInterval(() => {
			if(navigation.isFocused()) {
				populateBudgetList(false);
				populateWatchlist();
				listTransactions();
			}
		}, 15000);

		return () => {
			setFilteredRows({});
			setChartVerticalLabels([]);
			labelsRef.current = [];
			clearInterval(refresh);
		};
	}, []);

	// When the "query" variable's value is changed, the transactions are automatically searched through if there are less than 100 of them.
	useEffect(() => {
		if(Object.keys(transactionRows).length < 100 || Utils.empty(query)) {
			searchTransactions(query);
		}
	}, [query]);

	useEffect(() => {
		if(list === "budget") {
			populateBudgetList(true);
		} else {
			populateWatchlist();
		}
	}, [list]);

	return (
		<ImageBackground source={Utils.getBackground(theme, settings?.alternateBackground)} resizeMethod="scale" resizeMode="cover">
			<SafeAreaView style={styles.area}>
				<View style={[styles.areaActionsWrapper, styles[`areaActionsWrapper${theme}`], styles[`areaActionsWrapper${theme + alternateBackground}`], { top:statusBarHeight + 20 }]}>
					<TouchableOpacity onPress={() => changeList("budget")} style={[styles.button, styles.choiceButton, styles[`choiceButton${theme}`], list === "budget" ? styles[`choiceButtonActive${theme}`] : null]}>
						<Text style={[styles.choiceText, styles[`choiceText${theme}`], list === "budget" ? styles[`choiceTextActive${theme}`] : null]}>Budget</Text>
					</TouchableOpacity>
					<TouchableOpacity onPress={() => changeList("watchlist")} style={[styles.button, styles.choiceButton, styles[`choiceButton${theme}`], list === "watchlist" ? styles[`choiceButtonActive${theme}`] : null]}>
						<Text style={[styles.choiceText, styles[`choiceText${theme}`], list === "watchlist" ? styles[`choiceTextActive${theme}`] : null]}>Watchlist</Text>
					</TouchableOpacity>
				</View>
				{ list === "budget" &&
					<ScrollView style={[styles.wrapper, styles[`wrapper${theme}`], styles[`wrapper${theme + alternateBackground}`]]} contentContainerStyle={styles.budgetScrollViewContent} showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false}>
						{budgetChart}
						{budgetStats}
						{budgetSummary}
					</ScrollView>
				}
				{ list === "watchlist" &&
					<FlatList
						contentContainerStyle={{ paddingTop:10 }}
						data={Object.keys(watchlistRows)}
						renderItem={renderItemWatchlist}
						keyExtractor={item => watchlistRows[item].watchlistID}
						style={[styles.wrapper, styles[`wrapper${theme}`], styles[`wrapper${theme + alternateBackground}`]]}
						ListHeaderComponent={watchlistHeader}
						ListHeaderComponentStyle={styles.listHeader}
					/>
				}
				<View style={[styles.areaActionsWrapper, styles[`areaActionsWrapper${theme}`], styles[`areaActionsWrapper${theme + alternateBackground}`]]}>
					<TouchableOpacity onPress={() => showModal()} style={[styles.button, styles.actionButton, styles[`actionButton${theme}`]]}>
						<Text style={[styles.actionText, styles[`actionText${theme}`]]}>Transactions</Text>
					</TouchableOpacity>
					<TouchableOpacity onPress={() => showEditPopup()} style={[styles.button, styles.actionButton, styles[`actionButton${theme}`]]}>
						<Text style={[styles.actionText, styles[`actionText${theme}`]]}>Edit Budget</Text>
					</TouchableOpacity>
				</View>
			</SafeAreaView>
			<MarketPopup modal={marketModal} hideModal={hideMarketModal} loading={loading} setLoading={setLoading} theme={theme} settings={settings} chartVerticalLabels={chartVerticalLabels} chartData={chartData} chartLabels={chartLabels} chartSegments={chartSegments} labelsRef={labelsRef} modalInfo={modalInfo} modalType={modalType} modalDescription={modalDescription} page="Dashboard" watchlistData={modalData} populateList={populateWatchlist}/>
			<Modal visible={popup} onRequestClose={hidePopup} transparent={true}>
				<View style={styles.popup}>
					<TouchableOpacity activeOpacity={1} onPress={() => hidePopup()} style={styles.popupBackground}></TouchableOpacity>
					<View style={styles.popupForeground}>
						<View style={[styles.popupWrapper, styles[`popupWrapper${theme}`], { padding:0 }]}>{popupContent}</View>
					</View>
				</View>
			</Modal>
			<Modal visible={modal} onRequestClose={() => hideModal()} transparent={false}>
				<View style={[styles.modalContent, styles[`modalContent${theme}`]]}>
					<View style={[styles.areaSearchWrapper, styles[`areaSearchWrapper${theme}`]]}>
						<TextInput 
							spellCheck={false}
							placeholder="Search..." 
							selectionColor={Colors[theme].mainContrast} 
							placeholderTextColor={Colors[theme].mainContrastDarker} 
							style={[styles.inputSearch, styles[`inputSearch${theme}`]]} 
							onChangeText={(value) => setQuery(value)}
							value={query}
							onSubmitEditing={() => searchTransactions(query)}
						/>
						<TouchableOpacity onPress={() => searchTransactions(query)} style={[styles.button, styles.buttonSearch, styles[`buttonSearch${theme}`]]}>
							<Text style={[styles.searchText, styles[`searchText${theme}`]]}>Search</Text>
						</TouchableOpacity>
					</View>
					<FlatList
						contentContainerStyle={{ paddingTop:10, paddingLeft:10, paddingRight:10 }}
						data={getRows(filteredRows, transactionRows, query)}
						renderItem={renderItemTransaction}
						keyExtractor={item => transactionRows[item].transactionID}
						style={[styles.modalList, styles[`modalList${theme}`]]}
						ListHeaderComponent={transactionHeader}
						ListHeaderComponentStyle={styles.listHeader}
					/>
					<View style={[styles.areaActionsWrapper, styles[`areaActionsWrapper${theme}`], { top:barHeight + 80 + (screenHeight - actionBarHeight - barHeight - 40 - 70 - 130) + 18 + 20, }]}>
						<TouchableOpacity onPress={() => hideModal()} style={[styles.button, styles.actionButton, styles[`actionButton${theme}`]]}>
							<Text style={[styles.actionText, styles[`actionText${theme}`]]}>Back</Text>
						</TouchableOpacity>
						<TouchableOpacity onPress={() => showAddPopup()} style={[styles.button, styles.actionButton, styles[`actionButton${theme}`]]}>
							<Text style={[styles.actionText, styles[`actionText${theme}`]]}>Add Transaction</Text>
						</TouchableOpacity>
					</View>
				</View>
			</Modal>
			<Loading active={loading} theme={theme} opaque={true}/>
		</ImageBackground>
	);

	// Shows the price chart of an asset.
	async function showMarketModal(assetID: string, assetSymbol: string, currentPrice: number, info: any, type: string) {
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
			
			setMarketModal(true);
		} catch(error) {
			setLoading(false);
			console.log(error);
			ToastAndroid.show("Something went wrong... - EM39", 5000);
		}
	}

	function hideMarketModal() {
		Keyboard.dismiss();
		labelsRef.current = [];
		setChartVerticalLabels([]);
		setChartLabels(null);
		setChartData(null);
		setChartSegments(1);
		setModalDescription("");
		setModalInfo(null);
		setMarketModal(false);
		populateWatchlist();
	}

	// Determines whether to show all transaction rows or only ones the user has searched for.
	function getRows(filteredRows: any, transactionRows: any, query: any) {
		if(!Utils.empty(query) && Utils.empty(filteredRows)) {
			return null;
		}

		if(!Utils.empty(query) && Object.keys(filteredRows).length > 0) {
			return Object.keys(filteredRows);
		}
		
		return Object.keys(transactionRows);
	}

	// Given a search query, searches through the user's transaction data.
	function searchTransactions(query: string) {
		let settings: any = store.getState().settings.settings;

		if(Utils.empty(query)) {
			setFilteredRows(transactionRows);
			return;
		}

		query = query.toLowerCase();

		let filtered: any = {};

		Object.keys(transactionRows).map(id => {
			let transaction = transactionRows[id];

			let date = settings?.dateFormat === "dd-mm-yyyy" ? Utils.formatDateHyphenatedHuman(new Date(Date.parse(transaction.transactionDate))) : Utils.formatDateHyphenated(new Date(Date.parse(transaction.transactionDate)));

			let data = [date, transaction.transactionType, transaction.transactionAmount, transaction.transactionCategory, transaction.transactionNotes];

			if(data.join("|").toLowerCase().includes(query)) {
				filtered[id] = transaction;
			}
		});

		setFilteredRows(filtered);
	}

	// Populates the budget "ScrollView".
	async function populateBudgetList(recreate: boolean) {
		try {
			if(recreate) {
				setBudgetChart(null);
				setBudgetStats(null);
				setBudgetSummary(null);
			}

			let state = store.getState();
			let theme: any = state.theme.theme;

			let budgetData = await fetchBudget();
			let transactionData = await fetchTransaction();

			if(Utils.empty(budgetData)) {
				await setDefaultBudgetData();
				budgetData = await fetchBudget();
			}

			let backgroundColors: any = {
				food: "rgb(254,137,112)",
				housing: "rgb(157,255,149)",
				transport: "rgb(200,172,165)",
				entertainment: "rgb(255,195,127)",
				insurance: "rgb(119,254,229)",
				savings: "rgb(119,194,253)",
				other: "rgb(182,137,251)",
			};

			generatePieChart(theme, budgetData, backgroundColors);
			generateBudgetStats(theme, budgetData, transactionData, backgroundColors);
		} catch(error) {
			if(error !== "Timeout.") {
				Utils.notify(theme, "Something went wrong... - EM40");
				console.log(error);
			}
		}
	}

	// Populates the watchlist "FlatList".
	async function populateWatchlist() {
		try {
			let settings: any = store.getState().settings.settings;

			let currency = settings.currency;

			let watchlistData: any = await fetchWatchlist();

			if(Utils.empty(watchlistData)) {
				setModalData({});
				setWatchlistRows({});
				setWatchlistHeader(<View style={styles.listTextWrapper}><Text style={[styles.listText, styles[`listText${theme}`]]}>Search for and add assets to your watchlist through the Market page</Text></View>);
				return;
			}
			
			setModalData(watchlistData);

			let filteredWatchlist = filterWatchlistByType(watchlistData);

			let watchlistCryptoIDs = getWatchlistIDs(filteredWatchlist.crypto);
			let watchlistStockSymbols = getWatchlistSymbols(filteredWatchlist.stocks);

			let marketCryptoData = !Utils.empty(watchlistCryptoIDs) ? await cryptoAPI.getMarketByID(currency, watchlistCryptoIDs.join(",")) : {};

			let marketStocksData = !Utils.empty(watchlistStockSymbols) ? await Stock.fetchStockPrice(currency, watchlistStockSymbols) : {};
			if("error" in marketStocksData) {
				marketStocksData = {};
				watchlistStockSymbols = [];
				filteredWatchlist.stocks = {};
			}

			let rows: any = createWatchlistListRows(marketCryptoData, marketStocksData, watchlistData, currency);

			setWatchlistHeader(null);
			setWatchlistRows(rows);
		} catch(error) {
			if(error !== "Timeout.") {
				Utils.notify(theme, "Something went wrong... - EM41");
				console.log(error);
			}
		}
	}

	// Populates the transaction "FlatList".
	async function listTransactions() {
		try {
			let transactions: any = await fetchTransaction() || {};

			if(Utils.empty(transactions)) {
				setTransactionHeader(<View style={styles.listTextWrapper}><Text style={[styles.listText, styles[`listText${theme}`]]}>No Transactions Found</Text></View>);
				setTransactionRows({});
				setFilteredRows({});
				setLoading(false);
				return;
			}

			let sorted = sortTransactionDataByDate(transactions);

			let rows: any = {};

			transactions = sorted.sorted;

			let keys = sorted.sortedKeys;
			for(let i = 0; i < keys.length; i++) {
				let transaction = transactions[keys[i]];
				rows[i] = transaction;
			}

			setTransactionHeader(null);
			setTransactionRows(rows);
			searchTransactions(query);

			setLoading(false);
		} catch(error) {
			console.log(error);
			ToastAndroid.show("Something went wrong... - EM42", 5000);
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

	function showModal() {
		setLoading(true);
		listTransactions();
		Keyboard.dismiss();
		setModal(true);
		setTransactionRows({});
	}

	function hideModal() {
		Keyboard.dismiss();
		setModal(false);
		setTransactionRows({});
	}

	// Shows the popup used to create a transaction.
	function showAddPopup() {
		let info = {
			transactionID: "",
			transactionAmount: "",
			transactionType: "spent",
			transactionCategory: "Food",
			transactionDate: Utils.formatDateHyphenated(new Date()),
			transactionNotes: "",
			showDatePicker: false,
			action: "create"
		}

		showTransactionPopup(info, "create");
	}

	// Shows the popup used to edit the budget data.
	function showEditPopup() {
		let content = () => {
			return (
				<View style={[styles.popupContent, { padding:20 }]}>
					<View style={[styles.modalSection, styles[`modalSection${theme}`], { backgroundColor:Colors[theme].mainThird }]}>
						<Text style={[styles.modalInfo, styles[`modalInfo${theme}`]]}>Edit Budget</Text>
					</View>
					<View style={[styles.modalSection, styles[`modalSection${theme}`], { backgroundColor:Colors[theme].mainThird }]}>
						<TouchableOpacity onPress={() => showBudgetPopup()} style={[styles.button, styles.actionButton, styles[`actionButton${theme}`], styles.popupButton, styles.sectionButton]}>
							<Text style={[styles.actionText, styles[`actionText${theme}`]]}>Set Monthly Budget</Text>
						</TouchableOpacity>
						<TouchableOpacity onPress={() => showIncomePopup()} style={[styles.button, styles.actionButton, styles[`actionButton${theme}`], styles.popupButton, styles.sectionButton, { marginBottom:0 }]}>
							<Text style={[styles.actionText, styles[`actionText${theme}`]]}>Set Yearly Income</Text>
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

	// Shows the popup used to modify the budget percentages for each category.
	async function showBudgetPopup() {
		try {
			setLoading(true);

			let budgetData: any = await fetchBudget();

			popupRef.current.budget = {
				food: budgetData?.categories?.food,
				housing: budgetData?.categories?.housing,
				transport: budgetData?.categories?.transport,
				entertainment: budgetData?.categories?.entertainment,
				insurance: budgetData?.categories?.insurance,
				savings: budgetData?.categories?.savings,
				other: budgetData?.categories?.other
			};

			hidePopup();

			let content = () => {
				return (
					<View style={styles.popupContent}>
						<ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent} showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false}>
							<View style={[styles.modalSection, styles[`modalSection${theme}`], { marginTop:20, backgroundColor:Colors[theme].mainThird }]}>
								<Text style={[styles.modalInfo, styles[`modalInfo${theme}`]]}>Monthly Budget</Text>
							</View>
							<View style={[styles.modalSection, styles[`modalSection${theme}`], { backgroundColor:Colors[theme].mainThird }]}>
								<Text style={[styles.labelInput, styles[`labelInput${theme}`]]}>Food</Text>
								<TextInput 
									defaultValue={popupRef.current.budget.food.toString()}
									spellCheck={false}
									keyboardType="decimal-pad"
									autoCorrect={false}
									placeholder="Food..." 
									selectionColor={Colors[theme].mainContrast} 
									placeholderTextColor={Colors[theme].mainContrastDarker} 
									style={[styles.popupInput, styles[`popupInput${theme}`]]} 
									onChangeText={(value) => popupRef.current.budget.food = value}
								/>
								<Text style={[styles.labelInput, styles[`labelInput${theme}`]]}>Housing</Text>
								<TextInput 
									defaultValue={popupRef.current.budget.housing.toString()}
									spellCheck={false}
									keyboardType="decimal-pad"
									autoCorrect={false}
									placeholder="Housing..." 
									selectionColor={Colors[theme].mainContrast} 
									placeholderTextColor={Colors[theme].mainContrastDarker} 
									style={[styles.popupInput, styles[`popupInput${theme}`]]} 
									onChangeText={(value) => popupRef.current.budget.housing = value}
								/>
								<Text style={[styles.labelInput, styles[`labelInput${theme}`]]}>Transport</Text>
								<TextInput 
									defaultValue={popupRef.current.budget.transport.toString()}
									spellCheck={false}
									keyboardType="decimal-pad"
									autoCorrect={false}
									placeholder="Transport..." 
									selectionColor={Colors[theme].mainContrast} 
									placeholderTextColor={Colors[theme].mainContrastDarker} 
									style={[styles.popupInput, styles[`popupInput${theme}`]]} 
									onChangeText={(value) => popupRef.current.budget.transport = value}
								/>
								<Text style={[styles.labelInput, styles[`labelInput${theme}`]]}>Entertainment</Text>
								<TextInput 
									defaultValue={popupRef.current.budget.entertainment.toString()}
									spellCheck={false}
									keyboardType="decimal-pad"
									autoCorrect={false}
									placeholder="Entertainment..." 
									selectionColor={Colors[theme].mainContrast} 
									placeholderTextColor={Colors[theme].mainContrastDarker} 
									style={[styles.popupInput, styles[`popupInput${theme}`]]} 
									onChangeText={(value) => popupRef.current.budget.entertainment = value}
								/>
								<Text style={[styles.labelInput, styles[`labelInput${theme}`]]}>Insurance</Text>
								<TextInput 
									defaultValue={popupRef.current.budget.insurance.toString()}
									spellCheck={false}
									keyboardType="decimal-pad"
									autoCorrect={false}
									placeholder="Insurance..." 
									selectionColor={Colors[theme].mainContrast} 
									placeholderTextColor={Colors[theme].mainContrastDarker} 
									style={[styles.popupInput, styles[`popupInput${theme}`]]} 
									onChangeText={(value) => popupRef.current.budget.insurance = value}
								/>
								<Text style={[styles.labelInput, styles[`labelInput${theme}`]]}>Savings</Text>
								<TextInput 
									defaultValue={popupRef.current.budget.savings.toString()}
									spellCheck={false}
									keyboardType="decimal-pad"
									autoCorrect={false}
									placeholder="Savings..." 
									selectionColor={Colors[theme].mainContrast} 
									placeholderTextColor={Colors[theme].mainContrastDarker} 
									style={[styles.popupInput, styles[`popupInput${theme}`]]} 
									onChangeText={(value) => popupRef.current.budget.savings = value}
								/>
								<Text style={[styles.labelInput, styles[`labelInput${theme}`]]}>Other</Text>
								<TextInput 
									defaultValue={popupRef.current.budget.other.toString()}
									spellCheck={false}
									keyboardType="decimal-pad"
									autoCorrect={false}
									placeholder="Other..." 
									selectionColor={Colors[theme].mainContrast} 
									placeholderTextColor={Colors[theme].mainContrastDarker} 
									style={[styles.popupInput, styles[`popupInput${theme}`], { marginBottom:0 }]} 
									onChangeText={(value) => popupRef.current.budget.other = value}
								/>
							</View>
							<View style={[styles.popupButtonWrapper, { marginBottom:20 }]}>
								<TouchableOpacity onPress={() => hidePopup()} style={[styles.button, styles.choiceButton, styles[`choiceButton${theme}`], styles.popupButton]}>
									<Text style={[styles.choiceText, styles[`choiceText${theme}`]]}>Cancel</Text>
								</TouchableOpacity>
								<TouchableOpacity onPress={() => updateBudget()} style={[styles.button, styles.actionButton, styles[`actionButton${theme}`], styles.popupButton]}>
									<Text style={[styles.actionText, styles[`actionText${theme}`]]}>Confirm</Text>
								</TouchableOpacity>
							</View>
						</ScrollView>
					</View>
				);
			};

			setLoading(false);

			showPopup(content);
		} catch(error) {
			console.log(error);
			setLoading(false);
			Utils.notify(theme, "Something went wrong... - EM43");
		}
	}

	// Shows the popup used to modify the user's income.
	async function showIncomePopup() {
		try {
			setLoading(true);

			let budgetData: any = await fetchBudget();

			popupRef.current.income = {
				income: budgetData.income
			};

			hidePopup();

			let content = () => {
				return (
					<View style={styles.popupContent}>
						<View style={[styles.modalSection, styles[`modalSection${theme}`], { marginTop:20, backgroundColor:Colors[theme].mainThird }]}>
							<Text style={[styles.modalInfo, styles[`modalInfo${theme}`]]}>Yearly Income</Text>
						</View>
						<View style={[styles.modalSection, styles[`modalSection${theme}`], { backgroundColor:Colors[theme].mainThird }]}>
							<Text style={[styles.labelInput, styles[`labelInput${theme}`]]}>Income</Text>
							<TextInput 
								defaultValue={popupRef.current.income.income.toString()}
								spellCheck={false}
								keyboardType="decimal-pad"
								autoCorrect={false}
								placeholder="Income..." 
								selectionColor={Colors[theme].mainContrast} 
								placeholderTextColor={Colors[theme].mainContrastDarker} 
								style={[styles.popupInput, styles[`popupInput${theme}`], { marginBottom:0 }]} 
								onChangeText={(value) => popupRef.current.income.income = value}
							/>
						</View>
						<View style={[styles.popupButtonWrapper, { marginBottom:20 }]}>
							<TouchableOpacity onPress={() => hidePopup()} style={[styles.button, styles.choiceButton, styles[`choiceButton${theme}`], styles.popupButton]}>
								<Text style={[styles.choiceText, styles[`choiceText${theme}`]]}>Cancel</Text>
							</TouchableOpacity>
							<TouchableOpacity onPress={() => updateIncome()} style={[styles.button, styles.actionButton, styles[`actionButton${theme}`], styles.popupButton]}>
								<Text style={[styles.actionText, styles[`actionText${theme}`]]}>Confirm</Text>
							</TouchableOpacity>
						</View>
					</View>
				);
			};

			setLoading(false);

			showPopup(content);
		} catch(error) {
			console.log(error);
			setLoading(false);
			Utils.notify(theme, "Something went wrong... - EM44");
		}
	}

	// Updates the user's income.
	async function updateIncome() {
		try {
			setLoading(true);

			let userID = await AsyncStorage.getItem("userID");
			let token = await AsyncStorage.getItem("token");
			let key = await AsyncStorage.getItem("key") || "";
			let api = await AsyncStorage.getItem("api");

			let requests = new Requests(api);

			let budgetData: any = await fetchBudget();

			if(Utils.empty(budgetData)) {
				await setDefaultBudgetData();
				budgetData = await fetchBudget();
			}

			let income = popupRef.current.income.income;

			if(isNaN(income) || parseFloat(income) < 0) {
				ToastAndroid.show("Income has to be zero or greater.", 5000);
				return;
			}

			budgetData.income = parseFloat(income);

			let encrypted = CryptoFN.encryptAES(JSON.stringify(budgetData), key);

			await requests.updateBudget(token, userID, encrypted);

			populateBudgetList(true);

			listTransactions();

			setLoading(false);

			hidePopup();
		} catch(error) {
			console.log(error);
			setLoading(false);
			Utils.notify(theme, "Something went wrong... - EM45");
		}
	}

	// Updates the user's budget data.
	async function updateBudget() {
		try {
			setLoading(true);

			let userID = await AsyncStorage.getItem("userID");
			let token = await AsyncStorage.getItem("token");
			let key = await AsyncStorage.getItem("key") || "";
			let api = await AsyncStorage.getItem("api");

			let requests = new Requests(api);

			let budgetData: any = await fetchBudget();

			if(Utils.empty(budgetData)) {
				await setDefaultBudgetData();
				budgetData = await fetchBudget();
			}

			let values = popupRef.current.budget;

			let data: any = parseBudgetPopupData(values.food, values.housing, values.transport, values.entertainment, values.insurance, values.savings, values.other);

			if("error" in data) {
				setLoading(false);
				ToastAndroid.show(data.error, 5000);
				return;
			}

			let { food, housing, transport, entertainment, insurance, savings, other } = data;

			budgetData.categories.food = food;
			budgetData.categories.housing = housing;
			budgetData.categories.transport = transport;
			budgetData.categories.entertainment = entertainment;
			budgetData.categories.insurance = insurance;
			budgetData.categories.savings = savings;
			budgetData.categories.other = other;

			let encrypted = CryptoFN.encryptAES(JSON.stringify(budgetData), key);

			await requests.updateBudget(token, userID, encrypted);

			populateBudgetList(true);

			listTransactions();

			setLoading(false);

			hidePopup();
		} catch(error) {
			console.log(error);
			setLoading(false);
			Utils.notify(theme, "Something went wrong... - EM46");
		}
	}

	// Validates budget popup data.
	function parseBudgetPopupData(food: any, housing: any, transport: any, entertainment: any, insurance: any, savings: any, other: any) {
		if(isNaN(food) || parseFloat(food) < 0) {
			return { error:"Budget for food has to be zero or greater." };
		}

		if(isNaN(housing) || parseFloat(housing) < 0) {
			return { error:"Budget for housing has to be zero or greater." };
		}

		if(isNaN(transport) || parseFloat(transport) < 0) {
			return { error:"Budget for transport has to be zero or greater." };
		}

		if(isNaN(entertainment) || parseFloat(entertainment) < 0) {
			return { error:"Budget for entertainment has to be zero or greater." };
		}

		if(isNaN(insurance) || parseFloat(insurance) < 0) {
			return { error:"Budget for insurance has to be zero or greater." };
		}

		if(isNaN(savings) || parseFloat(savings) < 0) {
			return { error:"Budget for savings has to be zero or greater." };
		}

		if(isNaN(other) || parseFloat(other) < 0) {
			return { error:"Budget for other has to be zero or greater." };
		}

		food = parseFloat(food);
		housing = parseFloat(housing);
		transport = parseFloat(transport);
		entertainment = parseFloat(entertainment);
		insurance = parseFloat(insurance);
		savings = parseFloat(savings);
		other = parseFloat(other);
	
		if((food + housing + transport + entertainment + insurance + savings + other) !== 100) {
			return { error:"Budget data must add up to 100%." };
		}

		return { food:food, housing:housing, transport:transport, entertainment:entertainment, insurance:insurance, savings:savings, other:other };
	}

	// Generates a pie chart to visualize the user's budget allocation.
	function generatePieChart(theme: string, budgetData: any, backgroundColors: any) {
		let settings: any = store.getState().settings.settings;

		let currency = settings.currency;

		let categories = budgetData.categories;
		let income = budgetData.income;

		let sections: any = [];
		let labels = [];
		let values = [];

		Object.keys(categories).map(category => {
			let percentage = categories[category];
			let amount = parseFloat((((percentage * income) / 100) / 12).toFixed(0));
			sections.push({ percentage:percentage, color:backgroundColors[category] });
			labels.push(`${Utils.capitalizeFirstLetter(category)}: ${Utils.currencySymbols[currency] + Utils.separateThousands(amount)}`);
			values.push(categories[category]);
		});

		setBudgetChart(
			<View style={[styles.budgetItem, styles[`budgetItem${theme}`]]}>
				<Text style={[styles.header, styles[`header${theme}`]]}>Monthly Budget</Text>
				<View style={styles.row}>
					<View style={styles.chartWrapper}>
						<Pie 
							radius={60} 
							innerRadius={30} 
							sections={sections}
						/>
					</View>
					<View style={styles.legendWrapper}>
						<View style={styles.row}>
							<View style={[styles.legendColor, { backgroundColor:backgroundColors.food }]}></View>
							<Text style={[styles.legendText, styles[`legendText${theme}`]]}>Food ({categories.food}%)</Text>
						</View>
						<View style={styles.row}>
							<View style={[styles.legendColor, { backgroundColor:backgroundColors.housing }]}></View>
							<Text style={[styles.legendText, styles[`legendText${theme}`]]}>Housing ({categories.housing}%)</Text>
						</View>
						<View style={styles.row}>
							<View style={[styles.legendColor, { backgroundColor:backgroundColors.transport }]}></View>
							<Text style={[styles.legendText, styles[`legendText${theme}`]]}>Transport ({categories.transport}%)</Text>
						</View>
						<View style={styles.row}>
							<View style={[styles.legendColor, { backgroundColor:backgroundColors.entertainment }]}></View>
							<Text style={[styles.legendText, styles[`legendText${theme}`]]}>Entertainment ({categories.entertainment}%)</Text>
						</View>
						<View style={styles.row}>
							<View style={[styles.legendColor, { backgroundColor:backgroundColors.insurance }]}></View>
							<Text style={[styles.legendText, styles[`legendText${theme}`]]}>Insurance ({categories.insurance}%)</Text>
						</View>
						<View style={styles.row}>
							<View style={[styles.legendColor, { backgroundColor:backgroundColors.savings }]}></View>
							<Text style={[styles.legendText, styles[`legendText${theme}`]]}>Savings ({categories.savings}%)</Text>
						</View>
						<View style={styles.row}>
							<View style={[styles.legendColor, { backgroundColor:backgroundColors.other }]}></View>
							<Text style={[styles.legendText, styles[`legendText${theme}`]]}>Other ({categories.other}%)</Text>
						</View>
					</View>
				</View>
			</View>
		);
	}

	// Shows a popup to let the user choose which month's budget data they want to see.
	function showMonthPopup() {
		let content = () => {
			return (
				<View style={styles.popupContent}>
					<ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent} showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false}>
						<View style={[styles.modalSection, styles[`modalSection${theme}`], { backgroundColor:Colors[theme].mainThird, marginTop:20 }]}>
							<Text style={[styles.modalInfo, styles[`modalInfo${theme}`]]}>Select Month</Text>
						</View>
						<View style={[styles.modalSection, styles[`modalSection${theme}`], { backgroundColor:Colors[theme].mainThird }]}>
							{ 
								Utils.monthNames.map(name => {
									return (
										<TouchableOpacity key={name} onPress={() => setMonth(Utils.monthNames.indexOf(name))} style={[styles.button, styles.actionButton, styles[`actionButton${theme}`], styles.popupButton, styles.sectionButton, { marginBottom:name === "December" ? 0 : 20 }]}>
											<Text style={[styles.actionText, styles[`actionText${theme}`]]}>{name}</Text>
										</TouchableOpacity>
									);
								})
							}
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

	// Shows a popup to let the user choose which year's budget data they want to see.
	function showYearPopup() {
		let currentYear = new Date().getFullYear();
		let years = [currentYear, currentYear - 1, currentYear - 2, currentYear - 3, currentYear - 4, currentYear - 5];

		let content = () => {
			return (
				<View style={styles.popupContent}>
					<ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent} showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false}>
						<View style={[styles.modalSection, styles[`modalSection${theme}`], { backgroundColor:Colors[theme].mainThird, marginTop:20 }]}>
							<Text style={[styles.modalInfo, styles[`modalInfo${theme}`]]}>Select Year</Text>
						</View>
						<View style={[styles.modalSection, styles[`modalSection${theme}`], { backgroundColor:Colors[theme].mainThird }]}>
							{ 
								years.map((year: number) => {
									return (
										<TouchableOpacity key={year} onPress={() => setYear(year)} style={[styles.button, styles.actionButton, styles[`actionButton${theme}`], styles.popupButton, styles.sectionButton, { marginBottom:year === years[5] ? 0 : 20 }]}>
											<Text style={[styles.actionText, styles[`actionText${theme}`]]}>{year.toString()}</Text>
										</TouchableOpacity>
									);
								})
							}
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

	function setMonth(month: number) {
		hidePopup();
		dateRef.current.month = month;
		populateBudgetList(false);
	}

	function setYear(year: number) {
		hidePopup();
		dateRef.current.year = year;
		populateBudgetList(false);
	}

	// Calculates and shows the user how much of their budget they've used for each category.
	function generateBudgetStats(theme: string, budgetData: any, transactionData: any, backgroundColors: any) {
		transactionData = filterTransactionsByMonth(transactionData, dateRef.current.month, dateRef.current.year);

		let settings: any = store.getState().settings.settings;

		let currency = settings.currency;

		let parsed = parseTransactionData(transactionData);

		let budgetAmounts: any = {};
	
		let categories = budgetData.categories;
		let income = budgetData.income;
		let earned = parsed.earned;

		if(earned > 0) {
			setBudgetSummary(
				<View style={[styles.budgetItem, styles[`budgetItem${theme}`]]}>
					<Text style={[styles.progressText, styles[`progressText${theme}`]]}>Based on your transactions, aside from your income of {Utils.currencySymbols[currency] + Utils.separateThousands(parseFloat((income / 12).toFixed(0)))}, you earned an additional {Utils.currencySymbols[currency] + Utils.separateThousands(earned)} this month.</Text>
				</View>
			);
		} else {
			setBudgetSummary(
				<View style={[styles.budgetItem, styles[`budgetItem${theme}`]]}>
					<Text style={[styles.progressText, styles[`progressText${theme}`]]}>Based on your transactions, you didn't earn any additional money aside from your income of {Utils.currencySymbols[currency] + Utils.separateThousands(parseFloat((income / 12).toFixed(0)))}.</Text>
				</View>
			);
		}

		Object.keys(categories).map(category => {
			let percentage = categories[category];
			let amount = parseFloat((((percentage * income) / 100) / 12).toFixed(0));
			let remaining = amount - parsed[category];
			let remainingPercentage = parseFloat(((remaining * 100) / amount).toFixed(0));
			let used = amount - remaining;
			let usedPercentage = 100 - remainingPercentage;

			if(usedPercentage > 100) {
				usedPercentage = 100;
			}
		
			budgetAmounts[category] = { budget:amount, remaining:remaining, remainingPercentage:remainingPercentage, used:used, usedPercentage:usedPercentage };
		});

		setBudgetStats(<BudgetStats theme={theme} currency={currency} stats={budgetAmounts} backgroundColors={backgroundColors} showMonthPopup={showMonthPopup} showYearPopup={showYearPopup} month={parseInt(dateRef.current.month)} year={dateRef.current.year}/>)
	}

	function changeList(list: string) {
		setList(list);
	}

	// Shows the popup used to create and update transactions.
	function showTransactionPopup(info: any, action: string) {
		try {
			setLoading(true);

			popupRef.current.transaction = {
				transactionID: info.transactionID,
				amount: info.transactionAmount,
				type: info.transactionType,
				category: Utils.capitalizeFirstLetter(info.transactionCategory),
				date: info.transactionDate,
				notes: info.transactionNotes,
				showDatePicker: info.showDatePicker,
				action: action
			};

			hidePopup();

			let content = () => {
				return (
					<TransactionPopup popupRef={popupRef} changeContent={changeContent} theme={theme} setDate={setDate} action={action} showConfirmationPopup={showConfirmationPopup} hidePopup={hidePopup} updateTransaction={updateTransaction} createTransaction={createTransaction}/>
				);
			};

			setLoading(false);

			showPopup(content);
		} catch(error) {
			console.log(error);
			setLoading(false);
			Utils.notify(theme, "Something went wrong... - EM47");
		}
	}

	// Shows a confirmation popup so the user doesn't accidentally perform "destructive" actions.
	function showConfirmationPopup() {
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
						<TouchableOpacity onPress={() => deleteTransaction()} style={[styles.button, styles.actionButton, styles[`actionButton${theme}`], styles.popupButton]}>
							<Text style={[styles.actionText, styles[`actionText${theme}`]]}>Confirm</Text>
						</TouchableOpacity>
					</View>
				</View>
			);
		};

		showPopup(content);
	}

	function setDate(value: any) {
		popupRef.current.transaction.date = Utils.replaceAll("/", "-", value);
		popupRef.current.transaction.showDatePicker = false;
		changeContent();
	}
	
	// Updates the transaction popup's components.
	function changeContent() {
		let info = {
			transactionID: popupRef.current.transaction.transactionID,
			transactionAmount: popupRef.current.transaction.amount,
			transactionType: popupRef.current.transaction.type,
			transactionCategory: popupRef.current.transaction.category,
			transactionDate: popupRef.current.transaction.date,
			transactionNotes: popupRef.current.transaction.notes,
			showDatePicker: popupRef.current.transaction.showDatePicker,
			action: popupRef.current.transaction.action
		};

		showTransactionPopup(info, info.action);
	}

	// Deletes a transaction.
	async function deleteTransaction() {
		try {
			setLoading(true);

			let userID = await AsyncStorage.getItem("userID");
			let token = await AsyncStorage.getItem("token");
			let api = await AsyncStorage.getItem("api");

			let requests = new Requests(api);

			await requests.deleteTransaction(token, userID, popupRef.current.transaction.transactionID);

			setLoading(false);

			hidePopup();

			listTransactions();

			populateBudgetList(true);
		} catch(error) {
			console.log(error);
			setLoading(false);
			ToastAndroid.show("Something went wrong... - EM48", 5000);
		}
	}

	// Updates a transaction.
	async function updateTransaction() {
		try {
			setLoading(true);

			let transaction = popupRef.current.transaction;

			let userID = await AsyncStorage.getItem("userID");
			let token = await AsyncStorage.getItem("token");
			let key = await AsyncStorage.getItem("key") || "";
			let api = await AsyncStorage.getItem("api");

			let requests = new Requests(api);

			let data: any = validateTransactionData(transaction.amount, transaction.type, transaction.category, transaction.date, transaction.notes);

			if("error" in data) {
				ToastAndroid.show(data?.error, 5000);
				return;
			}

			let encrypted = Utils.encryptObjectValues(key, data);

			await requests.updateTransaction(token, userID, transaction.transactionID, encrypted.transactionType, encrypted.transactionDate, encrypted.transactionCategory, encrypted.transactionAmount, encrypted.transactionNotes);

			setLoading(false);

			hidePopup();

			listTransactions();

			populateBudgetList(true);
		} catch(error) {
			console.log(error);
			setLoading(false);
			ToastAndroid.show("Something went wrong... - EM49", 5000);
		}
	}

	// Creates a transaction.
	async function createTransaction() {
		try {
			setLoading(true);

			let transaction = popupRef.current.transaction;

			let userID = await AsyncStorage.getItem("userID");
			let token = await AsyncStorage.getItem("token");
			let key = await AsyncStorage.getItem("key") || "";
			let api = await AsyncStorage.getItem("api");

			let requests = new Requests(api);

			let data: any = validateTransactionData(transaction.amount, transaction.type, transaction.category, transaction.date, transaction.notes);

			if("error" in data) {
				ToastAndroid.show(data?.error, 5000);
				return;
			}

			let encrypted = Utils.encryptObjectValues(key, data);

			await requests.createTransaction(token, userID, encrypted.transactionType, encrypted.transactionDate, encrypted.transactionCategory, encrypted.transactionAmount, encrypted.transactionNotes);

			setLoading(false);

			hidePopup();

			listTransactions();

			populateBudgetList(true);
		} catch(error) {
			console.log(error);
			setLoading(false);
			ToastAndroid.show("Something went wrong... - EM50", 5000);
		}
	}
}

// Calculates how much money the user has earned or spent based on their transactions.
export function parseTransactionData(transactionData: any) {
	let categories = Object.keys(Utils.defaultBudgetData.categories);
	let parsed: any = {};

	parsed.earned = 0;

	categories.map(category => {
		parsed[category] = 0;
	});

	let keys = Object.keys(transactionData);
	
	keys.map(key => {
		let transaction = transactionData[key];

		try {
			let amount = parseFloat(transaction.transactionAmount);

			if(transaction.transactionType === "spent") {
				parsed[transaction.transactionCategory] += amount;
			} else {
				if(transaction.transactionCategory === "savings") {
					parsed[transaction.transactionCategory] += amount;
				} else {
					parsed.earned += amount;
				}
			}
		} catch(error) {
			console.log(error);
			ToastAndroid.show("Couldn't parse all transactions.", 5000);
		}
	});

	return parsed;
}

// Filters transactions based on the year and month the user has chosen.
export function filterTransactionsByMonth(transactionData: any, month: any, year: any) {
	let filtered: any = {};

	Object.keys(transactionData).map(key => {
		try {
			let transaction = transactionData[key];

			let date = new Date(Date.parse(transaction.transactionDate));

			if(parseFloat(month) === date.getMonth() && parseFloat(year) === date.getFullYear()) {
				filtered[key] = transaction;
			}
		} catch(error) {
			console.log(error);
		}
	});

	return filtered;
}

// Resets the user's budget data.
export function setDefaultBudgetData() {
	return new Promise(async (resolve, reject) => {
		try {
			let userID = await AsyncStorage.getItem("userID");
			let token = await AsyncStorage.getItem("token");
			let key = await AsyncStorage.getItem("key") || "";
			let api = await AsyncStorage.getItem("api");

			let requests = new Requests(api);

			let encrypted = CryptoFN.encryptAES(JSON.stringify(Utils.defaultBudgetData), key);

			await requests.updateBudget(token, userID, encrypted);

			resolve(null);
		} catch(error) {
			console.log(error);
			reject(error);
		}
	});
}

// Searches through the user's watchlist data based on a provided symbol and asset type, and returns the "watchlistID".
export function getWatchlistIDBySymbol(watchlist: any, symbol: string, type: string) {
	try {
		let result = { exists:false, id:null };

		Object.keys(watchlist).map(index => {
			let asset = watchlist[index];
			if(asset?.assetSymbol.toLowerCase() === symbol.toLowerCase() && asset.assetType.toLowerCase() === type.toLowerCase()) {
				result.exists = true;
				result.id = asset.watchlistID;
			}
		});

		return result;
	} catch(error) {
		console.log(error);
		return { exists:false, id:null, error:error };
	}
}

// Validates transaction data.
export function validateTransactionData(amount: any, type: any, category: any, date: any, notes: any) {
	try {
		type = type.toLowerCase();
		category = category.toLowerCase();

		if(Utils.empty(amount) || isNaN(amount) || parseFloat(amount) <= 0) {
			return { error:"Amount must be a number, and greater than zero." };
		}

		if(Utils.empty(category) || (!Object.keys(Utils.defaultBudgetData.categories).includes(category.toLowerCase()) && category.toLowerCase() !== "income")) {
			return { error:"Invalid category." };
		}

		if(type === "earned" && !["income", "savings"].includes(category.toLowerCase())) {
			return { error:"Category must be set to Income or Savings if you earned money." };
		}

		try {
			new Date(Date.parse(date));
		} catch(error) {
			return { error:"Invalid date." };
		}

		if(Utils.empty(notes)) {
			notes = "-";
		}

		return { transactionAmount:amount, transactionType:type, transactionCategory:category.toLowerCase(), transactionDate:date, transactionNotes:notes };
	} catch(error) {
		console.log(error);
		return { error:"Invalid data." };
	}
}

// Fetches, decrypts, and returns the user's budget data.
export function fetchBudget() {
	return new Promise(async (resolve, reject) => {
		try {
			let userID = await AsyncStorage.getItem("userID");
			let token = await AsyncStorage.getItem("token");
			let key = await AsyncStorage.getItem("key") || "";
			let api = await AsyncStorage.getItem("api");

			let requests = new Requests(api);

			let budget = await requests.readBudget(token, userID);

			if(Utils.empty(budget?.data?.readBudget)) {
				resolve({});
				return;
			}
	
			let encrypted = budget?.data?.readBudget?.budgetData;

			if(Utils.empty(encrypted)) {
				resolve({});
				return;
			}

			let budgetData = CryptoFN.decryptAES(encrypted, key);

			if(!Utils.validJSON(budgetData)) {
				resolve({});
				return;
			}

			resolve(JSON.parse(budgetData));
		} catch(error) {
			console.log(error);
			reject(error);
		}
	});
}

// Fetches, decrypts, and returns the user's transaction data.
export function fetchTransaction() {
	return new Promise(async (resolve, reject) => {
		try {
			let userID = await AsyncStorage.getItem("userID");
			let token = await AsyncStorage.getItem("token");
			let key = await AsyncStorage.getItem("key") || "";
			let api = await AsyncStorage.getItem("api");

			let requests = new Requests(api);

			let transaction = await requests.readTransaction(token, userID);

			if(Utils.empty(transaction?.data?.readTransaction)) {
				resolve({});
				return;
			}
	
			let transactionData: any = {};
	
			let encrypted = transaction?.data?.readTransaction;
	
			Object.keys(encrypted).map(index => {
				let decrypted = Utils.decryptObjectValues(key, encrypted[index]);
				decrypted.transactionID = encrypted[index].transactionID;
				transactionData[decrypted.transactionID] = decrypted;
			});

			resolve(transactionData);
		} catch(error) {
			console.log(error);
			reject(error);
		}
	});
}

// Sorts transaction data by date.
function sortTransactionDataByDate(transactionData: any) {
	let sorted: any = {};
	let sortedKeys: any = [];
	let array = [];

	for(let transaction in transactionData) {
		array.push([transaction, transactionData[transaction].transactionDate]);
	}

	array.sort(function(a, b) {
		return new Date(a[1]).getTime() - new Date(b[1]).getTime();
	});

	array.map(item => {
		sorted[item[0]] = transactionData[item[0]];
		sortedKeys.push(item[0]);
	});

	return { sorted:sorted, sortedKeys:sortedKeys.reverse() };
}

// Returns the watchlist IDs of every watchlist row.
export function getWatchlistIDs(watchlist: any) {
	let ids: any = [];

	Object.keys(watchlist).map(id => {
		ids.push(watchlist[id].assetID);
	});

	return ids;
}

// Returns the asset symbols of every watchlist row.
export function getWatchlistSymbols(watchlist: any) {
	let symbols: any = [];

	Object.keys(watchlist).map(id => {
		symbols.push(watchlist[id].assetSymbol);
	});

	return symbols;
}

// Filters watchlist data by asset type (crypto or stock).
export function filterWatchlistByType(watchlistData: any) {
	let watchlistCrypto: any = {};
	let watchlistStocks: any = {};

	let ids = Object.keys(watchlistData);
	ids.map(id => {
		let asset = watchlistData[id];
		if(asset.assetType === "crypto") {
			watchlistCrypto[id] = asset;
		} else {
			watchlistStocks[id] = asset;
		}
	});

	return { crypto:watchlistCrypto, stocks:watchlistStocks };
}

// Checks whether an asset is in the user's watchlist based on the asset ID.
export function watchlistExists(watchlist: any, id: string) {
	try {
		if(Utils.empty(id)) {
			return false;
		}
		
		let exists = false;

		Object.keys(watchlist).map(index => {
			let asset = watchlist[index];
			if(asset?.assetID.toLowerCase() === id.toLowerCase()) {
				exists = true;
			}
		});

		return exists;
	} catch(error) {
		console.log(error);
		return false;
	}
}

// Returns the "watchlistID" of a particular asset in the user's watchlist data.
export function getWatchlistID(watchlist: any, assetID: string) {
	try {
		if(Utils.empty(assetID)) {
			return false;
		}

		let id: any = null;

		Object.keys(watchlist).map(index => {
			let asset = watchlist[index];
			if(asset?.assetID.toLowerCase() === assetID.toLowerCase()) {
				id = asset?.watchlistID;
			}
		});

		return id;
	} catch(error) {
		console.log(error);
		return false;
	}
}

// Generates watchlist "FlatList" rows.
export function createWatchlistListRows(marketCryptoData: any, marketStocksData: any, watchlistData: any, currency: string) {
	let rows: any = {};

	let ids = Object.keys(watchlistData);

	marketCryptoData = sortMarketDataByCoinID(marketCryptoData);

	for(let i = 0; i < ids.length; i++) {
		try {
			let id = ids[i];
			
			let asset = watchlistData[id];

			if(asset.assetType === "crypto") {
				if(Utils.empty(marketCryptoData)) {
					continue;
				}

				let coin = marketCryptoData[asset.assetID];

				let coinID = coin.id;
				let price = coin.current_price;
				let priceChangeDay = Utils.formatPercentage(coin.market_cap_change_percentage_24h);
				let name = coin.name;
				let symbol = coin.symbol;
				let marketCap = coin.market_cap;
				let volume = coin.total_volume;
				let athChange = Utils.formatPercentage(coin?.ath_change_percentage);
				let ath = coin?.ath;
				let high24h = coin?.high_24h;
				let low24h = coin?.low_24h;
				let supply = coin?.circulating_supply;
				let rank = coin.market_cap_rank || "-";

				let info = { id:coinID, price:price, priceChangeDay:priceChangeDay, name:name, symbol:symbol, marketCap:marketCap, volume:volume, rank:rank, watchlistID:id, type:"crypto", athChange:athChange, ath:ath, high24h:high24h, low24h, supply:supply };

				rows[id] = info;
			} else {
				let symbol = asset.assetSymbol.toUpperCase();

				let stock = marketStocksData[symbol].priceData;

				let shortName = stock.shortName;
				let price = stock.price;
				let marketCap = stock.marketCap;
				let volume = stock.volume;
				let priceChangeDay = Utils.formatPercentage(stock.change);

				let info = { id:symbol, symbol:symbol, price:price, priceChangeDay:priceChangeDay, name:shortName, marketCap:marketCap, volume:volume, watchlistID:id, type:"stock", change:stock.change, currency:currency, displayName:stock.displayName, high1y:stock.high1y, low1y:stock.low1y, longName:stock.longName, shortName:shortName };

				rows[id] = info;
			}
		} catch(error) {
			console.log(error);
		}
	}

	return rows;
}

// Fetches, decrypts, and returns the user's watchlist data.
export function fetchWatchlist() {
	return new Promise(async (resolve, reject) => {
		try {
			let userID = await AsyncStorage.getItem("userID");
			let token = await AsyncStorage.getItem("token");
			let key = await AsyncStorage.getItem("key") || "";
			let api = await AsyncStorage.getItem("api");

			let requests = new Requests(api);

			let watchlist = await requests.readWatchlist(token, userID);

			if(Utils.empty(watchlist?.data?.readWatchlist)) {
				resolve(null);
				return;
			}

			let watchlistData: any = {};
	
			let encrypted = watchlist?.data?.readWatchlist;
	
			Object.keys(encrypted).map(index => {
				let decrypted = Utils.decryptObjectValues(key, encrypted[index]);
				decrypted.watchlistID = encrypted[index].watchlistID;
				watchlistData[decrypted.watchlistID] = decrypted;
			});

			resolve(watchlistData);
		} catch(error) {
			console.log(error);
			reject(error);
		}
	});
}