import React from "react";
import * as TransparentStatusAndNavigationBar from "react-native-transparent-status-and-navigation-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import Login from "../../screens/Login";
import ChatBot from "../../screens/ChatBot";
import Dashboard from "../../screens/Dashboard";
import Market from "../../screens/Market";
import Holdings from "../../screens/Holdings";
import Activity from "../../screens/Activity";
import Settings from "../../screens/Settings";

const Stack = createStackNavigator();

const horizontalAnimation: object = {
	gestureDirection: "horizontal",
	cardStyleInterpolator: ({ current, layouts }: any) => {
		return {
			cardStyle: {
				transform: [{
					translateX: current.progress.interpolate({
						inputRange: [0, 1],
						outputRange: [layouts.screen.width, 0],
					}),
				}],
			}
		};
	},
};

export default function Navigator() {
	const navigationRef = React.useRef<any>();
	const routeNameRef = React.useRef<any>();

	const [active, setActive] = React.useState<string>("Login");
	
	return (
		<NavigationContainer ref={navigationRef} onStateChange={() => checkState()} onReady={() =>
			(routeNameRef.current = navigationRef.current.getCurrentRoute().name)}>
			<Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown:false }}>
				<Stack.Screen name="Login" component={Login}></Stack.Screen>
				<Stack.Screen name="Chat Bot" component={ChatBot}></Stack.Screen>
				<Stack.Screen name="Dashboard" component={Dashboard} options={horizontalAnimation}></Stack.Screen>
				<Stack.Screen name="Market" component={Market} options={horizontalAnimation}></Stack.Screen>	
				<Stack.Screen name="Holdings" component={Holdings} options={horizontalAnimation}></Stack.Screen>
				<Stack.Screen name="Activity" component={Activity} options={horizontalAnimation}></Stack.Screen>
				<Stack.Screen name="Settings" component={Settings} options={horizontalAnimation}></Stack.Screen>
			</Stack.Navigator>
		</NavigationContainer>
	);

	async function checkState() {
		TransparentStatusAndNavigationBar.init();
		TransparentStatusAndNavigationBar.setBarsStyle(true, "light-content");

		let currentRouteName: string = navigationRef.current.getCurrentRoute().name;
		setActive(currentRouteName);
	}
}