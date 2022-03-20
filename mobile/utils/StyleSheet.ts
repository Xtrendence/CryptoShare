import { ColorValue, ImageStyle, StyleSheet, TextStyle, ViewStyle } from "react-native";

// A custom "StyleSheet" component that supports additional properties.
export interface ToggleStyle extends ViewStyle {
	activeBackgroundColor: ColorValue | undefined;
	inActiveBackgroundColor: ColorValue | undefined;
	borderActiveColor: ColorValue | undefined;
	borderInActiveColor: ColorValue | undefined;
	radius: number | undefined;
}

export type NamedStyles<T> = { [P in keyof T]: ViewStyle | TextStyle | ImageStyle | ToggleStyle };

export function createStyle<T extends NamedStyles<T>>(styles: NamedStyles<T>) {
	return StyleSheet.create(styles);
}