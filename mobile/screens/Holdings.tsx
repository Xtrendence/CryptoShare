import { useFocusEffect } from "@react-navigation/native";
import React from "react";
import { ImageBackground, ScrollView, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Utils from "../utils/Utils";
import { SafeAreaView } from "react-native-safe-area-context";
import styles from "../styles/Holdings";
import { useDispatch, useSelector } from "react-redux";
import LinearGradient from "react-native-linear-gradient";
import { Colors } from "../styles/Global";
import { TouchableOpacity } from "react-native-gesture-handler";

export default function Holdings({ navigation }: any) {
	const dispatch = useDispatch();
	const { theme } = useSelector((state: any) => state.theme);
	
	useFocusEffect(Utils.backHandler(navigation));

	return (
		<ImageBackground source={Utils.getBackground(theme)} resizeMethod="scale" resizeMode="cover">
			<ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent} showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false} nestedScrollEnabled={true}>
				<SafeAreaView style={styles.area}>
					<View style={[styles.areaCardWrapper, styles[`areaCardWrapper${theme}`]]}>
						<TouchableOpacity>
							<LinearGradient
								style={styles.areaCard}
								colors={Colors[theme].oceanGradient}
								useAngle={true}
								angle={300}
							>
								<Text style={[styles.areaCardText, styles[`areaCardText${theme}`]]}>-</Text>
							</LinearGradient>
						</TouchableOpacity>
					</View>
					<ScrollView style={[styles.wrapper, styles[`wrapper${theme}`]]} contentContainerStyle={styles.wrapperContent}>

					</ScrollView>
					<View style={[styles.areaActionsWrapper, styles[`areaActionsWrapper${theme}`]]}>
						<TouchableOpacity style={[styles.button, styles.actionButton, styles[`actionButton${theme}`]]}>
							<Text style={[styles.actionText, styles[`actionText${theme}`]]}>Add Crypto</Text>
						</TouchableOpacity>
						<TouchableOpacity style={[styles.button, styles.actionButton, styles[`actionButton${theme}`]]}>
							<Text style={[styles.actionText, styles[`actionText${theme}`]]}>Add Stock</Text>
						</TouchableOpacity>
					</View>
				</SafeAreaView>
			</ScrollView>
		</ImageBackground>
	);
}