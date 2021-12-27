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
			} else {
				state.theme = "dark";
			}
		}
	}
});

export const { switchTheme } = themeSlice.actions;

export default themeSlice.reducer;