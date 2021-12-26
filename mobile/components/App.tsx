import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as TransparentStatusAndNavigationBar from "react-native-transparent-status-and-navigation-bar";

TransparentStatusAndNavigationBar.init();
TransparentStatusAndNavigationBar.setBarsStyle(true, "light-content");

function App() {
	return (
		<SafeAreaView style={{ backgroundColor:"rgb(20,20,20)", width:"100%", height:"100%", justifyContent:"center", alignItems:"center" }}>
			<View>
				<Text style={{ color:"rgb(255,255,255)", fontSize:20, fontWeight:"bold" }}>CryptoShare</Text>
			</View>
		</SafeAreaView>
	);
}

export default App;