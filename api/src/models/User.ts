export default class User {
	userID: number | undefined;
	username: string;
	password: string;
	key: string;

	constructor(username: string, password: string, key: string) {
		this.username = username;
		this.password = password;
		this.key = key;
	}
}