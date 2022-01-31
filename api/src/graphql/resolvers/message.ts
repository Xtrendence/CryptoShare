import Message from "../../models/Message";
import DB from "../../utils/DB";
import Utils from "../../utils/Utils";

const db = new DB();

export async function createMessage({ token, userID, userMessage, botMessage }: any) {
	try {
		let valid = await Utils.verifyToken(userID, token);

		if(valid) {
			db.runQuery("INSERT INTO Message (userID, userMessage, botMessage, messageDate) VALUES (?, ?, ?, TIME())", [userID, userMessage, botMessage]);
			return "Done";
		} else {
			return "Unauthorized";
		}
	} catch(error) {
		console.log(error);
	}
}

export async function readMessage({ token, userID }: any) {
	return new Promise(async (resolve, reject) => {
		try {
			let valid = await Utils.verifyToken(userID, token);

			if(valid) {
				db.db?.get("SELECT * FROM Message WHERE userID = ?", [userID], (error, row) => {
					if(error) {
						console.log(error);
						reject();
					} else {
						if(row === undefined) {
							reject("!Message not found.!");
							return;
						}

						let message = new Message(userID, row.userMessage, row.botMessage, row.messageDate);
						message.messageID = row.messageID;
						resolve(message);
					}
				});
			} else {
				reject("!Unauthorized!");
			}
		} catch(error) {
			console.log(error);
		}
	});
}

export async function updateMessage({ token, userID, messageID, userMessage, botMessage }: any) {
	try {
		let valid = await Utils.verifyToken(userID, token);

		if(valid) {
			db.runQuery("UPDATE Message SET userMessage = ?, botMessage = ? WHERE messageID = ? AND userID = ?", [userMessage, botMessage, messageID, userID]);
			return "Done";
		} else {
			return "Unauthorized";
		}
	} catch(error) {
		console.log(error);
	}
}

export async function deleteMessage({ token, userID, messageID }: any) {
	try {
		let valid = await Utils.verifyToken(userID, token);

		if(valid) {
			db.runQuery("DELETE FROM Message WHERE messageID = ? AND userID = ?", [messageID, userID]);
			return "Done";
		} else {
			return "Unauthorized";
		}
	} catch(error) {
		console.log(error);
	}
}