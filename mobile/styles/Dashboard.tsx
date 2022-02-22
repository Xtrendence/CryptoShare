import { createStyle } from "../utils/StyleSheet";
import { Colors, GlobalStyle } from "./Global";
import { barHeight, screenWidth, windowHeight } from "./NavigationBar";

export default createStyle<any>({
	scrollView: {
		width: "100%",
		height: "100%",
	},
	scrollViewContent: {
		justifyContent: "center", 
		alignItems: "center", 
		flexGrow: 1
	},
	area: {
		width: "100%",
		height: "100%",
		justifyContent: "center",
		alignItems: "center",
	},
	wrapper: {
		position: "absolute",
		top: 120,
		left: 20,
		width: screenWidth - 40,
		height: windowHeight - barHeight - 40 - 20 - 70 - 20 - 80,
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
	modalScroll: {
		backgroundColor: "rgba(0,0,0,0.9)"
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
		maxHeight: windowHeight - 200,
		padding: 20,
		borderRadius: GlobalStyle.borderRadius
	},
	popupWrapperLight: {
		backgroundColor: Colors.Light.mainFirst
	},
	popupContent: {
		alignItems: "center",
		justifyContent: "center",
		width: "100%"
	},
	popupChoicesWrapper: {
		flexDirection: "column",
		flexWrap: "nowrap",
		width: 200
	},
	popupButtonWrapper: {
		flexDirection: "row",
	},
	popupButton: {
		width: 110,
		marginLeft: 10,
		marginRight: 10
	},
	popupChoiceButton: {
		width: "100%",
		marginLeft: 0,
		marginBottom: 10
	},
	popupInput: {
		width: 200,
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
	pickerWrapper: {
		marginBottom: 20,
		borderRadius: GlobalStyle.borderRadius,
		overflow: "hidden",
	},
	picker: {
		fontSize: 14,
		backgroundColor: Colors.Dark.mainFirst,
		color: Colors.Dark.mainContrast,
	},
	pickerLight: {
		backgroundColor: Colors.Light.mainFirst,
		color: Colors.Light.mainContrast
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
	},
	sectionButton: {
		width: 200,
		marginLeft: 0,
		marginRight: 0,
		marginBottom: 20
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
		backgroundColor: Colors.Dark.Dashboard.accentFirst
	},
	iconButtonLight: {
		backgroundColor: Colors.Light.Dashboard.accentFirst
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
		backgroundColor: Colors.Dark.Dashboard.accentFirst
	},
	actionButtonLight: {
		backgroundColor: Colors.Light.Dashboard.accentSecond
	},
	dangerButton: {
		backgroundColor: Colors.Dark.negativeFirst,
		marginTop: 20
	},
	dangerButtonLight: {
		backgroundColor: Colors.Light.negativeFirst
	},
	choiceButton: {
		backgroundColor: "transparent",
		borderWidth: 3,
		borderColor: Colors.Dark.Dashboard.accentFirst
	},
	choiceButtonLight: {
		backgroundColor: "transparent",
		borderColor: Colors.Light.Dashboard.accentFirst
	},
	choiceButtonActiveDark: {
		backgroundColor: Colors.Dark.Dashboard.accentFirst
	},
	choiceButtonActiveLight: {
		backgroundColor: Colors.Light.Dashboard.accentFirst
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
	budgetScrollViewContent: {
		paddingTop: 20,
		paddingRight: 20,
		paddingLeft: 20,
	},
	budgetItem: {
		padding: 20,
		marginBottom: 20,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: Colors.Dark.mainFirst,
		borderRadius: GlobalStyle.borderRadius,
		shadowColor: GlobalStyle.shadowColor,
		shadowOffset: GlobalStyle.shadowOffset,
		shadowOpacity: GlobalStyle.shadowOpacity,
		shadowRadius: GlobalStyle.shadowRadius,
		elevation: GlobalStyle.shadowElevation,
	},
	budgetItemLight: {
		backgroundColor: Colors.Light.mainFirst
	},
	header: {
		width: "100%",
		textAlign: "left",
		fontSize: 16,
		fontWeight: "bold",
		marginBottom: 20,
		color: Colors.Dark.mainContrast
	},
	headerLight: {
		color: Colors.Light.mainContrast
	},
	row: {
		flexDirection: "row",
		alignItems: "center"
	},
	column: {
		flexDirection: "column",
	},
	legendWrapper: {
		marginLeft: 15
	},
	legendColor: {
		width: 15,
		height: 15,
		borderRadius: 10,
	},
	legendText: {
		marginLeft: 5,
		marginBottom: 3,
		marginTop: 3,
		fontSize: 12,
		color: Colors.Dark.mainContrast
	},
	legendTextLight: {
		color: Colors.Light.mainContrast
	},
	progressWrapper: {
		width: "100%",
		justifyContent: "flex-start"
	},
	progressContainer: {
		width: "100%",
		height: 20,
	},
	progressShape: {
		height: 20,
		width: screenWidth - 60 - 40 - 20,
		overflow: "hidden",
		borderRadius: GlobalStyle.borderRadius
	},
	progressBar: {
		position: "absolute",
		left: 0,
		width: screenWidth - 60 - 40 - 20,
		height: 20,
	},
	progressBackground: {
		zIndex: 4,
		backgroundColor: Colors.Dark.mainSecond
	},
	progressBackgroundLight: {
		backgroundColor: Colors.Dark.mainSecond
	},
	progressForeground: {
		zIndex: 5
	},
	progressText: {
		fontSize: 14,
		color: Colors.Dark.mainContrast
	},
	progressTextLight: {
		color: Colors.Light.mainContrast
	},
	statsTextWrapper: {
		marginTop: 15,
		marginLeft: 10,
		width: "100%",
		justifyContent: "flex-start",
		alignItems: "flex-start"
	},
	statsText: {
		marginTop: 10,
		fontSize: 12,
		color: Colors.Dark.mainContrast
	},
	statsTextLight: {
		color: Colors.Light.mainContrast
	},
	statsHeader: {
		fontWeight: "bold",
		fontSize: 14,
		color: Colors.Dark.mainContrast
	},
	statsHeaderLight: {
		color: Colors.Light.mainContrast
	},
	modalContent: {
		width: "100%",
		height: "100%",
		backgroundColor: Colors.Dark.mainFirst
	},
	modalContentLight: {
		backgroundColor: Colors.Light.mainFirst
	},
	modalList: {
		position: "absolute",
		top: 16,
		left: 20,
		width: screenWidth - 40,
		height: windowHeight - barHeight - 40 - 40,
		borderRadius: GlobalStyle.borderRadius,
		backgroundColor: Colors.Dark.mainSecond,
		shadowColor: GlobalStyle.shadowColor,
		shadowOffset: GlobalStyle.shadowOffset,
		shadowOpacity: GlobalStyle.shadowOpacity,
		shadowRadius: GlobalStyle.shadowRadius,
		elevation: GlobalStyle.shadowElevation,
	},
	modalListLight: {
		backgroundColor: Colors.Light.mainThird,
	},
	listHeader: {
		alignItems: "center"
	},
	listText: {
		fontSize: 18,
		fontWeight: "bold",
		lineHeight: windowHeight - barHeight - 40 - 20 - 70 - 130 - 10,
		color: Colors.Dark.mainContrast
	},
	listTextLight: {
		color: Colors.Light.mainContrast
	},
});