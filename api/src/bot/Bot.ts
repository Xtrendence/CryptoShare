import { NlpManager } from "node-nlp";
import Message from "../models/Message";
import { createActivity } from "../graphql/resolvers/activity";
import { createHolding, readHolding, deleteHolding } from "../graphql/resolvers/holding";
import { createWatchlist, readWatchlist, deleteWatchlist } from "../graphql/resolvers/watchlist";
import { createMessage, readMessage, updateMessage, deleteMessage } from "../graphql/resolvers/message";
import { readCoinByID, readCoinBySymbol } from "../graphql/resolvers/coin";
import { readStockByID, readStockBySymbol } from "../graphql/resolvers/stock";
import Utils from "../utils/Utils";

export default class Bot {
	manager: typeof NlpManager;

	constructor() {
		this.manager = new NlpManager({ languages: ['en'], forceNER: true });
	}

	async initialize() {

	}

	async generateResponse(message: string) {
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

			console.log(details);
		} catch(error) {
			console.log(error);
			return { error:error };
		}
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
				action = "add";
			} else if(utterance.includes("watch") && utterance.match("(stop|remove|delete)")) {
				category = "watchlist";
				action = "remove";
			}

			return { category:category, action:action, utterance:utterance };
		} catch(error) {
			return { error:error };
		}
	}

	processActivity(entities: any, intent: any, details: any) {
		let numberOfEntities = entities.length;
		let lastEntity = entities[numberOfEntities - 1];

		let regex = /\w+(?=\s+((at |@ )\$?[0-9]\d*\.?\d))/;
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
			details["price"] = parseFloat(entities[1].resolution.value);

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
			details["amount"] = 0;
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