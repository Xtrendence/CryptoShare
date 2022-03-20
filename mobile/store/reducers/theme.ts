import AsyncStorage from "@react-native-async-storage/async-storage";
import { createSlice } from "@reduxjs/toolkit";
import * as TransparentStatusAndNavigationBar from "react-native-transparent-status-and-navigation-bar";
import store from "../store";

// Redux "slice" for storing the app's theme.
export const themeSlice = createSlice({
	name: "theme",
	initialState: {
		theme: "Dark"
	},
	reducers: {
		switchTheme: (state, data) => {
			if(data.payload.theme === "Light") {
				state.theme = "Light";
				AsyncStorage.setItem("theme", "Light");

				if(data.payload.alternateBackground === "disabled") {
					TransparentStatusAndNavigationBar.setBarsStyle(true, "dark-content");
				} else {
					TransparentStatusAndNavigationBar.setBarsStyle(true, "light-content");
				}
			} else {
				state.theme = "Dark";
				AsyncStorage.setItem("theme", "Dark");
				TransparentStatusAndNavigationBar.setBarsStyle(true, "light-content");
			}

			return state;
		}
	}
});

export const { switchTheme } = themeSlice.actions;

export default themeSlice.reducer;