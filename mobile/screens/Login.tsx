import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { ImageBackground, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Utils from "../utils/Utils";
import { switchTheme } from "../store/reducers/theme";
import { TouchableOpacity } from "react-native-gesture-handler";

export default function Login() {
	const dispatch = useDispatch();
	const { theme } = useSelector((state: any) => state.theme);

	let background = Utils.getBackground(theme, "static");

	return (
		<ImageBackground source={background} resizeMethod="scale" resizeMode="cover">
			<SafeAreaView style={styles.area}>
				<View>
					<Text style={{ color:"rgb(255,255,255)", fontSize:20, fontWeight:"bold" }}>CryptoShare</Text>
				</View>
			</SafeAreaView>
		</ImageBackground>
	);
}

let styles = StyleSheet.create({
	area: {
		width:"100%",
		height:"100%",
		justifyContent:"center",
		alignItems:"center"
	}
});