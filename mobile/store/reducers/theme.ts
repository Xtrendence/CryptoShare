import * as TransparentStatusAndNavigationBar from "react-native-transparent-status-and-navigation-bar";
import { createSlice } from "@reduxjs/toolkit";

export const themeSlice = createSlice({
	name: "theme",
	initialState: {
		theme: "dark"
	},
	reducers: {
		switchTheme: (state) => {
			if(state.theme === "dark") {
				state.theme = "light";
				TransparentStatusAndNavigationBar.setBarsStyle(true, "dark-content");
			} else {
				state.theme = "dark";
				TransparentStatusAndNavigationBar.setBarsStyle(true, "light-content");
			}
		}
	}
});

export const { switchTheme } = themeSlice.actions;

export default themeSlice.reducer;