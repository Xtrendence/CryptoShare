import bcrypt from "bcryptjs";
import User from "../../models/User";
import DB from "../../utils/DB";
import Utils from "../../utils/Utils";
// @ts-ignore
import CryptoFN from "../../utils/CryptoFN";

const db = new DB();

// Checks if a user with a given username exists.
export function userExists({ username }: any) {
	return new Promise(async (resolve, reject) => {
		try {
			let settings = await Utils.getAdminSettings();

			if(settings.userRegistration === "enabled") {
				db.db?.get("SELECT * FROM User WHERE username = ? COLLATE NOCASE", [username], (error, row) => {
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
			} else {
				resolve(`User registration has been disabled by the admin.`);
			}
		} catch(error) {
			console.log(error);
			reject(`!${error}!`);
		}
	});
}

// Creates a user.
export async function createUser({ username, password, key }: any) {
	try {
		let settings = await Utils.getAdminSettings();

		if(settings.userRegistration === "enabled") {
			return userExists({ username:username }).then(async (result) => {
				if(result === "Not found.") {
					if(Utils.validUsername(username) && Utils.xssValid(username)) {
						let keys: any = await Utils.checkKeys();
						let decryptedPassword = await CryptoFN.decryptRSA(password, keys.privateKey);
						let hashedPassword = bcrypt.hashSync(decryptedPassword, 10);
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
		} else {
			return "User registration has been disabled by the admin.";
		}
	} catch(error) {
		return error;
	}
}

// Returns the details of a user.
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

// Updates a user's encryption key.
export async function updateUser({ token, userID, key }: any) {
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

// Deletes a user (and all their data).
export async function deleteUser({ token, userID }: any) {
	try {
		let valid = await Utils.verifyToken(userID, token);

		if(valid) {
			db.runQuery("DELETE FROM User WHERE userID = ?", [userID]);

			db.runQuery("DELETE FROM Activity WHERE userID = ?", [userID]);
			db.runQuery("DELETE FROM Budget WHERE userID = ?", [userID]);
			db.runQuery("DELETE FROM Holding WHERE userID = ?", [userID]);
			db.runQuery("DELETE FROM Login WHERE userID = ?", [userID]);
			db.runQuery("DELETE FROM Message WHERE userID = ?", [userID]);
			db.runQuery("DELETE FROM Setting WHERE userID = ?", [userID]);
			db.runQuery("DELETE FROM Transaction WHERE userID = ?", [userID]);
			db.runQuery("DELETE FROM Watchlist WHERE userID = ?", [userID]);
			
			return "Done";
		} else {
			return "Unauthorized";
		}
	} catch(error) {
		console.log(error);
		return error;
	}
}