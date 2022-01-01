import { useFocusEffect } from "@react-navigation/native";
import React from "react";
import { ImageBackground, ScrollView, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Utils from "../utils/Utils";
import { SafeAreaView } from "react-native-safe-area-context";
import styles from "../styles/Settings";
import { useDispatch, useSelector } from "react-redux";

export default function Settings({ navigation }: any) {
	const dispatch = useDispatch();
	const { theme } = useSelector((state: any) => state.theme);
	
	useFocusEffect(Utils.backHandler(navigation));

	return (
		<ImageBackground source={Utils.getBackground(theme, "static")} resizeMethod="scale" resizeMode="cover">
			<ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent} showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false} nestedScrollEnabled={true}>
				<SafeAreaView style={styles.area}>

				</SafeAreaView>
			</ScrollView>
		</ImageBackground>
	);
}