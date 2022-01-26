import React from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import styles from "../styles/Activity";
import { Colors } from "../styles/Global";

export default function ActivityPopup({ action, theme, popupRef, data, hidePopup, showActivityPopup, processAction }: any) {
	return (
		<View style={styles.popupContent}>
			<ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent} showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false}>
				<View style={[styles.modalSection, styles[`modalSection${theme}`], { backgroundColor:Colors[theme].mainThird }]}>
					<Text style={[styles.modalInfo, styles[`modalInfo${theme}`]]}>
						{ action === "createActivity" ? "Add Activity" : "Update Activity" }
					</Text>
				</View>
				<View style={[styles.modalSection, styles[`modalSection${theme}`], { backgroundColor:Colors[theme].mainThird }]}>
					<TextInput 
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
					<TextInput 
						defaultValue={data.activityAssetAmount}
						keyboardType="decimal-pad"
						autoCorrect={false}
						placeholder="Amount..." 
						selectionColor={Colors[theme].mainContrast} 
						placeholderTextColor={Colors[theme].mainContrastDarker} 
						style={[styles.popupInput, styles[`popupInput${theme}`], { marginTop:10 }]} 
						onChangeText={(value) => popupRef.current.activity.activityAssetAmount = value}
					/>
					<TextInput 
						defaultValue={data.activityDate}
						autoCorrect={false}
						placeholder="Date..." 
						selectionColor={Colors[theme].mainContrast} 
						placeholderTextColor={Colors[theme].mainContrastDarker} 
						style={[styles.popupInput, styles[`popupInput${theme}`]]} 
						onChangeText={(value) => popupRef.current.activity.activityDate = value}
					/>
					<TextInput 
						defaultValue={data.activityFee}
						keyboardType="decimal-pad"
						autoCorrect={false}
						placeholder="Fee..." 
						selectionColor={Colors[theme].mainContrast} 
						placeholderTextColor={Colors[theme].mainContrastDarker} 
						style={[styles.popupInput, styles[`popupInput${theme}`]]} 
						onChangeText={(value) => popupRef.current.activity.activityFee = value}
					/>
					<TextInput 
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
							<TextInput 
								defaultValue={data.activityExchange}
								autoCorrect={false}
								placeholder="Exchange..." 
								selectionColor={Colors[theme].mainContrast} 
								placeholderTextColor={Colors[theme].mainContrastDarker} 
								style={[styles.popupInput, styles[`popupInput${theme}`], { marginTop:10 }]} 
								onChangeText={(value) => popupRef.current.activity.activityExchange = value}
							/>
							<TextInput 
								defaultValue={data.activityPair}
								autoCorrect={false}
								placeholder="Pair..." 
								selectionColor={Colors[theme].mainContrast} 
								placeholderTextColor={Colors[theme].mainContrastDarker} 
								style={[styles.popupInput, styles[`popupInput${theme}`]]} 
								onChangeText={(value) => popupRef.current.activity.activityPair = value}
							/>
							<TextInput 
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
							<TextInput 
								defaultValue={data.activityFrom}
								autoCorrect={false}
								placeholder="From..." 
								selectionColor={Colors[theme].mainContrast} 
								placeholderTextColor={Colors[theme].mainContrastDarker} 
								style={[styles.popupInput, styles[`popupInput${theme}`], { marginTop:10 }]} 
								onChangeText={(value) => popupRef.current.activity.activityFrom = value}
							/>
							<TextInput 
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
				</View>
				<View style={styles.popupButtonWrapper}>
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

	function changeContent() {
		let info = popupRef.current.activity;

		let data = {
			activityID: info.activityID, 
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