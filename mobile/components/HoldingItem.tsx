import React from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import store from "../store/store";
import { Colors, GlobalStyle } from "../styles/Global";
import { screenWidth } from "../styles/NavigationBar";
import Utils from "../utils/Utils";

// Component used for each row of the "Holding" page's "FlatList".
export default function Item({ info, showHoldingChart, showHoldingPopup, theme, settings }: any) {
	if(!("error" in info)) {
		return (
			<TouchableOpacity
				onPress={() => {
					let settings: any = store.getState().settings.settings;
					if(settings.activitiesAffectHoldings === "enabled") {
						showHoldingChart(info);
					} else {
						showHoldingPopup(info.type, "updateHolding", info);
					}
				}}
				style={[styles.itemCard, styles[`itemCard${theme}`]]}
			>
				<View style={styles.itemTop}>
					{ info.type === "crypto" && 
						<View style={[styles.itemIconWrapper, settings.assetIconBackdrop === "enabled" ? styles.itemIconWrapperBackdrop : null]}>
							<Image source={{ uri: info.icon }} style={styles.itemIcon} />
						</View>
					}
					{ info.type === "stock" && 
						<View style={[styles.itemIconWrapper, styles.itemIconWrapperStock]}>
							<Text style={[styles.itemStockSymbol, styles[`itemStockSymbol${theme}`]]}>{info.symbol.toUpperCase()}</Text>
						</View>
					}
					{ info.type === "crypto" && 
						<Text style={[styles.itemText, styles.itemTextName, styles[`itemTextName${theme}`]]} numberOfLines={1} ellipsizeMode="tail">{info.name} ({info.symbol.toUpperCase()})</Text>
					}
					{ info.type === "stock" && 
						<Text style={[styles.itemText, styles.itemTextName, styles[`itemTextName${theme}`]]} numberOfLines={1} ellipsizeMode="tail">{info.shortName} ({info.symbol.toUpperCase()})</Text>
					}
				</View>
				<View style={styles.itemBottom}>
					<ScrollView style={[styles.itemScrollView]} contentContainerStyle={styles.itemScrollViewContent} horizontal={true} showsHorizontalScrollIndicator={true} showsVerticalScrollIndicator={false} nestedScrollEnabled={true}>
						{ info.type === "crypto" &&
							<Text style={[styles.itemText, styles[`itemText${theme}`], styles.itemTextRank, styles[`itemTextRank${theme}`]]} numberOfLines={1} ellipsizeMode="tail">#{info.rank}</Text>
						}
						{ info.type === "stock" &&
							<Text style={[styles.itemText, styles[`itemText${theme}`], styles.itemTextRank, styles[`itemTextRank${theme}`]]} numberOfLines={1} ellipsizeMode="tail">-</Text>
						}
						<Text style={[styles.itemText, styles[`itemText${theme}`]]} numberOfLines={1} ellipsizeMode="tail">24h: {info.priceChangeDay}%</Text>
						<Text style={[styles.itemText, styles[`itemText${theme}`]]} numberOfLines={1} ellipsizeMode="tail">Price: {Utils.currencySymbols[settings.currency] + Utils.separateThousands(info.price)}</Text>
					</ScrollView>
					<ScrollView style={[styles.itemScrollView, { marginBottom: 10 }]} contentContainerStyle={styles.itemScrollViewContent} horizontal={true} showsHorizontalScrollIndicator={true} showsVerticalScrollIndicator={false} nestedScrollEnabled={true}>
						<Text style={[styles.itemText, styles[`itemText${theme}`]]} numberOfLines={1} ellipsizeMode="tail">Value: {Utils.currencySymbols[settings.currency] + Utils.separateThousands(info.value)}</Text>
						<Text style={[styles.itemText, styles[`itemText${theme}`]]} numberOfLines={1} ellipsizeMode="tail">Amount: {Utils.separateThousands(info.amount)}</Text>
					</ScrollView>
				</View>
			</TouchableOpacity>
		);
	} else {
		return (
			<View style={[styles.itemCard, styles[`itemCard${theme}`]]}>
				<Text style={[styles.itemError, styles[`itemError${theme}`], { marginTop:20, marginBottom:20 }]}>{info?.error}</Text>
				<Text style={[styles.itemError, styles[`itemError${theme}`], { marginBottom:20 }]}>Stock Holdings Omitted</Text>
			</View>
		);
	}
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
	itemIconWrapperBackdrop: {
		backgroundColor: "rgb(255,255,255)",
		borderRadius: GlobalStyle.borderRadius
	},
	itemIcon: {
		width: 32,
		height: 32,
	},
	itemStockSymbol: {
		backgroundColor: Colors.Dark.Holdings.accentFirst,
		color: Colors.Dark.accentContrast,
		fontWeight: "bold",
		borderRadius: GlobalStyle.borderRadius,
		paddingLeft: 10,
		paddingRight: 10,
		paddingTop: 4,
		paddingBottom: 4,
	},
	itemStockSymbolLight: {
		backgroundColor: Colors.Light.Holdings.accentFirst,
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
		backgroundColor: Colors.Dark.Holdings.accentThird,
		color: Colors.Dark.accentContrast
	},
	itemTextRankLight: {
		backgroundColor: Colors.Light.Holdings.accentThird,
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