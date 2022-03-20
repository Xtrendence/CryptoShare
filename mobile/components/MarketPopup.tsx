import React from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Linking, Modal, ScrollView, Text, ToastAndroid, TouchableOpacity, View } from "react-native";
import HTML from "react-native-render-html";
import { fetchWatchlist, getWatchlistID, watchlistExists } from "../screens/Dashboard";
import { Colors } from "../styles/Global";
import styles, { gradientColor } from "../styles/Market";
import { screenWidth } from "../styles/NavigationBar";
import Requests from "../utils/Requests";
import Utils from "../utils/Utils";
import Chart from "./Charts/Chart";

// Component used on the "Market" page for displaying the price chart of a crypto asset or stock.
export default function MarketPopup({ modal, hideModal, loading, setLoading, theme, settings, chartVerticalLabels, chartData, chartLabels, chartSegments, labelsRef, modalInfo, modalType, modalDescription, page, watchlistData, populateList }: any) {
	let assetID = modalType === "crypto" ? modalInfo?.id : "stock-" + modalInfo?.id;

	return (
		<Modal style={styles.modal} visible={modal} onRequestClose={hideModal} transparent={true}>
			<View style={[styles.modalOverlay, loading ? { opacity:0 } : null]}></View>
			<View style={[styles.modalWrapper, loading ? { opacity:0 } : null]}>
				<View style={[styles.modalChartWrapper, styles[`modalChartWrapper${theme}`]]}>
					<View style={[styles.modalChartLeft, styles[`modalChartLeft${theme}`]]}>
						{
							Utils.sortLabels(settings.currency, chartVerticalLabels).map((label: any) => {
								return (
									<Text key={`label-${chartVerticalLabels.indexOf(label) + Utils.randomBetween(0, 9999999)}`} style={[styles.modalChartText, styles[`modalChartText${theme}`]]}>{label}</Text>
								);
							})
						}
					</View>
					<ScrollView horizontal={true} style={[styles.modalScrollView, styles[`modalScrollView${theme}`]]}>
						{ !Utils.empty(chartData) && !Utils.empty(chartLabels) ? 
							<Chart
								data={{ labels:chartLabels, datasets:[{ data:chartData }]}}
								width={1400}
								height={300}
								segments={chartSegments}
								withHorizontalLines={true}
								withVerticalLines={false}
								withVerticalLabels={true}
								yAxisInterval={500}
								formatYLabel={(label): any => {
									if(Utils.empty(labelsRef.current)) {
										labelsRef.current = [];
									}
									let current = labelsRef.current;
									current.push(label);
									labelsRef.current = current;
									return "";
								}}
								withShadow={false}
								chartConfig={{
									backgroundColor: "rgba(0,0,0,0)",
									backgroundGradientFrom: "rgba(0,0,0,0)",
									backgroundGradientTo: "rgba(0,0,0,0)",
									decimalPlaces: 6,
									color: () => "url(#gradient)",
									labelColor: () => Colors[theme].mainContrast,
									style: {
										borderRadius: 0
									},
									propsForDots: {
										r: "0",
										strokeWidth: "2",
										stroke: Colors[theme].mainFifth
									},
									propsForVerticalLabels: {
										fontSize: 12,
										rotation: 0,
										fontWeight: "bold",
									},
									propsForBackgroundLines: {
										strokeWidth: 2,
										stroke: Colors[theme].mainSecond
									}
								}}
								bezier
								style={{
									backgroundColor: "rgba(255,255,255,0)",
								}}
								// @ts-ignore
								gradient={gradientColor()}
							/>
						: 
							<View style={{ height:320, width:screenWidth }}></View>
						}
					</ScrollView>
				</View>
				<ScrollView style={[styles.modalWrapperScrollView, styles[`modalWrapperScrollView${theme}`]]} contentContainerStyle={styles.modalWrapperScrollViewContent} showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={true} nestedScrollEnabled={true}>
					<View style={[styles.modalSection, styles[`modalSection${theme}`], { alignItems:"center" }]}>
						{ watchlistExists(watchlistData, assetID) &&
							<TouchableOpacity onPress={() => deleteWatchlist(getWatchlistID(watchlistData, assetID))} style={[styles.button, styles.actionButton, styles[`actionButton${theme}`], { backgroundColor:Colors[theme][page].accentFirst, width:220 }]}>
								<Text style={[styles.actionText, styles[`actionText${theme}`]]}>Remove From Watchlist</Text>
							</TouchableOpacity>
						}
						{ !watchlistExists(watchlistData, assetID) &&
							<TouchableOpacity onPress={() => createWatchlist(assetID, modalInfo?.symbol, modalType)} style={[styles.button, styles.actionButton, styles[`actionButton${theme}`], { backgroundColor:Colors[theme][page].accentFirst, width:220 }]}>
								<Text style={[styles.actionText, styles[`actionText${theme}`]]}>Add To Watchlist</Text>
							</TouchableOpacity>
						}
					</View>
					<View style={[styles.modalSection, styles[`modalSection${theme}`]]}>
						{ !Utils.empty(modalInfo) && modalType === "crypto" &&
							<View style={styles.modalInfoWrapper}>
								<Text style={[styles.modalInfo, styles[`modalInfo${theme}`]]}>
									Name: {modalInfo.name} ({modalInfo.symbol.toUpperCase()})
								</Text>
								<Text style={[styles.modalInfo, styles[`modalInfo${theme}`]]}>
									Rank: #{modalInfo.rank}
								</Text>
								<Text style={[styles.modalInfo, styles[`modalInfo${theme}`]]}>
									Price: {Utils.currencySymbols[settings.currency] + Utils.separateThousands(modalInfo.price)}
								</Text>
								<Text style={[styles.modalInfo, styles[`modalInfo${theme}`]]}>
									Market Cap: {Utils.currencySymbols[settings.currency] + Utils.separateThousands(modalInfo.marketCap)}
								</Text>
								<Text style={[styles.modalInfo, styles[`modalInfo${theme}`]]}>
									Volume: {Utils.currencySymbols[settings.currency] + Utils.separateThousands(modalInfo.volume)}
								</Text>
								<Text style={[styles.modalInfo, styles[`modalInfo${theme}`]]}>
									Supply: {Utils.separateThousands(modalInfo.supply)}
								</Text>
								<Text style={[styles.modalInfo, styles[`modalInfo${theme}`]]}>
									ATH: {Utils.currencySymbols[settings.currency] + Utils.separateThousands(modalInfo.ath)}
								</Text>
								<Text style={[styles.modalInfo, styles[`modalInfo${theme}`]]}>
									ATH Change: {modalInfo.athChange}%
								</Text>
								<Text style={[styles.modalInfo, styles[`modalInfo${theme}`]]}>
									24h High: {Utils.currencySymbols[settings.currency] + Utils.separateThousands(modalInfo.high24h)}
								</Text>
								<Text style={[styles.modalInfo, styles[`modalInfo${theme}`]]}>
									24h Low: {Utils.currencySymbols[settings.currency] + Utils.separateThousands(modalInfo.low24h)}
								</Text>
								<Text style={[styles.modalInfo, styles[`modalInfo${theme}`]]}>
									24h Change: {modalInfo.priceChangeDay}%
								</Text>
							</View>
						}
						{ !Utils.empty(modalInfo) && modalType === "stock" &&
							<View style={styles.modalInfoWrapper}>
								<Text style={[styles.modalInfo, styles[`modalInfo${theme}`]]}>
									Name: {modalInfo.shortName}
								</Text>
								<Text style={[styles.modalInfo, styles[`modalInfo${theme}`]]}>
									Symbol: {modalInfo.symbol.toUpperCase()}
								</Text>
								<Text style={[styles.modalInfo, styles[`modalInfo${theme}`]]}>
									Price: {Utils.currencySymbols[modalInfo.currency] + Utils.separateThousands(modalInfo.price)}
								</Text>
								<Text style={[styles.modalInfo, styles[`modalInfo${theme}`]]}>
									1Y High: {Utils.currencySymbols[modalInfo.currency] + Utils.separateThousands(modalInfo.high1y)}
								</Text>
								<Text style={[styles.modalInfo, styles[`modalInfo${theme}`]]}>
									1Y Low: {Utils.currencySymbols[modalInfo.currency] + Utils.separateThousands(modalInfo.low1y)}
								</Text>
								<Text style={[styles.modalInfo, styles[`modalInfo${theme}`]]}>
									Market Cap: {Utils.currencySymbols[modalInfo.currency] + Utils.separateThousands(modalInfo.marketCap)}
								</Text>
								<Text style={[styles.modalInfo, styles[`modalInfo${theme}`]]}>
									24h Change: {Utils.formatPercentage(modalInfo.change)}
								</Text>
							</View>
						}
					</View>
					{ !Utils.empty(modalDescription) &&
						<View style={[styles.modalSection, styles[`modalSection${theme}`]]}>
							<HTML 
								renderersProps={{
									a: {
										onPress(event: any, url: any, htmlAttribs: any, target: any) {
											Linking.openURL(url);
										}
									}
								}}
								contentWidth={screenWidth - 40}
								source={{ html:modalDescription }} 
								tagsStyles={{ 
									a: { 
										color: Colors[theme].Market.accentFirst,
										textDecorationLine: "none",
										fontSize: 16
									}, 
									span: { 
										color: Colors[theme].mainContrast, 
										fontSize: 16 
									}
								}}
							/>
						</View>
					}
				</ScrollView>
			</View>
		</Modal>
	);

	// Removes an asset from the user's watchlist.
	async function deleteWatchlist(watchlistID: any) {
		try {
			setLoading(true);

			setTimeout(async () => {
				let userID = await AsyncStorage.getItem("userID");
				let token = await AsyncStorage.getItem("token");
				let api = await AsyncStorage.getItem("api");

				let requests = new Requests(api);

				await requests.deleteWatchlist(token, userID, watchlistID);

				setTimeout(() => {
					setLoading(false);
					populateList();
				}, 1000);
			}, 500);
		} catch(error) {
			console.log(error);
			setLoading(false);
			ToastAndroid.show("Something went wrong... - EM1", 5000);
		}
	}

	// Adds an asset to the user's watchlist.
	async function createWatchlist(assetID: string, assetSymbol: string, assetType: string) {
		try {
			setLoading(true);

			setTimeout(async () => {
				let watchlist = await fetchWatchlist() || {};

				if(watchlistExists(watchlist, assetID)) {
					setLoading(false);
					ToastAndroid.show("Asset already in watchlist.", 5000);
					return;
				}

				let userID = await AsyncStorage.getItem("userID");
				let token = await AsyncStorage.getItem("token");
				let key = await AsyncStorage.getItem("key") || "";
				let api = await AsyncStorage.getItem("api");

				let requests = new Requests(api);

				let encrypted = Utils.encryptObjectValues(key, {
					assetID: assetID.toLowerCase(),
					assetSymbol: assetSymbol.toUpperCase(),
					assetType: assetType,
				});

				await requests.createWatchlist(token, userID, encrypted.assetID, encrypted.assetSymbol, encrypted.assetType);

				populateList();

				setTimeout(() => {
					setLoading(false);
				}, 1000);
			}, 500);
		} catch(error) {
			console.log(error);
			setLoading(false);
			ToastAndroid.show("Something went wrong... - EM2", 5000);
		}
	}
}