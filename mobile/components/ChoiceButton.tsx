import React from "react";
import { Text, TouchableOpacity } from "react-native";
import styles from "../styles/Settings";

// Button used for user settings that offer a choice between two or more options.
export default function ChoiceButton(props: any) {
	return (
		<TouchableOpacity style={[styles.button, styles.choiceButton, styles[`choiceButton${props.theme}`], props.setting === props.active ? styles[`choiceButtonActive${props.theme}`] : null]} onPress={props.onPress}>
			<Text style={[styles.choiceText, styles[`choiceText${props.theme}`], props.setting === props.active ? styles[`choiceTextActive${props.theme}`] : null]}>{props.text}</Text>
		</TouchableOpacity>
	);
}