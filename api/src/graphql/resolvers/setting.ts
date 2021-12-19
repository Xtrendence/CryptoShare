import Setting from "../../models/Setting";
import DB from "../../utils/DB";
import Utils from "../../utils/Utils";

const db = new DB();

export async function createSetting({ token, userID, userSettings }: any) {
	let valid = await Utils.verifyToken(userID, token);

	if(valid) {
		db.runQuery("INSERT INTO Setting (userID, userSettings) VALUES (?, ?)", [userID, userSettings]);
		return "Done";
	} else {
		return "Unauthorized";
	}
}

export async function readSetting({ token, userID }: any) {
	return new Promise(async (resolve, reject) => {
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
	});
}

export async function updateSetting({ token, userID, settingID, userSettings }: any) {
	let valid = await Utils.verifyToken(userID, token);

	if(valid) {
		db.runQuery("UPDATE Setting SET userSettings = ? WHERE settingID = ? AND userID = ?", [userSettings, settingID, userID]);
		return "Done";
	} else {
		return "Unauthorized";
	}
}

export async function deleteSetting({ token, userID, settingID }: any) {
	let valid = await Utils.verifyToken(userID, token);

	if(valid) {
		db.runQuery("DELETE FROM Setting WHERE settingID = ? AND userID = ?", [settingID, userID]);
		return "Done";
	} else {
		return "Unauthorized";
	}
}