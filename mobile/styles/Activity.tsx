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
		backgroundColor: Colors.Dark.Activity.accentFirst
	},
	buttonSearchLight: {
		backgroundColor: Colors.Light.Activity.accentFirst
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
		backgroundColor: Colors.Dark.Activity.accentFirst
	},
	actionButtonLight: {
		backgroundColor: Colors.Light.Activity.accentSecond
	},
});