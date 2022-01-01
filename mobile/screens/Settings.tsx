import { useFocusEffect } from "@react-navigation/native";
import React from "react";
import { ImageBackground, ScrollView, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Utils from "../utils/Utils";
import Icon from "react-native-vector-icons/FontAwesome5";
import Toggle from "react-native-toggle-element";
import { SafeAreaView } from "react-native-safe-area-context";
import styles from "../styles/Settings";
import { useDispatch, useSelector } from "react-redux";
import { Colors } from "../styles/Global";
import { switchTheme } from "../store/reducers/theme";
import { TouchableOpacity } from "react-native-gesture-handler";
import Requests from "../utils/Requests";

export default function Settings({ navigation }: any) {
	const dispatch = useDispatch();
	const { theme } = useSelector((state: any) => state.theme);
	
	useFocusEffect(Utils.backHandler(navigation));

	return (
		<ImageBackground source={Utils.getBackground(theme, "static")} resizeMethod="scale" resizeMode="cover">
			<ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent} showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false} nestedScrollEnabled={true}>
				<SafeAreaView style={styles.area}>
					<ScrollView style={[styles.wrapper, styles[`wrapper${theme}`]]} contentContainerStyle={styles.wrapperContent}>
						<View style={[styles.section, styles[`section${theme}`], styles.inline]}>
							<View style={styles.sectionLeft}>
								<Text style={[styles.title, styles[`title${theme}`]]}>Application Theme</Text>
							</View>
							<View style={styles.sectionRight}>
								<Toggle
									style={styles.inlineRight}
									value={theme === "Dark" ? false : true}
									onPress={() => dispatch(switchTheme(theme === "Dark" ? "Light" : "Dark"))}
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
						<View style={[styles.section, styles[`section${theme}`]]}>
							<View style={styles.sectionTop}>
								<Text style={[styles.title, styles[`title${theme}`], styles.titleTop]}>Account</Text>
							</View>
							<View style={styles.sectionBottom}>
								<TouchableOpacity style={[styles.button, styles.actionButton, styles[`actionButton${theme}`]]} onPress={() => logout()}>
									<Text style={[styles.actionText, styles[`actionText${theme}`]]}>Logout</Text>
								</TouchableOpacity>
								<TouchableOpacity style={[styles.button, styles.actionButton, styles[`actionButton${theme}`]]}>
									<Text style={[styles.actionText, styles[`actionText${theme}`]]}>Logout Everywhere</Text>
								</TouchableOpacity>
								<TouchableOpacity style={[styles.button, styles.actionButton, styles[`actionButton${theme}`], { marginBottom:0 }]}>
									<Text style={[styles.actionText, styles[`actionText${theme}`]]}>Change Password</Text>
								</TouchableOpacity>
							</View>
						</View>
					</ScrollView>
				</SafeAreaView>
			</ScrollView>
		</ImageBackground>
	);

	async function logout() {
		let url = await AsyncStorage.getItem("api");
		let userID = await AsyncStorage.getItem("userID");
		let token = await AsyncStorage.getItem("token");

		let requests = new Requests(url);

		requests.logout(userID, token).then(result => {
			if("error" in result) {
				Utils.notify(theme, result.error);
			} else {
				finishLogout();
			}
		}).catch(error => {
			Utils.notify(theme, error);
		});
	}

	async function finishLogout() {
		await Utils.removeAccountInfo();
		navigation.navigate("Login");
	}
}