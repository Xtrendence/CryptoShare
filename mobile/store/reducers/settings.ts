import * as TransparentStatusAndNavigationBar from "react-native-transparent-status-and-navigation-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createSlice } from "@reduxjs/toolkit";
import Utils from "../../utils/Utils";

export const settingsSlice = createSlice({
	name: "settings",
	initialState: {
		settings: {
			...Utils.defaultSettings
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