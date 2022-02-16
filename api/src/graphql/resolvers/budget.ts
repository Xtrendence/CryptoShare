import Budget from "../../models/Budget";
import DB from "../../utils/DB";
import Utils from "../../utils/Utils";

const db = new DB();

export async function createBudget({ token, userID, budgetData }: any) {
	try {
		let valid = await Utils.verifyToken(userID, token);

		if(valid) {
			db.runQuery("INSERT INTO Budget (userID, budgetData) VALUES (?, ?)", [userID, budgetData]);
			return "Done";
		} else {
			return "Unauthorized";
		}
	} catch(error) {
		console.log(error);
		return error;
	}
}

export async function readBudget({ token, userID }: any) {
	return new Promise(async (resolve, reject) => {
		try {
			let valid = await Utils.verifyToken(userID, token);

			if(valid) {
				db.db?.get("SELECT * FROM Budget WHERE userID = ?", [userID], (error, row) => {
					if(error) {
						console.log(error);
						reject();
					} else {
						if(row === undefined) {
							reject("!Budget not found.!");
							return;
						}

						let budget = new Budget(userID, row.budgetData);
						budget.budgetID = row.budgetID;
						resolve(budget);
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

export async function updateBudget({ token, userID, budgetData }: any) {
	try {
		let valid = await Utils.verifyToken(userID, token);

		if(valid) {
			db.runQuery("UPDATE Budget SET budgetData = ? WHERE userID = ?", [budgetData, userID]);
			return "Done";
		} else {
			return "Unauthorized";
		}
	} catch(error) {
		console.log(error);
		return error;
	}
}

export async function deleteBudget({ token, userID }: any) {
	try {
		let valid = await Utils.verifyToken(userID, token);

		if(valid) {
			db.runQuery("DELETE FROM Budget WHERE userID = ?", [userID]);
			return "Done";
		} else {
			return "Unauthorized";
		}
	} catch(error) {
		console.log(error);
		return error;
	}
}