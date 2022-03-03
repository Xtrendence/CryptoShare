import React, { useEffect, useRef, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { Dimensions, FlatList, ImageBackground, Keyboard, KeyboardAvoidingView, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import styles, { wrapperHeight } from "../styles/ChatBot";
import Utils from "../utils/Utils";
import { sha256 } from "react-native-sha256";
import Icon from "react-native-vector-icons/FontAwesome5";
import io from "socket.io-client";
import Requests from "../utils/Requests";
import CryptoFN from "../utils/CryptoFN";
import store from "../store/store";
import defaultFood from "../utils/defaultFood";
import { fetchBudget, fetchTransaction, fetchWatchlist, filterTransactionsByMonth, getWatchlistIDBySymbol, parseTransactionData, setDefaultBudgetData, validateTransactionData, watchlistExists } from "./Dashboard";
import { validateActivityData } from "./Activity";
import CryptoFinder from "../utils/CryptoFinder";
import Stock from "../utils/Stock";
import { assetHoldingExists } from "./Holdings";
import Item from "../components/MessageItem";
import { Colors } from "../styles/Global";
import { barHeight } from "../styles/NavigationBar";

export default function ChatBot({ navigation }: any) {
	const dispatch = useDispatch();
	const { theme } = useSelector((state: any) => state.theme);
	const { settings } = useSelector((state: any) => state.settings);

	const [botURL, setBotURL] = useState<string>("");
	const [socket, setSocket] = useState<any>(null);
	const [chatConnected, setChatConnected] = useState<boolean>(false);
	const [status, setStatus] = useState<string>("");

	const [checksum, setChecksum] = useState<string>("");
	const [header, setHeader] = useState<any>(null);
	
	const [messageRows, setMessageRows] = useState<any>({});
	const [updateMessages, setUpdatedMessages] = useState<any>(new Date());
	const messageRef: any = useRef({});

	const [input, setInput] = useState<string>("");
	const [keyboardVisible, setKeyboardVisible] = useState<boolean>(false);
	const [keyboardHeight, setKeyboardHeight] = useState<number>(0);

	const inputRef: any = useRef();
	const chatRef: any = useRef();

	let keyboardDidHideListener: any = null;
	let keyboardDidShowListener: any = null;

	const [popup, setPopup] = useState<boolean>(false);
	const [popupContent, setPopupContent] = useState<any>(null);

	const renderItem = ({ item }: any) => {
		let message = messageRows[item];

		return (
			<Item theme={theme} message={message}/>
		);
	}
	
	useFocusEffect(Utils.backHandler(navigation));

	useEffect(() => {
		AsyncStorage.getItem("api").then((api) => {
			api = api || "";
			let protocol = api.split("://")[0];
			let hostname = api.split(":")[1].replace(protocol + "://", "");
			let port = parseInt(api.split(":")[2]) + 1;
			let urlBot = `${protocol}:${hostname}:${port}`;

			let botSocket = io(urlBot);
			attachSocketEvents(botSocket);

			setSocket(botSocket);
			setBotURL(urlBot);
		}).catch(error => {
			console.log(error);
		});

		keyboardDidHideListener = Keyboard.addListener("keyboardDidHide", keyboardDidHide);
		keyboardDidShowListener = Keyboard.addListener("keyboardDidShow", keyboardDidShow);

		navigation.addListener("focus", () => {
			if(navigation.isFocused()) {
				setTimeout(() => {
					populateChatList(true);
				}, 500);
			}
		});
		
		// let refresh = setInterval(() => {
		// 	if(navigation.isFocused()) {
		// 		populateChatList(false);
		// 	}
		// }, 15000);

		return () => {
			// clearInterval(refresh);
		};
	}, []);

	useEffect(() => {
		setMessageRows(messageRef.current);
	}, [updateMessages]);

	return (
		<ImageBackground source={Utils.getBackground(theme)} resizeMethod="scale" resizeMode="cover">
			<SafeAreaView style={styles.area}>
				<KeyboardAvoidingView style={[styles.wrapper, styles[`wrapper${theme}`], keyboardVisible ? { height:wrapperHeight - keyboardHeight + barHeight } : null]}>
					<View style={[styles.wrapperBar, styles[`wrapperBar${theme}`], styles.wrapperBarTop]}>
						<TouchableOpacity onPress={() => showMenu()} style={[styles.button, styles.iconButton, styles[`iconButton`], { width:44, position:"absolute", top:10, right:4, zIndex:10 }]}>
							<Icon
								name="ellipsis-h" 
								size={24} 
								color={Colors[theme].accentContrast}
							/>
						</TouchableOpacity>
					</View>
					<FlatList
						ref={chatRef}
						contentContainerStyle={{ 
							paddingTop: 70,
							paddingBottom: 60,
							flexGrow: 1,
							justifyContent: "flex-end"
						}}
						data={Object.keys(messageRows).reverse()}
						renderItem={renderItem}
						keyExtractor={item => messageRows[item].key}
						style={[styles.chatList, styles[`chatList${theme}`]]}
						ListHeaderComponent={header}
						ListHeaderComponentStyle={styles.header}
						inverted={true}
					/>
					<View style={[styles.wrapperBar, styles[`wrapperBar${theme}`], styles.wrapperBarBottom]}>
						<TextInput
							onSubmitEditing={() => sendMessage(input)}
							ref={inputRef}
							value={input}
							spellCheck={true}
							keyboardType="default"
							autoCorrect={true}
							placeholder="Say Something..." 
							selectionColor={Colors[theme].mainContrast} 
							placeholderTextColor={Colors[theme].mainContrastDarker} 
							style={[styles.input, styles[`input${theme}`]]} 
							onChangeText={(value) => setInput(value)}
						/>
						<TouchableOpacity onPress={() => sendMessage(input)} style={[styles.button, styles.actionButton, styles[`actionButton${theme}`], styles.sendButton]}>
							<Text style={[styles.actionText, styles[`actionText${theme}`]]}>Send</Text>
						</TouchableOpacity>
					</View>
				</KeyboardAvoidingView>
			</SafeAreaView>
			<Modal visible={popup} onRequestClose={hidePopup} transparent={true}>
				<View style={styles.popup}>
					<TouchableOpacity onPress={() => hidePopup()} style={styles.popupBackground}></TouchableOpacity>
					<View style={styles.popupForeground}>
						<View style={[styles.popupWrapper, styles[`popupWrapper${theme}`], { padding:0 }]}>{popupContent}</View>
					</View>
				</View>
			</Modal>
		</ImageBackground>
	);

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

	function keyboardDidHide(event: any) {
		inputRef?.current?.blur();
		setKeyboardVisible(false);
		scrollChatToBottom();
	}

	function keyboardDidShow(event: any) {
		setKeyboardHeight(event.endCoordinates.height);
		setKeyboardVisible(true);
		scrollChatToBottom();
	}

	function showMenu() {
		let content = () => {
			return (
				<View style={styles.popupContent}>
					<View style={[styles.modalSection, styles[`modalSection${theme}`], { backgroundColor:Colors[theme].mainThird, marginTop:20 }]}>
						<Text style={[styles.modalInfo, styles[`modalInfo${theme}`]]}>Chat Actions</Text>
					</View>
					<View style={[styles.modalSection, styles[`modalSection${theme}`], { backgroundColor:Colors[theme].mainThird }]}>
						<TouchableOpacity onPress={() => deleteChat()} style={[styles.button, styles.actionButton, styles[`actionButton${theme}`], styles.popupButton, styles.sectionButton, { marginBottom:0 }]}>
							<Text style={[styles.actionText, styles[`actionText${theme}`]]}>Clear Messages</Text>
						</TouchableOpacity>
					</View>
					<TouchableOpacity onPress={() => hidePopup()} style={[styles.button, styles.choiceButton, styles[`choiceButton${theme}`], { marginBottom:20 }]}>
						<Text style={[styles.choiceText, styles[`choiceText${theme}`]]}>Dismiss</Text>
					</TouchableOpacity>
				</View>
			);
		};

		showPopup(content);
	}

	async function deleteChat() {
		hidePopup();

		let userID = await AsyncStorage.getItem("userID");
		let token = await AsyncStorage.getItem("token");
		let api = await AsyncStorage.getItem("api");

		let requests = new Requests(api);

		await requests.deleteMessageAll(token, userID);

		messageRef.current = {};
		setUpdatedMessages(new Date());
		setChecksum("");
		clearChatOptions();
	}

	async function populateChatList(recreate: boolean) {
		if(recreate) {
			dismissChatOptions();
			clearChatOptions();
			setChecksum("");
			messageRef.current = {};
			setUpdatedMessages(new Date());
		}

		try {
			let messages = await fetchMessage() || "";
			// let checksumHash = await sha256(JSON.stringify(messages));

			let sorted: any = sortMessages(messages);

			let rows: any = {};

			sorted.keys.map((index: any) => {
				let message = sorted.messages[index];
				let text = message.message;

				if(Utils.validJSON(text)) {
					let parsed = JSON.parse(text);
					let from = parsed.from;
					let content = parsed.message;
					
					let key = Object.keys(rows).length;
					rows[key] = { from:from, message:content, key:key };
				}
			});

			messageRef.current = rows;
			setUpdatedMessages(new Date());

			scrollChatToBottom();
		} catch(error) {
			console.log(error);
			Utils.notify(theme, "Something went wrong...");
		}
	}

	function sortMessages(messages: any) {
		let sorted: any = {};
		let sortedKeys: any = [];
		let array: any = [];

		for(let message in messages) {
			array.push([message, messages[message].messageDate]);
		}

		array.sort(function(a: any, b: any) {
			return new Date(a[1]).getTime() - new Date(b[1]).getTime();
		});

		array.map((item: any) => {
			sorted[item[0]] = messages[item[0]];
			sortedKeys.push(item[0]);
		});

		return { messages:sorted, keys:sortedKeys };
	}

	async function sendMessage(message: string) {
		if(Utils.empty(message)) {
			return;
		}

		if(chatConnected) {
			try {
				setInput("");

				let userID = await AsyncStorage.getItem("userID");
				let token = await AsyncStorage.getItem("token");

				await addMessage("user", message);

				setTimeout(() => {
					socket.emit("message", { userID:userID, token:token, message:message });
				}, 500);
			} catch(error) {
				Utils.notify(theme, "Something went wrong...");
				console.log(error);
			}
		} else {
			Utils.notify(theme, "You aren't connected to the chat bot.");
		}
	}

	function listMessage(from: string, message: string) {
		message = Utils.stripHTMLCharacters(message);

		let key = Object.keys(messageRef.current).length;

		let current = messageRef.current;

		current[key] = { from:from, message:message, key:key };

		messageRef.current = current;
		setUpdatedMessages(new Date());
	}

	async function addMessage(from: string, message: string) {
		return new Promise(async (resolve, reject) => {
			try {
				message = Utils.stripHTMLCharacters(message);

				clearChatOptions();

				let userID = await AsyncStorage.getItem("userID");
				let token = await AsyncStorage.getItem("token");
				let key = await AsyncStorage.getItem("key") || "";
				let api = await AsyncStorage.getItem("api");

				let requests = new Requests(api);

				let json = JSON.stringify({ from:from, message:message });

				let encrypted = CryptoFN.encryptAES(json, key);

				await requests.createMessage(token, userID, encrypted);
			
				listMessage(from, message);

				resolve(null);
			} catch(error) {
				console.log(error);
				reject(error);
			}
		});
	}

	function determineIntent(processed: any) {
		try {
			let utterance = processed.utterance.toLowerCase();
			let category;
			let action;

			switch(utterance) {
				case utterance.match("(rent|mortgage|bill|fuel|gas|insurance|spent)")?.input:
					category = "transaction";
					action = "buy";
					break;
				case utterance.match("(bought|buy)")?.input:
					category = "activity-or-transaction";
					action = "buy";
					break;
				case utterance.match("(sold|sell)")?.input:
					category = "activity-or-transaction";
					action = "sell";
					break;
				case utterance.match("(transfer|transferred|sent|send|received)")?.input:
					category = "activity-or-transaction";
					action = "transfer";
					break;
				case utterance.match("(holding|amount)")?.input:
					category = "holding";
					action = "update";
					break;
				case utterance.match("(watch)")?.input:
					category = "watchlist";

					if(utterance.match("(start|add)")) {
						action = "create";
					} else if(utterance.match("(stop|remove|delete)")) {
						action = "delete";
					}
					break;
				case utterance.match("(income|yearly|salary)")?.input:
					category = "income";
					action = "update";
					break;
				case utterance.match("(afford)")?.input:
					category = "afford";
					action = "read";
					break;
			}

			return { category:category, action:action, utterance:utterance };
		} catch(error) {
			return { error:error };
		}
	}

	function processRequest(processedIntent: any) {
		try {
			console.log(processedIntent);

			switch(processedIntent.category) {
				case "transaction":
					createTransaction(processedIntent);
					break;
				case "activity":
					createActivity(processedIntent);
					break;
				case "holding":
					updateHolding(processedIntent);
					break;
				case "watchlist":
					processedIntent.action === "delete" ? deleteWatchlist(processedIntent) : createWatchlist(processedIntent);
					break;
				case "income":
					updateIncome(processedIntent);
					break;
				case "afford":
					checkAffordability(processedIntent);
					break;
			}
		} catch(error) {
			console.log(error);
			addMessage("bot", "Sorry, I couldn't process that request.");
		}
	}

	function processIntent(entities: any, intent: any) {
		try {
			let settings: any = store.getState().settings.settings;
			
			clearChatOptions();

			let details: any = {};
			details["category"] = intent.category;
			details["action"] = intent.action;
			details["type"] = null;

			switch(intent.category) {
				case "transaction":
					processTransaction(entities, intent, details);
					return;
				case "activity":
					processActivity(entities, intent, details);
					return;
				case "holding":
					if(settings.transactionsAffectHoldings === "disabled") {
						processHolding(entities, intent, details);
						return;
					} else {
						addMessage("bot", "Please set transactions to not affect holdings in the settings page first.");
						return;
					}
				case "watchlist":
					processWatchlist(entities, intent, details);
					return;
				case "income":
					processIncome(entities, intent, details);
					return;
				case "afford":
					processAfford(entities, intent, details);
					return;
			}

			processOther(entities, intent, details);
		} catch(error) {
			console.log(error);
		}
	}

	function processOther(entities: any, intent: any, details: any) {
		if(intent.utterance.match("(help)")) {
			let settings: any = store.getState().settings.settings;

			let currencySymbol = Utils.currencySymbols[settings.currency];

			requireClarification("What are you trying to do?", {
				"Check Affordability": async () => {
					await addMessage("user", "See if I can afford something.");
					await addMessage("bot", `Example: Can I afford a ${currencySymbol}20 pizza?`);
				},
				"Set Income": async () => {
					await addMessage("user", "Set income.");
					await addMessage("bot", `Example: Set my income to ${currencySymbol}50000.`);
				},
				"Set Holding": async () => {
					await addMessage("user", "Set holding.");
					await addMessage("bot", `Example: Set my BTC holdings to 5.`);
				},
				"Record Transaction": async () => {
					await addMessage("user", "Record a transaction.");
					await addMessage("bot", `Example: I bought a train ticket for $50 yesterday.`);
				},
				"Record Activity": async () => {
					await addMessage("user", "Record an activity.");
					await addMessage("bot", `Example: I bought 2 BTC today.`);
				},
				"Edit Watchlist": async () => {
					await addMessage("user", "Edit my watchlist.");
					await addMessage("bot", `Example: Add BTC to my watchlist.`);
					await addMessage("bot", `Example: Remove BTC from my watchlist.`);
				},
			});
		}
	}

	function processTransaction(entities: any, intent: any, details: any) {
		try {
			if(intent.utterance.match("(rent|gas|fuel|mortgage)")) {
				if(intent.utterance.match("(rent)")) {
					details["item"] = "Rent";
					details["type"] = "housing";
				} else if(intent.utterance.match("(gas)")) {
					details["item"] = "Gas";
					details["type"] = "transport";
				} else if(intent.utterance.match("(fuel)")) {
					details["item"] = "Fuel";
					details["type"] = "transport";
				} else if(intent.utterance.match("(mortgage)")) {
					details["item"] = "Mortgage";
					details["type"] = "housing";
				} else if(intent.utterance.match("(insurance)")) {
					details["item"] = "Insurance";
					details["type"] = "insurance";
				}
			}

			if(Utils.empty(details?.type)) {
				requireClarification("What budget category does this belong to?", {
					Food: async () => {
						try {
							details.type = "food";
							await addMessage("user", "Food.");
							processTransaction(entities, intent, details);
						} catch(error) {
							Utils.notify(theme, "Something went wrong...");
							console.log(error);
						}
					},
					Housing: async () => {
						try {
							details.type = "housing";
							await addMessage("user", "Housing.");
							processTransaction(entities, intent, details);
						} catch(error) {
							Utils.notify(theme, "Something went wrong...");
							console.log(error);
						}
					},
					Transport: async () => {
						try {
							details.type = "transport";
							await addMessage("user", "Transport.");
							processTransaction(entities, intent, details);
						} catch(error) {
							Utils.notify(theme, "Something went wrong...");
							console.log(error);
						}
					},
					Entertainment: async () => {
						try {
							details.type = "entertainment";
							await addMessage("user", "Entertainment.");
							processTransaction(entities, intent, details);
						} catch(error) {
							Utils.notify(theme, "Something went wrong...");
							console.log(error);
						}
					},
					Insurance: async () => {
						try {
							details.type = "insurance";
							await addMessage("user", "Insurance.");
							processTransaction(entities, intent, details);
						} catch(error) {
							Utils.notify(theme, "Something went wrong...");
							console.log(error);
						}
					},
					Savings: async () => {
						try {
							details.type = "savings";
							await addMessage("user", "Savings.");
							processTransaction(entities, intent, details);
						} catch(error) {
							Utils.notify(theme, "Something went wrong...");
							console.log(error);
						}
					},
					Other: async () => {
						try {
							details.type = "other";
							await addMessage("user", "Other.");
							processTransaction(entities, intent, details);
						} catch(error) {
							Utils.notify(theme, "Something went wrong...");
							console.log(error);
						}
					},
				});

				return;
			}

			let numberOfEntities = entities.length;
			let lastEntity = entities[numberOfEntities - 1];

			if(!("item" in details) || Utils.empty(details?.item)) {
				let start = intent.utterance.split("bought")[1];
				let item = Utils.replaceAll(" a ", "", start.split("for")[0]);
				details["item"] = Utils.titleCase(item).trim();
				// let regex = /\w+(?=\s+((for )\$?[0-9]\d*\.?\d))/;
				// let match = intent.utterance.match(regex);
				// details["item"] = match[0];
			}

			if(entities[0]?.typeName.includes("number")) {
				details["price"] = parseFloat(entities[0].resolution.value);
			}

			if(entities[1]?.typeName.includes("number")) {
				details["price"] = parseFloat(entities[1].resolution.value);

				if(!Utils.empty(lastEntity) && lastEntity?.typeName.includes("date")) {
					details["date"] = lastEntity.resolution.values[0].value;
				}
			} else if(entities[1]?.typeName.includes("date")) {
				details["date"] = entities[1].resolution.values[0].value;
			} else if(lastEntity?.typeName.includes("date")) {
				details["date"] = lastEntity.resolution.values[0].value;
			}

			if(!("date" in details)) {
				details["date"] = new Date().toISOString().split("T")[0]
			}

			processRequest(details);
		} catch(error) {
			addMessage("bot", `Something went wrong. Please type "help" to learn how to use me.`);
			console.log(error);
		}
	}

	function processIncome(entities: any, intent: any, details: any) {
		try {
			let income = entities[0]?.resolution?.value;
			details.income = income;
			processRequest(details);
		} catch(error) {
			addMessage("bot", `Something went wrong. Please type "help" to learn how to use me.`);
			console.log(error);
		}
	}

	function processAfford(entities: any, intent: any, details: any) {
		try {
			let price = entities[0]?.resolution?.value;
			let item = intent.utterance.split(price)[1];
		
			details.price = price;
			details.item = Utils.replaceAll("?", "", item.toLowerCase().trim());

			if(defaultFood.includes(details.item)) {
				details.type = "food";
			}

			if(Utils.empty(details?.type)) {
				requireClarification("What budget category does this belong to?", {
					Food: async () => {
						try {
							details.type = "food";
							await addMessage("user", "Food.");
							processAfford(entities, intent, details);
						} catch(error) {
							Utils.notify(theme, "Something went wrong...");
							console.log(error);
						}
					},
					Housing: async () => {
						try {
							details.type = "housing";
							await addMessage("user", "Housing.");
							processAfford(entities, intent, details);
						} catch(error) {
							Utils.notify(theme, "Something went wrong...");
							console.log(error);
						}
					},
					Transport: async () => {
						try {
							details.type = "transport";
							await addMessage("user", "Transport.");
							processAfford(entities, intent, details);
						} catch(error) {
							Utils.notify(theme, "Something went wrong...");
							console.log(error);
						}
					},
					Entertainment: async () => {
						try {
							details.type = "entertainment";
							await addMessage("user", "Entertainment.");
							processAfford(entities, intent, details);
						} catch(error) {
							Utils.notify(theme, "Something went wrong...");
							console.log(error);
						}
					},
					Insurance: async () => {
						try {
							details.type = "insurance";
							await addMessage("user", "Insurance.");
							processAfford(entities, intent, details);
						} catch(error) {
							Utils.notify(theme, "Something went wrong...");
							console.log(error);
						}
					},
					Savings: async () => {
						try {
							details.type = "savings";
							await addMessage("user", "Savings.");
							processAfford(entities, intent, details);
						} catch(error) {
							Utils.notify(theme, "Something went wrong...");
							console.log(error);
						}
					},
					Other: async () => {
						try {
							details.type = "other";
							await addMessage("user", "Other.");
							processAfford(entities, intent, details);
						} catch(error) {
							Utils.notify(theme, "Something went wrong...");
							console.log(error);
						}
					},
				});

				return;
			}

			processRequest(details);
		} catch(error) {
			addMessage("bot", `Something went wrong. Please type "help" to learn how to use me.`);
			console.log(error);
		}
	}

	function processActivity(entities: any, intent: any, details: any) {
		try {
			if(Utils.empty(details?.type)) {
				requireClarification("Is this a crypto or stock?", {
					Crypto: async () => {
						try {
							await addMessage("user", "Crypto.");
							details.type = "crypto";
							processActivity(entities, intent, details);
						} catch(error) {
							Utils.notify(theme, "Something went wrong...");
							console.log(error);
						}
					},
					Stock: async () => {
						try {
							await addMessage("user", "Stock.");
							details.type = "stock";
							processActivity(entities, intent, details);
						} catch(error) {
							Utils.notify(theme, "Something went wrong...");
							console.log(error);
						}
					}
				});

				return;
			}

			let numberOfEntities = entities.length;
			let lastEntity = entities[numberOfEntities - 1];

			let valueGiven = false;

			let regex = /\w+(?=\s+((at |@ )\$?[0-9]\d*\.?\d))/;

			if(intent.action.match("(buy|sell)") && !intent.utterance.match("(at|@)") && intent.utterance.match("(for)")) {
				regex = /\w+(?=\s+((for )\$?[0-9]\d*\.?\d))/;
				valueGiven = true;
			}

			if(intent.action.match("(buy)") && !intent.utterance.match("(at|@)") && !intent.utterance.match("(for)")) {
				regex = /(?<=bought [0-9]*.[0-9]* )\w+/gi;
				valueGiven = true;
			}

			if(intent.action.match("(sell)") && !intent.utterance.match("(at|@)") && !intent.utterance.match("(for)")) {
				regex = /(?<=sold [0-9]*.[0-9]* )\w+/gi;
				valueGiven = true;
			}

			if(intent.action === "transfer") {
				regex = /(transfer |transferred |send |sent |received )\$?\d*\.?\d\s+[A-Z]*/gi;
			}

			let match = intent.utterance.match(regex);

			let asset = match[0];
			if(intent.action === "transfer") {
				asset = match[0].split(" ").pop();

				if(intent.utterance.includes("from")) {
					let from = intent.utterance.match(/(from )+[A-Z]*/gi)[0].split(" ")[1];
					details["from"] = Utils.capitalizeFirstLetter(from);
					details["to"] = "Me";
				} else if(intent.utterance.includes("to")) {
					let to = intent.utterance.match(/(to )+[A-Z]*/gi)[0].split(" ")[1];
					details["from"] = "Me";
					details["to"] = Utils.capitalizeFirstLetter(to);
				}
			}

			details["amount"] = parseFloat(entities[0].resolution.value);
			details["asset"] = asset;

			if(entities[1]?.typeName.includes("number")) {
				if(intent.action !== "transfer") {
					if(valueGiven) {
						details["price"] = parseFloat(entities[1].resolution.value) / details.amount;
					} else {
						details["price"] = parseFloat(entities[1].resolution.value);
					}
				}

				if(!Utils.empty(lastEntity) && lastEntity?.typeName.includes("date")) {
					details["date"] = lastEntity.resolution.values[0].value;
				}
			} else if(entities[1]?.typeName.includes("date")) {
				details["date"] = entities[1].resolution.values[0].value;
			} else if(lastEntity?.typeName.includes("date")) {
				details["date"] = lastEntity.resolution.values[0].value;
			}

			if(!("date" in details)) {
				details["date"] = new Date().toISOString().split("T")[0]
			}

			processRequest(details);
		} catch(error) {
			addMessage("bot", `Something went wrong. Please type "help" to learn how to use me.`);
			console.log(error);
		}
	}

	function processHolding(entities: any, intent: any, details: any) {
		try {
			if(Utils.empty(details?.type)) {
				requireClarification("Is this a crypto or stock?", {
					Crypto: async () => {
						try {
							await addMessage("user", "Crypto.");
							details.type = "crypto";
							processHolding(entities, intent, details);
						} catch(error) {
							Utils.notify(theme, "Something went wrong...");
							console.log(error);
						}
					},
					Stock: async () => {
						try {
							await addMessage("user", "Stock.");
							details.type = "stock";
							processHolding(entities, intent, details);
						} catch(error) {
							Utils.notify(theme, "Something went wrong...");
							console.log(error);
						}
					}
				});

				return;
			}

			let numberOfEntities = entities.length;
			let lastEntity = entities[numberOfEntities - 1];

			let match;

			if(intent.utterance.match("(set|add)")) {
				match = intent.utterance.match(/\w+(?=\s+((holding)))/gi);
				details["amount"] = parseFloat(lastEntity.resolution.value);
			} else if(intent.utterance.match("(remove|delete)")) {
				match = intent.utterance.match(/\w+(?=\s+((from )))/);
				details["action"] = "delete";
			}

			let asset = match[0];
			details["asset"] = asset;

			processRequest(details);
		} catch(error) {
			addMessage("bot", `Something went wrong. Please type "help" to learn how to use me.`);
			console.log(error);
		}
	}

	function processWatchlist(entities: any, intent: any, details: any) {
		try {
			if(Utils.empty(details?.type)) {
				requireClarification("Is this a crypto or stock?", {
					Crypto: async () => {
						try {
							await addMessage("user", "Crypto.");
							details.type = "crypto";
							processWatchlist(entities, intent, details);
						} catch(error) {
							Utils.notify(theme, "Something went wrong...");
							console.log(error);
						}
					},
					Stock: async () => {
						try {
							await addMessage("user", "Stock.");
							details.type = "stock";
							processWatchlist(entities, intent, details);
						} catch(error) {
							Utils.notify(theme, "Something went wrong...");
							console.log(error);
						}
					}
				});

				return;
			}

			let match;

			if(intent.utterance.match("(add|set)")) {
				match = intent.utterance.match(/\w+(?=\s+((to )))/gi);
			} else if(intent.utterance.match("(remove|delete)")) {
				match = intent.utterance.match(/\w+(?=\s+((from )))/gi);
			}

			let asset = match[0];
			details["asset"] = asset;

			processRequest(details);
		} catch(error) {
			addMessage("bot", `Something went wrong. Please type "help" to learn how to use me.`);
			console.log(error);
		}
	}

	async function requireClarification(message: string, options: any) {
		try {
			await addMessage("bot", message);

			clearChatOptions();

			options["Nevermind"] = async () => {
				await addMessage("user", "Nevermind.");
				clearChatOptions();
			}

			let choices = Object.keys(options);

			

			scrollChatToBottom();
		} catch(error) {
			Utils.notify(theme, "Something went wrong...");
			console.log(error);
		}
	}

	function dismissChatOptions() {
		
	}

	function clearChatOptions() {
		
	}

	function scrollChatToBottom() {
		Utils.wait(250).then(() => chatRef.current.scrollToOffset({ animated:true, offset:0 }));
	}

	function attachSocketEvents(socket: any) {
		socket.on("connect", () => {
			setStatus("Connected");
			setChatConnected(true);
		});

		socket.on("disconnect", () => {
			setStatus("Disconnected");
			setChatConnected(false);
		});

		socket.on("reconnection_attempt", () => {
			setStatus("Reconnecting");
			setChatConnected(false);
		});

		socket.on("reconnect", () => {
			setStatus("Connected");
			setChatConnected(true);
		});

		socket.on("response", (response: any) => {
			let message = response.message;
			addMessage("bot", message);
		});

		socket.on("process", (data: any) => {
			let entities = data.processed.sourceEntities;
			let intent = determineIntent(data.processed);
		
			if(intent.category === "activity-or-transaction") {
				requireClarification("Is this activity an asset trade?", {
					Yes: async () => {
						try {
							await addMessage("user", "Yes.");
							intent.category = "activity";
							processIntent(entities, intent);
						} catch(error) {
							Utils.notify(theme, "Something went wrong...");
							console.log(error);
						}
					},
					No: async () => {
						try {
							await addMessage("user", "No.");
							intent.category = "transaction";
							processIntent(entities, intent);
						} catch(error) {
							Utils.notify(theme, "Something went wrong...");
							console.log(error);
						}
					}
				});

				return;
			}

			processIntent(entities, intent);
		});
	}

	function fetchMessage() {
		return new Promise(async (resolve, reject) => {
			try {
				let userID = await AsyncStorage.getItem("userID");
				let token = await AsyncStorage.getItem("token");
				let key = await AsyncStorage.getItem("key") || "";
				let api = await AsyncStorage.getItem("api");

				let requests = new Requests(api);

				let message = await requests.readMessage(token, userID);

				if(Utils.empty(message?.data?.readMessage)) {
					resolve(null);
					return;
				}

				let messageData: any = {};
	
				let encrypted = message?.data?.readMessage;
	
				Object.keys(encrypted).map(index => {
					let decrypted = Utils.decryptObjectValues(key, encrypted[index]);
					decrypted.messageID = encrypted[index].messageID;
					decrypted.messageDate = encrypted[index].messageDate;
					messageData[decrypted.messageID] = decrypted;
				});

				resolve(messageData);
			} catch(error) {
				console.log(error);
				reject(error);
			}
		});
	}

	async function createTransaction(details: any) {
		try {
			let userID = await AsyncStorage.getItem("userID");
			let token = await AsyncStorage.getItem("token");
			let key = await AsyncStorage.getItem("key") || "";
			let api = await AsyncStorage.getItem("api");

			let requests = new Requests(api);

			let data: any = validateTransactionData(details.price, "spent", details.type, details.date, details.item);

			if("error" in data) {
				addMessage("bot", data.error);
				return;
			}

			let encrypted = Utils.encryptObjectValues(key, data);

			await requests.createTransaction(token, userID, encrypted.transactionType, encrypted.transactionDate, encrypted.transactionCategory, encrypted.transactionAmount, encrypted.transactionNotes);

			addMessage("bot", "I've recorded that transaction.");
		} catch(error) {
			console.log(error);
		}
	}

	async function createActivity(details: any) {
		try {
			let settings: any = store.getState().settings.settings;

			let userID = await AsyncStorage.getItem("userID");
			let token = await AsyncStorage.getItem("token");
			let key = await AsyncStorage.getItem("key") || "";
			let api = await AsyncStorage.getItem("api");

			let requests = new Requests(api);

			let currency = settings.currency;
			let symbol = details.asset;

			let amount = details.amount;
			let type = details.type;
			let date = details.date;
			let action = details.action;

			let values = {
				activityAssetSymbol: symbol,
				activityAssetType: type,
				activityAssetAmount: amount,
				activityDate: date,
				activityFee: "",
				activityNotes: "",
				activityType: action,
				activityExchange: "",
				activityPair: "",
				activityPrice: details?.price || "",
				activityFrom: "",
				activityTo: ""
			};

			let data: any = validateActivityData(values);

			if(type === "crypto") {
				let result: any = await CryptoFinder.getCoin({ symbol:symbol });

				if("id" in details) {
					result.id = details.id;
				}

				if("id" in result) {
					let id = result.id;

					data.activityAssetID = id;

					let encrypted = Utils.encryptObjectValues(key, data);

					await requests.createActivity(token, userID, encrypted.activityAssetID, encrypted.activityAssetSymbol, encrypted.activityAssetType, encrypted.activityDate, encrypted.activityType, encrypted.activityAssetAmount, encrypted.activityFee, encrypted.activityNotes, encrypted.activityExchange, encrypted.activityPair, encrypted.activityPrice, encrypted.activityFrom, encrypted.activityTo);

					addMessage("bot", "I've recorded that activity.");
				} else {
					let clarification: any = {};

					Object.keys(result.matches).map(index => {
						let match = result.matches[index];
						let symbol = Object.keys(match)[0];
						let id = match[symbol];

						clarification[id] = async () => {
							details.id = id;
							await addMessage("user", id);
							createActivity(details);
						}
					});

					requireClarification("I found multiple assets with that symbol. Please choose one.", clarification);

					return;
				}
			} else {
				symbol = symbol.toUpperCase();

				let resultPrice = await Stock.fetchStockPrice(currency, [symbol]);

				if("error" in resultPrice) {
					addMessage("bot", resultPrice.error);
					return;
				}

				let id = "stock-" + symbol;

				data.activityAssetID = id;

				let encrypted = Utils.encryptObjectValues(key, data);

				await requests.createActivity(token, userID, encrypted.activityAssetID, encrypted.activityAssetSymbol, encrypted.activityAssetType, encrypted.activityDate, encrypted.activityType, encrypted.activityAssetAmount, encrypted.activityFee, encrypted.activityNotes, encrypted.activityExchange, encrypted.activityPair, encrypted.activityPrice, encrypted.activityFrom, encrypted.activityTo);

				addMessage("bot", "I've recorded that activity.");
			}
		} catch(error) {
			console.log(error);
		}
	}

	async function updateHolding(details: any) {
		try {
			let settings: any = store.getState().settings.settings;

			let userID = await AsyncStorage.getItem("userID");
			let token = await AsyncStorage.getItem("token");
			let key = await AsyncStorage.getItem("key") || "";
			let api = await AsyncStorage.getItem("api");

			let requests = new Requests(api);

			let currency = settings.currency;
			let symbol = details.asset;

			let amount = details.amount;
			let type = details.type;

			if(type === "crypto") {
				let result: any = await CryptoFinder.getCoin({ symbol:symbol });

				if("id" in details) {
					result.id = details.id;
				}

				if("id" in result) {
					let id = result.id;

					let exists: any = await assetHoldingExists(id);

					let encrypted = Utils.encryptObjectValues(key, {
						holdingAssetID: id,
						holdingAssetSymbol: symbol,
						holdingAssetAmount: amount,
						holdingAssetType: type
					});

					if(exists.exists) {
						await requests.updateHolding(token, userID, exists.holdingID, encrypted.holdingAssetID, encrypted.holdingAssetSymbol, encrypted.holdingAssetAmount, encrypted.holdingAssetType);
					} else {
						await requests.createHolding(token, userID, encrypted.holdingAssetID, encrypted.holdingAssetSymbol, encrypted.holdingAssetAmount, encrypted.holdingAssetType);
					}

					addMessage("bot", "I've updated your holdings.");
				} else {
					let clarification: any = {};

					Object.keys(result.matches).map(index => {
						let match = result.matches[index];
						let symbol = Object.keys(match)[0];
						let id = match[symbol];

						clarification[id] = async () => {
							details.id = id;
							await addMessage("user", id);
							updateHolding(details);
						}
					});

					requireClarification("I found multiple assets with that symbol. Please choose one.", clarification);

					return;
				}
			} else {
				symbol = symbol.toUpperCase();

				let resultPrice = await Stock.fetchStockPrice(currency, [symbol]);

				if("error" in resultPrice) {
					addMessage("bot", resultPrice.error);
					return;
				}

				let id = "stock-" + symbol;

				let exists: any = await assetHoldingExists(id);

				let encrypted = Utils.encryptObjectValues(key, {
					holdingAssetID: id,
					holdingAssetSymbol: symbol,
					holdingAssetAmount: amount,
					holdingAssetType: type
				});

				if(exists.exists) {
					await requests.updateHolding(token, userID, exists.holdingID, encrypted.holdingAssetID, encrypted.holdingAssetSymbol, encrypted.holdingAssetAmount, encrypted.holdingAssetType);
				} else {
					await requests.createHolding(token, userID, encrypted.holdingAssetID, encrypted.holdingAssetSymbol, encrypted.holdingAssetAmount, encrypted.holdingAssetType);
				}

				addMessage("bot", "I've updated your holdings.");
			}
		} catch(error) {
			console.log(error);
		}
	}

	async function createWatchlist(details: any) {
		try {
			let settings: any = store.getState().settings.settings;

			let userID = await AsyncStorage.getItem("userID");
			let token = await AsyncStorage.getItem("token");
			let key = await AsyncStorage.getItem("key") || "";
			let api = await AsyncStorage.getItem("api");

			let requests = new Requests(api);

			let currency = settings.currency;
			let symbol = details.asset;

			let watchlist = await fetchWatchlist() || {};

			let type = details.type;

			if(type === "crypto") {
				let result: any = await CryptoFinder.getCoin({ symbol:symbol });

				if("id" in details) {
					result.id = details.id;
				}

				if("id" in result) {
					let id = result.id;

					if(watchlistExists(watchlist, id)) {
						addMessage("bot", "Asset already in watchlist.");
						return;
					}

					let encrypted = Utils.encryptObjectValues(key, {
						assetID: id.toLowerCase(),
						assetSymbol: symbol.toUpperCase(),
						assetType: "crypto",
					});

					await requests.createWatchlist(token, userID, encrypted.assetID, encrypted.assetSymbol, encrypted.assetType);

					addMessage("bot", "I've added that asset to your watchlist.");
				} else {
					let clarification: any = {};

					Object.keys(result.matches).map(index => {
						let match = result.matches[index];
						let symbol = Object.keys(match)[0];
						let id = match[symbol];

						clarification[id] = async () => {
							details.id = id;
							await addMessage("user", id);
							createWatchlist(details);
						}
					});

					requireClarification("I found multiple assets with that symbol. Please choose one.", clarification);

					return;
				}
			} else {
				symbol = symbol.toUpperCase();

				let resultPrice = await Stock.fetchStockPrice(currency, [symbol]);

				if("error" in resultPrice) {
					addMessage("bot", resultPrice.error);
					return;
				}

				let id = "stock-" + symbol;

				if(watchlistExists(watchlist, id)) {
					addMessage("bot", "Asset already in watchlist.");
					return;
				}

				let encrypted = Utils.encryptObjectValues(key, {
					assetID: id,
					assetSymbol: symbol,
					assetType: "stock",
				});

				await requests.createWatchlist(token, userID, encrypted.assetID, encrypted.assetSymbol, encrypted.assetType);

				addMessage("bot", "I've added that asset to your watchlist.");
			}
		} catch(error) {
			console.log(error);
		}
	}

	async function deleteWatchlist(details: any) {
		try {
			let userID = await AsyncStorage.getItem("userID");
			let token = await AsyncStorage.getItem("token");
			let api = await AsyncStorage.getItem("api");

			let requests = new Requests(api);

			let watchlist = await fetchWatchlist() || {};

			let find = getWatchlistIDBySymbol(watchlist, details.asset, details.type);

			if(find.exists === true) {
				await requests.deleteWatchlist(token, userID, find.id);
				addMessage("bot", "I've removed that asset from your watchlist.");
			} else {
				addMessage("bot", "I couldn't find that asset in your watchlist.");
			}
		} catch(error) {
			console.log(error);
		}
	}

	async function updateIncome(details: any) {
		try {
			let settings: any = store.getState().settings.settings;

			let userID = await AsyncStorage.getItem("userID");
			let token = await AsyncStorage.getItem("token");
			let key = await AsyncStorage.getItem("key") || "";
			let api = await AsyncStorage.getItem("api");

			let requests = new Requests(api);

			let income = details.income;
			
			let currency = settings.currency;

			let budgetData: any = await fetchBudget();

			if(Utils.empty(budgetData)) {
				await setDefaultBudgetData();
				budgetData = await fetchBudget();
			}

			if(isNaN(income) || parseFloat(income) < 0) {
				Utils.notify(theme, "Income has to be zero or greater.");
				return;
			}

			budgetData.income = parseFloat(income);

			let encrypted = CryptoFN.encryptAES(JSON.stringify(budgetData), key);

			await requests.updateBudget(token, userID, encrypted);

			addMessage("bot", `Your yearly income has been set to ${Utils.currencySymbols[currency] + Utils.separateThousands(budgetData.income)}.`);
		} catch(error) {
			console.log(error);
		}
	}

	async function checkAffordability(details: any) {
		try {
			let settings: any = store.getState().settings.settings;

			let budgetData: any = await fetchBudget() || {};
			let transactionData: any = await fetchTransaction() || {};

			let currentDate = new Date();
			let currentMonth = currentDate.getMonth();
			let currentYear = currentDate.getFullYear();

			transactionData = filterTransactionsByMonth(transactionData, currentMonth, currentYear);

			let parsed = parseTransactionData(transactionData);
		
			let categories = budgetData.categories;
			let income = budgetData.income;

			let category = details.type;

			let percentage = categories[category];
			let amount = parseFloat((((percentage * income) / 100) / 12).toFixed(0));
			let remaining = amount - parsed[category];
			let remainingPercentage = parseFloat(((remaining * 100) / amount).toFixed(0));
			let used = amount - remaining;
			let usedPercentage = 100 - remainingPercentage;

			if(usedPercentage > 100) {
				usedPercentage = 100;
			}

			let currency = settings.currency;

			let price = parseFloat(details.price);

			if(remaining >= price) {
				addMessage("bot", `You've used ${usedPercentage}% (${Utils.currencySymbols[currency] + used}) of your ${category} budget this month, so you can afford to buy that.`);
			} else {
				addMessage("bot", `You've used ${usedPercentage}% (${Utils.currencySymbols[currency] + used}) of your ${category} budget this month, so you cannot afford to buy that.`);
			}
		} catch(error) {
			console.log(error);
		}
	}
}