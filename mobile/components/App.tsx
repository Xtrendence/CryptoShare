import React from "react";
import "react-native-gesture-handler";
import FlashMessage from "react-native-flash-message";
import * as TransparentStatusAndNavigationBar from "react-native-transparent-status-and-navigation-bar";
import { ModalPortal } from "react-native-modals";
import { Provider } from "react-redux";
import Navigator from "./Navigation/Navigator";
import store from "../store/store";

TransparentStatusAndNavigationBar.init();
TransparentStatusAndNavigationBar.setBarsStyle(true, "light-content");

export default function App() {
	return (
		<Provider store={store}>
			<Navigator/>
			<ModalPortal/>
			<FlashMessage position="top"/>
		</Provider>
	);
}