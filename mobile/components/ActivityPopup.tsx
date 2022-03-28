import React, { useState, useEffect } from "react";
import { Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import DatePicker from "react-native-modern-datepicker";
import Icon from "react-native-vector-icons/FontAwesome5";
import styles from "../styles/Activity";
import { Colors } from "../styles/Global";
import Utils from "../utils/Utils";

// Popup component for creating and updating activities.
export default function ActivityPopup({ action, theme, popupRef, data, hidePopup, showActivityPopup, showConfirmationPopup, processAction }: any) {
	const [initialSelect, setInitialSelect] = useState<boolean>(true);
	const [showDatePicker, setShowDatePicker] = useState<boolean>(false);

	useEffect(() => {
		setInitialSelect(true);
	}, [showDatePicker]);

	let formattedDate = Utils.empty(data?.activityDate) ? Utils.formatDateHyphenated(new Date()) : Utils.formatDateHyphenated(new Date(Date.parse(Utils.replaceAll("/", "-", data?.activityDate))));

	return (
		<View style={styles.popupContent}>
			<Modal animationType="fade" visible={showDatePicker} onRequestClose={() => setShowDatePicker(false)} transparent={true}>
				<ScrollView style={[styles.modalScroll, styles[`modalScroll${theme}`]]}>
					<DatePicker 
						mode="calendar"
						selected={formattedDate}
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
						<TouchableOpacity style={[styles.button, styles.actionButton, styles[`actionButton${theme}`], { width:100 }]} onPress={() => setShowDatePicker(false)}>
							<Text style={styles.text}>Cancel</Text>
						</TouchableOpacity>
					</View>
				</ScrollView>
			</Modal>
			<ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent} showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false}>
				<View style={[styles.modalSection, styles[`modalSection${theme}`], { backgroundColor:Colors[theme].mainThird, marginTop:20 }]}>
					<Text style={[styles.modalInfo, styles[`modalInfo${theme}`]]}>
						{ action === "createActivity" ? "Add Activity" : "Update Activity" }
					</Text>
				</View>
				<View style={[styles.modalSection, styles[`modalSection${theme}`], { backgroundColor:Colors[theme].mainThird }]}>
					<Text style={[styles.labelInput, styles[`labelInput${theme}`]]}>Symbol</Text>
					<TextInput 
						spellCheck={false}
						defaultValue={data.activityAssetSymbol}
						autoCorrect={false}
						autoCapitalize="characters"
						placeholder="Symbol..."
						selectionColor={Colors[theme].mainContrast} 
						placeholderTextColor={Colors[theme].mainContrastDarker} 
						style={[styles.popupInput, styles[`popupInput${theme}`]]} 
						onChangeText={(value) => popupRef.current.activity.activityAssetSymbol = value}
					/>
					<View style={styles.popupChoicesWrapper}>
						<TouchableOpacity onPress={() => { popupRef.current.activity.activityAssetType = "crypto"; changeContent(); }} style={[styles.button, styles.choiceButton, styles[`choiceButton${theme}`], styles.popupChoiceButton, popupRef.current.activity.activityAssetType === "crypto" ? styles[`choiceButtonActive${theme}`] : null]}>
							<Text style={[styles.choiceText, styles[`choiceText${theme}`], popupRef.current.activity.activityAssetType === "crypto" ? styles[`choiceTextActive${theme}`] : null]}>Crypto</Text>
						</TouchableOpacity>
						<TouchableOpacity onPress={() => { popupRef.current.activity.activityAssetType = "stock"; changeContent(); }} style={[styles.button, styles.choiceButton, styles[`choiceButton${theme}`], styles.popupChoiceButton, popupRef.current.activity.activityAssetType === "stock" ? styles[`choiceButtonActive${theme}`] : null]}>
							<Text style={[styles.choiceText, styles[`choiceText${theme}`], popupRef.current.activity.activityAssetType === "stock" ? styles[`choiceTextActive${theme}`] : null]}>Stock</Text>
						</TouchableOpacity>
					</View>
					<Text style={[styles.labelInput, styles[`labelInput${theme}`], { marginTop:10 }]}>Amount</Text>
					<TextInput 
						spellCheck={false}
						defaultValue={data.activityAssetAmount}
						keyboardType="decimal-pad"
						autoCorrect={false}
						placeholder="Amount..." 
						selectionColor={Colors[theme].mainContrast} 
						placeholderTextColor={Colors[theme].mainContrastDarker} 
						style={[styles.popupInput, styles[`popupInput${theme}`]]} 
						onChangeText={(value) => popupRef.current.activity.activityAssetAmount = value}
					/>
					<Text style={[styles.labelInput, styles[`labelInput${theme}`]]}>Date</Text>
					<View style={styles.popupButtonWrapper}>
						<TextInput 
							spellCheck={false}
							defaultValue={data.activityDate}
							autoCorrect={false}
							placeholder="Date..." 
							selectionColor={Colors[theme].mainContrast} 
							placeholderTextColor={Colors[theme].mainContrastDarker} 
							style={[styles.popupInput, styles[`popupInput${theme}`], { width:150, marginRight:5 }]} 
							onChangeText={(value) => popupRef.current.activity.activityDate = value}
						/>
						<TouchableOpacity style={[styles.button, styles.iconButton, styles[`iconButton${theme}`], { height:40 }]} onPress={() => setShowDatePicker(true)}>
							<Icon name="calendar" size={20} color={Colors[theme].mainContrastLight}></Icon>
						</TouchableOpacity>
					</View>
					<Text style={[styles.labelInput, styles[`labelInput${theme}`]]}>Fee</Text>
					<TextInput 
						spellCheck={false}
						defaultValue={data.activityFee}
						keyboardType="decimal-pad"
						autoCorrect={false}
						placeholder="Fee..." 
						selectionColor={Colors[theme].mainContrast} 
						placeholderTextColor={Colors[theme].mainContrastDarker} 
						style={[styles.popupInput, styles[`popupInput${theme}`]]} 
						onChangeText={(value) => popupRef.current.activity.activityFee = value}
					/>
					<Text style={[styles.labelInput, styles[`labelInput${theme}`]]}>Notes</Text>
					<TextInput 
						spellCheck={true}
						defaultValue={data.activityNotes}
						autoCorrect={false}
						placeholder="Notes..." 
						selectionColor={Colors[theme].mainContrast} 
						placeholderTextColor={Colors[theme].mainContrastDarker} 
						style={[styles.popupInput, styles[`popupInput${theme}`]]} 
						onChangeText={(value) => popupRef.current.activity.activityNotes = value}
					/>
					<View style={styles.popupChoicesWrapper}>
						<TouchableOpacity onPress={() => { popupRef.current.activity.activityType = "buy"; changeContent(); }} style={[styles.button, styles.choiceButton, styles[`choiceButton${theme}`], styles.popupChoiceButton, popupRef.current.activity.activityType === "buy" ? styles[`choiceButtonActive${theme}`] : null]}>
							<Text style={[styles.choiceText, styles[`choiceText${theme}`], popupRef.current.activity.activityType === "buy" ? styles[`choiceTextActive${theme}`] : null]}>Buy</Text>
						</TouchableOpacity>
						<TouchableOpacity onPress={() => { popupRef.current.activity.activityType = "sell"; changeContent(); }} style={[styles.button, styles.choiceButton, styles[`choiceButton${theme}`], styles.popupChoiceButton, popupRef.current.activity.activityType === "sell" ? styles[`choiceButtonActive${theme}`] : null]}>
							<Text style={[styles.choiceText, styles[`choiceText${theme}`], popupRef.current.activity.activityType === "sell" ? styles[`choiceTextActive${theme}`] : null]}>Sell</Text>
						</TouchableOpacity>
						<TouchableOpacity onPress={() => { popupRef.current.activity.activityType = "transfer"; changeContent(); }} style={[styles.button, styles.choiceButton, styles[`choiceButton${theme}`], styles.popupChoiceButton, popupRef.current.activity.activityType === "transfer" ? styles[`choiceButtonActive${theme}`] : null]}>
							<Text style={[styles.choiceText, styles[`choiceText${theme}`], popupRef.current.activity.activityType === "transfer" ? styles[`choiceTextActive${theme}`] : null]}>Transfer</Text>
						</TouchableOpacity>
					</View>
					{ ["buy", "sell"].includes(popupRef.current.activity.activityType) &&
						<View>
							<Text style={[styles.labelInput, styles[`labelInput${theme}`], { marginTop:10 }]}>Exchange</Text>
							<TextInput 
								spellCheck={false}
								defaultValue={data.activityExchange}
								autoCorrect={false}
								placeholder="Exchange..." 
								selectionColor={Colors[theme].mainContrast} 
								placeholderTextColor={Colors[theme].mainContrastDarker} 
								style={[styles.popupInput, styles[`popupInput${theme}`]]} 
								onChangeText={(value) => popupRef.current.activity.activityExchange = value}
							/>
							<Text style={[styles.labelInput, styles[`labelInput${theme}`]]}>Pair</Text>
							<TextInput 
								spellCheck={false}
								defaultValue={data.activityPair}
								autoCorrect={false}
								placeholder="Pair..." 
								selectionColor={Colors[theme].mainContrast} 
								placeholderTextColor={Colors[theme].mainContrastDarker} 
								style={[styles.popupInput, styles[`popupInput${theme}`]]} 
								onChangeText={(value) => popupRef.current.activity.activityPair = value}
							/>
							<Text style={[styles.labelInput, styles[`labelInput${theme}`]]}>Price</Text>
							<TextInput 
								spellCheck={false}
								keyboardType="decimal-pad"
								defaultValue={data.activityPrice}
								autoCorrect={false}
								placeholder="Price..." 
								selectionColor={Colors[theme].mainContrast} 
								placeholderTextColor={Colors[theme].mainContrastDarker} 
								style={[styles.popupInput, styles[`popupInput${theme}`], { marginBottom:0 }]} 
								onChangeText={(value) => popupRef.current.activity.activityPrice = value}
							/>
						</View>
					}
					{ popupRef.current.activity.activityType === "transfer" &&
						<View>
							<Text style={[styles.labelInput, styles[`labelInput${theme}`], { marginTop:10 }]}>From</Text>
							<TextInput 
								spellCheck={true}
								defaultValue={data.activityFrom}
								autoCorrect={false}
								placeholder="From..." 
								selectionColor={Colors[theme].mainContrast} 
								placeholderTextColor={Colors[theme].mainContrastDarker} 
								style={[styles.popupInput, styles[`popupInput${theme}`]]} 
								onChangeText={(value) => popupRef.current.activity.activityFrom = value}
							/>
							<Text style={[styles.labelInput, styles[`labelInput${theme}`]]}>To</Text>
							<TextInput 
								spellCheck={true}
								defaultValue={data.activityTo}
								autoCorrect={false}
								placeholder="To..." 
								selectionColor={Colors[theme].mainContrast} 
								placeholderTextColor={Colors[theme].mainContrastDarker} 
								style={[styles.popupInput, styles[`popupInput${theme}`], { marginBottom:0 }]} 
								onChangeText={(value) => popupRef.current.activity.activityTo = value}
							/>
						</View>
					}
					{ action === "updateActivity" &&
						<TouchableOpacity onPress={() => showConfirmationPopup("deleteActivity", { activityTransactionID:popupRef.current.activity.activityTransactionID })} style={[styles.button, styles.actionButton, styles[`actionButton${theme}`], styles.popupButton, styles.dangerButton, styles[`dangerButton${theme}`], styles.sectionButton, { marginBottom:0 }]}>
							<Text style={[styles.actionText, styles[`actionText${theme}`]]}>Delete Activity</Text>
						</TouchableOpacity>
					}
				</View>
				<View style={[styles.popupButtonWrapper, { marginBottom:20 }]}>
					<TouchableOpacity onPress={() => hidePopup()} style={[styles.button, styles.choiceButton, styles[`choiceButton${theme}`], styles.popupButton]}>
						<Text style={[styles.choiceText, styles[`choiceText${theme}`]]}>Cancel</Text>
					</TouchableOpacity>
					<TouchableOpacity onPress={() => processAction(action)} style={[styles.button, styles.actionButton, styles[`actionButton${theme}`], styles.popupButton]}>
						<Text style={[styles.actionText, styles[`actionText${theme}`]]}>Confirm</Text>
					</TouchableOpacity>
				</View>
			</ScrollView>
		</View>
	);

	function setDate(value: any) {
		if(initialSelect) {
			setInitialSelect(false);
			return;
		}

		popupRef.current.activity.activityDate = Utils.replaceAll("/", "-", value);
		setShowDatePicker(false);
	}

	// Since the input data provided by the user is stored in a "ref", the state of the component needs to be updated when the data is changed so that the UI can be re-rendered.
	function changeContent() {
		let info = popupRef.current.activity;

		let data = {
			activityID: info.activityID, 
			activityTransactionID: info.activityTransactionID,
			activityAssetID: info.activityAssetID, 
			activityAssetSymbol: info.activityAssetSymbol, 
			activityAssetType: info.activityAssetType || "crypto", 
			activityDate: info.activityDate, 
			activityType: info.activityType || "buy", 
			activityAssetAmount: info.activityAssetAmount, 
			activityFee: info.activityFee, 
			activityNotes: info.activityNotes, 
			activityExchange: info.activityExchange, 
			activityPair: info.activityPair, 
			activityPrice: info.activityPrice, 
			activityFrom: info.activityFrom, 
			activityTo: info.activityTo
		};

		showActivityPopup(action, data);
	}
}