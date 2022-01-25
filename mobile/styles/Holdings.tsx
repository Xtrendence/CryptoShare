import React from "react";
import { createStyle } from "../utils/StyleSheet";
import { Colors, GlobalStyle } from "./Global";
import { barHeight, screenHeight, screenWidth, statusBarHeight, windowHeight } from "./NavigationBar";
import { Stop, LinearGradient as SVGLinearGradient } from "react-native-svg";

export const gradientColor = () => {
	return (
		<SVGLinearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
			<Stop offset="0" stopColor={Colors.Dark.Holdings.accentFirst} stopOpacity="1" />
			<Stop offset="0.5" stopColor={Colors.Dark.Holdings.accentSecond} stopOpacity="1" />
			<Stop offset="1" stopColor={Colors.Dark.Holdings.accentThird} stopOpacity="1" />
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
	areaCardWrapper: {
		position: "absolute",
		left: 20,
		top: 40,
		width: screenWidth - 40,
		height: 90,
		padding: 10,
		backgroundColor: Colors.Dark.mainSecond,
		borderRadius: GlobalStyle.borderRadius,
		shadowColor: GlobalStyle.shadowColor,
		shadowOffset: GlobalStyle.shadowOffset,
		shadowOpacity: GlobalStyle.shadowOpacity,
		shadowRadius: GlobalStyle.shadowRadius,
		elevation: GlobalStyle.shadowElevation,
	},
	areaCardWrapperLight: {
		backgroundColor: Colors.Light.mainThird,
	},
	areaCard: {
		width: "100%",
		height: "100%",
		borderRadius: GlobalStyle.borderRadius,
		justifyContent: "center",
		alignItems: "center"
	},
	areaCardText: {
		fontSize: 20,
		fontWeight: "bold",
		color: Colors.Dark.accentContrast
	},
	areaCardTextLight: {
		color: Colors.Light.accentContrast
	},
	wrapper: {
		position: "absolute",
		top: 40 + 110,
		left: 20,
		width: screenWidth - 40,
		height: windowHeight - barHeight - 40 - 20 - 70 - 130,
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
		top: barHeight + 80 + (windowHeight - barHeight - 40 - 20 - 70 - 130) + 28,
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
		width: (screenWidth / 2) - 35,
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
	actionText: {
		fontSize: 16,
		fontWeight: "bold",
		color: Colors.Dark.accentContrast,
	},
	actionTextLight: {
		color: Colors.Light.accentContrast,
	},
	actionButton: {
		backgroundColor: Colors.Dark.Holdings.accentFirst
	},
	actionButtonLight: {
		backgroundColor: Colors.Light.Holdings.accentSecond
	},
	choiceButton: {
		backgroundColor: "transparent",
		borderWidth: 3,
		borderColor: Colors.Dark.Holdings.accentFirst
	},
	choiceButtonLight: {
		backgroundColor: "transparent",
		borderColor: Colors.Light.Holdings.accentFirst
	},
	choiceButtonActiveDark: {
		backgroundColor: Colors.Dark.Holdings.accentFirst
	},
	choiceButtonActiveLight: {
		backgroundColor: Colors.Light.Holdings.accentFirst
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
		alignItems: "center",
		minWidth: 80,
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
		backgroundColor: Colors.Light.mainFirstTransparent,
		borderColor: Colors.Light.mainFifth
	},
	modalChartText: {
		fontWeight: "bold",
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
		paddingBottom: 10,
		paddingLeft: 25
	},
	modalSection: {
		maxWidth: screenWidth - 80,
		padding: 20,
		marginBottom: 20,
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
	},
	modalInfo: {
		fontSize: 16,
		fontWeight: "bold",
		color: Colors.Dark.mainContrast,
		padding: 4,
	},
	modalInfoLight: {
		color: Colors.Light.mainContrast
	},
	modalInfoPositiveDark: {
		color: Colors.Dark.positiveFirst,
	},
	modalInfoPositiveLight: {
		color: Colors.Light.positiveFirst
	},
	modalInfoNegativeDark: {
		color: Colors.Dark.negativeFirst,
	},
	modalInfoNegativeLight: {
		color: Colors.Light.negativeFirst
	},
	popup: {
		justifyContent: "center",
		alignItems: "center",
		width: "100%",
		height: "100%",
	},
	popupBackground: {
		position: "absolute",
		zIndex: 2,
		width: "100%",
		height: "100%",
		backgroundColor: "rgba(0,0,0,0.9)",
		justifyContent: "center",
		alignItems: "center"
	},
	popupForeground: {
		position: "absolute",
		zIndex: 3,
		justifyContent: "center",
		alignItems: "center",
	},
	popupWrapper: {
		backgroundColor: Colors.Dark.mainFirst,
		justifyContent: "center",
		alignItems: "center",
		width: screenWidth - 80,
		padding: 20,
		borderRadius: GlobalStyle.borderRadius
	},
	popupWrapperLight: {
		backgroundColor: Colors.Light.mainFirst
	},
	popupContent: {
		alignItems: "center",
		justifyContent: "center"
	},
	popupButtonWrapper: {
		flexDirection: "row",
	},
	popupButton: {
		width: 100,
		marginLeft: 10,
		marginRight: 10
	},
	popupInput: {
		width: 180,
		borderRadius: GlobalStyle.borderRadius,
		backgroundColor: Colors.Dark.mainFirstTransparent,
		color: Colors.Dark.mainContrast,
		paddingLeft: 10,
		paddingRight: 10,
		height: 40,
		marginBottom: 20,
	},
	popupInputLight: {
		backgroundColor: Colors.Light.mainFirstTransparent,
		color: Colors.Light.mainContrast,
	},
	dangerButton: {
		backgroundColor: Colors.Dark.negativeFirst,
		width: 180,
		marginLeft: 0,
		marginRight: 0,
		marginTop: 20
	},
	dangerButtonLight: {
		backgroundColor: Colors.Light.negativeFirst
	}
});