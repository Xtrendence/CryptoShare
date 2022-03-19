import Setting from "../../models/Setting";
import DB from "../../utils/DB";
import Utils from "../../utils/Utils";

const db = new DB();

// Creates a setting row for a user.
export async function createSetting({ token, userID, userSettings }: any) {
	try {
		let valid = await Utils.verifyToken(userID, token);

		if(valid) {
			db.runQuery("INSERT INTO Setting (userID, userSettings) VALUES (?, ?)", [userID, userSettings]);
			return "Done";
		} else {
			return "Unauthorized";
		}
	} catch(error) {
		console.log(error);
		return error;
	}
}

// Returns the settings data of a user.
export async function readSetting({ token, userID }: any) {
	return new Promise(async (resolve, reject) => {
		try {
			let valid = await Utils.verifyToken(userID, token);

			if(valid) {
				db.db?.get("SELECT * FROM Setting WHERE userID = ?", [userID], (error, row) => {
					if(error) {
						console.log(error);
						reject();
					} else {
						if(row === undefined) {
							reject("!Setting not found.!");
							return;
						}

						let setting = new Setting(userID, row.userSettings);
						setting.settingID = row.settingID;
						resolve(setting);
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

// Updates the settings data of a user.
export async function updateSetting({ token, userID, userSettings }: any) {
	try {
		let valid = await Utils.verifyToken(userID, token);

		if(valid) {
			db.runQuery("UPDATE Setting SET userSettings = ? WHERE userID = ?", [userSettings, userID]);
			return "Done";
		} else {
			return "Unauthorized";
		}
	} catch(error) {
		console.log(error);
		return error;
	}
}

// Deletes the settings data of a user.
export async function deleteSetting({ token, userID }: any) {
	try {
		let valid = await Utils.verifyToken(userID, token);

		if(valid) {
			db.runQuery("DELETE FROM Setting WHERE userID = ?", [userID]);
			return "Done";
		} else {
			return "Unauthorized";
		}
	} catch(error) {
		console.log(error);
		return error;
	}
}