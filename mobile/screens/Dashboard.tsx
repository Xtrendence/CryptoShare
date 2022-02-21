import { useFocusEffect } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { FlatList, ImageBackground, ScrollView, Text, TouchableOpacity, View } from "react-native";
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

export default function Dashboard({ navigation }: any) {
	const dispatch = useDispatch();
	const { theme } = useSelector((state: any) => state.theme);

	const [loading, setLoading] = useState<boolean>(false);
	const [loadingText, setLoadingText] = useState<string>("");

	const [popup, setPopup] = useState<boolean>(false);
	const [popupContent, setPopupContent] = useState<any>(null);

	const [list, setList] = useState<string>("budget");

	const [budgetChart, setBudgetChart] = useState<any>(null);
	const [budgetStats, setBudgetStats] = useState<any>(null);

	const [watchlistRows, setWatchlistRows] = useState<any>({});
	
	useFocusEffect(Utils.backHandler(navigation));

	useEffect(() => {
		navigation.addListener("focus", () => {
			if(navigation.isFocused()) {
				setTimeout(() => {
					populateDashboardList(true);
				}, 500);
			}
		});
		
		let refresh = setInterval(() => {
			if(navigation.isFocused()) {
				populateDashboardList(false);
			}
		}, 15000);

		return () => {
			clearInterval(refresh);
		};
	}, []);

	return (
		<ImageBackground source={Utils.getBackground(theme)} resizeMethod="scale" resizeMode="cover">
			<SafeAreaView style={styles.area}>
				{ list === "budget" &&
					<ScrollView style={[styles.wrapper, styles[`wrapper${theme}`]]} contentContainerStyle={styles.budgetScrollViewContent} showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false}>
						{budgetChart}
						{budgetStats}
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
		</ImageBackground>
	);

	async function populateDashboardList(recreate: boolean) {
		try {
			let settings: any = store.getState().settings.settings;

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

			generatePieChart(budgetData);
			generateBudgetStats(budgetData, transactionData);
		} catch(error) {
			if(error !== "Timeout.") {
				Utils.notify(theme, "Something went wrong...");
				console.log(error);
			}
		}
	}

	function generatePieChart(budgetData: any) {
		let settings: any = store.getState().settings.settings;

		let currency = settings.currency;

		let backgroundColors: any = {
			food: "rgb(254,137,112)",
			housing: "rgb(157,255,149)",
			transport: "rgb(200,172,165)",
			entertainment: "rgb(255,195,127)",
			insurance: "rgb(119,254,229)",
			savings: "rgb(119,194,253)",
			other: "rgb(182,137,251)",
		};

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

	function generateBudgetStats(budgetData: any, transactionData: any) {
		
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