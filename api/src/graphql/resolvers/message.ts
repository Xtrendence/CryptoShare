import Utils from "../../utils/Utils";
import DB from "../../utils/DB";
import Message from "../../models/Message";

const db = new DB();

export async function createMessage({ token, userID, userMessage, botMessage }: any) {
	let valid = await Utils.verifyToken(userID, token);

	if(valid) {
		db.runQuery("INSERT INTO Message (userID, userMessage, botMessage, messageDate) VALUES (?, ?, ?, TIME())", [userID, userMessage, botMessage]);
		return "Done";
	} else {
		return "Unauthorized";
	}
}

export async function readMessage({ token, userID }: any) {
	return new Promise(async (resolve, reject) => {
		let valid = await Utils.verifyToken(userID, token);

		if(valid) {
			db.db?.get("SELECT * FROM Message WHERE userID = ?", [userID], (error, row) => {
				if(error) {
					console.log(error);
					reject();
				} else {
					if(row === undefined) {
						reject("!Message Not Found!");
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
	});
}

export async function updateMessage({ token, userID, messageID, userMessage, botMessage }: any) {
	let valid = await Utils.verifyToken(userID, token);

	if(valid) {
		db.runQuery("UPDATE Message SET userMessage = ?, botMessage = ? WHERE messageID = ? AND userID = ?", [userMessage, botMessage, messageID, userID]);
		return "Done";
	} else {
		return "Unauthorized";
	}
}

export async function deleteMessage({ token, userID, messageID }: any) {
	let valid = await Utils.verifyToken(userID, token);

	if(valid) {
		db.runQuery("DELETE FROM Message WHERE messageID = ? AND userID = ?", [messageID, userID]);
		return "Done";
	} else {
		return "Unauthorized";
	}
}