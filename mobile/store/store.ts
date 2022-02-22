import { configureStore } from "@reduxjs/toolkit";
import themeReducer from "./reducers/theme";
import settingsReducer from "./reducers/settings";

const store = configureStore({
	reducer: {
		theme: themeReducer,
		settings: settingsReducer
	},
	// Disable serializable state check.
	middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck:false }),
});

export default store;