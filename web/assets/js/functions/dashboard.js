async function populateDashboardBudget(recreate) {
	if(getActivePage().id === "dashboard-page") {
		if(recreate) {
			divDashboardBudgetList.innerHTML = `<div class="loading-icon"><div></div><div></div></div>`;
		}
		
		try {

		} catch(error) {
			console.log(error);
			errorNotification("Something went wrong...");
		}
	}
}

async function populateDashboardWatchlist(recreate) {
	if(getActivePage().id === "dashboard-page") {
		if(recreate) {
			divDashboardWatchlistList.innerHTML = `<div class="loading-icon"><div></div><div></div></div>`;
		}
		
		try {
			let watchlist = await fetchWatchlist();

			if(empty(watchlist)) {
				divDashboardWatchlistList.innerHTML = `<span class="list-text noselect">No Assets In Watchlist</span>`;
				return;
			}


		} catch(error) {
			console.log(error);
			errorNotification("Something went wrong...");
		}
	}
}

function watchlistExists(watchlist, id) {
	let exists = false;

	Object.keys(watchlist).map(index => {
		let asset = watchlist[index];
		if(asset?.assetID === id) {
			exists = true;
		}
	});

	return exists;
}

function fetchWatchlist() {
	return new Promise(async (resolve, reject) => {
		try {
			let userID = localStorage.getItem("userID");
			let token = localStorage.getItem("token");
			let key = localStorage.getItem("key");

			let watchlist = await readWatchlist(token, userID);

			if(empty(watchlist?.data?.readWatchlist)) {
				resolve();
				return;
			}

			let watchlistData = {};
	
			let encrypted = watchlist?.data?.readWatchlist;
	
			Object.keys(encrypted).map(index => {
				let decrypted = decryptObjectValues(key, encrypted[index]);
				decrypted.watchlistID = encrypted[index].watchlistID;
				watchlistData[decrypted.watchlistID] = decrypted;
			});

			resolve(watchlistData);
		} catch(error) {
			console.log(error);
			reject(error);
		}
	});
}