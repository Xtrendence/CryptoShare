import React from "react";
import FlashMessage from "react-native-flash-message";
import "react-native-gesture-handler";
import { ModalPortal } from "react-native-modals";
import * as TransparentStatusAndNavigationBar from "react-native-transparent-status-and-navigation-bar";
import { Provider } from "react-redux";
import store from "../store/store";
import Navigator from "./Navigation/Navigator";

TransparentStatusAndNavigationBar.init();
TransparentStatusAndNavigationBar.setBarsStyle(true, "light-content");

// The entry point of the app. The "Provider" component of React Redux is used to pass down the state of the app to all other components. The state contains data such as the theme of the app, and other user settings.
export default function App() {
	return (
		<Provider store={store}>
			<Navigator/>
			<ModalPortal/>
			<FlashMessage position="top"/>
		</Provider>
	);
}