import React from "react";
import { View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import Utils from "../utils/Utils";

export default function ChatBot({ navigation }: any) {
	useFocusEffect(Utils.backHandler(navigation));

	return (
		<View></View>
	);
}