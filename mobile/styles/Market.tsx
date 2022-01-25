import React from "react";
import { createStyle } from "../utils/StyleSheet";
import { Colors, GlobalStyle } from "./Global";
import { barHeight, screenHeight, screenWidth, statusBarHeight, windowHeight } from "./NavigationBar";
import { Stop, LinearGradient as SVGLinearGradient } from "react-native-svg";

export const gradientColor = () => {
	return (
		<SVGLinearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
			<Stop offset="0" stopColor={Colors.Dark.Market.accentFirst} stopOpacity="1" />
			<Stop offset="0.5" stopColor={Colors.Dark.Market.accentSecond} stopOpacity="1" />
			<Stop offset="1" stopColor={Colors.Dark.Market.accentThird} stopOpacity="1" />
		</SVGLinearGradient>
	);
}

export default createStyle<any>({
	area: {
		width: "100%",
		height: "100%",
		justifyContent: "center",
		alignItems: "center",
	},
	areaSearchWrapper: {
		flexDirection: "row",
		position: "absolute",
		left: 20,
		top: 40,
		width: screenWidth - 40,
		height: 50,
		backgroundColor: Colors.Dark.mainSecond,
		borderRadius: GlobalStyle.borderRadius,
		shadowColor: GlobalStyle.shadowColor,
		shadowOffset: GlobalStyle.shadowOffset,
		shadowOpacity: GlobalStyle.shadowOpacity,
		shadowRadius: GlobalStyle.shadowRadius,
		elevation: GlobalStyle.shadowElevation,
	},
	areaSearchWrapperLight: {
		backgroundColor: Colors.Light.mainThird,
	},
	inputSearch: {
		fontSize: 16,
		paddingLeft: 14,
		paddingRight: 14,
		width: screenWidth - 40 - 20 - 60,
		color: Colors.Dark.mainContrast,
		height: "100%",
		marginBottom: 20,
		fontWeight: "bold",
		borderTopLeftRadius: GlobalStyle.borderRadius,
		borderBottomLeftRadius: GlobalStyle.borderRadius,
	},
	inputSearchLight: {
		color: Colors.Light.mainContrast,
	},
	buttonSearch: {
		borderTopLeftRadius: 0,
		borderBottomLeftRadius: 0,
		borderTopRightRadius: GlobalStyle.borderRadius,
		borderBottomRightRadius: GlobalStyle.borderRadius,
		marginLeft: 0,
		marginRight: 0,
		height: "100%",
		width: 80,
		backgroundColor: Colors.Dark.Market.accentFirst
	},
	buttonSearchLight: {
		backgroundColor: Colors.Light.Market.accentFirst
	},
	searchText: {
		fontWeight: "bold",
		color: Colors.Dark.accentContrast
	},
	searchTextLight: {
		color: Colors.Light.accentContrast
	},
	wrapper: {
		position: "absolute",
		top: 40 + 70,
		left: 20,
		width: screenWidth - 40,
		height: windowHeight - barHeight - 40 - 20 - 70 - 90,
		borderRadius: GlobalStyle.borderRadius,
		backgroundColor: Colors.Dark.mainSecond,
		shadowColor: GlobalStyle.shadowColor,
		shadowOffset: GlobalStyle.shadowOffset,
		shadowOpacity: GlobalStyle.shadowOpacity,
		shadowRadius: GlobalStyle.shadowRadius,
		elevation: GlobalStyle.shadowElevation,
	},
	wrapperLight: {
		backgroundColor: Colors.Light.mainThird,
	},
	wrapperContent: {
		paddingBottom: 20
	},
	areaActionsWrapper: {
		justifyContent: "center",
		alignItems: "center",
		flexDirection: "row",
		position: "absolute",
		left: 20,
		top: 40 + 80 + (windowHeight - barHeight - 40 - 20 - 70 - 100) + 20,
		width: screenWidth - 40,
		height: 60,
		backgroundColor: Colors.Dark.mainSecond,
		borderRadius: GlobalStyle.borderRadius,
		shadowColor: GlobalStyle.shadowColor,
		shadowOffset: GlobalStyle.shadowOffset,
		shadowOpacity: GlobalStyle.shadowOpacity,
		shadowRadius: GlobalStyle.shadowRadius,
		elevation: GlobalStyle.shadowElevation,
	},
	areaActionsWrapperLight: {
		backgroundColor: Colors.Light.mainThird,
	},
	button: {
		width: ((screenWidth / 2) - 35) - 25,
		paddingLeft: 10,
		paddingRight: 10,
		justifyContent: "center",
		alignItems: "center",
		height: 40,
		paddingBottom: 2,
		borderRadius: GlobalStyle.borderRadius,
		marginLeft: 5,
		marginRight: 5
	},
	iconButton: {
		width: 40,
		backgroundColor: Colors.Dark.Market.accentFirst
	},
	iconButtonLight: {
		backgroundColor: Colors.Light.Market.accentFirst
	},
	choiceButton: {
		backgroundColor: "transparent",
		borderWidth: 3,
		borderColor: Colors.Dark.Market.accentFirst
	},
	choiceButtonLight: {
		backgroundColor: "transparent",
		borderColor: Colors.Light.Market.accentSecond
	},
	choiceButtonActiveDark: {
		backgroundColor: Colors.Dark.Market.accentFirst
	},
	choiceButtonActiveLight: {
		backgroundColor: Colors.Light.Market.accentSecond
	},
	choiceText: {
		fontSize: 16,
		fontWeight: "bold",
		color: Colors.Dark.accentContrast,
	},
	choiceTextLight: {
		color: Colors.Light.mainContrast,
	},
	choiceTextActiveDark: {
		color: Colors.Dark.accentContrast
	},
	choiceTextActiveLight: {
		color: Colors.Light.accentContrast
	},
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
	itemTextName: {
		maxWidth: "90%",
		backgroundColor: "transparent",
		color: Colors.Dark.mainContrast
	},
	itemTextNameLight: {
		color: Colors.Light.mainContrast
	},
	itemTextRank: {
		backgroundColor: Colors.Dark.Market.accentSecond,
		color: Colors.Dark.accentContrast
	},
	itemTextRankLight: {
		backgroundColor: Colors.Light.Market.accentSecond,
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
	modal: {

	},
	modalOverlay: {
		zIndex: 2,
		position: "absolute",
		top: 0,
		left: 0,
		width: "100%",
		height: "100%",
		backgroundColor: "rgba(0,0,0,0.9)"
	},
	modalWrapper: {
		zIndex: 3,
		position: "absolute",
		top: 0,
		left: 0,
	},
	modalChartWrapper: {
		flexDirection: "row",
		backgroundColor: Colors.Dark.mainFirstTransparent,
		overflow: "hidden",
	},
	modalChartWrapperLight: {
		backgroundColor: Colors.Light.mainFirst,
	},
	modalChartLeft: {
		height: "100%",
		position: "absolute",
		backgroundColor: Colors.Dark.mainFirstTransparent,
		paddingTop: 16,
		paddingRight: 10,
		paddingLeft: 10,
		zIndex: 4,
		borderBottomWidth: 5,
		borderColor: Colors.Dark.mainFifth
	},
	modalChartLeftLight: {
		backgroundColor: Colors.Light.mainSecond,
		borderColor: Colors.Light.mainFifth
	},
	modalChartText: {
		color: Colors.Dark.mainContrast,
		marginBottom: 36
	},
	modalChartTextLight: {
		color: Colors.Light.mainContrast
	},
	modalScrollView: {
		paddingLeft: 50,
		paddingTop: 10,
		borderBottomWidth: 5,
		borderColor: Colors.Dark.mainFifth
	},
	modalScrollViewLight: {
		borderColor: Colors.Light.mainFifth
	},
	modalWrapperScrollView: {
		height: screenHeight - barHeight - 40 - 280,
		backgroundColor: Colors.Dark.mainFirstTransparent,
	},
	modalWrapperScrollViewLight: {
		backgroundColor: Colors.Light.mainFirstTransparent
	},
	modalWrapperScrollViewContent: {
		paddingTop: 20,
		paddingRight: 25,
		paddingBottom: 30,
		paddingLeft: 25
	},
	modalSection: {
		padding: 20,
		backgroundColor: Colors.Dark.mainFirst,
		borderRadius: GlobalStyle.borderRadius,
		shadowColor: GlobalStyle.shadowColor,
		shadowOffset: GlobalStyle.shadowOffset,
		shadowOpacity: GlobalStyle.shadowOpacity,
		shadowRadius: GlobalStyle.shadowRadius,
		elevation: GlobalStyle.shadowElevation,
	},
	modalSectionLight: {
		backgroundColor: Colors.Light.mainFirst,
	}
});