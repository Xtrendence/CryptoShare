import React from "react";
import { ImageBackground, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Login() {
	return (
		<ImageBackground source={require("../assets/img/BG-Black-Gold.png")} resizeMethod="scale" resizeMode="cover">
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