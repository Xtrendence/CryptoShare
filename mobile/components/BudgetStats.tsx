import React from "react";
import { Text, View } from "react-native";
import styles from "../styles/Dashboard";
import { screenWidth } from "../styles/NavigationBar";
import Utils from "../utils/Utils";

export default function BudgetStats({ theme, currency, stats, backgroundColors }: any) {
	return (
		<View style={[styles.budgetItem, styles[`budgetItem${theme}`]]}>
			<Text style={[styles.header, styles[`header${theme}`]]}>Used Budget</Text>
			{ 
				Object.keys(stats).map(category => {
					return (
						<View style={styles.progressWrapper} key={category + "-view"}>
							<View style={styles.progressContainer}>
								<View style={styles.progressShape}>
									<View style={[styles.progressBar, styles.progressBackground, styles[`progressBackground${theme}`]]}></View>
									<View style={[styles.progressBar, styles.progressForeground, { backgroundColor:backgroundColors[category], width:calculateWidth(stats[category].usedPercentage) }]}></View>
								</View>
							</View>
							<View style={[styles.column, styles.statsTextWrapper]}>
								<Text style={[styles.statsHeader, styles[`statsHeader${theme}`]]}>{Utils.capitalizeFirstLetter(category)} - Budget: {Utils.currencySymbols[currency] + Utils.separateThousands(stats[category].budget)}</Text>
								<Text style={[styles.statsText, styles[`statsText${theme}`]]}>Used: {Utils.currencySymbols[currency] + Utils.separateThousands(stats[category].used)} ({stats[category].usedPercentage}%)</Text>
								<Text style={[styles.statsText, styles[`statsText${theme}`], { marginBottom:20 }]}>Remaining: {Utils.currencySymbols[currency] + Utils.separateThousands(stats[category].remaining)} ({stats[category].remainingPercentage}%)</Text>
							</View>
						</View>
					)
				})
			}
		</View>
	);

	function calculateWidth(usedPercentage: number) {
		let max = screenWidth - 60 - 100 - 20;
		return (max * usedPercentage) / 100;
	}
}