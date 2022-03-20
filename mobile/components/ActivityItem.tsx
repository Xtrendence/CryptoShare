import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors, GlobalStyle } from "../styles/Global";
import Utils from "../utils/Utils";

// Component for each activity "FlatList" row.
export default function Item({ info, showActivityPopup, theme, dateFormat }: any) {
	let date = dateFormat === "dd-mm-yyyy" ? Utils.formatDateHyphenatedHuman(new Date(Date.parse(info.activityDate))) : Utils.formatDateHyphenated(new Date(Date.parse(info.activityDate)));

	return (
		<TouchableOpacity
			onPress={() => showActivityPopup("updateActivity", info)}
			style={[styles.itemCard, styles[`itemCard${theme}`]]}
		>
			<View style={styles.itemLeft}>
				<Text style={[styles.itemText, styles[`itemText${theme}`], { backgroundColor:Colors[theme].Activity.accentSecond, color:Colors[theme].accentContrast, marginBottom:10 }]}>{date}</Text>
				<Text style={[styles.itemText, styles[`itemText${theme}`], { backgroundColor:Colors[theme].Activity.accentThird, color:Colors[theme].accentContrast }]}>{info.activityAssetSymbol.toUpperCase()}</Text>
			</View>
			<View style={styles.itemRight}>
				<Text style={[styles.itemText, styles[`itemText${theme}`], styles[`itemText${Utils.capitalizeFirstLetter(info.activityType + theme)}`], { marginBottom:10 }]}>{Utils.capitalizeFirstLetter(info.activityType)}</Text>
				<Text style={[styles.itemText, styles[`itemText${theme}`]]}>Amount: {info.activityAssetAmount}</Text>
			</View>
		</TouchableOpacity>
	);
}

let styles: any = StyleSheet.create({
	itemCard: {
		padding: 20,
		flexDirection: "row",
		alignItems: "center",
		marginRight: 10,
		marginLeft: 10,
		marginBottom: 10,
		backgroundColor: Colors.Dark.mainFirst,
		borderRadius: GlobalStyle.borderRadius,
		shadowColor: GlobalStyle.shadowColor,
		shadowOffset: GlobalStyle.shadowOffset,
		shadowOpacity: GlobalStyle.shadowOpacity,
		shadowRadius: GlobalStyle.shadowRadius,
		elevation: GlobalStyle.shadowElevation,
	},
	itemCardLight: {
		backgroundColor: Colors.Light.mainFirst
	},
	itemLeft: {
		justifyContent: "center",
		alignItems: "flex-start",
		flexGrow: 1
	},
	itemRight: {
		justifyContent: "center",
		alignItems: "flex-end",
	},
	itemText: {
		paddingTop: 6,
		paddingBottom: 6,
		paddingRight: 10,
		paddingLeft: 10,
		color: Colors.Dark.mainContrast,
		fontWeight: "bold",
		backgroundColor: Colors.Dark.mainFourth,
		borderRadius: GlobalStyle.borderRadius
	},
	itemTextLight: {
		color: Colors.Light.mainContrast,
		backgroundColor: Colors.Light.mainThird
	},
	itemTextBuyDark: {
		backgroundColor: Colors.Dark.positiveFirst,
		color: Colors.Dark.accentContrast,
	},
	itemTextBuyLight: {
		backgroundColor: Colors.Light.positiveFirst,
		color: Colors.Light.accentContrast,
	},
	itemTextSellDark: {
		backgroundColor: Colors.Dark.negativeFirst,
		color: Colors.Dark.accentContrast,
	},
	itemTextSellLight: {
		backgroundColor: Colors.Light.negativeFirst,
		color: Colors.Light.accentContrast,
	},
	itemTextTransferDark: {
		backgroundColor: Colors.Dark.mainSecond,
		color: Colors.Dark.mainContrast,
	},
	itemTextTransferLight: {
		backgroundColor: Colors.Light.mainThird,
		color: Colors.Light.mainContrast,
	},
});