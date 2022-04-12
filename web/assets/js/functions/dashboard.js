// Populate dashboard budget list.
async function populateDashboardBudget(recreate) {
	if(getActivePage().id === "dashboard-page") {
		if(recreate) {
			tippyInstances.budgetStats = {};
			divDashboardBudgetList.innerHTML = `<div class="loading-icon"><div></div><div></div></div>`;
		}
		
		try {
			let budgetData = await fetchBudget();
			let transactionData = await fetchTransaction();

			if(empty(budgetData)) {
				await setDefaultBudgetData();
				budgetData = await fetchBudget();
			}

			let currentDate = new Date();
			let currentMonth = currentDate.getMonth();
			let currentYear = currentDate.getFullYear();

			if(empty(divDashboardBudgetList.getAttribute("data-month"))) {
				divDashboardBudgetList.setAttribute("data-month", currentMonth);
			} else {
				currentMonth = parseFloat(divDashboardBudgetList.getAttribute("data-month"));
			}

			if(empty(divDashboardBudgetList.getAttribute("data-year"))) {
				divDashboardBudgetList.setAttribute("data-year", currentYear);
			} else {
				currentYear = parseFloat(divDashboardBudgetList.getAttribute("data-year"));
			}

			if(document.getElementById("button-budget-month")) {
				document.getElementById("button-budget-month").textContent = monthNames[currentMonth];
			}

			if(document.getElementById("button-budget-year")) {
				document.getElementById("button-budget-year").textContent = currentYear;
			}

			if(divDashboardBudgetList.getElementsByTagName("canvas").length === 0) {
				divDashboardBudgetList.innerHTML = `
					<div class="chart-wrapper">
						<canvas class="pie-chart-canvas" id="pie-chart-canvas"></canvas>
					</div>
					<div class="stats-wrapper noselect">
						<span class="header">Used Budget</span>
						<div class="date-wrapper">
							<button class="date month" id="button-budget-month">${monthNames[currentMonth]}</button>
							<button class="date year" id="button-budget-year">${currentYear}</button>
						</div>
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
					<div class="income-wrapper noselect">
						<span id="span-income"></span>
					</div>
				`;

				generatePieChart(budgetData);
			}
			
			generateBudgetStats(budgetData, transactionData, recreate);

			checkHoldingsOnDashboard();
		} catch(error) {
			console.log(error);
			errorNotification("Something went wrong... - EW47");
		}
	}
}

// Populate dashboard watchlist.
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

			let currency = await getCurrency();

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

			let rows = await createWatchlistListRows(marketCryptoData, marketStocksData, watchlistData);

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
			errorNotification("Something went wrong... - EW48");
		}
	}
}

// Generate budget pie chart.
async function generatePieChart(budgetData) {
	let canvas = document.getElementById("pie-chart-canvas");

	let currency = await getCurrency();

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
				onClick: (event) => event.stopPropagation(),
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

// Generate budget stats, which show progress bars to indicate how much money the user has spent each month on each budget category.
async function generateBudgetStats(budgetData, transactionData, recreate) {
	let spanIncome = document.getElementById("span-income");
	let spanStats = divDashboardBudgetList.getElementsByClassName("span-stats");
	let divStats = divDashboardBudgetList.getElementsByClassName("foreground");
	
	for(let i = 0; i < spanStats.length; i++) {
		spanStats[i].textContent = "0%";
		divStats[i].style.width = "0%";
	}

	let currency = await getCurrency();

	let buttonMonth = document.getElementById("button-budget-month");
	let buttonYear = document.getElementById("button-budget-year");

	if(recreate) {
		addBudgetDateEvents(buttonMonth, buttonYear);
	}

	let monthName = buttonMonth.textContent;
	let month = monthNames.indexOf(monthName);
	let year = buttonYear.textContent;

	transactionData = filterTransactionsByMonth(transactionData, month, year);

	let parsed = parseTransactionData(transactionData);

	let budgetAmounts = {};
	
	let categories = budgetData.categories;
	let income = budgetData.income;
	let earned = parsed.earned;

	if(earned > 0) {
		spanIncome.textContent = `Based on your transactions, aside from your income of ${currencySymbols[currency] + separateThousands(parseFloat((income / 12).toFixed(0)))}, you earned an additional ${currencySymbols[currency] + separateThousands(earned)} this month.`;
	} else {
		spanIncome.textContent = `Based on your transactions, you didn't earn any additional money aside from your income of ${currencySymbols[currency] + separateThousands(parseFloat((income / 12).toFixed(0)))}.`;
	}

	Object.keys(categories).map(category => {
		let percentage = categories[category];
		let amount = parseFloat((((percentage * income) / 100) / 12).toFixed(0));
		let remaining = amount - parsed[category];
		let remainingPercentage = parseFloat(((remaining * 100) / amount).toFixed(0));
		let used = amount - remaining;
		let usedPercentage = 100 - remainingPercentage;

		if(usedPercentage > 100) {
			usedPercentage = 100;
		}
		
		budgetAmounts[category] = { budget:amount, remaining:remaining, remainingPercentage:remainingPercentage, usedPercentage:usedPercentage };

		let span = document.getElementById(`span-stats-${category}`);
		let div = document.getElementById(`stats-${category}`);

		span.textContent = `${usedPercentage}%`;
		div.style.width = `${usedPercentage}%`;

		if(span.id in tippyInstances.budgetStats) {
			tippyInstances.budgetStats[span.id].setContent(`Used: ${currencySymbols[currency] + separateThousands(used)}`);
			tippyInstances.budgetStats[div.id].setContent(`Used: ${currencySymbols[currency] + separateThousands(used)}`);
			tippyInstances.budgetStats[div.id + "-background"].setContent(`Remaining: ${currencySymbols[currency] + separateThousands(remaining)}`);
		} else {
			tippyInstances.budgetStats[span.id] = tippy(span, { content:`Used: ${currencySymbols[currency] + separateThousands(used)}`, placement:"bottom" });
			tippyInstances.budgetStats[div.id] = tippy(div, { content:`Used: ${currencySymbols[currency] + separateThousands(used)}`, placement:"bottom" });
			tippyInstances.budgetStats[div.id + "-background"] = tippy(div.parentElement.getElementsByClassName("background")[0], { content:`Remaining: ${currencySymbols[currency] + separateThousands(remaining)}`, placement:"right" });
		}
	});
}

// Add event listeners to date buttons (month and year).
function addBudgetDateEvents(buttonMonth, buttonYear) {
	buttonMonth.addEventListener("click", () => {
		let html = `
			<div class="popup-button-wrapper no-margin-top">
				<button class="popup-choice" data-value="January">January</button>
				<button class="popup-choice" data-value="February">February</button>
			</div>
			<div class="popup-button-wrapper">
				<button class="popup-choice" data-value="March">March</button>
				<button class="popup-choice" data-value="April">April</button>
			</div>
			<div class="popup-button-wrapper">
				<button class="popup-choice" data-value="May">May</button>
				<button class="popup-choice" data-value="June">June</button>
			</div>
			<div class="popup-button-wrapper">
				<button class="popup-choice" data-value="July">July</button>
				<button class="popup-choice" data-value="August">August</button>
			</div>
			<div class="popup-button-wrapper">
				<button class="popup-choice" data-value="September">September</button>
				<button class="popup-choice" data-value="October">October</button>
			</div>
			<div class="popup-button-wrapper">
				<button class="popup-choice" data-value="November">November</button>
				<button class="popup-choice" data-value="December">December</button>
			</div>
		`;

		let popup = new Popup(360, "auto", "Select Month", html, { confirmText:"-", cancelText:"Dismiss", page:"dashboard" });
		popup.show();
		popup.updateHeight();

		let choices = popup.bottom.getElementsByClassName("popup-choice");
		
		for(let i = 0; i < choices.length; i++) {
			choices[i].addEventListener("click", () => {
				popup.hide();
				buttonMonth.textContent = choices[i].textContent;
				divDashboardBudgetList.setAttribute("data-month", monthNames.indexOf(choices[i].textContent));
				populateDashboardBudget();
			});
		}
	});

	buttonYear.addEventListener("click", () => {
		let currentYear = new Date().getFullYear();
		let year1 = currentYear - 1;
		let year2 = currentYear - 2;
		let year3 = currentYear - 3;
		let year4 = currentYear - 4;
		let year5 = currentYear - 5;

		let html = `
			<div class="popup-button-wrapper no-margin-top">
				<button class="popup-choice" data-value="${currentYear}">${currentYear}</button>
				<button class="popup-choice" data-value="${year1}">${year1}</button>
			</div>
			<div class="popup-button-wrapper">
				<button class="popup-choice" data-value="${year2}">${year2}</button>
				<button class="popup-choice" data-value="${year3}">${year3}</button>
			</div>
			<div class="popup-button-wrapper">
				<button class="popup-choice" data-value="${year4}">${year4}</button>
				<button class="popup-choice" data-value="${year5}">${year5}</button>
			</div>
		`;

		let popup = new Popup(360, "auto", "Select Year", html, { confirmText:"-", cancelText:"Dismiss", page:"dashboard" });
		popup.show();
		popup.updateHeight();

		let choices = popup.bottom.getElementsByClassName("popup-choice");
		
		for(let i = 0; i < choices.length; i++) {
			choices[i].addEventListener("click", () => {
				popup.hide();
				buttonYear.textContent = choices[i].textContent;
				divDashboardBudgetList.setAttribute("data-year", choices[i].textContent);
				populateDashboardBudget();
			});
		}
	});
}

// Filter transactions by month.
function filterTransactionsByMonth(transactionData, month, year) {
	let filtered = {};

	Object.keys(transactionData).map(key => {
		try {
			let transaction = transactionData[key];

			let date = new Date(Date.parse(transaction.transactionDate));

			if(parseFloat(month) === date.getMonth() && parseFloat(year) === date.getFullYear()) {
				filtered[key] = transaction;
			}
		} catch(error) {
			console.log(error);
		}
	});

	return filtered;
}

// Calculate how much money the user has spent for each budget category.
function parseTransactionData(transactionData) {
	let categories = Object.keys(defaultBudgetData.categories);
	let parsed = {};

	parsed.earned = 0;

	categories.map(category => {
		parsed[category] = 0;
	});

	let keys = Object.keys(transactionData);
	
	keys.map(key => {
		let transaction = transactionData[key];

		try {
			let amount = parseFloat(transaction.transactionAmount);

			if(transaction.transactionType === "spent") {
				parsed[transaction.transactionCategory] += amount;
			} else {
				if(transaction.transactionCategory === "savings") {
					parsed[transaction.transactionCategory] += amount;
				} else {
					parsed.earned += amount;
				}
			}
		} catch(error) {
			console.log(error);
			errorNotification("Couldn't parse all transactions.");
		}
	});

	return parsed;
}

// Populate transaction list.
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
		
		let choices = await getSettingsChoices();

		let currency = await getCurrency();

		divSideMenuContainer.innerHTML = "";

		let sorted = sortTransactionDataByDate(transactions);

		transactions = sorted.sorted;

		let keys = sorted.sortedKeys;
		keys.map(key => {
			let transaction = transactions[key];

			let div = document.createElement("div");
			div.id = "transaction-list-" + transaction.transactionID;
			div.setAttribute("class", `transaction-row noselect ${transaction.transactionCategory}`);

			let date = choices?.dateFormat === "dd-mm-yyyy" ? formatDateHyphenatedHuman(new Date(Date.parse(transaction.transactionDate))) : formatDateHyphenated(new Date(Date.parse(transaction.transactionDate)));

			div.innerHTML = `
				<div class="item">
					<span class="date">${date}</span>
				</div>
				<div class="item">
					<span class="category">${capitalizeFirstLetter(transaction.transactionCategory)}</span>
				</div>
				<div class="item">
					<span class="type ${transaction.transactionType}">${transaction.transactionCategory === "savings" ? "Saved" : capitalizeFirstLetter(transaction.transactionType)} ${currencySymbols[currency] + separateThousands(transaction.transactionAmount)}</span>
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
		errorNotification("Something went wrong... - EW49");
	}
}

// Add event to each transaction row.
function addTransactionListRowEvent(transaction, div) {
	try {
		div.addEventListener("click", () => {
			let html = `
				<span class="popup-input-span">Amount</span>
				<input id="popup-input-amount" type="number" placeholder="Amount..." spellcheck="false" autocomplete="off" value="${transaction.transactionAmount}">
				<div class="popup-button-wrapper margin-bottom">
					<button id="popup-choice-earned" class="choice ${transaction.transactionType === "earned" ? "active" : ""}">Earned</button>
					<button id="popup-choice-spent" class="choice ${transaction.transactionType === "spent" ? "active" : ""}">Spent</button>
				</div>
				<span class="popup-input-span">Category</span>
				<input class="audible-pop" id="popup-input-category" type="text" placeholder="Category..." autocomplete="off" spellcheck="false" readonly value="${capitalizeFirstLetter(transaction.transactionCategory)}">
				<span class="popup-input-span">Date</span>
				<input id="popup-input-date" type="text" placeholder="Date..." autocomplete="off" spellcheck="false" value="${transaction.transactionDate}">
				<span class="popup-input-span">Notes</span>
				<input id="popup-input-notes" type="text" placeholder="Notes..." autocomplete="off" value="${transaction.transactionNotes}">
				<button class="action-button delete" id="popup-button-delete-transaction">Delete Transaction</button>
			`;
	
			let popup = new Popup(300, "auto", "Update Transaction", html, { confirmText:"Add", page:"dashboard" });
			popup.show();
			popup.updateHeight();

			let popupInputAmount = document.getElementById("popup-input-amount");
			let popupChoiceEarned = document.getElementById("popup-choice-earned");
			let popupChoiceSpent = document.getElementById("popup-choice-spent");
			let popupInputCategory = document.getElementById("popup-input-category");
			let popupInputDate = document.getElementById("popup-input-date");
			let popupInputNotes = document.getElementById("popup-input-notes");

			popupChoiceEarned.addEventListener("click", () => {
				popupInputCategory.value = "";
				popupChoiceEarned.classList.add("active");
				popupChoiceSpent.classList.remove("active");
			});

			popupChoiceSpent.addEventListener("click", () => {
				popupInputCategory.value = "";
				popupChoiceEarned.classList.remove("active");
				popupChoiceSpent.classList.add("active");
			});

			addTransactionCategoryEvent(popup, popupInputCategory);

			addTransactionPopupDeleteEvent(popup, document.getElementById("popup-button-delete-transaction"), transaction.transactionID);
	
			popupInputAmount.focus();
	
			flatpickr(popupInputDate, {
				enableTime: false,
				dateFormat: "Y-m-d",
				allowInput: true
			});
	
			popup.on("confirm", async () => {
				let userID = await appStorage.getItem("userID");
				let token = await appStorage.getItem("token");
				let key = await appStorage.getItem("key");

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

				populateDashboardBudget();

				popup.hide();
			});
		});
	} catch(error) {
		console.log(error);
		errorNotification("Something went wrong... - EW50");
	}
}

function addTransactionPopupDeleteEvent(previousPopup, buttonDelete, transactionID) {
	buttonDelete.addEventListener("click", async () => {
		previousPopup.hide();
		
		let userID = await appStorage.getItem("userID");
		let token = await appStorage.getItem("token");

		let popup = new Popup(300, "auto", "Delete Transaction", `<span>Are you sure you want to remove this transaction?</span>`, { page:"dashboard" });
		popup.show();
		popup.updateHeight();

		popup.on("confirm", async () => {
			try {
				showLoading(1500, "Deleting...");

				await deleteTransaction(token, userID, transactionID);

				listTransactions();

				populateDashboardBudget();

				hideLoading();

				popup.hide();
			} catch(error) {
				console.log(error);
				errorNotification("Couldn't delete transaction.");
			}
		});
	});
}

// Sort transactions by date.
function sortTransactionDataByDate(transactionData) {
	let sorted = {};
	let sortedKeys = [];
	let array = [];

	for(let transaction in transactionData) {
		array.push([transaction, transactionData[transaction].transactionDate]);
	}

	array.sort(function(a, b) {
		return new Date(a[1]).getTime() - new Date(b[1]).getTime();
	});

	array.map(item => {
		sorted[item[0]] = transactionData[item[0]];
		sortedKeys.push(item[0]);
	});

	return { sorted:sorted, sortedKeys:sortedKeys.reverse() };
}

// Add event to transaction search input field.
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

// Filters transaction list by a given search query.
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

// Add event to the "Add Transaction" button.
function addTransactionButtonEvent(button) {
	button.addEventListener("click", () => {
		try {
			let html = `
				<span class="popup-input-span">Amount</span>
				<input id="popup-input-amount" type="number" placeholder="Amount..." spellcheck="false" autocomplete="off">
				<div class="popup-button-wrapper margin-bottom">
					<button id="popup-choice-earned" class="choice">Earned</button>
					<button id="popup-choice-spent" class="choice active">Spent</button>
				</div>
				<span class="popup-input-span">Category</span>
				<input class="audible-pop" id="popup-input-category" type="text" placeholder="Category..." autocomplete="off" spellcheck="false" readonly>
				<span class="popup-input-span">Date</span>
				<input id="popup-input-date" type="text" placeholder="Date..." autocomplete="off" spellcheck="false">
				<span class="popup-input-span">Notes</span>
				<input id="popup-input-notes" type="text" placeholder="Notes..." autocomplete="off">
			`;
	
			let popup = new Popup(300, "auto", "Add Transaction", html, { confirmText:"Add", page:"dashboard" });
			popup.show();
			popup.updateHeight();

			let popupInputAmount = document.getElementById("popup-input-amount");
			let popupChoiceEarned = document.getElementById("popup-choice-earned");
			let popupChoiceSpent = document.getElementById("popup-choice-spent");
			let popupInputCategory = document.getElementById("popup-input-category");
			let popupInputDate = document.getElementById("popup-input-date");
			let popupInputNotes = document.getElementById("popup-input-notes");

			popupChoiceEarned.addEventListener("click", () => {
				popupInputCategory.value = "";
				popupChoiceEarned.classList.add("active");
				popupChoiceSpent.classList.remove("active");
			});

			popupChoiceSpent.addEventListener("click", () => {
				popupInputCategory.value = "";
				popupChoiceEarned.classList.remove("active");
				popupChoiceSpent.classList.add("active");
			});

			addTransactionCategoryEvent(popup, popupInputCategory);
	
			popupInputAmount.focus();
	
			flatpickr(popupInputDate, {
				enableTime: false,
				dateFormat: "Y-m-d",
				allowInput: true
			});
	
			popup.on("confirm", async () => {
				let userID = await appStorage.getItem("userID");
				let token = await appStorage.getItem("token");
				let key = await appStorage.getItem("key");

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

				populateDashboardBudget();

				popup.hide();
			});
		} catch(error) {
			console.log(error);
			errorNotification("Something went wrong... - EW51");
		}
	});
}

// Validate transaction popup data.
function validateTransactionData(amount, type, category, date, notes) {
	try {
		if(empty(amount) || isNaN(amount) || parseFloat(amount) <= 0) {
			return { error:"Amount must be a number, and greater than zero." };
		}

		if(empty(category) || (!Object.keys(defaultBudgetData.categories).includes(category.toLowerCase()) && category.toLowerCase() !== "income")) {
			return { error:"Invalid category." };
		}

		if(type === "earned" && !["income", "savings"].includes(category.toLowerCase())) {
			return { error:"Category must be set to Income or Savings if you earned money." };
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
		return { error:error };
	}
}

// Parse transaction popup data.
function parseTransactionPopupData(popupInputAmount, popupChoiceEarned, popupInputCategory, popupInputDate, popupInputNotes) {
	try {
		let amount = popupInputAmount.value;
		let type = popupChoiceEarned.classList.contains("active") ? "earned" : "spent";
		let category = popupInputCategory.value;
		let date = popupInputDate.value;
		let notes = popupInputNotes.value;

		return validateTransactionData(amount, type, category, date, notes);
	} catch(error) {
		console.log(error);
		return { error:"Invalid data." };
	}
}

// Add event to transaction category choice buttons on the popup.
function addTransactionCategoryEvent(previousPopup, input) {
	input.addEventListener("focus", () => {
		input.click();
	});

	input.addEventListener("click", () => {
		previousPopup.element.classList.add("hidden");

		let html = "";

		if(document.getElementById("popup-choice-spent").classList.contains("active")) {
			html = `
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
					<button class="popup-choice" data-value="Other">Other</button>
				</div>
			`;
		} else {
			html = `
				<div class="popup-button-wrapper no-margin-top">
					<button class="popup-choice" data-value="Income">Income</button>
					<button class="popup-choice" data-value="Savings">Savings</button>
				</div>
			`;
		}
		
		let popup = new Popup(360, "auto", "Transaction Category", html, { confirmText:"-", cancelText:"Back", page:"dashboard" });
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

// Create watchlist row elements.
async function createWatchlistListRows(marketCryptoData, marketStocksData, watchlistData) {
	return new Promise(async (resolve, reject) => {
		try {
			let currency = await getCurrency();

			let rows = [];

			let ids = Object.keys(watchlistData);

			marketCryptoData = sortMarketDataByCoinID(marketCryptoData);

			for(let i = 0; i < ids.length; i++) {
				try {
					let id = ids[i];
					
					let asset = watchlistData[id];

					if(asset.assetType === "crypto") {
						if(empty(marketCryptoData)) {
							continue;
						}

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
								<button class="action-button delete" title="Delete">
									<svg class="delete" width="1792" height="1792" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"><path class="delete" d="M704 1376v-704q0-14-9-23t-23-9h-64q-14 0-23 9t-9 23v704q0 14 9 23t23 9h64q14 0 23-9t9-23zm256 0v-704q0-14-9-23t-23-9h-64q-14 0-23 9t-9 23v704q0 14 9 23t23 9h64q14 0 23-9t9-23zm256 0v-704q0-14-9-23t-23-9h-64q-14 0-23 9t-9 23v704q0 14 9 23t23 9h64q14 0 23-9t9-23zm-544-992h448l-48-117q-7-9-17-11h-317q-10 2-17 11zm928 32v64q0 14-9 23t-23 9h-96v948q0 83-47 143.5t-113 60.5h-832q-66 0-113-58.5t-47-141.5v-952h-96q-14 0-23-9t-9-23v-64q0-14 9-23t23-9h309l70-167q15-37 54-63t79-26h320q40 0 79 26t54 63l70 167h309q14 0 23 9t9 23z"/></svg>
								</button>
							</div>
						`;

						addWatchlistDeleteEvent(div, asset);
						addWatchlistRowEvent(div, asset);

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
								<button class="action-button delete" title="Delete">
									<svg class="delete" width="1792" height="1792" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"><path class="delete" d="M704 1376v-704q0-14-9-23t-23-9h-64q-14 0-23 9t-9 23v704q0 14 9 23t23 9h64q14 0 23-9t9-23zm256 0v-704q0-14-9-23t-23-9h-64q-14 0-23 9t-9 23v704q0 14 9 23t23 9h64q14 0 23-9t9-23zm256 0v-704q0-14-9-23t-23-9h-64q-14 0-23 9t-9 23v704q0 14 9 23t23 9h64q14 0 23-9t9-23zm-544-992h448l-48-117q-7-9-17-11h-317q-10 2-17 11zm928 32v64q0 14-9 23t-23 9h-96v948q0 83-47 143.5t-113 60.5h-832q-66 0-113-58.5t-47-141.5v-952h-96q-14 0-23-9t-9-23v-64q0-14 9-23t23-9h309l70-167q15-37 54-63t79-26h320q40 0 79 26t54 63l70 167h309q14 0 23 9t9 23z"/></svg>
								</button>
							</div>
						`;

						addWatchlistDeleteEvent(div, asset);
						addWatchlistRowEvent(div, asset);

						rows.push(div);
					}
				} catch(error) {
					console.log(error);
				}
			}

			resolve(rows);
		} catch(error) {
			console.log(error);
			reject(error);
		}
	});
}

function addWatchlistDeleteEvent(div, asset) {
	div.getElementsByClassName("action-button delete")[0].addEventListener("click", async () => {
		let userID = await appStorage.getItem("userID");
		let token = await appStorage.getItem("token");

		let popup = new Popup(300, "auto", "Delete Asset", `<span>Are you sure you want to remove ${asset.assetSymbol.toUpperCase()} from your watchlist?</span>`, { page:"dashboard" });
		popup.show();
		popup.updateHeight();

		popup.on("confirm", async () => {
			try {
				showLoading(1500, "Deleting...");

				await deleteWatchlist(token, userID, asset.watchlistID);

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

// Add event to watchlist rows.
async function addWatchlistRowEvent(div, asset) {
	div.addEventListener("click", async (event) => {
		if(!event.target.classList.contains("delete")) {
			showLoading(5000, "Loading...");
			
			let currency = await getCurrency();

			if(asset.assetType === "crypto") {
				let data = await cryptoAPI.getMarketByID(currency, asset.assetID);
				let info = parseCryptoMarketData(currency, data[0]);
				showCryptoMarketData(info);
			} else {
				let resultPrice = await fetchStockPrice(currency, [asset.assetSymbol], true);

				if("error" in resultPrice) {
					errorNotification(resultPrice.error);
					return;
				}

				let infoPrice = resultPrice[Object.keys(resultPrice)[0]].priceData;
				infoPrice.currency = currency;

				let resultHistorical = await fetchStockHistorical(currency, asset.assetSymbol, true);

				if("error" in resultHistorical) {
					errorNotification(resultHistorical.error);
					return;
				}

				let infoHistorical = resultHistorical.data.historicalData.chart.result[0];
				infoHistorical.currency = currency;

				showStockMarketData(infoPrice, infoHistorical);
			}
		}
	});
}

// Returns the asset ID of each watchlist item.
function getWatchlistIDs(watchlist) {
	let ids = [];

	Object.keys(watchlist).map(id => {
		ids.push(watchlist[id].assetID);
	});

	return ids;
}

// Returns the symbols of assets in the user's watchlist.
function getWatchlistSymbols(watchlist) {
	let symbols = [];

	Object.keys(watchlist).map(id => {
		symbols.push(watchlist[id].assetSymbol);
	});

	return symbols;
}

// Separates watchlist data based on the asset type ("crypto" or "stock").
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

// Checks if an asset is in the user's watchlist.
function watchlistExists(watchlist, id) {
	try {
		let exists = false;

		Object.keys(watchlist).map(index => {
			let asset = watchlist[index];
			if(asset?.assetID.toLowerCase() === id.toLowerCase()) {
				exists = true;
			}
		});

		return exists;
	} catch(error) {
		console.log(error);
		return false;
	}
}

// Returns the "watchlistID" of an item based on the asset symbol and type.
function getWatchlistIDBySymbol(watchlist, symbol, type) {
	try {
		let result = { exists:false, id:null };

		Object.keys(watchlist).map(index => {
			let asset = watchlist[index];
			if(asset?.assetSymbol.toLowerCase() === symbol.toLowerCase() && asset.assetType.toLowerCase() === type.toLowerCase()) {
				result.exists = true;
				result.id = asset.watchlistID;
			}
		});

		return result;
	} catch(error) {
		console.log(error);
		return { exists:false, id:null, error:error };
	}
}

// Fetches, decrypts, and returns watchlist data.
function fetchWatchlist() {
	return new Promise(async (resolve, reject) => {
		try {
			let userID = await appStorage.getItem("userID");
			let token = await appStorage.getItem("token");
			let key = await appStorage.getItem("key");

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

// Fetches, decrypts, and returns budget data.
function fetchBudget() {
	return new Promise(async (resolve, reject) => {
		try {
			let userID = await appStorage.getItem("userID");
			let token = await appStorage.getItem("token");
			let key = await appStorage.getItem("key");

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
			if(error.toString().includes("Malformed")) {
				setDefaultBudgetData();
			}

			console.log(error);
			reject(error);
		}
	});
}

// Fetches, decrypts, and returns transactions.
function fetchTransaction() {
	return new Promise(async (resolve, reject) => {
		try {
			let userID = await appStorage.getItem("userID");
			let token = await appStorage.getItem("token");
			let key = await appStorage.getItem("key");

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

// Resets budget data.
function setDefaultBudgetData() {
	return new Promise(async (resolve, reject) => {
		try {
			let userID = await appStorage.getItem("userID");
			let token = await appStorage.getItem("token");
			let key = await appStorage.getItem("key");

			let encrypted = CryptoFN.encryptAES(JSON.stringify(defaultBudgetData), key);

			await updateBudget(token, userID, encrypted);

			resolve();
		} catch(error) {
			console.log(error);
			reject(error);
		}
	});
}

// Show popup to modify budget data.
async function showBudgetPopup() {
	let html = `
		<span class="popup-input-span">Food</span>
		<input type="number" id="popup-input-food" placeholder="Food..." spellcheck="false" autocomplete="off">
		<span class="popup-input-span">Housing</span>
		<input type="number" id="popup-input-housing" placeholder="Housing..." spellcheck="false" autocomplete="off">
		<span class="popup-input-span">Transport</span>
		<input type="number" id="popup-input-transport" placeholder="Transport..." spellcheck="false" autocomplete="off">
		<span class="popup-input-span">Entertainment</span>
		<input type="number" id="popup-input-entertainment" placeholder="Entertainment..." spellcheck="false" autocomplete="off">
		<span class="popup-input-span">Insurance</span>
		<input type="number" id="popup-input-insurance" placeholder="Insurance..." spellcheck="false" autocomplete="off">
		<span class="popup-input-span">Savings</span>
		<input type="number" id="popup-input-savings" placeholder="Savings..." spellcheck="false" autocomplete="off">
		<span class="popup-input-span">Other</span>
		<input type="number" id="popup-input-other" placeholder="Other..." spellcheck="false" autocomplete="off">
	`;

	let popup = new Popup(250, "auto", "Set Monthly Budget", html, { page:"dashboard" });
	popup.show();
	popup.updateHeight();
	
	let budgetData = await fetchBudget();
	
	let popupInputFood = document.getElementById("popup-input-food");
	let popupInputHousing = document.getElementById("popup-input-housing");
	let popupInputTransport = document.getElementById("popup-input-transport");
	let popupInputEntertainment = document.getElementById("popup-input-entertainment");
	let popupInputInsurance = document.getElementById("popup-input-insurance");
	let popupInputSavings = document.getElementById("popup-input-savings");
	let popupInputOther = document.getElementById("popup-input-other");

	popupInputFood.value = budgetData.categories.food;
	popupInputHousing.value = budgetData.categories.housing;
	popupInputTransport.value = budgetData.categories.transport;
	popupInputEntertainment.value = budgetData.categories.entertainment;
	popupInputInsurance.value = budgetData.categories.insurance;
	popupInputSavings.value = budgetData.categories.savings;
	popupInputOther.value = budgetData.categories.other;

	popup.on("confirm", async () => {
		try {
			popup.hide();

			showLoading(5000, "Updating...");

			let userID = await appStorage.getItem("userID");
			let token = await appStorage.getItem("token");
			let key = await appStorage.getItem("key");

			let budgetData = await fetchBudget();

			if(empty(budgetData)) {
				await setDefaultBudgetData();
				budgetData = await fetchBudget();
			}

			let data = parseBudgetPopupData(popupInputFood, popupInputHousing, popupInputTransport, popupInputEntertainment, popupInputInsurance, popupInputSavings, popupInputOther);

			if("error" in data) {
				hideLoading();
				errorNotification(data.error);
				return;
			}

			let { food, housing, transport, entertainment, insurance, savings, other } = data;

			budgetData.categories.food = food;
			budgetData.categories.housing = housing;
			budgetData.categories.transport = transport;
			budgetData.categories.entertainment = entertainment;
			budgetData.categories.insurance = insurance;
			budgetData.categories.savings = savings;
			budgetData.categories.other = other;

			let encrypted = CryptoFN.encryptAES(JSON.stringify(budgetData), key);

			await updateBudget(token, userID, encrypted);

			populateDashboardBudget(true);

			listTransactions();

			hideLoading();
		} catch(error) {
			console.log(error);
			errorNotification("Something went wrong... - EW52");
		}
	});
}

// Validate and parse budget popup data.
function parseBudgetPopupData(popupInputFood, popupInputHousing, popupInputTransport, popupInputEntertainment, popupInputInsurance, popupInputSavings, popupInputOther) {
	let food = popupInputFood.value;
	let housing = popupInputHousing.value;
	let transport = popupInputTransport.value;
	let entertainment = popupInputEntertainment.value;
	let insurance = popupInputInsurance.value;
	let savings = popupInputSavings.value;
	let other = popupInputOther.value;

	if(isNaN(food) || parseFloat(food) < 0) {
		return { error:"Budget for food has to be zero or greater." };
	}

	if(isNaN(housing) || parseFloat(housing) < 0) {
		return { error:"Budget for housing has to be zero or greater." };
	}

	if(isNaN(transport) || parseFloat(transport) < 0) {
		return { error:"Budget for transport has to be zero or greater." };
	}

	if(isNaN(entertainment) || parseFloat(entertainment) < 0) {
		return { error:"Budget for entertainment has to be zero or greater." };
	}

	if(isNaN(insurance) || parseFloat(insurance) < 0) {
		return { error:"Budget for insurance has to be zero or greater." };
	}

	if(isNaN(savings) || parseFloat(savings) < 0) {
		return { error:"Budget for savings has to be zero or greater." };
	}

	if(isNaN(other) || parseFloat(other) < 0) {
		return { error:"Budget for other has to be zero or greater." };
	}

	food = parseFloat(food);
	housing = parseFloat(housing);
	transport = parseFloat(transport);
	entertainment = parseFloat(entertainment);
	insurance = parseFloat(insurance);
	savings = parseFloat(savings);
	other = parseFloat(other);
	
	if((food + housing + transport + entertainment + insurance + savings + other) !== 100) {
		return { error:"Budget data must add up to 100%." };
	}

	return { food:food, housing:housing, transport:transport, entertainment:entertainment, insurance:insurance, savings:savings, other:other };
}

// Show popup to modify income.
async function showIncomePopup() {
	let html = `
		<input type="number" id="popup-input-income" placeholder="Yearly Income..." spellcheck="false" autocomplete="off">
	`;

	let popup = new Popup(250, "auto", "Set Yearly Income", html, { page:"dashboard" });
	popup.show();
	popup.updateHeight();
	
	let budgetData = await fetchBudget();
	
	let popupInputIncome = document.getElementById("popup-input-income");

	popupInputIncome.value = budgetData.income;

	popup.on("confirm", async () => {
		try {
			popup.hide();

			showLoading(5000, "Updating...");

			let userID = await appStorage.getItem("userID");
			let token = await appStorage.getItem("token");
			let key = await appStorage.getItem("key");

			let income = popupInputIncome.value;

			if(empty(budgetData)) {
				await setDefaultBudgetData();
				budgetData = await fetchBudget();
			}

			if(isNaN(income) || parseFloat(income) < 0) {
				errorNotification("Income has to be zero or greater.");
				return;
			}

			budgetData.income = parseFloat(income);

			let encrypted = CryptoFN.encryptAES(JSON.stringify(budgetData), key);

			await updateBudget(token, userID, encrypted);

			populateDashboardBudget(true);

			listTransactions();

			hideLoading();
		} catch(error) {
			console.log(error);
			errorNotification("Something went wrong... - EW53");
		}
	});
}