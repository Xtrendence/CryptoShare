import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors, GlobalStyle } from "../styles/Global";
import Utils from "../utils/Utils";

// Component used for each chat bubble on the "Chat Bot" page's "FlatList".
export default function Item({ theme, message }: any) {
	let from = Utils.capitalizeFirstLetter(message.from);

	return (
		<View style={[styles.row, styles[`row${from}`]]}>
			<View style={[styles.bubble, styles[`bubble${from + theme}`]]}>
				<Text style={[styles.text, styles[`text${from + theme}`]]}>{message.message}</Text>
			</View>
		</View>
	);
}

let styles: any = StyleSheet.create({
	row: {
		width: "100%",
		justifyContent: "center",
	},
	rowBot: {
		alignItems: "flex-start"
	},
	rowUser: {
		alignItems: "flex-end"
	},
	bubble: {
		padding: 10,
		marginTop: 20,
		marginRight: 20,
		marginLeft: 20,
		borderRadius: GlobalStyle.borderRadius,
		flexGrow: 0,
	},
	bubbleBotDark: {
		maxWidth: "75%",
		backgroundColor: Colors.Dark.mainFirst
	},
	bubbleUserDark: {
		maxWidth: "50%",
		backgroundColor: Colors.Dark.ChatBot.accentSecond
	},
	bubbleBotLight: {
		maxWidth: "75%",
		backgroundColor: Colors.Light.mainFirst
	},
	bubbleUserLight: {
		maxWidth: "50%",
		backgroundColor: Colors.Light.ChatBot.accentSecond
	},
	text: {
		color: Colors.Dark.mainContrast
	},
	textBotDark: {
		color: Colors.Dark.mainContrast
	},
	textUserDark: {
		color: Colors.Dark.accentContrast
	},
	textBotLight: {
		color: Colors.Light.mainContrast
	},
	textUserLight: {
		color: Colors.Light.accentContrast
	},
});