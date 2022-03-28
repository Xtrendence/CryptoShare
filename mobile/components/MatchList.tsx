import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors, GlobalStyle } from "../styles/Global";
import { screenWidth } from "../styles/NavigationBar";
import Utils from "../utils/Utils";

// Component used when the user performs an action that involves an asset that has the same symbol as one or more other assets. Offers a list of assets for the user to choose from.
export default function MatchList(props: any) {
	let theme = props.theme;

	return (
		<View>
			<View style={[styles.messageWrapper, styles[`messageWrapper${theme}`]]}>
				<Text style={[styles.message, styles[`message${theme}`]]}>Two or more assets have the same symbol. Please choose the desired asset from the list below.</Text>
			</View>
			<ScrollView style={[styles.scrollView, styles[`scrollView${theme}`]]} contentContainerStyle={styles.scrollViewContent} showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false} nestedScrollEnabled={true}>
				{ !Utils.empty(props.matches) &&
					Object.keys(props.matches).map((index: any) => {
						let match = props.matches[index];
						let symbol = Object.keys(match)[0];
						let id = match[symbol];

						return (
							<TouchableOpacity onPress={() => props.onPress(id)} key={index} style={[styles.row, Utils.isEven(index) ? styles[`rowEven${theme}`] : styles[`rowOdd${theme}`]]}>
								<Text style={[styles.text, styles[`text${theme}`], { marginRight:10 }]}>{symbol.toUpperCase()}</Text>
								<Text style={[styles.text, styles[`text${theme}`]]}>{id}</Text>
							</TouchableOpacity>
						);
					})
				}
			</ScrollView>
		</View>
	);
}

let styles: any = StyleSheet.create({
	messageWrapper: {
		width: 280,
		padding: 10,
		marginBottom: 20,
		backgroundColor: Colors.Dark.mainThird,
		borderRadius: GlobalStyle.borderRadius,
		shadowColor: GlobalStyle.shadowColor,
		shadowOffset: GlobalStyle.shadowOffset,
		shadowOpacity: GlobalStyle.shadowOpacity,
		shadowRadius: GlobalStyle.shadowRadius,
		elevation: GlobalStyle.shadowElevation,
	},
	messageWrapperLight: {
		backgroundColor: Colors.Light.mainThird
	},
	message: {
		color: Colors.Dark.mainContrast,
		lineHeight: 25
	},
	messageLight: {
		color: Colors.Light.mainContrast
	},
	scrollView: {
		maxWidth: screenWidth - 40,
		minWidth: 280,
		flexGrow: 0,
		backgroundColor: Colors.Dark.mainThird,
		borderRadius: GlobalStyle.borderRadius,
		shadowColor: GlobalStyle.shadowColor,
		shadowOffset: GlobalStyle.shadowOffset,
		shadowOpacity: GlobalStyle.shadowOpacity,
		shadowRadius: GlobalStyle.shadowRadius,
		elevation: GlobalStyle.shadowElevation,
	},
	scrollViewLight: {
		backgroundColor: Colors.Light.mainThird
	},
	scrollViewContent: {
		padding: 10,
	},
	row: {
		height: 40,
		width: "100%",
		flexDirection: "row",
		marginTop: 5,
		marginBottom: 5,
		justifyContent: "center",
		alignItems: "center",
		borderRadius: GlobalStyle.borderRadius
	},
	rowEvenDark: {
		backgroundColor: Colors.Dark.mainFirst
	},
	rowEvenLight: {
		backgroundColor: Colors.Light.mainFirst
	},
	rowOddDark: {
		backgroundColor: Colors.Dark.mainFirstTransparent
	},
	rowOddLight: {
		backgroundColor: Colors.Light.mainFirstTransparent
	},
	text: {
		color: Colors.Dark.mainContrast
	},
	textLight: {
		color: Colors.Light.mainContrast
	}
});