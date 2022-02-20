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

function calculateTax(currency, income) {
	let currencySymbol = currencySymbols[currency];

	income = parseFloat(income);

	let brackets = [
		{
			title: "Personal Allowance",
			from: 0,
			to: 12570,
			rate: 0
		},
		{
			title: "Basic Rate",
			from: 12571,
			to: 50270,
			rate: 20
		},
		{
			title: "Higher Rate",
			from: 50271,
			to: 150000,
			rate: 40
		},
		{
			title: "Additional Rate",
			from: 150001,
			to: Number.MAX_SAFE_INTEGER,
			rate: 45
		}
	];

	let output = `This may not be accurate, and would only be applicable in the UK:<br><br>Total Tax To Pay: `;

	let taxableBasic, taxableHigher, taxableAdditional;

	let toPay = 0;

	if(income <= brackets[0].to) {
		toPay = 0;
	} else if(income >= brackets[1].from && income <= brackets[1].to) {
		taxableBasic = income - brackets[0].to;
		let amountBasic = parseFloat(((taxableBasic * brackets[1].rate) / 100).toFixed(2));
		toPay += amountBasic;
	} else if(income >= brackets[2].from && income <= brackets[2].to) {
		taxableBasic = brackets[1].to - brackets[0].to;
		let amountBasic = parseFloat(((taxableBasic * brackets[1].rate) / 100).toFixed(2));
		toPay += amountBasic;

		taxableHigher = income - brackets[1].to;
		let amountHigher = parseFloat(((taxableHigher * brackets[2].rate) / 100).toFixed(2));
		toPay += amountHigher;
	} else if(income >= brackets[3].from && income <= brackets[3].to) {
		taxableBasic = brackets[1].to - brackets[0].to;
		let amountBasic = parseFloat(((taxableBasic * brackets[1].rate) / 100).toFixed(2));
		toPay += amountBasic;

		taxableHigher = income - brackets[1].to;
		let amountHigher = parseFloat(((taxableHigher * brackets[2].rate) / 100).toFixed(2));
		toPay += amountHigher;

		taxableAdditional = income - brackets[2].to;
		let amountAdditional = parseFloat(((taxableAdditional * brackets[3].rate) / 100).toFixed(2));
		toPay += amountAdditional;
	}

	output += currencySymbol + separateThousands(toPay) + "<br><br>";

	output += `Taxable Basic: ${currencySymbol + separateThousands(taxableBasic)}<br>`;
	output += `Taxable Higher: ${currencySymbol + separateThousands(taxableHigher)}<br>`;
	output += `Taxable Additional: ${currencySymbol + separateThousands(taxableAdditional)}`;

	return output;
}