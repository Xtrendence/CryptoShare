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
		top: 40,
		left: 20,
		width: screenWidth - 40,
		height: windowHeight - barHeight - 40 - 20 - 70 - 20,
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
	}
});