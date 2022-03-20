import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import styles from "../styles/Dashboard";
import { Colors } from "../styles/Global";
import { screenWidth } from "../styles/NavigationBar";
import Utils from "../utils/Utils";

// Component used in the "Dashboard" page's "FlatList" to show the budget stats to the user.
export default function BudgetStats({ theme, currency, stats, backgroundColors, showMonthPopup, showYearPopup, month, year }: any) {
	return (
		<View style={[styles.budgetItem, styles[`budgetItem${theme}`]]}>
			<Text style={[styles.header, styles[`header${theme}`]]}>Used Budget</Text>
			<View style={[styles.row, { position:"absolute", top:16.5, right:15 }]}>
				<TouchableOpacity onPress={() => showMonthPopup()} style={[styles.button, styles.actionButton, styles[`actionButton${theme}`], { width:"auto", height:30, backgroundColor:Colors[theme].mainThird }]}>
					<Text style={[styles.actionText, styles[`actionText${theme}`], { color:Colors[theme].mainContrast }]}>{Utils.monthNames[month]}</Text>
				</TouchableOpacity>
				<TouchableOpacity onPress={() => showYearPopup()} style={[styles.button, styles.actionButton, styles[`actionButton${theme}`], { width:"auto", height:30, backgroundColor:Colors[theme].mainThird }]}>
					<Text style={[styles.actionText, styles[`actionText${theme}`], { color:Colors[theme].mainContrast }]}>{year.toString()}</Text>
				</TouchableOpacity>
			</View>
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

	// Function used to calculate the width of the progress bar for a budget category based on what percentage of the budget for the category has been used.
	function calculateWidth(usedPercentage: number) {
		let max = screenWidth - 60 - 100 - 20;
		return (max * usedPercentage) / 100;
	}
}