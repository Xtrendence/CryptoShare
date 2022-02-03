import bcrypt from "bcrypt";
import User from "../../models/User";
import DB from "../../utils/DB";
import Utils from "../../utils/Utils";

const db = new DB();

export function userExists({ username }: any) {
	return new Promise(async (resolve, reject) => {
		try {
			db.db?.get("SELECT * FROM User WHERE username = ?", [username], (error, row) => {
				if(error) {
					console.log(error);
					reject();
				} else {
					if(row === undefined) {
						resolve("Not found.");
						return;
					}

					resolve(username);
				}
			});
		} catch(error) {
			console.log(error);
			reject(`!${error}!`);
		}
	});
}

export async function createUser({ username, password, key }: any) {
	return userExists({ username:username }).then((result) => {
		if(result === "Not found.") {
			if(Utils.validUsername(username) && Utils.xssValid(username)) {
				let hashedPassword = bcrypt.hashSync(password, 10);
				db.runQuery("INSERT INTO User (username, password, key) VALUES (?, ?, ?)", [username, hashedPassword, key]);
				return "Done";
			} else {
				return "Invalid Username";
			}
		}

		return "User already exists.";
	}).catch(error => {
		return error;
	});
}

export async function readUser({ token, userID }: any) {
	return new Promise(async (resolve, reject) => {
		try {
			let valid = await Utils.verifyToken(userID, token);

			if(valid) {
				db.db?.get("SELECT * FROM User WHERE userID = ?", [userID], (error, row) => {
					if(error) {
						console.log(error);
						reject();
					} else {
						if(row === undefined) {
							reject("!User not found.!");
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
		} catch(error) {
			console.log(error);
			reject(`!${error}!`);
		}
	});
}

export async function updateUser({ token, userID, password, key }: any) {
	try {
		let valid = await Utils.verifyToken(userID, token);

		if(valid) {
			db.runQuery("UPDATE User SET key = ? WHERE userID = ?", [key, userID]);
			return "Done";
		} else {
			return "Unauthorized";
		}
	} catch(error) {
		console.log(error);
		return error;
	}
}

export async function deleteUser({ token, userID }: any) {
	try {
		let valid = await Utils.verifyToken(userID, token);

		if(valid) {
			db.runQuery("DELETE FROM User WHERE userID = ?", [userID]);
			return "Done";
		} else {
			return "Unauthorized";
		}
	} catch(error) {
		console.log(error);
		return error;
	}
}