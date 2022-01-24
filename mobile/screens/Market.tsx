import { useFocusEffect } from "@react-navigation/native";
import React, { useState } from "react";
import { ImageBackground, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/FontAwesome5";
import Utils from "../utils/Utils";
import { SafeAreaView } from "react-native-safe-area-context";
import styles from "../styles/Market";
import { useDispatch, useSelector } from "react-redux";
import { Colors } from "../styles/Global";

export default function Market({ navigation }: any) {
	const dispatch = useDispatch();
	const { theme } = useSelector((state: any) => state.theme);

	const [symbol, setSymbol] = useState<string>("");
	const [type, setType] = useState<string>("crypto");
	
	useFocusEffect(Utils.backHandler(navigation));

	return (
		<ImageBackground source={Utils.getBackground(theme)} resizeMethod="scale" resizeMode="cover">
			<ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent} showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false} nestedScrollEnabled={true}>
			<SafeAreaView style={styles.area}>
					<View style={[styles.areaSearchWrapper, styles[`areaSearchWrapper${theme}`]]}>
						<TextInput
							placeholder="Symbol..." 
							selectionColor={Colors[theme].mainContrast} 
							placeholderTextColor={Colors[theme].mainContrastDarker} 
							style={[styles.inputSearch, styles[`inputSearch${theme}`]]} 
							onChangeText={(value) => setSymbol(value)}
							value={symbol}
						/>
						<TouchableOpacity style={[styles.button, styles.buttonSearch, styles[`buttonSearch${theme}`]]}>
							<Text style={[styles.searchText, styles[`searchText${theme}`]]}>Search</Text>
						</TouchableOpacity>
					</View>
					<ScrollView style={[styles.wrapper, styles[`wrapper${theme}`]]} contentContainerStyle={styles.wrapperContent}>

					</ScrollView>
					<View style={[styles.areaActionsWrapper, styles[`areaActionsWrapper${theme}`]]}>
						<TouchableOpacity style={[styles.button, styles.iconButton, styles[`iconButton`]]}>
							<Icon
								name="chart-line" 
								size={24} 
								color={Colors[theme].accentContrast}
							/>
						</TouchableOpacity>
						<TouchableOpacity onPress={() => changeType("crypto")} style={[styles.button, styles.choiceButton, styles[`choiceButton${theme}`], type === "crypto" ? styles[`choiceButtonActive${theme}`] : null]}>
							<Text style={[styles.choiceText, styles[`choiceText${theme}`]]}>Crypto</Text>
						</TouchableOpacity>
						<TouchableOpacity onPress={() => changeType("stocks")} style={[styles.button, styles.choiceButton, styles[`choiceButton${theme}`], type === "stocks" ? styles[`choiceButtonActive${theme}`] : null]}>
							<Text style={[styles.choiceText, styles[`choiceText${theme}`]]}>Stocks</Text>
						</TouchableOpacity>
					</View>
				</SafeAreaView>
			</ScrollView>
		</ImageBackground>
	);

	function changeType(type: string) {
		setType(type);
	}
}