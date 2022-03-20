import React, { useEffect } from "react";
import { TouchableOpacity, View } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Icon from "react-native-vector-icons/FontAwesome5";
import { useSelector } from "react-redux";
import { Colors } from "../../styles/Global";
import styles from "../../styles/NavigationBar";
import PatternIcon from "../Icons/PatternIcon";

// The size of the navbar icons.
let iconSize = 24;

// Bottom navigation bar component.
export default function BottomBar({ screen, navigation }: any) {
	const { theme } = useSelector((state: any) => state.theme);
	const { settings } = useSelector((state: any) => state.settings);

	const alternateBackground = settings?.alternateBackground === "disabled" ? "" : "Alternate";
	
	// Used to indicate which page is active.
	const [left, setLeft] = React.useState("0%");
	const [gradient, setGradient] = React.useState(Colors.getGradient(theme, getActive()));

	useEffect(() => {
		checkActive();
	}, [screen.active]);

	// When the "left" value changes, it means the active page has changed, so the appropriate navbar item needs to be colored.
	useEffect(() => {
		setGradient(Colors.getGradient(theme, getActive()));
	}, [left]);

	return (
		<View style={[styles.bar, styles[`bar${theme}`], styles[`bar${theme + alternateBackground}`]]}>
			<View style={styles.background}>
				<LinearGradient
					style={[styles.backdrop, styles[`backdrop${theme}`], { left:left }]}
					colors={gradient}
					useAngle={true}
					angle={45}
				>
					<PatternIcon style={[styles.pattern, styles[`pattern${getActive()}`]]} fill={Colors[theme].accentContrast} opacity={0.2}/>
				</LinearGradient>
			</View>
			<View style={styles.foreground}>
				<TouchableOpacity style={styles.tab} onPress={() => { screen.setActive("Chat Bot") }}>
					<View style={styles.itemWrapper}>
						<View style={[styles.iconWrapper, styles[`iconWrapper${theme}`], screen.active === "Chat Bot" ? styles.iconWrapperActive : null]}>
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
						<View style={[styles.iconWrapper, styles[`iconWrapper${theme}`], screen.active === "Dashboard" ? styles.iconWrapperActive : null]}>
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
						<View style={[styles.iconWrapper, styles[`iconWrapper${theme}`], screen.active === "Market" ? styles.iconWrapperActive : null]}>
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
						<View style={[styles.iconWrapper, styles[`iconWrapper${theme}`], screen.active === "Holdings" ? styles.iconWrapperActive : null]}>
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
						<View style={[styles.iconWrapper, styles[`iconWrapper${theme}`], screen.active === "Activity" ? styles.iconWrapperActive : null]}>
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
						<View style={[styles.iconWrapper, styles[`iconWrapper${theme}`], screen.active === "Settings" ? styles.iconWrapperActive : null]}>
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

	// Returns the active page's name. The first space character is removed to handle the "Chat Bot" page.
	function getActive() {
		return screen.active.replace(" ", "");
	}

	// Checks which page is active, and navigates to it while also changing the position of the square behind the active page's icon on the navbar.
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

	// Sets the position of the square behind the active page's navbar icon.
	async function animateLeft(to: number) {
		setLeft(to + "%");
	}
}