import React from "react";
import { useFocusEffect } from "@react-navigation/native";
import { ImageBackground } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import styles from "../styles/ChatBot";
import Utils from "../utils/Utils";

export default function ChatBot({ navigation }: any) {
	const dispatch = useDispatch();
	const { theme } = useSelector((state: any) => state.theme);
	
	useFocusEffect(Utils.backHandler(navigation));

	return (
		<ImageBackground source={Utils.getBackground(theme)} resizeMethod="scale" resizeMode="cover">
			<SafeAreaView style={styles.area}>

			</SafeAreaView>
		</ImageBackground>
	);
}