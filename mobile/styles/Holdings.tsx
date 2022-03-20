import React from "react";
import { LinearGradient as SVGLinearGradient, Stop } from "react-native-svg";
import { createStyle } from "../utils/StyleSheet";
import { Colors, GlobalStyle } from "./Global";
import { actionBarHeight, barHeight, screenHeight, screenWidth, statusBarHeight, windowHeight } from "./NavigationBar";

// Gradient used for the holdings chart.
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
		top: statusBarHeight + 20,
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
	areaCardWrapperDarkAlternate: {
		elevation: 0,
		shadowOpacity: 0,
		backgroundColor: Colors.Dark.mainFirstTransparent,
	},
	areaCardWrapperLightAlternate: {
		elevation: 0,
		shadowOpacity: 0,
		backgroundColor: Colors.Light.mainFirstTransparent,
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
		top: statusBarHeight + 90 + 40,
		left: 20,
		width: screenWidth - 40,
		height: screenHeight - statusBarHeight - barHeight - actionBarHeight - 20 - 70 - 20 - 80 - 40,
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
	wrapperDarkAlternate: {
		elevation: 0,
		shadowOpacity: 0,
		backgroundColor: Colors.Dark.mainFirstTransparent,
	},
	wrapperLightAlternate: {
		elevation: 0,
		shadowOpacity: 0,
		backgroundColor: Colors.Light.mainFirstTransparent,
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
		top: barHeight + 80 + (screenHeight - actionBarHeight - barHeight - 40 - 70 - 130) + 18,
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
	areaActionsWrapperDarkAlternate: {
		elevation: 0,
		shadowOpacity: 0,
		backgroundColor: Colors.Dark.mainFirstTransparent,
	},
	areaActionsWrapperLightAlternate: {
		elevation: 0,
		shadowOpacity: 0,
		backgroundColor: Colors.Light.mainFirstTransparent,
	},
	header: {
		alignItems: "center",
	},
	listText: {
		fontSize: 18,
		fontWeight: "bold",
		lineHeight: windowHeight - barHeight - 40 - 20 - 70 - 130 - 30,
		color: Colors.Dark.mainContrast
	},
	listTextLight: {
		color: Colors.Light.mainContrast
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
	iconButton: {
		width: 40,
		backgroundColor: Colors.Dark.Holdings.accentFirst
	},
	iconButtonLight: {
		backgroundColor: Colors.Light.Holdings.accentFirst
	},
	smallerButton: {
		width: ((screenWidth / 2) - 35) - 25,
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
		borderWidth: 0,
		backgroundColor: Colors.Dark.Holdings.accentFirst
	},
	choiceButtonActiveLight: {
		borderWidth: 0,
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
		marginLeft: 50,
		paddingTop: 10,
		borderBottomWidth: 5,
		borderColor: Colors.Dark.mainFifth
	},
	modalScrollViewLight: {
		borderColor: Colors.Light.mainFifth
	},
	modalWrapperScrollView: {
		height: screenHeight - barHeight - 40 - 275,
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
		maxWidth: screenWidth - 40,
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
	},
	labelInput: {
		color: Colors.Dark.mainContrastDark,
		backgroundColor: Colors.Dark.mainFirst,
		fontSize: 14,
		textAlign: "center",
		lineHeight: 30,
		marginBottom: 10,
		borderRadius: GlobalStyle.borderRadius
	},
	labelInputLight: {
		color: Colors.Light.mainContrast,
		backgroundColor: Colors.Light.mainFifth
	}
});