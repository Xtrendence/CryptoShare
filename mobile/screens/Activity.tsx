import { useFocusEffect } from "@react-navigation/native";
import React, { useRef, useState } from "react";
import { FlatList, ImageBackground, Keyboard, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Utils from "../utils/Utils";
import { SafeAreaView } from "react-native-safe-area-context";
import styles from "../styles/Activity";
import { useDispatch, useSelector } from "react-redux";
import LinearGradient from "react-native-linear-gradient";
import { Colors } from "../styles/Global";
import Requests from "../utils/Requests";
import Loading from "../components/Loading";
import Item from "../components/ActivityItem";

export default function Activity({ navigation }: any) {
	const dispatch = useDispatch();
	const { theme } = useSelector((state: any) => state.theme);
	const { settings } = useSelector((state: any) => state.settings);

	const [query, setQuery] = useState<string>("");

	const [loading, setLoading] = useState<boolean>(false);

	const [popup, setPopup] = useState<boolean>(false);
	const [popupContent, setPopupContent] = useState<any>(null);

	const [activityRows, setActivityRows] = useState<any>({});

	const popupRef = useRef<any>({
		
	});

	const renderItem = ({ item }: any) => {
		let info = activityRows[item];

		return (
			<Item info={info} showActivityPopup={showActivityPopup} theme={theme} settings={settings}/>
		);
	}
	
	useFocusEffect(Utils.backHandler(navigation));

	return (
		<ImageBackground source={Utils.getBackground(theme)} resizeMethod="scale" resizeMode="cover">
			<SafeAreaView style={styles.area}>
				<View style={[styles.areaSearchWrapper, styles[`areaSearchWrapper${theme}`]]}>
					<TextInput 
						placeholder="Query..." 
						selectionColor={Colors[theme].mainContrast} 
						placeholderTextColor={Colors[theme].mainContrastDarker} 
						style={[styles.inputSearch, styles[`inputSearch${theme}`]]} 
						onChangeText={(value) => setQuery(value)}
						value={query}
					/>
					<TouchableOpacity style={[styles.button, styles.buttonSearch, styles[`buttonSearch${theme}`]]}>
						<Text style={[styles.searchText, styles[`searchText${theme}`]]}>Search</Text>
					</TouchableOpacity>
				</View>
				<FlatList
					contentContainerStyle={{ paddingTop:10 }}
					data={Object.keys(activityRows)}
					renderItem={renderItem}
					keyExtractor={item => activityRows[item].coinID}
					style={[styles.wrapper, styles[`wrapper${theme}`]]}
				/>
				<View style={[styles.areaActionsWrapper, styles[`areaActionsWrapper${theme}`]]}>
					<TouchableOpacity onPress={() => showToolsPopup()} style={[styles.button, styles.actionButton, styles[`actionButton${theme}`]]}>
						<Text style={[styles.actionText, styles[`actionText${theme}`]]}>Tools</Text>
					</TouchableOpacity>
					<TouchableOpacity style={[styles.button, styles.actionButton, styles[`actionButton${theme}`]]}>
						<Text style={[styles.actionText, styles[`actionText${theme}`]]}>Add Activity</Text>
					</TouchableOpacity>
				</View>
			</SafeAreaView>
			<Modal visible={popup} onRequestClose={hidePopup} transparent={true}>
				<View style={styles.popup}>
					<TouchableOpacity onPress={() => hidePopup()} style={styles.popupBackground}></TouchableOpacity>
					<View style={styles.popupForeground}>
						<View style={[styles.popupWrapper, styles[`popupWrapper${theme}`]]}>{popupContent}</View>
					</View>
				</View>
			</Modal>
			<Loading active={loading} theme={theme} opaque={true}/>
		</ImageBackground>
	);

	function showActivityPopup() {

	}

	function showToolsPopup() {
		let content = () => {
			return (
				<View style={styles.popupContent}>
					<View style={[styles.modalSection, styles[`modalSection${theme}`], { backgroundColor:Colors[theme].mainThird }]}>
						<Text style={[styles.modalInfo, styles[`modalInfo${theme}`]]}>Tools</Text>
					</View>
					<View style={[styles.modalSection, styles[`modalSection${theme}`], { backgroundColor:Colors[theme].mainThird }]}>
						<TouchableOpacity onPress={() => showStakingPopup()} style={[styles.button, styles.actionButton, styles[`actionButton${theme}`], styles.popupButton, styles.sectionButton]}>
							<Text style={[styles.actionText, styles[`actionText${theme}`]]}>Staking Calculator</Text>
						</TouchableOpacity>
						<TouchableOpacity onPress={() => showMiningPopup()} style={[styles.button, styles.actionButton, styles[`actionButton${theme}`], styles.popupButton, styles.sectionButton]}>
							<Text style={[styles.actionText, styles[`actionText${theme}`]]}>Mining Calculator</Text>
						</TouchableOpacity>
						<TouchableOpacity onPress={() => showDividendsPopup()} style={[styles.button, styles.actionButton, styles[`actionButton${theme}`], styles.popupButton, styles.sectionButton, { marginBottom:0 }]}>
							<Text style={[styles.actionText, styles[`actionText${theme}`]]}>Dividends Calculator</Text>
						</TouchableOpacity>
					</View>
					<TouchableOpacity onPress={() => hidePopup()} style={[styles.button, styles.choiceButton, styles[`choiceButton${theme}`]]}>
						<Text style={[styles.choiceText, styles[`choiceText${theme}`]]}>Dismiss</Text>
					</TouchableOpacity>
				</View>
			);
		};

		showPopup(content);
	}

	function showStakingPopup() {
		hidePopup();
	}

	function showMiningPopup() {
		hidePopup();
	}

	// TODO: Add functionality.
	function showDividendsPopup() {
		hidePopup();
	}

	function showPopup(content: any) {
		Keyboard.dismiss();
		setPopup(true);
		setPopupContent(content);
	}

	function hidePopup() {
		Keyboard.dismiss();
		setPopup(false);
		setPopupContent(null);
	}
}

export function fetchActivity() {
	return new Promise(async (resolve, reject) => {
		try {
			let userID = await AsyncStorage.getItem("userID");
			let token = await AsyncStorage.getItem("token");
			let key = await AsyncStorage.getItem("key") || "";
			let api = await AsyncStorage.getItem("api");

			let requests = new Requests(api);

			let activity = await requests.readActivity(token, userID);

			if(Utils.empty(activity?.data?.readActivity)) {
				resolve(null);
				return;
			}

			let activityData: any = {};
	
			let encrypted = activity?.data?.readActivity;
	
			Object.keys(encrypted).map(index => {
				let decrypted = Utils.decryptObjectValues(key, encrypted[index]);
				decrypted.activityID = encrypted[index].activityID;
				decrypted.activityTransactionID = encrypted[index].activityTransactionID;
				activityData[decrypted.activityTransactionID] = decrypted;
			});

			let sortedByDate = sortActivityDataByDate(activityData);

			resolve(sortedByDate);
		} catch(error) {
			console.log(error);
			reject(error);
		}
	});
}

export function sortActivityDataByDate(activityData: any) {
	let sorted: any = {};
	let array: any = [];

	for(let activity in activityData) {
		array.push([activity, activityData[activity].activityDate]);
	}

	array.sort(function(a: any, b: any) {
		return new Date(a[1]).getTime() - new Date(b[1]).getTime();
	});

	array.map((item: any) => {
		sorted[item[0]] = activityData[item[0]];
	});

	return sorted;
}