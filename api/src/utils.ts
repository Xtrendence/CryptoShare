import fs, { existsSync, mkdirSync, writeFileSync, readFileSync } from "fs";
import path from "path";

export default class Utils {
	dataFolder: string;

	constructor() {
		this.dataFolder = "./data/";
	}

	initialize() {
		if(!existsSync(this.dataFolder)) {
			mkdirSync(this.dataFolder);
		}
	}

	getSchema() {
		return readFileSync(path.join(__dirname, "./schema.graphql"), { encoding:"utf-8" });
	}
}