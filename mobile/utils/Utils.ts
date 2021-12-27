export default class Utils {
	static getBackground(theme: string, type: string) {
		switch(theme) {
			case "light":
				switch(type) {
					case "static":
						return require("../assets/img/BG-White-Gold.png");
					case "simple":
						return require("../assets/img/BG-White.png");
				}
				break;
			case "dark":
				switch(type) {
					case "static":
						return require("../assets/img/BG-Black-Gold.png");
					case "simple":
						return require("../assets/img/BG-Black.png");
				}
				break;
		}
	}
}