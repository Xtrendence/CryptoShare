import { NlpManager } from "node-nlp";
import Message from "../models/Message";
import { createMessage, readMessage, updateMessage, deleteMessage } from "../graphql/resolvers/message";

export default class Bot {
	manager: typeof NlpManager;

	constructor() {
		this.manager = new NlpManager({ languages: ['en'], forceNER: true });
	}

	async initialize() {

	}

	async generateResponse(message: string) {
		let processed = await this.manager.process(message);
		let intent = this.determineIntent(processed);

		console.log(intent);
	}

	determineIntent(processed: any) {
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

		return { category:category, action:action };
	}
}