import { useFocusEffect } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import { FlatList, ImageBackground, Keyboard, Modal, ScrollView, Text, TextInput, ToastAndroid, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Utils from "../utils/Utils";
import { SafeAreaView } from "react-native-safe-area-context";
import Pie from "react-native-pie";
import styles from "../styles/Dashboard";
import { useDispatch, useSelector } from "react-redux";
import { Colors } from "../styles/Global";
import store from "../store/store";
import CryptoFN from "../utils/CryptoFN";
import Requests from "../utils/Requests";
import BudgetStats from "../components/BudgetStats";
import Loading from "../components/Loading";
import Item from "../components/TransactionItem";
import TransactionPopup from "../components/TransactionPopup";

export default function Dashboard({ navigation }: any) {
	const dispatch = useDispatch();
	const { theme } = useSelector((state: any) => state.theme);
	const { settings } = useSelector((state: any) => state.settings);

	const [loading, setLoading] = useState<boolean>(false);
	const [loadingText, setLoadingText] = useState<string>("");

	const [popup, setPopup] = useState<boolean>(false);
	const [popupContent, setPopupContent] = useState<any>(null);

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
			category: "",
			date: "",
			notes: "",
			showDatePicker: false,
			action: "create",
		}
	});

	const [list, setList] = useState<string>("budget");

	const defaultBudgetStats = null;

	const [budgetChart, setBudgetChart] = useState<any>(null);
	const [budgetStats, setBudgetStats] = useState<any>(defaultBudgetStats);
	const [budgetSummary, setBudgetSummary] = useState<any>(null);

	const [watchlistRows, setWatchlistRows] = useState<any>({});

	const [modal, setModal] = useState<boolean>(false);
	const [transactionRows, setTransactionRows] = useState<any>({});
	const [transactionHeader, setTransactionHeader] = useState<any>(null);

	const renderItem = ({ item }: any) => {
		let info = transactionRows[item];
		info.showDatePicker = popupRef.current.transaction.showDatePicker;

		return (
			<Item info={info} theme={theme} settings={settings} setLoading={setLoading} showPopup={showPopup} hidePopup={hidePopup} popupRef={popupRef} listTransactions={listTransactions} showTransactionPopup={showTransactionPopup}/>
		);
	}
	
	useFocusEffect(Utils.backHandler(navigation));

	useEffect(() => {
		navigation.addListener("focus", () => {
			if(navigation.isFocused()) {
				setBudgetChart(null);
				setBudgetStats(null);
				setBudgetSummary(null);
				setTransactionRows({});
				
				setTimeout(() => {
					populateBudgetList(true);
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
			clearInterval(refresh);
		};
	}, []);

	return (
		<ImageBackground source={Utils.getBackground(theme)} resizeMethod="scale" resizeMode="cover">
			<SafeAreaView style={styles.area}>
				<View style={[styles.areaActionsWrapper, styles[`areaActionsWrapper${theme}`], { top:40 }]}>
					<TouchableOpacity onPress={() => changeList("budget")} style={[styles.button, styles.choiceButton, styles[`choiceButton${theme}`], list === "budget" ? styles[`choiceButtonActive${theme}`] : null]}>
						<Text style={[styles.choiceText, styles[`choiceText${theme}`], list === "budget" ? styles[`choiceTextActive${theme}`] : null]}>Budget</Text>
					</TouchableOpacity>
					<TouchableOpacity onPress={() => changeList("watchlist")} style={[styles.button, styles.choiceButton, styles[`choiceButton${theme}`], list === "watchlist" ? styles[`choiceButtonActive${theme}`] : null]}>
						<Text style={[styles.choiceText, styles[`choiceText${theme}`], list === "watchlist" ? styles[`choiceTextActive${theme}`] : null]}>Watchlist</Text>
					</TouchableOpacity>
				</View>
				{ list === "budget" &&
					<ScrollView style={[styles.wrapper, styles[`wrapper${theme}`]]} contentContainerStyle={styles.budgetScrollViewContent} showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false}>
						{budgetChart}
						{budgetStats}
						{budgetSummary}
					</ScrollView>
				}
				{ list === "watchlist" &&
					<FlatList
						contentContainerStyle={{ paddingTop:10 }}
						data={Object.keys(watchlistRows)}
						renderItem={watchlistRows}
						keyExtractor={item => watchlistRows[item].watchlistID}
						style={[styles.wrapper, styles[`wrapper${theme}`]]}
					/>
				}
				<View style={[styles.areaActionsWrapper, styles[`areaActionsWrapper${theme}`]]}>
					<TouchableOpacity onPress={() => showModal()} style={[styles.button, styles.actionButton, styles[`actionButton${theme}`]]}>
						<Text style={[styles.actionText, styles[`actionText${theme}`]]}>Transactions</Text>
					</TouchableOpacity>
					<TouchableOpacity onPress={() => showEditPopup()} style={[styles.button, styles.actionButton, styles[`actionButton${theme}`]]}>
						<Text style={[styles.actionText, styles[`actionText${theme}`]]}>Edit Budget</Text>
					</TouchableOpacity>
				</View>
			</SafeAreaView>
			<Modal visible={popup} onRequestClose={hidePopup} transparent={true}>
				<View style={styles.popup}>
					<TouchableOpacity onPress={() => hidePopup()} style={styles.popupBackground}></TouchableOpacity>
					<View style={styles.popupForeground}>
						<View style={[styles.popupWrapper, styles[`popupWrapper${theme}`], { padding:0 }]}>{popupContent}</View>
					</View>
				</View>
			</Modal>
			<Modal visible={modal} onRequestClose={() => hideModal()} transparent={false}>
				<View style={[styles.modalContent, styles[`modalContent${theme}`]]}>
					<FlatList
						contentContainerStyle={{ paddingTop:20, paddingLeft:20, paddingRight:20 }}
						data={Object.keys(transactionRows)}
						renderItem={renderItem}
						keyExtractor={item => transactionRows[item].transactionID}
						style={[styles.modalList, styles[`modalList${theme}`]]}
						ListHeaderComponent={transactionHeader}
						ListHeaderComponentStyle={styles.listHeader}
					/>
					<View style={[styles.areaActionsWrapper, styles[`areaActionsWrapper${theme}`], { top:"auto", bottom:20 }]}>
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
				Utils.notify(theme, "Something went wrong...");
				console.log(error);
			}
		}
	}

	function populateWatchlist() {
		
	}

	async function listTransactions() {
		try {
			let transactions: any = await fetchTransaction() || {};

			if(Utils.empty(transactions)) {
				setTransactionHeader(<View style={styles.listTextWrapper}><Text style={[styles.listText, styles[`listText${theme}`]]}>No Transactions Found</Text></View>);
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

			setTransactionRows(rows);

			setLoading(false);
		} catch(error) {
			console.log(error);
			ToastAndroid.show("Something went wrong...", 5000);
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

	function showAddPopup() {
		let info = {
			transactionID: "",
			transactionAmount: "",
			transactionType: "spent",
			transactionCategory: "",
			transactionDate: "",
			transactionNotes: "",
			showDatePicker: false,
			action: "create"
		}

		showTransactionPopup(info, "create");
	}

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
			Utils.notify(theme, "Something went wrong...");
		}
	}

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
			Utils.notify(theme, "Something went wrong...");
		}
	}

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
			Utils.notify(theme, "Something went wrong...");
		}
	}

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
			Utils.notify(theme, "Something went wrong...");
		}
	}

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

	function generateBudgetStats(theme: string, budgetData: any, transactionData: any, backgroundColors: any) {
		if(Utils.empty(transactionData)) {
			setBudgetStats(defaultBudgetStats);
			return;
		}

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

		setBudgetStats(<BudgetStats theme={theme} currency={currency} stats={budgetAmounts} backgroundColors={backgroundColors}/>)
	}

	function parseTransactionData(transactionData: any) {
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
				Utils.notify(theme, "Couldn't parse all transactions.");
			}
		});

		return parsed;
	}

	function changeList(list: string) {
		setList(list);
	}

	function fetchWatchlist() {
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
			Utils.notify(theme, "Something went wrong...");
		}
	}

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
		} catch(error) {
			console.log(error);
			setLoading(false);
			ToastAndroid.show("Something went wrong...", 5000);
		}
	}

	async function updateTransaction() {
		try {
			setLoading(true);

			let transaction = popupRef.current.transaction;

			let userID = await AsyncStorage.getItem("userID");
			let token = await AsyncStorage.getItem("token");
			let key = await AsyncStorage.getItem("key") || "";
			let api = await AsyncStorage.getItem("api");

			let requests = new Requests(api);

			let data: any = parseTransactionPopupData(transaction.amount, transaction.type, transaction.category, transaction.date, transaction.notes);

			if("error" in data) {
				ToastAndroid.show(data?.error, 5000);
				return;
			}

			let encrypted = Utils.encryptObjectValues(key, data);

			await requests.updateTransaction(token, userID, transaction.transactionID, encrypted.transactionType, encrypted.transactionDate, encrypted.transactionCategory, encrypted.transactionAmount, encrypted.transactionNotes);

			setLoading(false);

			hidePopup();

			listTransactions();
		} catch(error) {
			console.log(error);
			setLoading(false);
			ToastAndroid.show("Something went wrong...", 5000);
		}
	}

	async function createTransaction() {
		try {
			setLoading(true);

			let transaction = popupRef.current.transaction;

			let userID = await AsyncStorage.getItem("userID");
			let token = await AsyncStorage.getItem("token");
			let key = await AsyncStorage.getItem("key") || "";
			let api = await AsyncStorage.getItem("api");

			let requests = new Requests(api);

			let data: any = parseTransactionPopupData(transaction.amount, transaction.type, transaction.category, transaction.date, transaction.notes);

			if("error" in data) {
				ToastAndroid.show(data?.error, 5000);
				return;
			}

			let encrypted = Utils.encryptObjectValues(key, data);

			await requests.createTransaction(token, userID, encrypted.transactionType, encrypted.transactionDate, encrypted.transactionCategory, encrypted.transactionAmount, encrypted.transactionNotes);

			setLoading(false);

			hidePopup();

			listTransactions();
		} catch(error) {
			console.log(error);
			setLoading(false);
			ToastAndroid.show("Something went wrong...", 5000);
		}
	}

	function fetchBudget() {
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

	function fetchTransaction() {
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

	function setDefaultBudgetData() {
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
}

export function parseTransactionPopupData(amount: any, type: any, category: any, date: any, notes: any) {
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