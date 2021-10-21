import path from "path";
import bcrypt from "bcrypt";
import Utils from "../../utils/Utils";
import DB from "../../utils/DB";
import User from "../../models/User";

const utils = new Utils();
const db = new DB();

export function createUser(user: User) {
	let hashedPassword = bcrypt.hashSync(user.password, 10);
	db.runQuery("INSERT INTO User (username, password, key) VALUES (?, ?, ?)", [user.username, hashedPassword, user.key]);
}

export async function readUser({ token, userID }: any) {
	return new Promise(async (resolve, reject) => {
		let valid = await utils.verifyToken(userID, token);

		if(valid) {
			db.db?.get("SELECT * FROM User WHERE userID = ?", [userID], (error, row) => {
				if(error) {
					console.log(error);
					reject();
				} else {
					if(row === undefined) {
						reject("!User Not Found!");
						return;
					}

					let user = new User(row.username, row.password, row.key);
					user.userID = row.userID;
					resolve(user);
				}
			});
		} else {
			reject("!Unauthorized!");
		}
	});
}

export async function updateUser({ token, userID, password, key }: any) {
	let valid = await utils.verifyToken(userID, token);

	if(valid) {
		let hashedPassword = bcrypt.hashSync(password, 10);
		db.runQuery("UPDATE User SET password = ?, key = ? WHERE userID = ?", [hashedPassword, key, userID]);
		return "Done";
	} else {
		return "Unauthorized";
	}
}

export async function deleteUser({ token, userID }: any) {
	let valid = await utils.verifyToken(userID, token);

	if(valid) {
		db.runQuery("DELETE FROM User WHERE userID = ?", [userID]);
		return "Done";
	} else {
		return "Unauthorized";
	}
}