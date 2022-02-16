function populateDashboardBudget(recreate) {
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

function populateDashboardWatchlist(recreate) {
	if(getActivePage().id === "dashboard-page") {
		if(recreate) {
			divDashboardWatchlistList.innerHTML = `<div class="loading-icon"><div></div><div></div></div>`;
		}
		
		try {

		} catch(error) {
			console.log(error);
			errorNotification("Something went wrong...");
		}
	}
}