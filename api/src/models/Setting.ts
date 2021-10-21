export default class Setting {
	settingID: number | undefined;
	userID: number;
	userSettings: string;

	constructor(userID: number, userSettings: string) {
		this.userID = userID;
		this.userSettings = userSettings;
	}
}