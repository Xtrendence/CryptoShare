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

	let yearlyValue = (amount * dividend).toFixed(3);

	let monthlyValue = (parseFloat(yearlyValue) / 12).toFixed(3);

	let weeklyValue = (parseFloat(yearlyValue) / (365 / 7)).toFixed(3);

	let dailyValue = (parseFloat(yearlyValue) / 365).toFixed(3);

	return `
		Yearly Value: ${currencySymbol + separateThousands(yearlyValue)}<br>
		Monthly Value: ${currencySymbol + separateThousands(monthlyValue)}<br>
		Weekly Value: ${currencySymbol + separateThousands(weeklyValue)}<br>
		Daily Value: ${currencySymbol + separateThousands(dailyValue)}
	`;
}