import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { ImageBackground, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Utils from "../utils/Utils";
import { Colors } from "../styles/Global";
import { switchTheme } from "../store/reducers/theme";
import Icon from "react-native-vector-icons/FontAwesome5";
import Toggle from "react-native-toggle-element";
import { TouchableOpacity } from "react-native-gesture-handler";
import styles from "../styles/Login";

export default function Login() {
	const dispatch = useDispatch();
	const { theme } = useSelector((state: any) => state.theme);

	let background = Utils.getBackground(theme, "static");

	return (
		<ImageBackground source={background} resizeMethod="scale" resizeMode="cover">
			<SafeAreaView style={styles.area}>
				<Toggle
					value={theme === "dark" ? false : true}
					onPress={() => dispatch(switchTheme())}
					thumbActiveComponent={
						<Icon name="sun" size={25} color={Colors[theme].accentFirst} style={{ padding:12, paddingLeft:13 }}/>
					}
					thumbInActiveComponent={
						<Icon name="moon" size={25} color={Colors[theme].accentFirst} style={{ padding:12 }}/>
					}
					trackBar={styles.trackBar}
					thumbButton={styles.thumbButton}
					animationDuration={250}
				/>
			</SafeAreaView>
		</ImageBackground>
	);
}