import React, { useState } from "react";
import { Keyboard, Modal, ScrollView, StyleSheet, Text, TextInput, ToastAndroid, TouchableOpacity, View } from "react-native";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Colors, GlobalStyle } from "../styles/Global";
import Icon from "react-native-vector-icons/FontAwesome5";
import DatePicker from "react-native-modern-datepicker";
import Utils from "../utils/Utils";
import styles from "../styles/Dashboard";
import Requests from "../utils/Requests";

export default function Item({ info, theme, settings, popupRef, setLoading, showPopup, hidePopup, listTransactions }: any) {	
	let hasNote = (!Utils.empty(info.transactionNotes) && info.transactionNotes !== "-");

	let date = settings?.dateFormat === "dd-mm-yyyy" ? Utils.formatDateHyphenatedHuman(new Date(Date.parse(info.transactionDate))) : Utils.formatDateHyphenated(new Date(Date.parse(info.transactionDate)));

	return (
		<TouchableOpacity onPress={() => showTransactionPopup(info, "update")} style={[componentStyles.card, componentStyles[`card${theme}`], componentStyles[`card${Utils.capitalizeFirstLetter(info.transactionCategory)}`]]}>
			<View>
				<View style={componentStyles.row}>
					<Text style={[componentStyles.text, componentStyles[`text${theme}`], { backgroundColor:Colors[theme].accentThird, color:Colors[theme].accentContrast }]}>{date}</Text>
					<Text style={[componentStyles.text, componentStyles[`text${theme}`], { backgroundColor:Colors[theme].accentFirst, color:Colors[theme].accentContrast, marginLeft:10 }]}>{Utils.capitalizeFirstLetter(info.transactionCategory)}</Text>
				</View>
				<View style={componentStyles.row}>
					<Text style={[componentStyles.text, componentStyles[`text${theme}`], componentStyles[`text${Utils.capitalizeFirstLetter(info.transactionType) + theme}`], { marginBottom:hasNote ? 10 : 0 }]}>{info.transactionCategory === "savings" ? "Saved" : Utils.capitalizeFirstLetter(info.transactionType)} {Utils.currencySymbols[settings.currency] + Utils.separateThousands(info.transactionAmount)}</Text>
				</View>
				{ hasNote &&
					<View style={componentStyles.row}>
						<Text style={[componentStyles.text, componentStyles[`text${theme}`], { backgroundColor:Colors[theme].mainThird, marginBottom:0 }]}>{info.transactionNotes}</Text>
					</View>
				}
			</View>
		</TouchableOpacity>
	);

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
					<View style={styles.popupContent}>
						<Modal animationType="fade" visible={popupRef.current.transaction.showDatePicker} onRequestClose={() => { popupRef.current.transaction.showDatePicker = false; changeContent() }} transparent={true}>
							<ScrollView style={[styles.modalScroll, styles[`modalScroll${theme}`]]}>
								<DatePicker 
									onSelectedChange={(value: any) => setDate(value)} 
									style={styles.calendar}
									options={{
										backgroundColor: Colors[theme].mainFirst,
										textHeaderColor: Colors[theme].accentSecond,
										textDefaultColor: Colors[theme].mainContrast,
										selectedTextColor: Colors[theme].accentContrast,
										mainColor: Colors[theme].accentSecond,
										textSecondaryColor: Colors[theme].accentFirst,
										borderColor: Colors[theme].accentSecond,
									}}
								/>
								<View style={{ justifyContent:"center", alignItems:"center", width:"100%", marginTop:20 }}>
									<TouchableOpacity style={[styles.button, styles.actionButton, styles[`actionButton${theme}`], { width:100 }]} onPress={() => { popupRef.current.transaction.showDatePicker = false; changeContent() }}>
										<Text style={styles.text}>Cancel</Text>
									</TouchableOpacity>
								</View>
							</ScrollView>
						</Modal>
						<ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent} showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false}>
							<View style={[styles.modalSection, styles[`modalSection${theme}`], { marginTop:20, backgroundColor:Colors[theme].mainThird }]}>
								<Text style={[styles.modalInfo, styles[`modalInfo${theme}`]]}>Update Transaction</Text>
							</View>
							<View style={[styles.modalSection, styles[`modalSection${theme}`], { backgroundColor:Colors[theme].mainThird }]}>
								<Text style={[styles.labelInput, styles[`labelInput${theme}`]]}>Amount</Text>
								<TextInput 
									defaultValue={popupRef.current.transaction.amount.toString()}
									spellCheck={false}
									keyboardType="decimal-pad"
									autoCorrect={false}
									placeholder="Amount..." 
									selectionColor={Colors[theme].mainContrast} 
									placeholderTextColor={Colors[theme].mainContrastDarker} 
									style={[styles.popupInput, styles[`popupInput${theme}`]]} 
									onChangeText={(value) => popupRef.current.transaction.amount = value}
								/>
								<View style={styles.popupChoicesWrapper}>
									<TouchableOpacity onPress={() => { popupRef.current.transaction.type = "earned"; changeContent(); }} style={[styles.button, styles.choiceButton, styles[`choiceButton${theme}`], styles.popupChoiceButton, popupRef.current.transaction.type === "earned" ? styles[`choiceButtonActive${theme}`] : null]}>
										<Text style={[styles.choiceText, styles[`choiceText${theme}`], popupRef.current.transaction.type === "earned" ? styles[`choiceTextActive${theme}`] : null]}>Earned</Text>
									</TouchableOpacity>
									<TouchableOpacity onPress={() => { popupRef.current.transaction.type = "spent"; changeContent(); }} style={[styles.button, styles.choiceButton, styles[`choiceButton${theme}`], styles.popupChoiceButton, popupRef.current.transaction.type === "spent" ? styles[`choiceButtonActive${theme}`] : null]}>
										<Text style={[styles.choiceText, styles[`choiceText${theme}`], popupRef.current.transaction.type === "spent" ? styles[`choiceTextActive${theme}`] : null]}>Spent</Text>
									</TouchableOpacity>
								</View>
								<Text style={[styles.labelInput, styles[`labelInput${theme}`], { marginTop:10 }]}>Category</Text>
								<View style={styles.pickerWrapper}>
									<Picker
										mode="dropdown"
										dropdownIconColor={Colors[theme].mainContrastDark}
										selectedValue={popupRef.current.transaction.category}
										style={[styles.picker, styles[`picker${theme}`]]}
										onValueChange={(itemValue, itemIndex) => {
											popupRef.current.transaction.category = itemValue;
											changeContent();
										}}
									>
										<Picker.Item label="Food" value="Food"/>
										<Picker.Item label="Housing" value="Housing"/>
										<Picker.Item label="Transport" value="Transport"/>
										<Picker.Item label="Entertainment" value="Entertainment"/>
										<Picker.Item label="Insurance" value="Insurance"/>
										<Picker.Item label="Savings" value="Savings"/>
										<Picker.Item label="Other" value="Other"/>
									</Picker>
								</View>
								<Text style={[styles.labelInput, styles[`labelInput${theme}`]]}>Date</Text>
								<View style={styles.popupButtonWrapper}>
									<TextInput 
										spellCheck={false}
										defaultValue={popupRef.current.transaction.date.toString()}
										autoCorrect={false}
										placeholder="Date..." 
										selectionColor={Colors[theme].mainContrast} 
										placeholderTextColor={Colors[theme].mainContrastDarker} 
										style={[styles.popupInput, styles[`popupInput${theme}`], { width:150, marginRight:5 }]} 
										onChangeText={(value) => popupRef.current.transaction.date = value}
									/>
									<TouchableOpacity style={[styles.button, styles.iconButton, styles[`iconButton${theme}`], { height:40 }]} onPress={() => { popupRef.current.transaction.showDatePicker = true; changeContent() }}>
										<Icon name="calendar" size={20} color={Colors[theme].mainContrastLight}></Icon>
									</TouchableOpacity>
								</View>
								<Text style={[styles.labelInput, styles[`labelInput${theme}`]]}>Notes</Text>
								<TextInput 
									defaultValue={popupRef.current.transaction.notes.toString()}
									spellCheck={false}
									keyboardType="decimal-pad"
									autoCorrect={false}
									placeholder="Notes..." 
									selectionColor={Colors[theme].mainContrast} 
									placeholderTextColor={Colors[theme].mainContrastDarker} 
									style={[styles.popupInput, styles[`popupInput${theme}`], { marginBottom:0 }]} 
									onChangeText={(value) => popupRef.current.transaction.notes = value}
								/>
								{ action === "update" &&
									<TouchableOpacity onPress={() => showConfirmationPopup()} style={[styles.button, styles.actionButton, styles[`actionButton${theme}`], styles.popupButton, styles.dangerButton, styles[`dangerButton${theme}`], styles.sectionButton, { marginBottom:0 }]}>
										<Text style={[styles.actionText, styles[`actionText${theme}`]]}>Delete Transaction</Text>
									</TouchableOpacity>
								}
							</View>
							<View style={[styles.popupButtonWrapper, { marginBottom:20 }]}>
								<TouchableOpacity onPress={() => hidePopup()} style={[styles.button, styles.choiceButton, styles[`choiceButton${theme}`], styles.popupButton]}>
									<Text style={[styles.choiceText, styles[`choiceText${theme}`]]}>Cancel</Text>
								</TouchableOpacity>
								<TouchableOpacity onPress={() => updateTransaction()} style={[styles.button, styles.actionButton, styles[`actionButton${theme}`], styles.popupButton]}>
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
		popupRef.current.transaction.date = value;
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

let componentStyles: any = StyleSheet.create({
	card: {
		flexDirection: "column",
		borderLeftWidth: 4,
		borderStyle: "solid",
		borderColor: Colors.Dark.mainContrast,
		marginBottom: 20,
		padding: 20,
		backgroundColor: Colors.Dark.mainFirst,
		borderRadius: GlobalStyle.borderRadius,
		shadowColor: GlobalStyle.shadowColor,
		shadowOffset: GlobalStyle.shadowOffset,
		shadowOpacity: GlobalStyle.shadowOpacity,
		shadowRadius: GlobalStyle.shadowRadius,
		elevation: GlobalStyle.shadowElevation,
	},
	cardLight: {
		borderColor: Colors.Light.mainContrast,
		backgroundColor: Colors.Light.mainFirst
	},
	cardFood: {
		borderColor: "rgb(254,137,112)",
	},
	cardHousing: {
		borderColor: "rgb(157,255,149)",
	},
	cardTransport: {
		borderColor: "rgb(200,172,165)",
	},
	cardEntertainment: {
		borderColor: "rgb(255,195,127)",
	},
	cardInsurance: {
		borderColor: "rgb(119,254,229)",
	},
	cardSavings: {
		borderColor: "rgb(119,194,253)",
	},
	cardOther: {
		borderColor: "rgb(182,137,251)",
	},
	row: {
		flexDirection: "row"
	},
	text: {
		color: Colors.Dark.mainContrast,
		padding: 10,
		borderRadius: GlobalStyle.borderRadius,
		marginBottom: 10
	},
	textLight: {
		color: Colors.Light.mainContrast
	},
	textEarnedDark: {
		backgroundColor: Colors.Dark.positiveFirst,
		color: Colors.Dark.accentContrast
	},
	textSpentDark: {
		backgroundColor: Colors.Dark.negativeFirst,
		color: Colors.Dark.accentContrast
	},
	textEarnedLight: {
		backgroundColor: Colors.Light.positiveFirst,
		color: Colors.Light.accentContrast
	},
	textSpentLight: {
		backgroundColor: Colors.Light.negativeFirst,
		color: Colors.Light.accentContrast
	},
});