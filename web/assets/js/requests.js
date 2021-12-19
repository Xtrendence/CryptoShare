let urlAPI = "http://localhost:3190/graphql";

function userExists(username) {
	let query = {
		query: `{ 
			userExists(username: "${username}") 
		}`
	};

	return request("POST", urlAPI, query);
}

function createAccount(username, password) {
	
}

function login(username, password) {
	let body = {
		username: username,
		password: password
	};

	return request("POST", urlAPI.replace("graphql", "login"), body);
}

function verifyToken(userID, token) {
	let body = {
		userID: userID,
		token: token
	};

	return request("POST", urlAPI.replace("graphql", "verifyToken"), body);
}

function request(method, url, body) {
	return new Promise((resolve, reject) => {
		let xhr = new XMLHttpRequest();

		xhr.addEventListener("readystatechange", () => {
			if(xhr.readyState === xhr.DONE) {
				if(validJSON(xhr.responseText)) {
					let response = JSON.parse(xhr.responseText);

					if("errors" in response) {
						resolve(false);
					} else {
						resolve(true);
					}
				} else {
					if(empty(xhr.responseText)) {
						reject("Server Error.");
					} else {
						reject("Invalid JSON.");
					}
				}
			}
		});

		xhr.addEventListener("error", (error) => {
			reject(error);
		});

		xhr.open(method, url, true);
		xhr.setRequestHeader("Content-Type", "application/json");
		xhr.send(JSON.stringify(body));
	});
}