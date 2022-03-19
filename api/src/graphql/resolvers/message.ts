import Message from "../../models/Message";
import DB from "../../utils/DB";
import Utils from "../../utils/Utils";

const db = new DB();

// Creates a message.
export async function createMessage({ token, userID, message }: any) {
	try {
		let valid = await Utils.verifyToken(userID, token);

		if(valid) {
			db.runQuery("INSERT INTO Message (userID, message, messageDate) VALUES (?, ?, DATETIME('now'))", [userID, message]);
			return "Done";
		} else {
			return "Unauthorized";
		}
	} catch(error) {
		console.log(error);
		return error;
	}
}

// Returns the messages of a user.
export async function readMessage({ token, userID }: any) {
	return new Promise(async (resolve, reject) => {
		try {
			let valid = await Utils.verifyToken(userID, token);

			if(valid) {
				db.db?.all("SELECT * FROM Message WHERE userID = ?", [userID], (error, rows) => {
					if(error) {
						console.log(error);
						reject();
					} else {
						if(rows === undefined) {
							reject("!Messages not found.!");
							return;
						}

						let messages: Array<Message> = [];

						rows.map(row => {
							let message = new Message(userID, row.message, row.messageDate);
							message.messageID = row.messageID;
							messages.push(message);
						});
						
						resolve(messages);
					}
				});
			} else {
				reject("!Unauthorized!");
			}
		} catch(error) {
			console.log(error);
			reject(`!${error}!`);
		}
	});
}

// Updates a message.
export async function updateMessage({ token, userID, messageID, message }: any) {
	try {
		let valid = await Utils.verifyToken(userID, token);

		if(valid) {
			db.runQuery("UPDATE Message SET message = ? WHERE messageID = ? AND userID = ?", [message, messageID, userID]);
			return "Done";
		} else {
			return "Unauthorized";
		}
	} catch(error) {
		console.log(error);
		return error;
	}
}

// Deletes a message.
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
		return error;
	}
}

// Deletes all the messages of a user.
export async function deleteMessageAll({ token, userID }: any) {
	try {
		let valid = await Utils.verifyToken(userID, token);

		if(valid) {
			db.runQuery("DELETE FROM Message WHERE userID = ?", [userID]);
			return "Done";
		} else {
			return "Unauthorized";
		}
	} catch(error) {
		console.log(error);
		return error;
	}
}