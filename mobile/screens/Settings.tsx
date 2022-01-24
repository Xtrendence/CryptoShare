import { useFocusEffect } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
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
import { TextInput, TouchableOpacity } from "react-native-gesture-handler";
import Requests from "../utils/Requests";
import { changeSetting, setSettingsState } from "../store/reducers/settings";
import ChoiceButton from "../components/ChoiceButton";

export default function Settings({ navigation }: any) {
	const dispatch = useDispatch();
	const { theme } = useSelector((state: any) => state.theme);
	const { settings } = useSelector((state: any) => state.settings);

	const [search, setSearch] = useState<string>("");
	
	useFocusEffect(Utils.backHandler(navigation));

	useEffect(() => {
		navigation.addListener("focus", () => {
			if(navigation.isFocused()) {
				setTimeout(() => {
					Utils.getSettings(dispatch);
				}, 500);
			}
		});
	}, []);

	return (
		<ImageBackground source={Utils.getBackground(theme)} resizeMethod="scale" resizeMode="cover">
			<ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent} showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false} nestedScrollEnabled={true}>
				<SafeAreaView style={styles.area}>
				<TextInput 
						placeholder="Search..." 
						selectionColor={Colors[theme].mainContrast} 
						placeholderTextColor={Colors[theme].mainContrastDarker} 
						style={[styles.search, styles[`search${theme}`]]} 
						onChangeText={(value) => setSearch(value)}
						value={search}
					/>
					<ScrollView style={[styles.wrapper, styles[`wrapper${theme}`]]} contentContainerStyle={styles.wrapperContent}>
						{ Utils.filterSettings(search).includes("appearance") &&
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
											<Icon name="sun" size={20} color={Colors[theme].Settings.accentFirst} style={{ padding:12, paddingLeft:13 }}/>
										}
										thumbInActiveComponent={
											<Icon name="moon" size={20} color={Colors[theme].Settings.accentFirst} style={{ padding:12 }}/>
										}
										trackBar={styles.trackBar}
										thumbButton={styles.thumbButton}
										animationDuration={250}
									/>
								</View>
							</View>
						}
						{ Utils.filterSettings(search).includes("account") &&
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
									<TouchableOpacity style={[styles.button, styles.actionButton, styles[`actionButton${theme}`]]}>
										<Text style={[styles.actionText, styles[`actionText${theme}`]]}>Change Password</Text>
									</TouchableOpacity>
								</View>
							</View>
						}
						{ Utils.filterSettings(search).includes("defaultPage") &&
							<View style={[styles.section, styles[`section${theme}`]]}>
								<View style={styles.sectionTop}>
									<Text style={[styles.title, styles[`title${theme}`], styles.titleTop]}>Default Page</Text>
								</View>
								<View style={styles.sectionBottom}>
									<ChoiceButton setting="Chat Bot" active={settings.defaultPage} text="Chat Bot" theme={theme} onPress={() => dispatch(changeSetting({ key:"defaultPage", value:"Chat Bot" }))}/>
									<ChoiceButton setting="Dashboard" active={settings.defaultPage} text="Dashboard" theme={theme} onPress={() => dispatch(changeSetting({ key:"defaultPage", value:"Dashboard" }))}/>
									<ChoiceButton setting="Market" active={settings.defaultPage} text="Market" theme={theme} onPress={() => dispatch(changeSetting({ key:"defaultPage", value:"Market" }))}/>
									<ChoiceButton setting="Holdings" active={settings.defaultPage} text="Holdings" theme={theme} onPress={() => dispatch(changeSetting({ key:"defaultPage", value:"Holdings" }))}/>
									<ChoiceButton setting="Activity" active={settings.defaultPage} text="Activity" theme={theme} onPress={() => dispatch(changeSetting({ key:"defaultPage", value:"Activity" }))}/>
									<ChoiceButton setting="Settings" active={settings.defaultPage} text="Settings" theme={theme} onPress={() => dispatch(changeSetting({ key:"defaultPage", value:"Settings" }))}/>
								</View>
							</View>
						}
						{ Utils.filterSettings(search).includes("assetIconBackdrop") &&
							<View style={[styles.section, styles[`section${theme}`]]}>
								<View style={styles.sectionTop}>
									<Text style={[styles.title, styles[`title${theme}`], styles.titleTop]}>Asset Icon Backdrop</Text>
								</View>
								<View style={styles.sectionBottom}>
									<ChoiceButton setting="disabled" active={settings.assetIconBackdrop} text="Disabled" theme={theme} onPress={() => dispatch(changeSetting({ key:"assetIconBackdrop", value:"disabled" }))}/>
									<ChoiceButton setting="enabled" active={settings.assetIconBackdrop} text="Enabled" theme={theme} onPress={() => dispatch(changeSetting({ key:"assetIconBackdrop", value:"enabled" }))}/>
								</View>
							</View>
						}
					</ScrollView>
				</SafeAreaView>
			</ScrollView>
		</ImageBackground>
	);

	async function logout() {
		let api = await AsyncStorage.getItem("api");
		let userID = await AsyncStorage.getItem("userID");
		let token = await AsyncStorage.getItem("token");

		let requests = new Requests(api);

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