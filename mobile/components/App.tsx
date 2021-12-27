import React from "react";
import "react-native-gesture-handler";
import * as TransparentStatusAndNavigationBar from "react-native-transparent-status-and-navigation-bar";
import { Provider } from "react-redux";
import Navigator from "./Navigator";
import store from "../store/store";

TransparentStatusAndNavigationBar.init();
TransparentStatusAndNavigationBar.setBarsStyle(true, "light-content");

export default function App() {
	return (
		<Provider store={store}>
			<Navigator/>
		</Provider>
	);
}