import React from "react";
import { ActivityIndicator, Modal, StyleSheet, Text, View } from "react-native";
import Utils from "../utils/Utils";

export default function Loading(props: any) {
	return (
		<Modal transparent={true} visible={props.active} style={styles.modal}>
			<View style={[styles.overlay, props.opaque ? { backgroundColor:"rgb(0,0,0)" } : null]}>
				<ActivityIndicator color="rgb(255,255,255)" size={32}/>
				<Text style={styles.text}>{ Utils.empty(props.text) ? "Loading..." : props.text }</Text>
			</View>
		</Modal>
	);
}

let styles = StyleSheet.create({
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
		backgroundColor: "rgba(0,0,0,0.9)",
		justifyContent: "center",
		alignItems: "center"
	},
	text: {
		fontSize: 20,
		fontWeight: "bold",
		color: "rgb(255,255,255)",
		marginTop: 20
	}
});