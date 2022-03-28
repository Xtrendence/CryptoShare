import React, { useState, useEffect } from "react";
import { Picker } from "@react-native-picker/picker";
import { Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import DatePicker from "react-native-modern-datepicker";
import Icon from "react-native-vector-icons/FontAwesome5";
import styles from "../styles/Dashboard";
import { Colors } from "../styles/Global";
import Utils from "../utils/Utils";

// Component used to add and update transactions.
export default function TransactionPopup({ popupRef, changeContent, theme, setDate, action, showConfirmationPopup, hidePopup, updateTransaction, createTransaction }: any) {
	const [initialSelect, setInitialSelect] = useState<boolean>(true);

	useEffect(() => {
		setInitialSelect(true);
	}, [popupRef.current.transaction.showDatePicker]);

	let formattedDate = Utils.empty(popupRef.current.transaction.date) ? Utils.formatDateHyphenated(new Date()) : Utils.formatDateHyphenated(new Date(Date.parse(Utils.replaceAll("/", "-", popupRef.current.transaction.date))));
	
	return (
		<View style={styles.popupContent}>
			<Modal animationType="fade" visible={popupRef.current.transaction.showDatePicker} onRequestClose={() => { popupRef.current.transaction.showDatePicker = false; changeContent() }} transparent={true}>
				<ScrollView style={[styles.modalScroll, styles[`modalScroll${theme}`]]}>
					<DatePicker 
						mode="calendar"
						selected={formattedDate}
						onSelectedChange={(value: any) => changeDate(value)} 
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
					<Text style={[styles.modalInfo, styles[`modalInfo${theme}`]]}>{ action === "create" ? "Create" : "Update"} Transaction</Text>
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
					<TouchableOpacity onPress={() => { action === "create" ? createTransaction() : updateTransaction() }} style={[styles.button, styles.actionButton, styles[`actionButton${theme}`], styles.popupButton]}>
						<Text style={[styles.actionText, styles[`actionText${theme}`]]}>Confirm</Text>
					</TouchableOpacity>
				</View>
			</ScrollView>
		</View>
	);

	function changeDate(value: any) {
		if(initialSelect) {
			setInitialSelect(false);
			return;
		}

		setDate(value);
	}
}