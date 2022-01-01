import * as TransparentStatusAndNavigationBar from "react-native-transparent-status-and-navigation-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createSlice } from "@reduxjs/toolkit";

export const settingsSlice = createSlice({
	name: "settings",
	initialState: {
		settings: {
			defaultPage: "Dashboard"
		}
	},
	reducers: {
		changeSetting: (state: any, data) => {
			state.settings[data.payload.key] = data.payload.value;
			AsyncStorage.setItem(data.payload.key, data.payload.value);
		},
		setSettingsState: (state: any, data) => {
			state.settings = data.payload;
		}
	}
});

export const { changeSetting, setSettingsState } = settingsSlice.actions;

export default settingsSlice.reducer;