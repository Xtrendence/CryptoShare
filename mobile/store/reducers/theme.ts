import * as TransparentStatusAndNavigationBar from "react-native-transparent-status-and-navigation-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createSlice } from "@reduxjs/toolkit";

export const themeSlice = createSlice({
	name: "theme",
	initialState: {
		theme: "Dark"
	},
	reducers: {
		switchTheme: (state, data) => {
			if(data.payload === "Light") {
				state.theme = "Light";
				AsyncStorage.setItem("theme", "Light");
				TransparentStatusAndNavigationBar.setBarsStyle(true, "dark-content");
			} else {
				state.theme = "Dark";
				AsyncStorage.setItem("theme", "Dark");
				TransparentStatusAndNavigationBar.setBarsStyle(true, "light-content");
			}
		}
	}
});

export const { switchTheme } = themeSlice.actions;

export default themeSlice.reducer;