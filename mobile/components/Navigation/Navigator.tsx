import React from "react";
import * as TransparentStatusAndNavigationBar from "react-native-transparent-status-and-navigation-bar";
import { NavigationContainer, DarkTheme, DefaultTheme } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import Login from "../../screens/Login";
import ChatBot from "../../screens/ChatBot";
import Dashboard from "../../screens/Dashboard";
import Market from "../../screens/Market";
import Holdings from "../../screens/Holdings";
import Activity from "../../screens/Activity";
import Settings from "../../screens/Settings";
import NavigationBar from "./NavigationBar";
import { useSelector } from "react-redux";

const Stack = createStackNavigator();

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

	async function checkState() {
		TransparentStatusAndNavigationBar.init();
		theme === "Light" ? TransparentStatusAndNavigationBar.setBarsStyle(true, "dark-content") : TransparentStatusAndNavigationBar.setBarsStyle(true, "light-content");

		let currentRouteName: string = navigationRef.current.getCurrentRoute().name;
		setActive(currentRouteName);
	}
}