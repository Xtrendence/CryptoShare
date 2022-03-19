import Transaction from "../../models/Transaction";
import DB from "../../utils/DB";
import Utils from "../../utils/Utils";

const db = new DB();

// Creates a transaction.
export async function createTransaction({ token, userID, transactionType, transactionDate, transactionCategory, transactionAmount, transactionNotes }: any) {
	try {
		let valid = await Utils.verifyToken(userID, token);

		if(valid) {
			let txID = await Utils.generateToken();
			let transactionID = `tx-${userID.toString()}-${txID}`;

			db.runQuery("INSERT INTO [Transaction] (transactionID, userID, transactionType, transactionDate, transactionCategory, transactionAmount, transactionNotes) VALUES (?, ?, ?, ?, ?, ?, ?)", [transactionID, userID, transactionType, transactionDate, transactionCategory, transactionAmount, transactionNotes]);
			return "Done";
		} else {
			return "Unauthorized";
		}
	} catch(error) {
		console.log(error);
		return error;
	}
}

// Returns the transactions of a user.
export async function readTransaction({ token, userID }: any) {
	return new Promise(async (resolve, reject) => {
		try {
			let valid = await Utils.verifyToken(userID, token);

			if(valid) {
				db.db?.all("SELECT * FROM [Transaction] WHERE userID = ?", [userID], (error, rows) => {
					if(error) {
						console.log(error);
						reject();
					} else {
						if(rows === undefined) {
							reject("!Transactions not found.!");
							return;
						}

						let transactions: Array<Transaction> = [];

						rows.map(row => {
							let transaction = new Transaction(userID, row.transactionType, row.transactionDate, row.transactionCategory, row.transactionAmount, row.transactionNotes);
							transaction.transactionID = row.transactionID;
							transactions.push(transaction);
						});
						
						resolve(transactions);
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

// Updates a transaction.
export async function updateTransaction({ token, userID, transactionID, transactionType, transactionDate, transactionCategory, transactionAmount, transactionNotes }: any) {
	try {
		let valid = await Utils.verifyToken(userID, token);

		if(valid) {
			db.runQuery("UPDATE [Transaction] SET transactionType = ?, transactionDate = ?, transactionCategory = ?, transactionAmount = ?, transactionNotes = ? WHERE transactionID = ? AND userID = ?", [transactionType, transactionDate, transactionCategory, transactionAmount, transactionNotes, transactionID, userID]);
			return "Done";
		} else {
			return "Unauthorized";
		}
	} catch(error) {
		console.log(error);
		return error;
	}
}

// Deletes a transaction.
export async function deleteTransaction({ token, userID, transactionID }: any) {
	try {
		let valid = await Utils.verifyToken(userID, token);

		if(valid) {
			db.runQuery("DELETE FROM [Transaction] WHERE transactionID = ? AND userID = ?", [transactionID, userID]);
			return "Done";
		} else {
			return "Unauthorized";
		}
	} catch(error) {
		console.log(error);
		return error;
	}
}

// Deletes all transactions belonging to a user.
export async function deleteTransactionAll({ token, userID }: any) {
	try {
		let valid = await Utils.verifyToken(userID, token);

		if(valid) {
			db.runQuery("DELETE FROM [Transaction] WHERE userID = ?", [userID]);
			return "Done";
		} else {
			return "Unauthorized";
		}
	} catch(error) {
		console.log(error);
		return error;
	}
}