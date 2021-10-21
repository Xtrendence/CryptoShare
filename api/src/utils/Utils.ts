import fs, { existsSync, mkdirSync, writeFileSync, readFileSync } from "fs";
import path from "path";

export default class Utils {
	dataFolder: string;

	constructor() {
		this.dataFolder = "./data/";
	}

	verifyToken(token: string) {
		if(token === "testing") {
			return true;
		}
		return false;
	}

	checkFiles() {
		if(!existsSync(this.dataFolder)) {
			mkdirSync(this.dataFolder);
		}
	}

	getSchema() {
		return readFileSync(path.join(__dirname, "../graphql/schema.graphql"), { encoding:"utf-8" });
	}
}