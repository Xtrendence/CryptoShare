// Calculates staking rewards.
function calculateStakingRewards(currency, symbol, amount, apy, price) {
	let currencySymbol = currencySymbols[currency];

	let yearlyAmount = amount * (apy / 100);
	let yearlyValue = (yearlyAmount * price).toFixed(3);

	let monthlyAmount = (yearlyAmount / 12).toFixed(3);
	let monthlyValue = (parseFloat(yearlyValue) / 12).toFixed(3);

	let weeklyAmount = (yearlyAmount / (365 / 7)).toFixed(3);
	let weeklyValue = (parseFloat(yearlyValue) / (365 / 7)).toFixed(3);

	let dailyAmount = (yearlyAmount / 365).toFixed(3);
	let dailyValue = (parseFloat(yearlyValue) / 365).toFixed(3);

	return `
		If ${symbol.toUpperCase()} remains at its current price of ${currencySymbol + separateThousands(price)}:<br><br>
		Yearly Amount: ${yearlyAmount} ${symbol.toUpperCase()}<br>
		Yearly Value: ${currencySymbol + separateThousands(yearlyValue)}<br><br>
		Monthly Amount: ${monthlyAmount} ${symbol.toUpperCase()}<br>
		Monthly Value: ${currencySymbol + separateThousands(monthlyValue)}<br><br>
		Weekly Amount: ${weeklyAmount} ${symbol.toUpperCase()}<br>
		Weekly Value: ${currencySymbol + separateThousands(weeklyValue)}<br><br>
		Daily Amount: ${dailyAmount} ${symbol.toUpperCase()}<br>
		Daily Value: ${currencySymbol + separateThousands(dailyValue)}
	`;
}

// Calculates mining rewards.
function calculateMiningRewards(currency, symbol, price, equipmentCost, dailyAmount, dailyPowerCost) {
	let currencySymbol = currencySymbols[currency];

	let dailyValue = (dailyAmount * price) - dailyPowerCost;
	
	let weeklyAmount = dailyAmount * 7;
	let weeklyValue = dailyValue * 7;

	let monthlyAmount = dailyAmount * 30;
	let monthlyValue = dailyValue * 30;

	let yearlyAmount = dailyAmount * 365;
	let yearlyValue = dailyValue * 365;

	let roi = equipmentCost / monthlyValue;

	return `
		If ${symbol.toUpperCase()} remains at its current price of ${currencySymbol + separateThousands(price)}:<br><br>
		Yearly Amount: ${yearlyAmount} ${symbol.toUpperCase()}<br>
		Yearly Value: ${currencySymbol + separateThousands(yearlyValue)}<br><br>
		Monthly Amount: ${monthlyAmount} ${symbol.toUpperCase()}<br>
		Monthly Value: ${currencySymbol + separateThousands(monthlyValue)}<br><br>
		Weekly Amount: ${weeklyAmount} ${symbol.toUpperCase()}<br>
		Weekly Value: ${currencySymbol + separateThousands(weeklyValue)}<br><br>
		Daily Amount: ${dailyAmount} ${symbol.toUpperCase()}<br>
		Daily Value: ${currencySymbol + separateThousands(dailyValue)}<br><br>
		Your ROI (Return on Investment) would be ${roi.toFixed(2)} months.
	`;
}

// Calculates dividend rewards.
function calculateDividendRewards(currency, amount, dividend) {
	let currencySymbol = currencySymbols[currency];

	let yearlyValue = parseFloat((amount * dividend).toFixed(3));

	let monthlyValue = parseFloat((yearlyValue / 12).toFixed(3));

	let weeklyValue = parseFloat((yearlyValue / (365 / 7)).toFixed(3));

	let dailyValue = parseFloat((yearlyValue / 365).toFixed(3));

	return `
		Yearly Value: ${currencySymbol + separateThousands(yearlyValue)}<br>
		Monthly Value: ${currencySymbol + separateThousands(monthlyValue)}<br>
		Weekly Value: ${currencySymbol + separateThousands(weeklyValue)}<br>
		Daily Value: ${currencySymbol + separateThousands(dailyValue)}
	`;
}

// Calculates mortgage payments.
function calculateMortgage(currency, price, deposit, term, interest) {
	let currencySymbol = currencySymbols[currency];

	let toPay = parseFloat(price) - parseFloat(deposit);
	let interestAmount = (toPay * parseFloat(interest)) / 100;
	let total = parseFloat(price) + interestAmount;

	let yearly = parseFloat((total / term).toFixed(0));
	let monthly = parseFloat((yearly / 12).toFixed(0));

	return `
		This is a rough estimate, and likely only applicable in the UK:<br><br>
		Yearly Payment: ${currencySymbol + separateThousands(yearly)}<br>
		Monthly Payment: ${currencySymbol + separateThousands(monthly)}<br>
		Total Interest: ${currencySymbol + separateThousands(interestAmount)}<br>
		Total Cost: ${currencySymbol + separateThousands(total)}
	`;
}

// Calculates taxes.
function calculateTax(currency, income) {
	let currencySymbol = currencySymbols[currency];

	income = parseFloat(income);

	let brackets = {
		personalAllowance: {
			from: 0,
			to: 12570,
			rate: 0
		},
		basicRate: {
			from: 12571,
			to: 50270,
			rate: 20
		},
		higherRate: {
			from: 50271,
			to: 150000,
			rate: 40
		},
		additionalRate: {
			from: 150001,
			to: Number.MAX_SAFE_INTEGER,
			rate: 45
		}
	};

	let output = `This may not be accurate, and would only be applicable in the UK:`;

	let taxableBasic, taxableHigher, taxableAdditional;

	let toPay = 0;

	let taxBracket = "";

	if(income <= brackets.personalAllowance.to) {
		// Personal Allowance.
		taxBracket = "You aren't in any tax bracket. You don't need to pay tax.";

		toPay = 0;
	} else if(income >= brackets.basicRate.from && income <= brackets.basicRate.to) {
		// Basic Rate.
		taxBracket = "You are in the basic tax bracket.";

		taxableBasic = income - brackets.personalAllowance.to;
		let amountBasic = parseFloat(((taxableBasic * brackets.basicRate.rate) / 100).toFixed(2));
		toPay += amountBasic;
	} else if(income >= brackets.higherRate.from && income <= brackets.higherRate.to) {
		// Higher Rate.
		taxBracket = "You are in the higher tax bracket.";

		taxableBasic = brackets.basicRate.to - brackets.personalAllowance.to;
		let amountBasic = parseFloat(((taxableBasic * brackets.basicRate.rate) / 100).toFixed(2));
		toPay += amountBasic;

		taxableHigher = income - brackets.basicRate.to;
		let amountHigher = parseFloat(((taxableHigher * brackets.higherRate.rate) / 100).toFixed(2));
		toPay += amountHigher;
	} else {
		// Additional Rate.
		taxBracket = "You are in the additional tax bracket.";

		taxableBasic = brackets.basicRate.to - brackets.personalAllowance.to;
		let amountBasic = parseFloat(((taxableBasic * brackets.basicRate.rate) / 100).toFixed(2));
		toPay += amountBasic;

		taxableHigher = brackets.higherRate.to - brackets.basicRate.to;
		let amountHigher = parseFloat(((taxableHigher * brackets.higherRate.rate) / 100).toFixed(2));
		toPay += amountHigher;

		taxableAdditional = income - brackets.higherRate.to;
		let amountAdditional = parseFloat(((taxableAdditional * brackets.additionalRate.rate) / 100).toFixed(2));
		toPay += amountAdditional;
	}

	output += "<br><br>" + taxBracket;

	output += "<br><br>Total Tax To Pay: ";

	output += currencySymbol + separateThousands(toPay) + "<br><br>";

	output += `Taxable Basic: ${currencySymbol + separateThousands(taxableBasic)}<br>`;
	output += `Taxable Higher: ${currencySymbol + separateThousands(taxableHigher)}<br>`;
	output += `Taxable Additional: ${currencySymbol + separateThousands(taxableAdditional)}`;

	return output;
}