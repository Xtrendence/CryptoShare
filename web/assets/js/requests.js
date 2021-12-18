function userExists(username) {
	return new Promise((resolve, reject) => {
		let xhr = new XMLHttpRequest();

		let query = {
			query: `{ 
				userExists(username: "${username}") 
			}`
		};

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
					reject("Invalid JSON.");
				}
			}
		});

		xhr.addEventListener("error", (error) => {
			reject(error);
		});

		xhr.open("POST", "http://localhost:3190/graphql", true);
		xhr.setRequestHeader("Content-Type", "application/json");
		xhr.send(JSON.stringify(query));
	});
}