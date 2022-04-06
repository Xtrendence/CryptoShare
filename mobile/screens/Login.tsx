import React, { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BackHandler, ImageBackground, ScrollView, Text, TextInput, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { BottomModal, ModalButton, ModalContent, ModalFooter } from "react-native-modals";
import QRCodeScanner from "react-native-qrcode-scanner";
import { RNCamera } from "react-native-camera";
import { SafeAreaView } from "react-native-safe-area-context";
import Toggle from "react-native-toggle-element";
import Icon from "react-native-vector-icons/FontAwesome5";
import { useDispatch, useSelector } from "react-redux";
import Loading from "../components/Loading";
import { switchTheme } from "../store/reducers/theme";
import { Colors } from "../styles/Global";
import styles from "../styles/Login";
import CryptoFN from "../utils/CryptoFN";
import Requests from "../utils/Requests";
import Utils from "../utils/Utils";
import LinearGradient from "react-native-linear-gradient";

// The "Login" page of the app.
export default function Login({ navigation }: any) {
	const dispatch = useDispatch();
	const { theme } = useSelector((state: any) => state.theme);
	const { settings } = useSelector((state: any) => state.settings);

	const alternateBackground = settings?.alternateBackground === "disabled" ? "" : "Alternate";

	const [bottomModal, setBottomModal] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(true);
	const [action, setAction] = useState<string>("login");

	const [url, setURL] = useState<any>("");

	const [loginUsername, setLoginUsername] = useState<string>("");
	const [loginPassword, setLoginPassword] = useState<string>("");

	const [createUsername, setCreateUsername] = useState<string>("");
	const [createPassword, setCreatePassword] = useState<string>("");
	const [createRepeatPassword, setCreateRepeatPassword] = useState<string>("");

	// Used to show/hide the camera view used to scan a login QR code.
	const [showCamera, setShowCamera] = useState<boolean>(false);

	// The "Login" page has a different back event handler than the other pages, as it closes the app no matter what.
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
			dispatch(switchTheme({ theme:savedTheme, alternateBackground:settings?.alternateBackground }));

			Utils.wait(250).then(() => {
				attemptLogin();
			});
		});

		// In some cases, the camera can remain open in the background even though the user isn't using it. This would drain the user's battery and also be a privacy concern.
		navigation.addListener("focus", () => {
			setShowCamera(false);
		});
		
		navigation.addListener("blur", () => {
			setShowCamera(false);
		});
	}, []);

	return (
		<ImageBackground source={Utils.getBackground(theme, settings?.alternateBackground)} resizeMethod="scale" resizeMode="cover">
			<ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent} showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false} nestedScrollEnabled={true}>
				<SafeAreaView style={styles.area}>
					{ !showCamera &&
						<View style={{ alignItems:"center" }}>
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
												spellCheck={false}
												placeholder="API URL..." 
												selectionColor={Colors[theme].mainContrast} 
												placeholderTextColor={Colors[theme].mainContrastDarker} 
												style={[styles.input, styles[`input${theme}`]]} 
												onChangeText={(value) => setURL(value)}
												value={url}
											/>
											<TextInput 
												spellCheck={false}
												placeholder="Username..." 
												selectionColor={Colors[theme].mainContrast} 
												placeholderTextColor={Colors[theme].mainContrastDarker} 
												style={[styles.input, styles[`input${theme}`]]} 
												onChangeText={(value) => setLoginUsername(value)}
												value={loginUsername}
											/>
											<TextInput 
												spellCheck={false}
												placeholder="Password..." 
												selectionColor={Colors[theme].mainContrast} 
												placeholderTextColor={Colors[theme].mainContrastDarker} 
												style={[styles.input, styles[`input${theme}`]]} 
												onChangeText={(value) => setLoginPassword(value)}
												value={loginPassword}
												onSubmitEditing={() => login(url, loginUsername, loginPassword)}
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
												spellCheck={false}
												placeholder="API URL..." 
												selectionColor={Colors[theme].mainContrast} 
												placeholderTextColor={Colors[theme].mainContrastDarker} 
												style={[styles.input, styles[`input${theme}`]]} 
												onChangeText={(value) => setURL(value)}
												value={url}
											/>
											<TextInput 
												spellCheck={false}
												placeholder="Username..." 
												selectionColor={Colors[theme].mainContrast} 
												placeholderTextColor={Colors[theme].mainContrastDarker} 
												style={[styles.input, styles[`input${theme}`]]} 
												onChangeText={(value) => setCreateUsername(value)}
												value={createUsername}
											/>
											<TextInput 
												spellCheck={false}
												placeholder="Password..." 
												selectionColor={Colors[theme].mainContrast} 
												placeholderTextColor={Colors[theme].mainContrastDarker} 
												style={[styles.input, styles[`input${theme}`]]} 
												onChangeText={(value) => setCreatePassword(value)} 
												value={createPassword}
												secureTextEntry
											/>
											<TextInput 
												spellCheck={false}
												placeholder="Repeat Password..." 
												selectionColor={Colors[theme].mainContrast} 
												placeholderTextColor={Colors[theme].mainContrastDarker} 
												style={[styles.input, styles[`input${theme}`]]} 
												onChangeText={(value) => setCreateRepeatPassword(value)} 
												value={createRepeatPassword} 
												onSubmitEditing={() => showBottomModal(url, createUsername, createPassword, createRepeatPassword)}
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
									<TouchableOpacity style={[styles.button, styles.accentButton, styles[`accentButton${theme}`], { marginTop:20 }]} onPress={() => setShowCamera(true)}>
										<Text style={[styles.accentText, styles[`accentText${theme}`]]}>Scan QR Code</Text>
									</TouchableOpacity>
								</View>
							</View>
							<View style={[styles.wrapper, styles[`wrapper${theme}`], { alignItems:"center", width:120 }]}>
								<View style={[styles.toggleContainer, styles[`toggleContainer${theme}`]]}>
									<Toggle
										value={theme === "Dark" ? false : true}
										onPress={() => dispatch(switchTheme({ theme:theme === "Dark" ? "Light" : "Dark", alternateBackground:settings?.alternateBackground }))}
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
						</View>
					}
					{ showCamera &&
						<View style={styles.cameraWrapper}>
							<QRCodeScanner 
								reactivate={true}
								onRead={(e) => processCode(e.data)}
								topContent={
									<View style={styles.cameraTextWrapper}>
										<Text style={styles.cameraText}>Generate a QR code through the web app's settings page.</Text>
									</View>
								}
								bottomContent={
									<TouchableOpacity style={[styles.button, styles.accentButton, styles[`accentButton${theme}`], { marginTop:20 }]} onPress={() => setShowCamera(false)}>
										<Text style={[styles.accentText, styles[`accentText${theme}`]]}>Close Camera</Text>
									</TouchableOpacity>
								}
							/>
						</View>
					}
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
						<Text style={[styles.bottomModalText, styles[`bottomModalText${theme}`]]}>By using CryptoShare, you understand that third-party APIs are used to get the prices and details of stocks and cryptoassets. This data may be incorrect or inaccurate at any given time, and basing your trading activity on it is your own responsibility. You understand that trading can be a high-risk activity, and that you may lose all your money. You understand that CryptoShare does not provide any trading services, and does not manage or access your actual financial accounts. While steps have been taken to ensure the integrity of your data and the software working as intended, you understand that bugs may be present, and that the developer of the application cannot be held responsible for any loss of data or otherwise. You understand that all your data is stored on the device hosting the CryptoShare server, and is never sent to any third-party servers or service providers. You understand that the tax, mortgage, and other related data are exclusively based on UK law, and may not be accurate.</Text>
					</View>
					<View style={[styles.bottomModalSection, styles[`bottomModalSection${theme}`], { marginBottom:0 }]}>
						<Text style={[styles.bottomModalText, styles[`bottomModalText${theme}`], { fontWeight:"bold" }]}>Developer Contact: @Xtrendence</Text>
					</View>
				</ModalContent>
			</BottomModal>
			<Loading active={loading} theme={theme} opaque={true}/>
		</ImageBackground>
	);

	// Processes the login QR code data.
	function processCode(code: string) {
		setShowCamera(false);
		
		try {
			let parts = code.split("!");

			setURL(parts[0]);
			setLoginUsername(parts[1]);
			setLoginPassword(parts[2]);

			login(parts[0], parts[1], parts[2]);
		} catch(error) {
			Utils.notify(theme, "Something went wrong... - EM60");
			console.log(error);
		}
	}

	// Shows the user registration popup.
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

	// Automatically logs the user in if they've already logged in before and their credentials are still correct.
	async function attemptLogin() {
		let api = await AsyncStorage.getItem("api");
		let userID = await AsyncStorage.getItem("userID");
		let token = await AsyncStorage.getItem("token");

		if(Utils.empty(api) || Utils.empty(userID) || Utils.empty(token)) {
			setLoading(false);
			return;
		}

		let requests = new Requests(api);

		requests.verifyToken(userID, token).then(async result => {
			setTimeout(() => {
				setLoading(false);
			}, 1000);

			if("error" in result) {
				if(result.error.includes("Invalid")) {
					Utils.removeAccountInfo();
				}
				
				Utils.notify(theme, result.error);

				setLoading(false);
			} else {
				Utils.setAccountInfo(result, false);

				let settings = await Utils.getSettings(dispatch);

				navigation.navigate(settings.defaultPage);
			}
		}).catch(error => {
			setLoading(false);
			Utils.notify(theme, error);
		});
	}

	// Logs the user in.
	async function login(url: string, username: string, password: string) {
		setLoading(true);

		setTimeout(() => setLoading(false), 8000);

		if(!Utils.empty(url)) {
			let urlAPI = url;

			if(!urlAPI.includes("http://") && !urlAPI.includes("https://")) {
				urlAPI = `http://${urlAPI}`;
			}
			
			let requests = new Requests(urlAPI);

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

						let settings = await Utils.getSettings(dispatch);

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

	// Creates an account for the user.
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

					login(url, username, password);

					Utils.notify(theme, "Account created.");
				} else {
					Utils.notify(theme, "Something went wrong... - EM61");
				}
			}).catch(error => {
				Utils.notify(theme, error.toString());
			});
		} catch(error) {
			Utils.notify(theme, "Something went wrong... - EM62");
		}
	}
}