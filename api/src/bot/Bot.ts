import { NlpManager } from "node-nlp";
import { createActivity } from "../graphql/resolvers/activity";
import { createHolding, deleteHolding, updateHolding } from "../graphql/resolvers/holding";
import { createWatchlist, deleteWatchlist } from "../graphql/resolvers/watchlist";
import Utils from "../utils/Utils";

export default class Bot {
	manager: typeof NlpManager;
	queue: Array<any>;

	constructor() {
		this.manager = new NlpManager({ languages: ["en"], forceNER: true });
		this.queue = [];
	}

	async generateResponse(message: string) {
		return new Promise(async (resolve, reject) => {
			try {
				let processed = await this.manager.process(message);
				let entities = processed.sourceEntities;

				let intent = this.determineIntent(processed);

				if("error" in intent) {
					return { error:intent.error };
				}

				let details: any = {};
				details["category"] = intent.category;
				details["action"] = intent.action;
				details["type"] = null;

				switch(intent.category) {
					case "activity":
						details = this.processActivity(entities, intent, details);
						break;
					case "holding":
						details = this.processHolding(entities, intent, details);
						break;
					case "watchlist":
						details = this.processWatchlist(intent, details);
						break;
				}

				this.queue.push(details);

				resolve({ index:this.queue.indexOf(details), category:intent.category });
			} catch(error) {
				console.log(error);
				reject({ error:error });
			}
		});
	}

	async processType(userID: number, token: string, index: number, type: string, rowID: number) {
		return new Promise(async (resolve, reject) => {
			try {
				if(!["coin", "stock"].includes(type)) {
					reject({ error:"Invalid type." });
				}

				let response: any = {};

				let details = this.queue[index];
				details["type"] = type;

				// let assetID = type === "stock" ? await readStockBySymbol(details.asset) : await readCoinBySymbol(details.asset);
				let assetID = "temp";

				// TODO: Encrypt Data
				switch(details.category) {
					case "activity":
						let create = await createActivity({
							token: token, 
							userID: userID, 
							activityAssetID: assetID, 
							activityAssetSymbol: details.asset, 
							activityAssetType: type, 
							activityDate: details.date, 
							activityType: details.action, 
							activityAssetAmount: details.amount, 
							activityFee: 0, 
							activityNotes: "-", 
							activityExchange: "-", 
							activityPair: "-", 
							activityPrice: details?.price, 
							activityFrom: details?.from, 
							activityTo: details?.to
						});

						if(create === "Done") {
							resolve({ response:"Done" });
						} else {
							reject({ error:"Error" });
						}

						break;
					case "holding":
						if(details.action === "update") {
							if(Utils.empty(rowID)) {
								let create = await createHolding({
									token: token,
									userID: userID,
									holdingAssetID: assetID, 
									holdingAssetSymbol: details.asset,
									holdingAssetAmount: details.amount,
									holdingAssetType: type
								});

								if(create === "Done") {
									resolve({ response:"Done" });
								} else {
									reject({ error:"Error" });
								}
							} else {
								let update = await updateHolding({
									token: token,
									userID: userID,
									holdingID: rowID,
									holdingAssetID: assetID,
									holdingAssetSymbol: details.asset,
									holdingAssetAmount: details.amount,
									holdingAssetType: type
								});

								if(update === "Done") {
									resolve({ response:"Done" });
								} else {
									reject({ error:"Error" });
								}
							}
						} else if(details.action === "delete") {
							let remove = await deleteHolding({ 
								token: token,
								userID: userID,
								holdingID: rowID
							});

							if(remove === "Done") {
								resolve({ response:"Done" });
							} else {
								reject({ error:"Error" });
							}
						}

						break;
					case "watchlist":
						if(details.action === "create") {
							let create = await createWatchlist({
								token: token,
								userID: userID,
								assetID: assetID,
								assetSymbol: details.asset,
								assetType: type
							});

							if(create === "Done") {
								resolve({ response:"Done" });
							} else {
								reject({ error:"Error" });
							}
						} else if(details.action === "delete") {
							let remove = await deleteWatchlist({
								token: token,
								userID: userID,
								watchlistID: rowID
							});

							if(remove === "Done") {
								resolve({ response:"Done" });
							} else {
								reject({ error:"Error" });
							}
						}

						break;
				}

				resolve(response);
			} catch(error) {
				console.log(error);
				reject({ error:error });
			}
		});
	}

	determineIntent(processed: any) {
		try {
			let utterance = processed.utterance.toLowerCase();
			let category;
			let action;

			if(utterance.match("(bought|buy)")) {
				category = "activity";
				action = "buy";
			} else if(utterance.match("(sold|sell)")) {
				category = "activity";
				action = "sell";
			} else if(utterance.match("(transfer|transferred|sent|send|received)")) {
				category = "activity";
				action = "transfer";
			} else if(utterance.match("(holding|amount)")) {
				category = "holding";
				action = "update";
			} else if(utterance.includes("watch") && utterance.match("(start|add)")) {
				category = "watchlist";
				action = "create";
			} else if(utterance.includes("watch") && utterance.match("(stop|remove|delete)")) {
				category = "watchlist";
				action = "delete";
			}

			return { category:category, action:action, utterance:utterance };
		} catch(error) {
			return { error:error };
		}
	}

	processActivity(entities: any, intent: any, details: any) {
		let numberOfEntities = entities.length;
		let lastEntity = entities[numberOfEntities - 1];

		let valueGiven = false;

		let regex = /\w+(?=\s+((at |@ )\$?[0-9]\d*\.?\d))/;

		if(intent.action.match("(buy|sell)") && !intent.utterance.match("(at|@)") && intent.utterance.match("(for)")) {
			regex = /\w+(?=\s+((for )\$?[0-9]\d*\.?\d))/;
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
		}

		if(!("date" in details)) {
			details["date"] = new Date().toISOString().split("T")[0]
		}

		return details;
	}

	processHolding(entities: any, intent: any, details: any) {
		let numberOfEntities = entities.length;
		let lastEntity = entities[numberOfEntities - 1];

		let match;

		if(intent.utterance.match("(set)")) {
			match = intent.utterance.match(/\w+(?=\s+((holding)))/gi);
			details["amount"] = parseFloat(lastEntity.resolution.value);
		} else if(intent.utterance.match("(remove|delete)")) {
			match = intent.utterance.match(/\w+(?=\s+((from )))/);
			details["action"] = "delete";
		}

		let asset = match[0];
		details["asset"] = asset;

		return details;
	}

	processWatchlist(intent: any, details: any) {
		let match;

		if(intent.utterance.match("(add|set)")) {
			match = intent.utterance.match(/\w+(?=\s+((to )))/gi);
		} else if(intent.utterance.match("(remove|delete)")) {
			match = intent.utterance.match(/\w+(?=\s+((from )))/gi);
		}

		let asset = match[0];
		details["asset"] = asset;

		return details;
	}
}