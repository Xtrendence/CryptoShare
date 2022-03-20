import React from "react";
import { DarkTheme, DefaultTheme, NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import * as TransparentStatusAndNavigationBar from "react-native-transparent-status-and-navigation-bar";
import { useSelector } from "react-redux";
import Activity from "../../screens/Activity";
import ChatBot from "../../screens/ChatBot";
import Dashboard from "../../screens/Dashboard";
import Holdings from "../../screens/Holdings";
import Login from "../../screens/Login";
import Market from "../../screens/Market";
import Settings from "../../screens/Settings";
import NavigationBar from "./NavigationBar";

// The "Stack" navigator is used instead of a bottom tab one so that a custom bottom navbar can be used.
const Stack = createStackNavigator();

// Adds a fade transition effect when switching between pages.
const screenOptions = {
	headerShown:false, 
	cardStyleInterpolator: ({ current }: any) => ({
		cardStyle: {
			opacity: current.progress,
		},
	})
};

export default function Navigator() {
	const { theme } = useSelector((state: any) => state.theme);
	const { settings } = useSelector((state: any) => state.settings);
	
	// Used to keep track of the user's navigation history in the app, and which page is active.
	const navigationRef = React.useRef<any>();
	const routeNameRef = React.useRef<any>();

	const [active, setActive] = React.useState<string>("Login");
	
	return (
		<NavigationContainer ref={navigationRef} onStateChange={() => checkState()} onReady={() =>
			(routeNameRef.current = navigationRef.current.getCurrentRoute().name)} theme={theme === "Light" ? DefaultTheme : DarkTheme}>
			<Stack.Navigator initialRouteName="Login" screenOptions={screenOptions}>
				<Stack.Screen name="Login" component={Login}></Stack.Screen>
				<Stack.Screen name="Chat Bot" component={ChatBot}></Stack.Screen>
				<Stack.Screen name="Dashboard" component={Dashboard}></Stack.Screen>
				<Stack.Screen name="Market" component={Market}></Stack.Screen>	
				<Stack.Screen name="Holdings" component={Holdings}></Stack.Screen>
				<Stack.Screen name="Activity" component={Activity}></Stack.Screen>
				<Stack.Screen name="Settings" component={Settings}></Stack.Screen>
			</Stack.Navigator>
			{ active !== "Login" && 
				<NavigationBar navigation={navigationRef} screen={{ active:active, setActive:setActive }}></NavigationBar>
			}
		</NavigationContainer>
	);

	// Updates the app's state to set the currently active page. When the theme is changed, navigating to a different page can result in the status bar icons and text not being updated, so this is done each time the user navigates to a different page.
	async function checkState() {
		TransparentStatusAndNavigationBar.init();

		if(settings.alternateBackground === "disabled") {
			theme === "Light" ? TransparentStatusAndNavigationBar.setBarsStyle(true, "dark-content") : TransparentStatusAndNavigationBar.setBarsStyle(true, "light-content");
		} else {
			TransparentStatusAndNavigationBar.setBarsStyle(true, "light-content");
		}

		let currentRouteName: string = navigationRef.current.getCurrentRoute().name;
		setActive(currentRouteName);
	}
}