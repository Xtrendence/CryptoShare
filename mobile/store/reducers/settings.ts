import * as TransparentStatusAndNavigationBar from "react-native-transparent-status-and-navigation-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createSlice } from "@reduxjs/toolkit";
import Utils from "../../utils/Utils";

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
			AsyncStorage.setItem(data.payload.key, data.payload.value).then(() => {
				Utils.syncSettings();
			}).catch(error => {
				console.log(error);
			});
		},
		setSettingsState: (state: any, data) => {
			state.settings = data.payload;
		}
	}
});

export const { changeSetting, setSettingsState } = settingsSlice.actions;

export default settingsSlice.reducer;