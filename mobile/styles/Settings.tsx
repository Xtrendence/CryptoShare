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
		width: screenWidth - 40,
		paddingLeft: 14,
		paddingRight: 14,
		borderWidth: 2,
		borderRadius: GlobalStyle.borderRadius,
		borderColor: Colors.Dark.accentFirst,
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
		borderColor: Colors.Light.accentFirst,
		color: Colors.Light.mainContrast
	},
	wrapper: {
		position: "absolute",
		top: 40 + 70,
		left: 20,
		width: screenWidth - 40,
		height: windowHeight - barHeight - statusBarHeight - 20 - 70,
		borderWidth: 2,
		borderRadius: GlobalStyle.borderRadius,
		borderColor: Colors.Dark.accentFirst,
		backgroundColor: Colors.Dark.mainSecond,
		shadowColor: GlobalStyle.shadowColor,
		shadowOffset: GlobalStyle.shadowOffset,
		shadowOpacity: GlobalStyle.shadowOpacity,
		shadowRadius: GlobalStyle.shadowRadius,
		elevation: GlobalStyle.shadowElevation,
	},
	wrapperLight: {
		backgroundColor: Colors.Light.mainThird,
		borderColor: Colors.Light.accentFirst
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
		backgroundColor: Colors.Dark.mainFourth,
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
	sectionTop: {

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
		backgroundColor: Colors.Dark.accentFirst
	},
	actionButtonLight: {
		backgroundColor: Colors.Light.accentFirst
	},
	choiceButton: {
		backgroundColor: "transparent",
		borderWidth: 2,
		borderColor: Colors.Dark.accentFirst
	},
	choiceButtonLight: {
		backgroundColor: "transparent",
		borderColor: Colors.Light.accentFirst
	},
	choiceButtonActiveDark: {
		backgroundColor: Colors.Dark.accentFirst
	},
	choiceButtonActiveLight: {
		backgroundColor: Colors.Light.accentFirst
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
		activeBackgroundColor: Colors.Light.accentFirst,
		inActiveBackgroundColor: Colors.Dark.mainFirst,
		borderActiveColor: Colors.Light.accentFirst,
		borderInActiveColor: Colors.Dark.accentFirst,
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
});