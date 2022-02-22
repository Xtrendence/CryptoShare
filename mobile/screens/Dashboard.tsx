import { useFocusEffect } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import { FlatList, ImageBackground, Keyboard, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
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

export default function Dashboard({ navigation }: any) {
	const dispatch = useDispatch();
	const { theme } = useSelector((state: any) => state.theme);

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
			category: "",
			date: "",
			notes: ""
		}
	});

	const [list, setList] = useState<string>("budget");

	const defaultBudgetStats = null;

	const [budgetChart, setBudgetChart] = useState<any>(null);
	const [budgetStats, setBudgetStats] = useState<any>(defaultBudgetStats);
	const [budgetSummary, setBudgetSummary] = useState<any>(null);

	const [watchlistRows, setWatchlistRows] = useState<any>({});
	
	useFocusEffect(Utils.backHandler(navigation));

	useEffect(() => {
		navigation.addListener("focus", () => {
			if(navigation.isFocused()) {
				setBudgetChart(null);
				setBudgetStats(null);
				setBudgetSummary(null);
				
				setTimeout(() => {
					populateBudgetList(true);
					populateWatchlist();
				}, 500);
			}
		});
		
		let refresh = setInterval(() => {
			if(navigation.isFocused()) {
				populateBudgetList(true);
				populateWatchlist();
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
					<TouchableOpacity style={[styles.button, styles.actionButton, styles[`actionButton${theme}`]]}>
						<Text style={[styles.actionText, styles[`actionText${theme}`]]}>Transactions</Text>
					</TouchableOpacity>
					<TouchableOpacity onPress={() => showEditPopup()} style={[styles.button, styles.actionButton, styles[`actionButton${theme}`]]}>
						<Text style={[styles.actionText, styles[`actionText${theme}`]]}>Edit Budget</Text>
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
					<TouchableOpacity onPress={() => changeList("budget")} style={[styles.button, styles.choiceButton, styles[`choiceButton${theme}`], list === "budget" ? styles[`choiceButtonActive${theme}`] : null]}>
						<Text style={[styles.choiceText, styles[`choiceText${theme}`], list === "budget" ? styles[`choiceTextActive${theme}`] : null]}>Budget</Text>
					</TouchableOpacity>
					<TouchableOpacity onPress={() => changeList("watchlist")} style={[styles.button, styles.choiceButton, styles[`choiceButton${theme}`], list === "watchlist" ? styles[`choiceButtonActive${theme}`] : null]}>
						<Text style={[styles.choiceText, styles[`choiceText${theme}`], list === "watchlist" ? styles[`choiceTextActive${theme}`] : null]}>Watchlist</Text>
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
			let settings: any = state.settings.settings;
			let theme: any = state.theme.theme;

			let userID = await AsyncStorage.getItem("userID");
			let token = await AsyncStorage.getItem("token");
			let key = await AsyncStorage.getItem("key") || "";
			let api = await AsyncStorage.getItem("api");

			let currency = settings.currency;

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

	function showEditPopup() {
		let content = () => {
			return (
				<View style={[styles.popupContent, { padding:20 }]}>
					<View style={[styles.modalSection, styles[`modalSection${theme}`], { backgroundColor:Colors[theme].mainThird }]}>
						<Text style={[styles.modalInfo, styles[`modalInfo${theme}`]]}>Tools</Text>
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

	function updateIncome() {
		try {
			setLoading(true);

			populateBudgetList(true);

			setLoading(false);
		} catch(error) {
			console.log(error);
			setLoading(false);
			Utils.notify(theme, "Something went wrong...");
		}
	}

	function updateBudget() {
		try {
			setLoading(true);

			populateBudgetList(true);

			setLoading(false);
		} catch(error) {
			console.log(error);
			setLoading(false);
			Utils.notify(theme, "Something went wrong...");
		}
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