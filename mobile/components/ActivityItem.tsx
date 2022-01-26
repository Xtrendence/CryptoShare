import React from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import store from "../store/store";
import { Colors, GlobalStyle } from "../styles/Global";
import { screenWidth } from "../styles/NavigationBar";
import Utils from "../utils/Utils";

export default function Item({ info, showActivityPopup, theme, settings }: any) {
	return (
		<TouchableOpacity
			onPress={() => {}}
			style={[styles.itemCard, styles[`itemCard${theme}`]]}
		>
			
		</TouchableOpacity>
	);
}

let styles: any = StyleSheet.create({
	itemCard: {
		flexDirection: "column",
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
});