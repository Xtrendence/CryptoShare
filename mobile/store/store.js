import { configureStore } from "@reduxjs/toolkit";
import themeReducer from "./reducers/theme";

export default configureStore({
	reducer: {
		theme: themeReducer
	}
});