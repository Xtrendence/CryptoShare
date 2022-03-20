import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors, GlobalStyle } from "../styles/Global";
import Utils from "../utils/Utils";

// Component used for each row on the "Dashboard" page's transactions "FlatList".
export default function Item({ info, theme, settings, showTransactionPopup }: any) {	
	let hasNote = (!Utils.empty(info.transactionNotes) && info.transactionNotes !== "-");

	let date = settings?.dateFormat === "dd-mm-yyyy" ? Utils.formatDateHyphenatedHuman(new Date(Date.parse(info.transactionDate))) : Utils.formatDateHyphenated(new Date(Date.parse(info.transactionDate)));

	return (
		<TouchableOpacity onPress={() => showTransactionPopup(info, "update")} style={[styles.card, styles[`card${theme}`], styles[`card${Utils.capitalizeFirstLetter(info.transactionCategory)}`]]}>
			<View>
				<View style={styles.row}>
					<Text style={[styles.text, styles[`text${theme}`], { backgroundColor:Colors[theme].accentThird, color:Colors[theme].accentContrast }]}>{date}</Text>
					<Text style={[styles.text, styles[`text${theme}`], { backgroundColor:Colors[theme].accentFirst, color:Colors[theme].accentContrast, marginLeft:10 }]}>{Utils.capitalizeFirstLetter(info.transactionCategory)}</Text>
				</View>
				<View style={styles.row}>
					<Text style={[styles.text, styles[`text${theme}`], styles[`text${Utils.capitalizeFirstLetter(info.transactionType) + theme}`], { marginBottom:hasNote ? 10 : 0 }]}>{info.transactionCategory === "savings" ? "Saved" : Utils.capitalizeFirstLetter(info.transactionType)} {Utils.currencySymbols[settings.currency] + Utils.separateThousands(info.transactionAmount)}</Text>
				</View>
				{ hasNote &&
					<View style={styles.row}>
						<Text style={[styles.text, styles[`text${theme}`], { backgroundColor:Colors[theme].mainThird, marginBottom:0 }]}>{info.transactionNotes}</Text>
					</View>
				}
			</View>
		</TouchableOpacity>
	);
}

let styles: any = StyleSheet.create({
	card: {
		flexDirection: "column",
		borderLeftWidth: 4,
		borderStyle: "solid",
		borderColor: Colors.Dark.mainContrast,
		marginBottom: 10,
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