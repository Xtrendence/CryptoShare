import { Dimensions } from "react-native";
import { createStyle } from "../utils/StyleSheet";
import { Colors, GlobalStyle } from "./Global";

const screenWidth = Dimensions.get("screen").width;
const screenHeight = Dimensions.get("screen").height;

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

const statusBarHeight = screenHeight - windowHeight; 
const barHeight = 62;

export { screenWidth, screenHeight, windowWidth, windowHeight, statusBarHeight, barHeight };

export default createStyle<any>({
	bar: {
		position: "absolute",
		bottom: statusBarHeight + 10,
		left: 20,
		width: screenWidth - 40,
		height: barHeight,
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
	barLight: {
		backgroundColor: Colors.Light.mainSecond,
		borderColor: Colors.Light.accentFirst
	},
	foreground: {
		width: "100%",
		height: "100%",
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		position: "absolute",
		zIndex: 3,
	},
	background: {
		zIndex: 2,
		width: "100%",
		height: "100%",
		position: "absolute"
	},
	backdrop: {
		top: "15%",
		width: "12%",
		borderRadius: GlobalStyle.borderRadius,
		marginLeft: "2.5%",
		height: "70%",
		backgroundColor: Colors.Dark.accentFirst
	},
	backdropLight: {
		backgroundColor: Colors.Light.accentFirst
	},
	tab: {
		width: `${100 / 6}%`
	},
	itemWrapper: {
		flex: 1,
		flexGrow: 1,
		flexDirection: "column",
		height: 40,
		marginLeft: 10,
		marginRight: 10,
		justifyContent: "center",
		alignItems: "center",
		borderRadius: 40
	},
	iconWrapper: {
		height: "100%",
		alignItems: "center",
		justifyContent: "center"
	}
});