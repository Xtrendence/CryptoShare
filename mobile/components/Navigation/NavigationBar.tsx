import React, { useEffect } from "react";
import { TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";
import { useDispatch, useSelector } from "react-redux";
import { Colors, GlobalStyle } from "../../styles/Global";
import styles from "../../styles/NavigationBar";

export default function BottomBar({ screen, navigation }: any) {
	const { theme } = useSelector((state: any) => state.theme);
	
	const [left, setLeft] = React.useState("0%");

	useEffect(() => {
		checkActive();
	}, [screen.active]);

	return (
		<View style={[styles.bar, styles[`bar${theme}`]]}>
			<View style={styles.background}>
				<View style={[styles.backdrop, styles[`backdrop${theme}`], { left:left }]}></View>
			</View>
			<View style={styles.foreground}>
				<TouchableOpacity style={styles.tab} onPress={() => { screen.setActive("Chat Bot") }}>
					<View style={styles.itemWrapper}>
						<View style={styles.iconWrapper}>
							<Icon
								name="comment-dots" 
								size={iconSize} 
								color={screen.active === "Chat Bot" ? Colors[theme].accentContrast : Colors[theme].mainContrast}
							/>
						</View>
					</View>
				</TouchableOpacity>
				<TouchableOpacity style={styles.tab} onPress={() => { screen.setActive("Dashboard") }}>
					<View style={styles.itemWrapper}>
						<View style={styles.iconWrapper}>
							<Icon
								name="th-large" 
								size={iconSize} 
								color={screen.active === "Dashboard" ? Colors[theme].accentContrast : Colors[theme].mainContrast}
							/>
						</View>
					</View>
				</TouchableOpacity>
				<TouchableOpacity style={styles.tab} onPress={() => { screen.setActive("Market") }}>
					<View style={styles.itemWrapper}>
						<View style={styles.iconWrapper}>
							<Icon
								name="university" 
								size={iconSize} 
								color={screen.active === "Market" ? Colors[theme].accentContrast : Colors[theme].mainContrast}
							/>
						</View>
					</View>
				</TouchableOpacity>
				<TouchableOpacity style={styles.tab} onPress={() => { screen.setActive("Holdings") }}>
					<View style={styles.itemWrapper}>
						<View style={styles.iconWrapper}>
							<Icon
								name="wallet" 
								size={iconSize} 
								color={screen.active === "Holdings" ? Colors[theme].accentContrast : Colors[theme].mainContrast}
							/>
						</View>
					</View>
				</TouchableOpacity>
				<TouchableOpacity style={styles.tab} onPress={() => { screen.setActive("Activity") }}>
					<View style={styles.itemWrapper}>
						<View style={styles.iconWrapper}>
							<Icon
								name="exchange-alt" 
								size={iconSize} 
								color={screen.active === "Activity" ? Colors[theme].accentContrast : Colors[theme].mainContrast}
							/>
						</View>
					</View>
				</TouchableOpacity>
				<TouchableOpacity style={styles.tab} onPress={() => { screen.setActive("Settings") }}>
					<View style={styles.itemWrapper}>
						<View style={styles.iconWrapper}>
							<Icon
								name="cog" 
								size={iconSize} 
								color={screen.active === "Settings" ? Colors[theme].accentContrast : Colors[theme].mainContrast}
							/>
						</View>
					</View>
				</TouchableOpacity>
			</View>
		</View>
	);

	async function checkActive() {
		let amount = 100 / 6;

		switch(screen.active) {
			case "Chat Bot":
				animateLeft(0);
				navigation.current.navigate("Chat Bot");
				break;
			case "Dashboard":
				animateLeft(amount * 1);
				navigation.current.navigate("Dashboard");
				break;
			case "Market":
				animateLeft(amount * 2);
				navigation.current.navigate("Market");
				break;
			case "Holdings":
				animateLeft(amount * 3);
				navigation.current.navigate("Holdings");
				break;
			case "Activity":
				animateLeft(amount * 4);
				navigation.current.navigate("Activity");
				break;
			case "Settings":
				animateLeft(amount * 5);
				navigation.current.navigate("Settings");
				break;
		}
	}

	async function animateLeft(to: number) {
		setLeft(to + "%");
	}
}

let iconSize = 24;