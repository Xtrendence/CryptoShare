import React from "react";
import { ActivityIndicator, Modal, StyleSheet, Text, View } from "react-native";
import { Colors } from "../styles/Global";
import Utils from "../utils/Utils";

// Component used to indicate to the user that the app is loading something. The component covers the whole screen, so the user cannot tap on additional components.
export default function Loading(props: any) {
	return (
		<Modal transparent={true} visible={props.active} style={styles.modal}>
			<View style={[styles.overlay, styles[`background${props.theme}`], props.opaque ? styles[`backgroundOpaque${props.theme}`] : null]}>
				<ActivityIndicator color={Colors[props.theme].accentFirst} size={32}/>
				<Text style={[styles.text, styles[`text${props.theme}`]]}>{ Utils.empty(props.text) ? "Loading..." : props.text }</Text>
			</View>
		</Modal>
	);
}

let styles: any = StyleSheet.create({
	modal: {
		width: "100%",
		height: "100%"
	},
	overlay: {
		position: "absolute",
		top: 0,
		left: 0,
		width: "100%",
		height: "100%",
		zIndex: 50,
		justifyContent: "center",
		alignItems: "center"
	},
	backgroundOpaqueDark: {
		backgroundColor: "rgb(15,15,15)"
	},
	backgroundOpaqueLight: {
		backgroundColor: "rgb(255,255,255)"
	},
	backgroundDark: {
		backgroundColor: "rgba(0,0,0,0.9)"
	},
	backgroundLight: {
		backgroundColor: "rgba(255,255,255,0.9)"
	},
	text: {
		fontSize: 20,
		fontWeight: "bold",
		color: Colors.Dark.mainContrast,
		marginTop: 20
	},
	textLight: {
		color: Colors.Light.mainContrast
	},
});