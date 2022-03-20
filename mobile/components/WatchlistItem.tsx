import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors, GlobalStyle } from "../styles/Global";
import { screenWidth } from "../styles/NavigationBar";
import Utils from "../utils/Utils";

// Component used for each row of the "Dashboard" page's watchlist "FlatList" and "Market" page's stock "FlatList".
export default function Item({ info, theme, settings, page, onPress }: any) {
	return (
		<TouchableOpacity
			onPress={onPress}
			style={[styles.itemCard, styles[`itemCard${theme}`]]}
		>
			<View style={styles.itemTop}>
				<View style={styles.itemIconWrapper}>
					<Text style={[styles.itemSymbol, styles[`itemSymbol${theme}`], { backgroundColor:Colors[theme][page].accentFirst }]}>{info.symbol.toUpperCase()}</Text>
				</View>
				<Text style={[styles.itemText, styles.itemTextName, styles[`itemTextName${theme}`]]} numberOfLines={1} ellipsizeMode="tail">{info.name} ({info.symbol.toUpperCase()})</Text>
			</View>
			<View style={styles.itemBottom}>
				<ScrollView style={[styles.itemScrollView]} contentContainerStyle={styles.itemScrollViewContent} horizontal={true} showsHorizontalScrollIndicator={true} showsVerticalScrollIndicator={false} nestedScrollEnabled={true}>
					{ info.type === "crypto" &&
						<Text style={[styles.itemText, styles[`itemText${theme}`], styles.itemTextRank, styles[`itemTextRank${theme}`], { backgroundColor:Colors[theme][page].accentSecond }]} numberOfLines={1} ellipsizeMode="tail">#{info.rank}</Text>
					}
					{ info.type === "stock" &&
						<Text style={[styles.itemText, styles[`itemText${theme}`], styles.itemTextRank, styles[`itemTextRank${theme}`], { backgroundColor:Colors[theme][page].accentSecond }]} numberOfLines={1} ellipsizeMode="tail">-</Text>
					}
					<Text style={[styles.itemText, styles[`itemText${theme}`]]} numberOfLines={1} ellipsizeMode="tail">24h: {info.priceChangeDay}%</Text>
					<Text style={[styles.itemText, styles[`itemText${theme}`]]} numberOfLines={1} ellipsizeMode="tail">Price: {Utils.currencySymbols[settings.currency] + Utils.separateThousands(info.price)}</Text>
				</ScrollView>
				<ScrollView style={[styles.itemScrollView, { marginBottom: 10 }]} contentContainerStyle={styles.itemScrollViewContent} horizontal={true} showsHorizontalScrollIndicator={true} showsVerticalScrollIndicator={false} nestedScrollEnabled={true}>
					<Text style={[styles.itemText, styles[`itemText${theme}`]]} numberOfLines={1} ellipsizeMode="tail">Market Cap: {Utils.currencySymbols[settings.currency] + Utils.abbreviateNumber(info.marketCap, 2)}</Text>
					<Text style={[styles.itemText, styles[`itemText${theme}`]]} numberOfLines={1} ellipsizeMode="tail">Volume: {Utils.abbreviateNumber(info.volume, 2)}</Text>
				</ScrollView>
			</View>
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
	itemTop: {
		marginTop: 10,
		flexDirection: "row",
		alignItems: "center"
	},
	itemBottom: {
		flexDirection: "column",
		alignItems: "center"
	},
	itemIconWrapper: {
		padding: 4,
	},
	itemSymbol: {
		color: Colors.Dark.accentContrast,
		fontWeight: "bold",
		borderRadius: GlobalStyle.borderRadius,
		paddingLeft: 10,
		paddingRight: 10,
		paddingTop: 4,
		paddingBottom: 4,
	},
	itemSymbolLight: {
		color: Colors.Light.accentContrast,
	},
	itemText: {
		maxWidth: (screenWidth / 2) + 10,
		paddingLeft: 10,
		paddingRight: 10,
		lineHeight: 40,
		marginRight: 5,
		marginLeft: 5,
		backgroundColor: Colors.Dark.mainSecond,
		color: Colors.Dark.mainContrast,
		borderRadius: GlobalStyle.borderRadius
	},
	itemTextLight: {
		backgroundColor: Colors.Light.mainSecond,
		color: Colors.Light.mainContrast
	},
	itemError: {
		maxWidth: (screenWidth / 2) + 10,
		paddingLeft: 10,
		paddingRight: 10,
		lineHeight: 40,
		marginRight: 5,
		marginLeft: 5,
		backgroundColor: Colors.Dark.mainSecond,
		color: Colors.Dark.mainContrast,
		borderRadius: GlobalStyle.borderRadius
	},
	itemErrorLight: {
		backgroundColor: Colors.Light.mainSecond,
		color: Colors.Light.mainContrast
	},
	itemTextName: {
		maxWidth: "90%",
		backgroundColor: "transparent",
		color: Colors.Dark.mainContrast
	},
	itemTextNameLight: {
		color: Colors.Light.mainContrast
	},
	itemTextRank: {
		color: Colors.Dark.accentContrast
	},
	itemTextRankLight: {
		color: Colors.Light.accentContrast
	},
	itemScrollView: {
		flexGrow: 0,
		flexDirection: "row",
		width: "100%",
		height: 40,
		marginRight: 10,
		marginLeft: 10,
		marginTop: 10,
	},
	itemScrollViewContent: {
		width: "100%",
		alignItems: "center",
		justifyContent: "center"
	},
});