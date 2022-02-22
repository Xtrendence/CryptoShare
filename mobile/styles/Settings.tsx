import { createStyle } from "../utils/StyleSheet";
import { Colors, GlobalStyle } from "./Global";
import { barHeight, screenWidth, statusBarHeight, windowHeight } from "./NavigationBar";

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
	search: {
		position: "absolute",
		top: 40,
		left: 20,
		height: 50,
		width: screenWidth - 40,
		paddingLeft: 14,
		paddingRight: 14,
		borderRadius: GlobalStyle.borderRadius,
		backgroundColor: Colors.Dark.mainSecond,
		shadowColor: GlobalStyle.shadowColor,
		shadowOffset: GlobalStyle.shadowOffset,
		shadowOpacity: GlobalStyle.shadowOpacity,
		shadowRadius: GlobalStyle.shadowRadius,
		elevation: GlobalStyle.shadowElevation,
		color: Colors.Dark.mainContrast,
		fontWeight: "bold",
		fontSize: 16
	},
	searchLight: {
		backgroundColor: Colors.Light.mainThird,
		color: Colors.Light.mainContrast
	},
	wrapper: {
		position: "absolute",
		top: 40 + 70,
		left: 20,
		width: screenWidth - 40,
		height: windowHeight - barHeight - 40 - 20 - 80,
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
	section: {
		width: screenWidth - 40 - 40,
		padding: 20,
		marginTop: 20,
		marginRight: 20,
		marginLeft: 20,
		borderRadius: GlobalStyle.borderRadius,
		backgroundColor: Colors.Dark.mainFirst,
		shadowColor: GlobalStyle.shadowColor,
		shadowOffset: GlobalStyle.shadowOffset,
		shadowOpacity: GlobalStyle.shadowOpacity,
		shadowRadius: GlobalStyle.shadowRadius,
		elevation: GlobalStyle.shadowElevation,
	},
	sectionLight: {
		backgroundColor: Colors.Light.mainFirst
	},
	sectionLeft: {
		flexGrow: 1,
		alignItems: "flex-start"
	},
	sectionRight: {
		alignItems: "flex-end",
	},
	sectionBottom: {
		flexDirection: "row",
		flexWrap: "wrap",
	},
	inline: {
		flexDirection: "row",
		alignItems: "center",
	},
	title: {
		color: Colors.Dark.mainContrast,
		fontSize: 16,
		fontWeight: "bold"
	},
	titleLight: {
		color: Colors.Light.mainContrast
	},
	titleTop: {
		marginBottom: 20
	},
	button: {
		paddingLeft: 10,
		paddingRight: 10,
		justifyContent: "center",
		alignItems: "center",
		height: 40,
		paddingBottom: 2,
		borderRadius: GlobalStyle.borderRadius,
		marginBottom: 10,
		marginLeft: 10
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
		backgroundColor: Colors.Dark.Settings.accentSecond
	},
	actionButtonLight: {
		backgroundColor: Colors.Light.Settings.accentSecond
	},
	choiceButton: {
		backgroundColor: "transparent",
		borderWidth: 3,
		borderColor: Colors.Dark.Settings.accentFirst
	},
	choiceButtonLight: {
		backgroundColor: "transparent",
		borderColor: Colors.Light.Settings.accentFirst
	},
	choiceButtonActiveDark: {
		backgroundColor: Colors.Dark.Settings.accentFirst
	},
	choiceButtonActiveLight: {
		backgroundColor: Colors.Light.Settings.accentFirst
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
	trackBar: {
		activeBackgroundColor: Colors.Light.Settings.accentFirst,
		inActiveBackgroundColor: Colors.Dark.mainFourth,
		borderActiveColor: Colors.Light.Settings.accentFirst,
		borderInActiveColor: Colors.Dark.Settings.accentFirst,
		borderWidth: 0,
		width: 80,
		height: 35
	},
	thumbButton: {
		activeBackgroundColor: Colors.Light.mainThird,
		inActiveBackgroundColor: Colors.Dark.mainSecond,
		height: 45,
		width: 47,
		radius: 22.5
	},
	modalSection: {
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
	modalInfoWrapper: {
		flexDirection: "column",
		justifyContent: "center",
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
});