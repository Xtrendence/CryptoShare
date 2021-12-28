import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { ImageBackground, StyleSheet, Text, TextInput, View } from "react-native";
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
				<View style={[styles.wrapper, styles[`wrapper${theme}`]]}>
					<View style={[styles.titleContainer, styles[`titleContainer${theme}`]]}>
						<Text style={styles.title}>CryptoShare</Text>
					</View>
				</View>
				<View style={[styles.wrapper, styles[`wrapper${theme}`]]}>
					<View style={[styles.loginContainer, styles[`loginContainer${theme}`]]}>
						<TextInput placeholder="Username..." selectionColor={Colors[theme].mainContrast} placeholderTextColor={Colors[theme].mainContrastDarker} style={[styles.input, styles[`input${theme}`]]}/>
						<TextInput placeholder="Password..." selectionColor={Colors[theme].mainContrast} placeholderTextColor={Colors[theme].mainContrastDarker} style={[styles.input, styles[`input${theme}`]]} secureTextEntry/>
						<TouchableOpacity style={[styles.button, styles.mainButton, styles[`mainButton${theme}`]]}>
							<Text style={[styles.mainText, styles[`mainText${theme}`]]}>Need An Account?</Text>
						</TouchableOpacity>
						<TouchableOpacity style={[styles.button, styles.accentButton, styles[`accentButton${theme}`]]}>
							<Text style={[styles.accentText, styles[`accentText${theme}`]]}>Login</Text>
						</TouchableOpacity>
					</View>
				</View>
				<View style={[styles.wrapper, styles[`wrapper${theme}`]]}>
					<View style={[styles.toggleContainer, styles[`toggleContainer${theme}`]]}>
						<Toggle
							value={theme === "Dark" ? false : true}
							onPress={() => dispatch(switchTheme())}
							thumbActiveComponent={
								<Icon name="sun" size={20} color={Colors[theme].accentFirst} style={{ padding:12, paddingLeft:13 }}/>
							}
							thumbInActiveComponent={
								<Icon name="moon" size={20} color={Colors[theme].accentFirst} style={{ padding:12 }}/>
							}
							trackBar={styles.trackBar}
							thumbButton={styles.thumbButton}
							animationDuration={250}
						/>
					</View>
				</View>
			</SafeAreaView>
		</ImageBackground>
	);
}