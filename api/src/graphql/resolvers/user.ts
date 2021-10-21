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

export function readUser({ token, username }: any) {
	return new Promise((resolve, reject) => {
		let valid = utils.verifyToken(token);

		if(valid) {
			db.db?.get("SELECT * FROM User WHERE username = ?", [username], (error, row) => {
				if(error) {
					console.log(error);
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

export function updateUser({ token, username, password, key }: any) {
	let valid = utils.verifyToken(token);

	if(valid) {
		let hashedPassword = bcrypt.hashSync(password, 10);
		db.runQuery("UPDATE User SET password = ?, key = ? WHERE username = ?", [hashedPassword, key, username]);
		return "Done";
	} else {
		return "Unauthorized";
	}
}

export function deleteUser({ token, username }: any) {
	let valid = utils.verifyToken(token);

	if(valid) {
		db.runQuery("DELETE FROM User WHERE username = ?", [username]);
		return "Done";
	} else {
		return "Unauthorized";
	}
}