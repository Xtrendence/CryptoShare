import React from "react";
import "react-native-gesture-handler";
import * as TransparentStatusAndNavigationBar from "react-native-transparent-status-and-navigation-bar";
import Navigator from "./Navigator";

TransparentStatusAndNavigationBar.init();
TransparentStatusAndNavigationBar.setBarsStyle(true, "light-content");

export default function App() {
	return <Navigator/>
}