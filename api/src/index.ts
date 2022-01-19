import API from "./utils/API";

(async () => {
	let api = new API();
	await api.start();
})();