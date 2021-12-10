import { NlpManager } from "node-nlp";
import Message from "../models/Message";
import { createMessage, readMessage, updateMessage, deleteMessage } from "../graphql/resolvers/message";
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
			let numberOfEntities = entities.length;
			let lastEntity = entities[numberOfEntities - 1];

			let intent = this.determineIntent(processed);

			if("error" in intent) {
				return { error:intent.error };
			}

			let details: any = {};
			details["action"] = intent.action;

			switch(intent.category) {
				case "activity":
					let regex = /\w+(?=\s+((at |@ )\$?[0-9]\d*\.?\d))/;
					let asset = intent.utterance.match(regex)[0];
					
					details["amount"] = parseFloat(entities[0].resolution.value);
					details["asset"] = asset;

					if(entities[1].typeName.includes("number")) {
						details["price"] = parseFloat(entities[1].resolution.value);

						if(!Utils.empty(lastEntity) && lastEntity.typeName.includes("date")) {
							details["date"] = lastEntity.resolution.values[0].value;
						}
					} else if(entities[1].typeName.includes("date")) {
						details["date"] = entities[1].resolution.values[0].value;
					}
					
					break;
				case "holding":
					break;
				case "watchlist":
					break;
			}

			console.log(details);
		} catch(error) {
			return { error:error };
		}
	}

	determineIntent(processed: any) {
		try {
			let utterance = processed.utterance.toLowerCase();
			let category;
			let action;

			if(utterance.includes("bought")) {
				category = "activity";
				action = "buy";
			} else if(utterance.includes("sold")) {
				category = "activity";
				action = "sold";
			} else if(utterance.match("(transfer|sent|received)")) {
				category = "activity";
				action = "transfer";
			} else if(utterance.match("(holding|amount)")) {
				category = "holding";
				action = "modify";
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
}