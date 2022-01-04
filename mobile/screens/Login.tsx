import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BackHandler, ImageBackground, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BottomModal, ModalContent, ModalButton, ModalFooter } from "react-native-modals";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Utils from "../utils/Utils";
import { Colors } from "../styles/Global";
import { switchTheme } from "../store/reducers/theme";
import Icon from "react-native-vector-icons/FontAwesome5";
import Toggle from "react-native-toggle-element";
import { TouchableOpacity } from "react-native-gesture-handler";
import styles from "../styles/Login";
import Requests from "../utils/Requests";
import Loading from "../components/Loading";
import CryptoFN from "../utils/CryptoFN";

export default function Login({ navigation }: any) {
	const dispatch = useDispatch();
	const { theme } = useSelector((state: any) => state.theme);

	const [bottomModal, setBottomModal] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(true);
	const [action, setAction] = useState<string>("login");

	// TODO: Remove preset values.
	const [url, setURL] = useState<any>("http://192.168.1.100:3190/graphql");

	const [loginUsername, setLoginUsername] = useState<string>("Admin");
	const [loginPassword, setLoginPassword] = useState<string>("admin");

	const [createUsername, setCreateUsername] = useState<string>("Admin");
	const [createPassword, setCreatePassword] = useState<string>("admin");
	const [createRepeatPassword, setCreateRepeatPassword] = useState<string>("admin");

	useCallback(() => {
		function onBackPress(): boolean {
			BackHandler.exitApp();
			return true;
		}

		BackHandler.addEventListener("hardwareBackPress", onBackPress);

		return () => BackHandler.removeEventListener("hardwareBackPress", onBackPress);
	}, []);

	useEffect(() => {
		setLoading(true);

		AsyncStorage.getItem("api").then(api => {
			if(!Utils.empty(api)) {
				setURL(api);
			}
		});

		AsyncStorage.getItem("theme").then(savedTheme => {
			dispatch(switchTheme(savedTheme));

			Utils.wait(250).then(() => {
				setLoading(false);
			});
		});
	}, []);

	return (
		<ImageBackground source={Utils.getBackground(theme, "static")} resizeMethod="scale" resizeMode="cover">
			<ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent} showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false} nestedScrollEnabled={true}>
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
										placeholder="API URL..." 
										selectionColor={Colors[theme].mainContrast} 
										placeholderTextColor={Colors[theme].mainContrastDarker} 
										style={[styles.input, styles[`input${theme}`]]} 
										onChangeText={(value) => setURL(value)}
										value={url}
									/>
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
									<TouchableOpacity style={[styles.button, styles.accentButton, styles[`accentButton${theme}`]]} onPress={() => login(url, loginUsername, loginPassword)}>
										<Text style={[styles.accentText, styles[`accentText${theme}`]]}>Login</Text>
									</TouchableOpacity>
								</View>
							}
							{ action === "create" &&
								<View>
									<TextInput 
										placeholder="API URL..." 
										selectionColor={Colors[theme].mainContrast} 
										placeholderTextColor={Colors[theme].mainContrastDarker} 
										style={[styles.input, styles[`input${theme}`]]} 
										onChangeText={(value) => setURL(value)}
										value={url}
									/>
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
									<TouchableOpacity style={[styles.button, styles.accentButton, styles[`accentButton${theme}`]]} onPress={() => showBottomModal(url, createUsername, createPassword, createRepeatPassword)}>
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
				</SafeAreaView>
			</ScrollView>
			<BottomModal 
				visible={bottomModal} 
				modalStyle={[styles.bottomModal, styles[`bottomModal${theme}`]]} 
				onTouchOutside={hideBottomModal} 
				onSwipeOut={hideBottomModal}
				footer={
					<ModalFooter bordered={false} style={styles.bottomModalFooter}>
						<ModalButton style={[styles.bottomModalMainButton, styles[`bottomModalMainButton${theme}`]]} onPress={() => hideBottomModal()} text="Disagree" textStyle={[styles.bottomModalButtonMainText, styles[`bottomModalButtonMainText${theme}`]]}/>
						<ModalButton style={[styles.bottomModalAccentButton, styles[`bottomModalAccentButton${theme}`]]} onPress={() => createAccount(url, createUsername, createPassword)} text="Agree" textStyle={[styles.bottomModalButtonAccentText, styles[`bottomModalButtonAccentText${theme}`]]}/>
					</ModalFooter>
				}
			>
				<ModalContent>
					<View style={[styles.bottomModalSection, styles[`bottomModalSection${theme}`]]}>
						<Text style={[styles.bottomModalText, styles[`bottomModalText${theme}`], { fontWeight:"bold" }]}>You must agree to the terms below to use CryptoShare.</Text>
					</View>
					<View style={[styles.bottomModalSection, styles[`bottomModalSection${theme}`]]}>
						<Text style={[styles.bottomModalText, styles[`bottomModalText${theme}`]]}>By using CryptoShare, you understand that third-party APIs are used to get the prices and details of stocks and cryptoassets. This data may be incorrect or inaccurate at any given time, and basing your trading activity on it is your own responsibility. You understand that trading can be a high-risk activity, and that you may lose all your money. You understand that CryptoShare does not provide any trading services, and does not manage or access your actual financial accounts. While steps have been taken to ensure the integrity of your data and the software working as intended, you understand that bugs may be present, and that the developer of the application cannot be held responsible for any loss of data or otherwise. You understand that all your data is stored on the device hosting the CryptoShare server, and is never sent to any third-party servers or service providers. You understand that, in order to function, data sent to and received from the chat bot is not encrypted on the client-side (a compromised CryptoShare server could read/store it). You understand that the tax, mortgage, and other related data are exclusively based on UK law, and may not be accurate.</Text>
					</View>
					<View style={[styles.bottomModalSection, styles[`bottomModalSection${theme}`], { marginBottom:0 }]}>
						<Text style={[styles.bottomModalText, styles[`bottomModalText${theme}`], { fontWeight:"bold" }]}>Developer Contact: @Xtrendence</Text>
					</View>
				</ModalContent>
			</BottomModal>
			<Loading active={loading}/>
		</ImageBackground>
	);

	function showBottomModal(url: string, username: string, password: string, repeatPassword: string) {
		if(password === repeatPassword) {
			if(!Utils.empty(url)) {
				setLoading(true);

				let requests = new Requests(url);

				requests.userExists(username).then(response => {
					if(response.data.userExists !== "Not found.") {
						Utils.notify(theme, "Username taken.");
						return;
					} else {
						setTimeout(() => {
							setLoading(false);
							setBottomModal(true);
						}, 750);
					}
				}).catch(error => {
					console.log(error);
					Utils.notify(theme, error.toString());
				});
			} else {
				Utils.notify(theme, "No API URL provided.");
			}
		} else {
			Utils.notify(theme, "Passwords don't match.");
		}
	}

	function hideBottomModal() {
		setBottomModal(false);
	}

	async function login(url: string, username: string, password: string) {
		setLoading(true);

		setTimeout(() => setLoading(false), 8000);

		if(!Utils.empty(url)) {
			let requests = new Requests(url);

			requests.login(username, password).then(async (response: any) => {
				setTimeout(() => setLoading(false), 750);

				await AsyncStorage.setItem("api", url);

				if("error" in response) {
					Utils.notify(theme, Utils.replaceAll("!", "", response.error));
				} else {
					try {
						let decrypted = CryptoFN.decryptAES(response.key, password);
						response.key = decrypted;

						await Utils.setAccountInfo(response, true);

						let settings = Utils.defaultSettings;
						if(!Utils.empty(response.settings)) {
							let decryptedSettings = CryptoFN.decryptAES(response.settings.userSettings, decrypted);
							if(Utils.validJSON(decryptedSettings)) {
								settings = JSON.parse(decryptedSettings);
							}
						}
						
						await Utils.setSettings(dispatch, settings);

						navigation.navigate(settings.defaultPage);
					} catch(error) {
						Utils.notify(theme, "Couldn't save account info.");
						console.log(error);
					}
				}
			}).catch((error: any) => {
				setTimeout(() => setLoading(false), 750);
				Utils.notify(theme, error.toString());
				console.log(error);
			});
		} else {
			Utils.notify(theme, "No API URL provided.");
		}
	}

	async function createAccount(url: string, username: string, password: string) {
		try {
			let key = await CryptoFN.generateAESKey();
			let encrypted = CryptoFN.encryptAES(key, password);

			new Requests(url).createAccount(username, password, encrypted).then(result => {
				if(result.data.createUser === "Done") {
					AsyncStorage.setItem("key", key);

					hideBottomModal();

					setAction("login");

					setLoginUsername(username);
					setLoginPassword(password);

					Utils.notify(theme, "Account created.");
				} else {
					Utils.notify(theme, "Something went wrong...");
				}
			}).catch(error => {
				Utils.notify(theme, error.toString());
			});
		} catch(error) {
			Utils.notify(theme, "Something went wrong...");
		}
	}
}