import React, { useState, useEffect } from "react";
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
import Requests from "../utils/Requests";
import Loading from "../components/Loading";

export default function Login({ navigation }: any) {
	const dispatch = useDispatch();
	const { theme } = useSelector((state: any) => state.theme);

	const [loading, setLoading] = useState<boolean>(false);
	const [action, setAction] = useState<string>("login");

	// TODO: Remove preset values.
	const [loginUsername, setLoginUsername] = useState<string>("Admin");
	const [loginPassword, setLoginPassword] = useState<string>("admin");

	const [createUsername, setCreateUsername] = useState<string>("Admin");
	const [createPassword, setCreatePassword] = useState<string>("admin");
	const [createRepeatPassword, setCreateRepeatPassword] = useState<string>("admin");

	return (
		<ImageBackground source={Utils.getBackground(theme, "static")} resizeMethod="scale" resizeMode="cover">
			<SafeAreaView style={styles.area}>
				<View style={[styles.wrapper, styles[`wrapper${theme}`]]}>
					<View style={[styles.titleContainer, styles[`titleContainer${theme}`]]}>
						<Text style={styles.title}>CryptoShare</Text>
					</View>
				</View>
				<View style={[styles.wrapper, styles[`wrapper${theme}`]]}>
					<View style={[styles.loginContainer, styles[`loginContainer${theme}`]]}>
						{ action === "login" &&
							<View>
								<TextInput 
									placeholder="Username..." 
									selectionColor={Colors[theme].mainContrast} 
									placeholderTextColor={Colors[theme].mainContrastDarker} 
									style={[styles.input, styles[`input${theme}`]]} 
									onChangeText={(value) => setLoginUsername(value)}
									value={loginUsername}
								/>
								<TextInput 
									placeholder="Password..." 
									selectionColor={Colors[theme].mainContrast} 
									placeholderTextColor={Colors[theme].mainContrastDarker} 
									style={[styles.input, styles[`input${theme}`]]} 
									onChangeText={(value) => setLoginPassword(value)}
									value={loginPassword}
									secureTextEntry
								/>
								<TouchableOpacity style={[styles.button, styles.mainButton, styles[`mainButton${theme}`]]} onPress={() => setAction("create")}>
									<Text style={[styles.mainText, styles[`mainText${theme}`]]}>Need An Account?</Text>
								</TouchableOpacity>
								<TouchableOpacity style={[styles.button, styles.accentButton, styles[`accentButton${theme}`]]} onPress={() => login(loginUsername, loginPassword)}>
									<Text style={[styles.accentText, styles[`accentText${theme}`]]}>Login</Text>
								</TouchableOpacity>
							</View>
						}
						{ action === "create" &&
							<View>
								<TextInput 
									placeholder="Username..." 
									selectionColor={Colors[theme].mainContrast} 
									placeholderTextColor={Colors[theme].mainContrastDarker} 
									style={[styles.input, styles[`input${theme}`]]} 
									onChangeText={(value) => setCreateUsername(value)}
									value={createUsername}
								/>
								<TextInput 
									placeholder="Password..." 
									selectionColor={Colors[theme].mainContrast} 
									placeholderTextColor={Colors[theme].mainContrastDarker} 
									style={[styles.input, styles[`input${theme}`]]} 
									onChangeText={(value) => setCreatePassword(value)} 
									value={createPassword}
									secureTextEntry
								/>
								<TextInput 
									placeholder="Repeat Password..." 
									selectionColor={Colors[theme].mainContrast} 
									placeholderTextColor={Colors[theme].mainContrastDarker} 
									style={[styles.input, styles[`input${theme}`]]} 
									onChangeText={(value) => setCreateRepeatPassword(value)} 
									value={createRepeatPassword} 
									secureTextEntry
								/>
								<TouchableOpacity style={[styles.button, styles.mainButton, styles[`mainButton${theme}`]]} onPress={() => setAction("login")}>
									<Text style={[styles.mainText, styles[`mainText${theme}`]]}>Got An Account?</Text>
								</TouchableOpacity>
								<TouchableOpacity style={[styles.button, styles.accentButton, styles[`accentButton${theme}`]]}>
									<Text style={[styles.accentText, styles[`accentText${theme}`]]}>Create Account</Text>
								</TouchableOpacity>
							</View>
						}
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
			<Loading active={loading}/>
		</ImageBackground>
	);

	function login(username: string, password: string) {
		setLoading(true);

		let requests = new Requests("http://192.168.1.100:3190/graphql");

		requests.login(username, password).then((response: any) => {
			setTimeout(() => setLoading(false), 750);

			if("error" in response) {
				Utils.notify(theme, Utils.replaceAll("!", "", response.error));
			} else {
				Utils.setAccountInfo(response);
				navigation.navigate("Dashboard");
			}
		}).catch((error: any) => {
			setTimeout(() => setLoading(false), 750);
		});
	}
}