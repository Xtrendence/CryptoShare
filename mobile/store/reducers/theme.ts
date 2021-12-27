import * as TransparentStatusAndNavigationBar from "react-native-transparent-status-and-navigation-bar";
import { createSlice } from "@reduxjs/toolkit";

export const themeSlice = createSlice({
	name: "theme",
	initialState: {
		theme: "Dark"
	},
	reducers: {
		switchTheme: (state) => {
			if(state.theme === "Dark") {
				state.theme = "Light";
				TransparentStatusAndNavigationBar.setBarsStyle(true, "dark-content");
			} else {
				state.theme = "Dark";
				TransparentStatusAndNavigationBar.setBarsStyle(true, "light-content");
			}
		}
	}
});

export const { switchTheme } = themeSlice.actions;

export default themeSlice.reducer;