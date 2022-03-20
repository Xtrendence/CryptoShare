import { Dimensions, StatusBar } from "react-native";
import { createStyle } from "../utils/StyleSheet";
import { Colors, GlobalStyle } from "./Global";

// The width and height of the device's screen.
const screenWidth = Dimensions.get("screen").width;
const screenHeight = Dimensions.get("screen").height;

// The width and height of the app's visible window.
const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

// The height of Android's bottom navigation bar.
const barDifference = screenHeight - windowHeight + 10;

// The height of the OS' status bar.
const statusBarHeight = StatusBar.currentHeight || 32;

// The height of Android's bottom navigation bar after adjusting for unusually big ones.
const actionBarHeight = barDifference > 60 ? 60 : barDifference;

// The height of the app's navigation bar.
const barHeight = 62;

export { screenWidth, screenHeight, windowWidth, windowHeight, statusBarHeight, actionBarHeight, barHeight };

export default createStyle<any>({
	bar: {
		position: "absolute",
		bottom: actionBarHeight,
		left: 20,
		width: screenWidth - 40,
		height: barHeight,
		overflow: "hidden",
		borderRadius: GlobalStyle.borderRadius,
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
	barDarkAlternate: {
		elevation: 0,
		shadowOpacity: 0,
		backgroundColor: Colors.Dark.mainFirstTransparent,
	},
	barLightAlternate: {
		elevation: 0,
		shadowOpacity: 0,
		backgroundColor: Colors.Light.mainFirstTransparent,
	},
	foreground: {
		width: "100%",
		height: "100%",
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		position: "absolute",
		zIndex: 4,
	},
	background: {
		zIndex: 2,
		width: "100%",
		height: "100%",
		position: "absolute",
		overflow: "hidden"
	},
	backdrop: {
		top: "15%",
		width: "12%",
		borderRadius: GlobalStyle.borderRadius,
		marginLeft: "2.5%",
		height: "70%",
		backgroundColor: Colors.Dark.accentFirst,
		overflow: "hidden"
	},
	backdropLight: {
		backgroundColor: Colors.Light.accentFirst
	},
	pattern: {
		transform: [{ scale:2.5 }]
	},
	patternChatBot: {
		transform: [{ scale:2.5 }, { rotate:"30deg" }]
	},
	patternDashboard: {
		transform: [{ scale:2.5 }, { rotate:"200deg" }]
	},
	patternMarket: {
		transform: [{ scale:2.5 }, { rotate:"120deg" }]
	},
	patternHoldings: {
		transform: [{ scale:2.5 }, { rotate:"10deg" }]
	},
	patternActivity: {
		transform: [{ scale:2.5 }, { rotate:"50deg" }]
	},
	patternSettings: {
		transform: [{ scale:2.5 }, { rotate:"150deg" }]
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
		borderRadius: 40,
	},
	iconWrapper: {
		height: 40,
		width: 40,
		borderRadius: GlobalStyle.borderRadius,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: Colors.Dark.mainFirstTransparent
	},
	iconWrapperLight: {
		backgroundColor: Colors.Light.mainFirstTransparent
	},
	iconWrapperActive: {
		backgroundColor: "rgba(0,0,0,0)"
	}
});