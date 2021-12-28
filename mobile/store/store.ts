import { configureStore } from "@reduxjs/toolkit";
import themeReducer from "./reducers/theme";

const store = configureStore({
	reducer: {
		theme: themeReducer
	}
});

export default store;