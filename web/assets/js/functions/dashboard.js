async function populateDashboardBudget(recreate) {
	if(getActivePage().id === "dashboard-page") {
		if(recreate) {
			divDashboardBudgetList.innerHTML = `<div class="loading-icon"><div></div><div></div></div>`;
		}
		
		try {
			let budgetData = await fetchBudget();
			let transactionData = await fetchTransaction();

			if(empty(budgetData)) {
				await setDefaultBudgetData();
				budgetData = await fetchBudget();
			}

			if(divDashboardBudgetList.getElementsByTagName("canvas").length === 0) {
				divDashboardBudgetList.innerHTML = `
					<div class="chart-wrapper">
						<canvas class="pie-chart-canvas" id="pie-chart-canvas"></canvas>
					</div>
					<div class="stats-wrapper noselect">
						<div class="stats-container">
							<span class="title">Food</span>
							<div class="progress-container">
								<div class="background"></div>
								<div class="foreground food" id="stats-food"></div>
							</div>
							<span class="span-stats" id="span-stats-food">-</span>
						</div>
						<div class="stats-container">
							<span class="title">Housing</span>
							<div class="progress-container">
								<div class="background"></div>
								<div class="foreground housing" id="stats-housing"></div>
							</div>
							<span class="span-stats" id="span-stats-housing">-</span>
						</div>
						<div class="stats-container">
							<span class="title">Transport</span>
							<div class="progress-container">
								<div class="background"></div>
								<div class="foreground transport" id="stats-transport"></div>
							</div>
							<span class="span-stats" id="span-stats-transport">-</span>
						</div>
						<div class="stats-container">
							<span class="title">Entertainment</span>
							<div class="progress-container">
								<div class="background"></div>
								<div class="foreground entertainment" id="stats-entertainment"></div>
							</div>
							<span class="span-stats" id="span-stats-entertainment">-</span>
						</div>
						<div class="stats-container">
							<span class="title">Insurance</span>
							<div class="progress-container">
								<div class="background"></div>
								<div class="foreground insurance" id="stats-insurance"></div>
							</div>
							<span class="span-stats" id="span-stats-insurance">-</span>
						</div>
						<div class="stats-container">
							<span class="title">Savings</span>
							<div class="progress-container">
								<div class="background"></div>
								<div class="foreground savings" id="stats-savings"></div>
							</div>
							<span class="span-stats" id="span-stats-savings">-</span>
						</div>
						<div class="stats-container">
							<span class="title">Other</span>
							<div class="progress-container">
								<div class="background"></div>
								<div class="foreground other" id="stats-other"></div>
							</div>
							<span class="span-stats" id="span-stats-other">-</span>
						</div>
					</div>
				`;

				generatePieChart(budgetData);
				generateBudgetStats(budgetData, transactionData);
			}
		} catch(error) {
			console.log(error);
			errorNotification("Something went wrong...");
		}
	}
}

function generatePieChart(budgetData) {
	let canvas = document.getElementById("pie-chart-canvas");

	let currency = getCurrency();

	let mainContrast = cssValue(document.documentElement, "--main-contrast");

	let backgroundColors = [
		"rgb(254,137,112)",
		"rgb(157,255,149)",
		"rgb(200,172,165)",
		"rgb(255,195,127)",
		"rgb(119,254,229)",
		"rgb(119,194,253)",
		"rgb(182,137,251)",
	];

	let categories = budgetData.categories;
	let income = budgetData.income;

	let labels = [];
	let values = [];

	Object.keys(categories).map(category => {
		let percentage = categories[category];
		let amount = parseFloat((((percentage * income) / 100) / 12).toFixed(0));
		labels.push(`  ${capitalizeFirstLetter(category)}: ${currencySymbols[currency] + separateThousands(amount)}`);
		values.push(categories[category]);
	});

	new Chart(canvas, {
		type: "doughnut",
		data: {
			labels: labels,
			datasets: [{
				data: values,
				backgroundColor: backgroundColors,
				hoverOffset: 4,
				spacing: 4,
				borderWidth: 0,
				pointStyle: "circle"
			}]
		},
		options: {
			responsive: true,
			legend: {
				display: true,
				position: "right",
				labels: {
					fontColor: mainContrast,
					fontStyle: "bold",
					usePointStyle: true,
				},
			},
			tooltips: {
				callbacks: {
					title: function() {
						return "";
					},
					label: function(item) {
						return `${labels[item.index]} (${values[item.index]}%)`;
					}
				}
			}
		}
	});
}

function generateBudgetStats(budgetData, transactionData) {
	let spanStats = divDashboardBudgetList.getElementsByClassName("span-stats");
	let divStats = divDashboardBudgetList.getElementsByClassName("foreground");
	
	if(empty(transactionData)) {
		for(let i = 0; i < spanStats.length; i++) {
			spanStats[i].textContent = "0%";
			divStats[i].style.width = "0%";
		}

		return;
	}

	let parsed = parseTransactionData(transactionData);
}

function parseTransactionData(transactionData) {

}

async function listTransactions() {
	try {
		let transactions = await fetchTransaction() || {};

		divSideMenuTop.innerHTML = `<input type="text" id="input-search-transaction" placeholder="Search..." autocomplete="off"><button class="action-button" id="button-search-transaction">Search</button>`;
		divSideMenuBottom.innerHTML = `<button class="action-button" id="button-add-transaction">Add Transaction</button>`;
		
		addTransactionSearchEvent(document.getElementById("input-search-transaction"), document.getElementById("button-search-transaction"));
		addTransactionButtonEvent(document.getElementById("button-add-transaction"));

		if(empty(transactions)) {
			divSideMenuContainer.innerHTML = `<span class="list-text noselect">No Transactions Found</span>`;
			return;
		}

		let currency = getCurrency();

		divSideMenuContainer.innerHTML = "";

		transactions = sortTransactionDataByDate(transactions);

		let keys = Object.keys(transactions);
		keys.map(key => {
			let transaction = transactions[key];

			let div = document.createElement("div");
			div.setAttribute("class", `transaction-row noselect ${transaction.transactionCategory}`);

			div.innerHTML = `
				<div class="item">
					<span class="date">${transaction.transactionDate}</span>
				</div>
				<div class="item">
					<span class="category">${capitalizeFirstLetter(transaction.transactionCategory)}</span>
				</div>
				<div class="item">
					<span class="type ${transaction.transactionType}">${capitalizeFirstLetter(transaction.transactionType)} ${currencySymbols[currency] + separateThousands(transaction.transactionAmount)}</span>
				</div>
			`;
			
			if(!empty(transaction.transactionNotes) && transaction.transactionNotes !== "-") {
				div.innerHTML += `
					<div class="item">
						<span class="notes">${transaction.transactionNotes}</span>
					</div>
				`;
			}

			addTransactionListRowEvent(transaction, div);

			divSideMenuContainer.appendChild(div);
		});
	} catch(error) {
		console.log(error);
		errorNotification("Something went wrong...");
	}
}

function addTransactionListRowEvent(transaction, div) {
	try {
		div.addEventListener("click", () => {
			let html = `
				<input id="popup-input-amount" type="number" placeholder="Amount..." spellcheck="false" autocomplete="off" value="${transaction.transactionAmount}">
				<div class="popup-button-wrapper margin-bottom">
					<button id="popup-choice-earned" class="choice ${transaction.transactionType === "earned" ? "active" : ""}">Earned</button>
					<button id="popup-choice-spent" class="choice ${transaction.transactionType === "spent" ? "active" : ""}">Spent</button>
				</div>
				<input class="audible-pop" id="popup-input-category" type="text" placeholder="Category..." autocomplete="off" spellcheck="false" readonly value="${capitalizeFirstLetter(transaction.transactionCategory)}">
				<input id="popup-input-date" type="text" placeholder="Date..." autocomplete="off" spellcheck="false" value="${transaction.transactionDate}">
				<input id="popup-input-notes" type="text" placeholder="Notes..." autocomplete="off" value="${transaction.transactionNotes}">
				<button class="action-button delete" id="popup-button-delete-transaction">Delete Transaction</button>
			`;
	
			let popup = new Popup(300, "auto", "Update Transaction", html, { confirmText:"Add" });
			popup.show();
			popup.updateHeight();

			let popupInputAmount = document.getElementById("popup-input-amount");
			let popupChoiceEarned = document.getElementById("popup-choice-earned");
			let popupChoiceSpent = document.getElementById("popup-choice-spent");
			let popupInputCategory = document.getElementById("popup-input-category");
			let popupInputDate = document.getElementById("popup-input-date");
			let popupInputNotes = document.getElementById("popup-input-notes");

			popupChoiceEarned.addEventListener("click", () => {
				popupChoiceEarned.classList.add("active");
				popupChoiceSpent.classList.remove("active");
			});

			popupChoiceSpent.addEventListener("click", () => {
				popupChoiceEarned.classList.remove("active");
				popupChoiceSpent.classList.add("active");
			});

			addTransactionCategoryEvent(popup, popupInputCategory);

			addTransactionPopupDeleteEvent(popup, document.getElementById("popup-button-delete-transaction"), transaction.transactionID);
	
			popupInputAmount.focus();
	
			flatpickr(popupInputDate, {
				enableTime: true,
				dateFormat: "Y-m-d H:i",
				allowInput: true
			});
	
			popup.on("confirm", async () => {
				let userID = localStorage.getItem("userID");
				let token = localStorage.getItem("token");
				let key = localStorage.getItem("key");

				let data = parseTransactionPopupData(popupInputAmount, popupChoiceEarned, popupInputCategory, popupInputDate, popupInputNotes);

				if("error" in data) {
					errorNotification(data.error);
					return;
				}

				showLoading(5000, "Updating...");

				let encrypted = encryptObjectValues(key, data);

				await updateTransaction(token, userID, transaction.transactionID, encrypted.transactionType, encrypted.transactionDate, encrypted.transactionCategory, encrypted.transactionAmount, encrypted.transactionNotes);

				hideLoading();

				listTransactions();

				popup.hide();
			});
		});
	} catch(error) {
		console.log(error);
		errorNotification("Something went wrong...");
	}
}

function addTransactionPopupDeleteEvent(previousPopup, buttonDelete, transactionID) {
	buttonDelete.addEventListener("click", () => {
		previousPopup.hide();
		
		let userID = localStorage.getItem("userID");
		let token = localStorage.getItem("token");

		let popup = new Popup(300, "auto", "Delete Transaction", `<span>Are you sure you want to remove this transaction?</span>`);
		popup.show();
		popup.updateHeight();

		popup.on("confirm", async () => {
			try {
				showLoading(1500, "Deleting...");

				await deleteTransaction(token, userID, transactionID);

				listTransactions();

				hideLoading();

				popup.hide();
			} catch(error) {
				console.log(error);
				errorNotification("Couldn't delete transaction.");
			}
		});
	});
}

function sortTransactionDataByDate(transactionData) {
	let sorted = {};
	let array = [];

	for(let transaction in transactionData) {
		array.push([transaction, transactionData[transaction].transactionDate]);
	}

	array.sort(function(a, b) {
		return new Date(a[1]).getTime() - new Date(b[1]).getTime();
	});

	array.map(item => {
		sorted[item[0]] = transactionData[item[0]];
	});

	return sorted;
}

function addTransactionSearchEvent(input, button) {
	input.addEventListener("keydown", (event) => {
		if(divSideMenuContainer.childElementCount < 100 || empty(input.value)) {
			filterTransactionList(input.value);
		}

		if(event.key.toLowerCase() === "enter") {
			button.click();
		}
	});

	input.addEventListener("keyup", (event) => {
		if(divSideMenuContainer.childElementCount < 100 || empty(input.value)) {
			filterTransactionList(input.value);
		}

		if(event.key.toLowerCase() === "enter") {
			button.click();
		}
	});

	button.addEventListener("click", () => {
		filterTransactionList(input.value);
	});
}

function filterTransactionList(query) {
	let rows = divSideMenuContainer.getElementsByClassName("transaction-row");

	if(empty(query)) {
		for(let i = 0; i < rows.length; i++) {
			rows[i].classList.remove("hidden");
			rows[i].classList.remove("first-found");
			rows[i].removeAttribute("style");
		}

		return;
	}

	query = query.toLowerCase();

	let firstFound;

	for(let i = 0; i < rows.length; i++) {
		rows[i].removeAttribute("style");
		rows[i].classList.remove("first-found");

		let spans = rows[i].getElementsByTagName("span");
		let values = [];

		for(let j = 0; j < spans.length; j++) {
			values.push(spans[j].textContent.toLowerCase());
		}

		if(values.join(",").includes(query)) {
			if(empty(firstFound) && rows[i] !== rows[0] && divSideMenuContainer.getElementsByClassName("first-found").length === 0 && rows[0].classList.contains("hidden")) {
				firstFound = rows[i];
				rows[i].classList.add("first-found");
			}

			rows[i].classList.remove("hidden");
		} else {
			rows[i].classList.add("hidden");
		}
	}
}

function addTransactionButtonEvent(button) {
	button.addEventListener("click", () => {
		try {
			let html = `
				<input id="popup-input-amount" type="number" placeholder="Amount..." spellcheck="false" autocomplete="off">
				<div class="popup-button-wrapper margin-bottom">
					<button id="popup-choice-earned" class="choice active">Earned</button>
					<button id="popup-choice-spent" class="choice">Spent</button>
				</div>
				<input class="audible-pop" id="popup-input-category" type="text" placeholder="Category..." autocomplete="off" spellcheck="false" readonly>
				<input id="popup-input-date" type="text" placeholder="Date..." autocomplete="off" spellcheck="false">
				<input id="popup-input-notes" type="text" placeholder="Notes..." autocomplete="off">
			`;
	
			let popup = new Popup(300, "auto", "Add Transaction", html, { confirmText:"Add" });
			popup.show();
			popup.updateHeight();

			let popupInputAmount = document.getElementById("popup-input-amount");
			let popupChoiceEarned = document.getElementById("popup-choice-earned");
			let popupChoiceSpent = document.getElementById("popup-choice-spent");
			let popupInputCategory = document.getElementById("popup-input-category");
			let popupInputDate = document.getElementById("popup-input-date");
			let popupInputNotes = document.getElementById("popup-input-notes");

			popupChoiceEarned.addEventListener("click", () => {
				popupChoiceEarned.classList.add("active");
				popupChoiceSpent.classList.remove("active");
			});

			popupChoiceSpent.addEventListener("click", () => {
				popupChoiceEarned.classList.remove("active");
				popupChoiceSpent.classList.add("active");
			});

			addTransactionCategoryEvent(popup, popupInputCategory);
	
			popupInputAmount.focus();
	
			flatpickr(popupInputDate, {
				enableTime: true,
				dateFormat: "Y-m-d H:i",
				allowInput: true
			});
	
			popup.on("confirm", async () => {
				let userID = localStorage.getItem("userID");
				let token = localStorage.getItem("token");
				let key = localStorage.getItem("key");

				let data = parseTransactionPopupData(popupInputAmount, popupChoiceEarned, popupInputCategory, popupInputDate, popupInputNotes);

				if("error" in data) {
					errorNotification(data.error);
					return;
				}

				showLoading(5000, "Adding...");

				let encrypted = encryptObjectValues(key, data);

				await createTransaction(token, userID, encrypted.transactionType, encrypted.transactionDate, encrypted.transactionCategory, encrypted.transactionAmount, encrypted.transactionNotes);

				hideLoading();

				listTransactions();

				popup.hide();
			});
		} catch(error) {
			console.log(error);
			errorNotification("Something went wrong...");
		}
	});
}

function parseTransactionPopupData(popupInputAmount, popupChoiceEarned, popupInputCategory, popupInputDate, popupInputNotes) {
	try {
		let amount = popupInputAmount.value;
		let type = popupChoiceEarned.classList.contains("active") ? "earned" : "spent";
		let category = popupInputCategory.value;
		let date = popupInputDate.value;
		let notes = popupInputNotes.value;

		if(empty(amount) || isNaN(amount) || parseFloat(amount) <= 0) {
			return { error:"Amount must be a number, and greater than zero." };
		}

		if(empty(category) || !Object.keys(defaultBudgetData.categories).includes(category.toLowerCase())) {
			return { error:"Invalid category." };
		}

		try {
			new Date(Date.parse(date));
		} catch(error) {
			return { error:"Invalid date." };
		}

		if(empty(notes)) {
			notes = "-";
		}

		return { transactionAmount:amount, transactionType:type, transactionCategory:category.toLowerCase(), transactionDate:date, transactionNotes:notes };
	} catch(error) {
		console.log(error);
		return { error:"Invalid data." };
	}
}

function addTransactionCategoryEvent(previousPopup, input) {
	input.addEventListener("focus", () => {
		input.click();
	});

	input.addEventListener("click", () => {
		previousPopup.element.classList.add("hidden");

		let html = `
			<div class="popup-button-wrapper no-margin-top">
				<button class="popup-choice" data-value="Food">Food</button>
				<button class="popup-choice" data-value="Housing">Housing</button>
			</div>
			<div class="popup-button-wrapper">
				<button class="popup-choice" data-value="Transport">Transport</button>
				<button class="popup-choice" data-value="Entertainment">Entertainment</button>
			</div>
			<div class="popup-button-wrapper">
				<button class="popup-choice" data-value="Insurance">Insurance</button>
				<button class="popup-choice" data-value="Savings">Savings</button>
			</div>
			<div class="popup-button-wrapper">
				<button class="popup-choice" data-value="Other">Other</button>
			</div>
		`;
	
		let popup = new Popup(360, "auto", "Transaction Category", html, { confirmText:"-", cancelText:"Back" });
		popup.show();
		popup.updateHeight();

		let choices = popup.bottom.getElementsByClassName("popup-choice");
		
		for(let i = 0; i < choices.length; i++) {
			choices[i].addEventListener("click", () => {
				popup.hide();
				input.value = choices[i].getAttribute("data-value");
				previousPopup.element.classList.remove("hidden");
			});
		}

		popup.on("close", () => {
			popup.hide();
			previousPopup.element.classList.remove("hidden");
		});

		popup.on("cancel", () => {
			popup.hide();
			previousPopup.element.classList.remove("hidden");
		});
	});
}

async function populateDashboardWatchlist(recreate) {
	if(getActivePage().id === "dashboard-page") {
		if(recreate) {
			divDashboardWatchlistList.innerHTML = `<div class="loading-icon"><div></div><div></div></div>`;
		}
		
		try {
			let watchlistData = await fetchWatchlist();

			if(empty(watchlistData)) {
				divDashboardWatchlistList.innerHTML = `<span class="list-text noselect">No Assets In Watchlist</span>`;
				return;
			}

			let currency = getCurrency();

			let filteredWatchlist = filterWatchlistByType(watchlistData);

			let watchlistCryptoIDs = getWatchlistIDs(filteredWatchlist.crypto);
			let watchlistStockSymbols = getWatchlistSymbols(filteredWatchlist.stocks);

			let marketCryptoData = !empty(watchlistCryptoIDs) ? await cryptoAPI.getMarketByID(currency, watchlistCryptoIDs.join(",")) : {};

			let marketStocksData = !empty(watchlistStockSymbols) ? await fetchStockPrice(currency, watchlistStockSymbols, false) : {};
			if("error" in marketStocksData) {
				marketStocksData = {};
				watchlistStockSymbols = [];
				filteredWatchlist.stocks = {};
			}

			let rows = createWatchlistListRows(marketCryptoData, marketStocksData, watchlistData);

			if(divDashboardWatchlistList.getElementsByClassName("loading-icon").length > 0 || divDashboardWatchlistList.childElementCount !== rows.length) {
				divDashboardWatchlistList.innerHTML = "";
			}

			for(let i = 0; i < rows.length; i++) {
				if(divDashboardWatchlistList.childElementCount >= i + 1) {
					let current = divDashboardWatchlistList.getElementsByClassName("watchlist-list-row")[i];
					if(current.innerHTML !== rows[i].innerHTML) {
						let currentInfo = current.getElementsByClassName("info-wrapper")[0];

						if(currentInfo.innerHTML !== rows[i].getElementsByClassName("info-wrapper")[0].innerHTML) {
							currentInfo.innerHTML = rows[i].getElementsByClassName("info-wrapper")[0].innerHTML;
						}
					}
				} else {
					divDashboardWatchlistList.appendChild(rows[i]);
				}
			}
		} catch(error) {
			console.log(error);
			errorNotification("Something went wrong...");
		}
	}
}

function createWatchlistListRows(marketCryptoData, marketStocksData, watchlistData) {
	let currency = getCurrency();

	let rows = [];

	let ids = Object.keys(watchlistData);

	marketCryptoData = sortMarketDataByCoinID(marketCryptoData);

	for(let i = 0; i < ids.length; i++) {
		try {
			let id = ids[i];
			
			let asset = watchlistData[id];

			if(asset.assetType === "crypto") {
				let coin = marketCryptoData[asset.assetID];

				let coinID = coin.id;
				let price = coin.current_price;
				let priceChangeDay = formatPercentage(coin.market_cap_change_percentage_24h);
				let name = coin.name;
				let symbol = coin.symbol;
				let marketCap = coin.market_cap;
				let volume = coin.total_volume;
				let rank = coin.market_cap_rank || "-";

				let div = document.createElement("div");
				div.id = "watchlist-list-crypto-" + coinID;
				div.setAttribute("class", "watchlist-list-row crypto noselect audible-pop");

				div.innerHTML = `
					<div class="info-wrapper audible-pop">
						<span class="name">${name}</span>
						<div class="rank-container audible-pop">
							<span class="rank">#${rank}</span>
							<span class="symbol">${symbol.toUpperCase()}</span>
						</div>
						<div class="info-container">
							<div class="top audible-pop">
								<span class="price">Price: ${currencySymbols[currency] + separateThousands(price)}</span>
								<span class="market-cap">Market Cap: ${currencySymbols[currency] + abbreviateNumber(marketCap, 2)}</span>
							</div>
							<div class="bottom audible-pop">
								<span class="volume">Volume: ${currencySymbols[currency] + abbreviateNumber(volume, 2)}</span>
								<span class="price-change">24h Change: ${priceChangeDay}%</span>
							</div>
						</div>
					</div>
				`;

				addWatchlistRowEvent(div, asset.watchlistID);

				rows.push(div);
			} else {
				let symbol = asset.assetSymbol.toUpperCase();

				let stock = marketStocksData[symbol].priceData;

				let shortName = stock.shortName;
				let price = stock.price;
				let marketCap = stock.marketCap;
				let volume = stock.volume;
				let priceChangeDay = formatPercentage(stock.change);

				let div = document.createElement("div");
				div.id = "watchlist-list-stock-" + symbol;
				div.setAttribute("class", "watchlist-list-row stock noselect audible-pop");

				div.innerHTML = `
					<div class="info-wrapper audible-pop">
						<span class="name">${shortName}</span>
						<div class="rank-container audible-pop">
							<span class="rank">-</span>
							<span class="symbol">${symbol.toUpperCase()}</span>
						</div>
						<div class="info-container">
							<div class="top audible-pop">
								<span class="price">Price: ${currencySymbols[currency] + separateThousands(price)}</span>
								<span class="market-cap">Market Cap: ${currencySymbols[currency] + abbreviateNumber(marketCap, 2)}</span>
							</div>
							<div class="bottom audible-pop">
								<span class="volume">Volume: ${currencySymbols[currency] + abbreviateNumber(volume, 2)}</span>
								<span class="price-change">24h Change: ${priceChangeDay}%</span>
							</div>
						</div>
					</div>
				`;

				addWatchlistRowEvent(div, asset.watchlistID);

				rows.push(div);
			}
		} catch(error) {
			console.log(error);
		}
	}

	return rows;
}

function addWatchlistRowEvent(div, watchlistID) {
	div.addEventListener("click", () => {
		let userID = localStorage.getItem("userID");
		let token = localStorage.getItem("token");

		let popup = new Popup(300, "auto", "Delete Asset", `<span>Are you sure you want to remove this asset from your watchlist?</span>`);
		popup.show();
		popup.updateHeight();

		popup.on("confirm", async () => {
			try {
				showLoading(1500, "Deleting...");

				await deleteWatchlist(token, userID, watchlistID);

				populateDashboardWatchlist(true);

				hideLoading();

				popup.hide();
			} catch(error) {
				console.log(error);
				errorNotification("Couldn't delete asset.");
			}
		});
	});
}

function getWatchlistIDs(watchlist) {
	let ids = [];

	Object.keys(watchlist).map(id => {
		ids.push(watchlist[id].assetID);
	});

	return ids;
}

function getWatchlistSymbols(watchlist) {
	let symbols = [];

	Object.keys(watchlist).map(id => {
		symbols.push(watchlist[id].assetSymbol);
	});

	return symbols;
}

function filterWatchlistByType(watchlistData) {
	let watchlistCrypto = {};
	let watchlistStocks = {};

	let ids = Object.keys(watchlistData);
	ids.map(id => {
		let asset = watchlistData[id];
		if(asset.assetType === "crypto") {
			watchlistCrypto[id] = asset;
		} else {
			watchlistStocks[id] = asset;
		}
	});

	return { crypto:watchlistCrypto, stocks:watchlistStocks };
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

function fetchBudget() {
	return new Promise(async (resolve, reject) => {
		try {
			let userID = localStorage.getItem("userID");
			let token = localStorage.getItem("token");
			let key = localStorage.getItem("key");

			let budget = await readBudget(token, userID);

			if(empty(budget?.data?.readBudget)) {
				resolve({});
				return;
			}
	
			let encrypted = budget?.data?.readBudget?.budgetData;

			if(empty(encrypted)) {
				resolve({});
				return;
			}

			let budgetData = CryptoFN.decryptAES(encrypted, key);

			if(!validJSON(budgetData)) {
				resolve({});
				return;
			}

			resolve(JSON.parse(budgetData));
		} catch(error) {
			console.log(error);
			reject(error);
		}
	});
}

function fetchTransaction() {
	return new Promise(async (resolve, reject) => {
		try {
			let userID = localStorage.getItem("userID");
			let token = localStorage.getItem("token");
			let key = localStorage.getItem("key");

			let transaction = await readTransaction(token, userID);

			if(empty(transaction?.data?.readTransaction)) {
				resolve({});
				return;
			}
	
			let transactionData = {};
	
			let encrypted = transaction?.data?.readTransaction;
	
			Object.keys(encrypted).map(index => {
				let decrypted = decryptObjectValues(key, encrypted[index]);
				decrypted.transactionID = encrypted[index].transactionID;
				transactionData[decrypted.transactionID] = decrypted;
			});

			resolve(transactionData);
		} catch(error) {
			console.log(error);
			reject(error);
		}
	});
}

function setDefaultBudgetData() {
	return new Promise(async (resolve, reject) => {
		try {
			let userID = localStorage.getItem("userID");
			let token = localStorage.getItem("token");
			let key = localStorage.getItem("key");

			let encrypted = CryptoFN.encryptAES(JSON.stringify(defaultBudgetData), key);

			await updateBudget(token, userID, encrypted);

			resolve();
		} catch(error) {
			console.log(error);
			reject(error);
		}
	});
}