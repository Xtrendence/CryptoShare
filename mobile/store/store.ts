import { configureStore } from "@reduxjs/toolkit";
import settingsReducer from "./reducers/settings";
import themeReducer from "./reducers/theme";

// Redux store used to manage the app's state.
const store = configureStore({
	reducer: {
		theme: themeReducer,
		settings: settingsReducer
	},
	// Disable serializable state check.
	middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck:false, immutableCheck:false }),
});

export default store;