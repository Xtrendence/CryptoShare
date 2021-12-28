import { createStyle } from "../utils/StyleSheet";
import { Colors, GlobalStyle } from "./Global";

export default createStyle<any>({
	area: {
		width: "100%",
		height: "100%",
		justifyContent: "center",
		alignItems: "center",
	},
	wrapper: {
		overflow: "hidden",
		borderRadius: GlobalStyle.borderRadius,
		marginBottom: 20,
		shadowColor: GlobalStyle.shadowColor,
		shadowOffset: GlobalStyle.shadowOffset,
		shadowOpacity: GlobalStyle.shadowOpacity,
		shadowRadius: GlobalStyle.shadowRadius,
		elevation: GlobalStyle.shadowElevation,
		backgroundColor: Colors.Dark.mainSecond
	},
	wrapperLight: {
		backgroundColor: Colors.Light.mainFirst
	},
	titleContainer: {
		height: 50,
		paddingRight: 10,
		paddingLeft: 10,
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 3,
	},
	title: {
		marginTop: 5,
		fontSize: 30,
		fontFamily: "Arkhip",
		color: Colors.Dark.accentFirst,
		textAlign: "center"
	},
	loginContainer: {
		width: 220,
		padding: 20,
		justifyContent: "center",
		alignItems: "center"
	},
	input: {
		width: 180,
		borderColor: Colors.Dark.accentFirst,
		borderWidth: 2,
		borderRadius: GlobalStyle.borderRadius,
		backgroundColor: Colors.Dark.mainFirstTransparent,
		color: Colors.Dark.mainContrast,
		paddingLeft: 10,
		paddingRight: 10,
		height: 40,
		marginBottom: 20,
	},
	inputLight: {
		backgroundColor: Colors.Light.mainFirstTransparent,
		borderColor: Colors.Light.accentFirst,
		color: Colors.Light.mainContrast,
	},
	button: {
		width: 180,
		justifyContent: "center",
		alignItems: "center",
		height: 40,
		paddingBottom: 2,
		borderRadius: GlobalStyle.borderRadius,
	},
	mainText: {
		fontSize: 16,
		fontWeight: "bold",
		color: Colors.Dark.mainContrast,
	},
	mainTextLight: {
		color: Colors.Light.mainContrast,
	},
	accentText: {
		fontSize: 16,
		fontWeight: "bold",
		color: Colors.Dark.accentContrast,
	},
	accentTextLight: {
		color: Colors.Light.accentContrast,
	},
	mainButton: {
		backgroundColor: Colors.Dark.mainFirstTransparent,
		borderColor: Colors.Dark.accentFirst,
		borderWidth: 2,
		marginBottom: 20,
	},
	mainButtonLight: {
		borderColor: Colors.Light.accentFirst,
		backgroundColor: Colors.Light.mainFirstTransparent,
	},
	accentButton: {
		backgroundColor: Colors.Dark.accentFirst
	},
	accentButtonLight: {
		backgroundColor: Colors.Light.accentFirst
	},
	toggleContainer: {
		width: 110,
		padding: 20,
		justifyContent: "center",
		alignItems: "center",
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
		inActiveBackgroundColor: Colors.Dark.mainFourth,
		height: 45,
		width: 47,
		radius: 22.5
	}
});