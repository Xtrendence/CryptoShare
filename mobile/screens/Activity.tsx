import React from "react";
import { View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Utils from "../utils/Utils";
import { useFocusEffect } from "@react-navigation/native";

export default function Activity({ navigation }: any) {
	useFocusEffect(Utils.backHandler(navigation));

	return (
		<View></View>
	);
}