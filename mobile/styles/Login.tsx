import { StyleSheet } from "react-native";
import { Colors, GlobalStyle } from "./Global";

export default StyleSheet.create({
	area: {
		width: "100%",
		height: "100%",
		justifyContent: "center",
		alignItems: "center"
	},
	trackBar: {
		activeBackgroundColor: Colors.light.accentFirst,
		inActiveBackgroundColor: Colors.dark.mainSecond,
		borderActiveColor: Colors.light.accentFirst,
		borderInActiveColor: Colors.dark.accentFirst,
		borderWidth: 0,
		width: 100,
		height: 45
	},
	thumbButton: {
		activeBackgroundColor: Colors.light.mainThird,
		inActiveBackgroundColor: Colors.dark.mainThird,
		height: 50,
		width: 52,
		radius: 25,
	}
});