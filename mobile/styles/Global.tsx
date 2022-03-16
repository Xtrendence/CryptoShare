export const Colors: any = {
	Light: {
		mainFirst: "rgb(255,255,255)",
		mainFirstTransparent: "rgba(255,255,255,0.9)",
		mainSecond: "rgb(240,240,240)",
		mainSecondTransparent: "rgba(240,240,240,0.7)",
		mainThird: "rgb(230,230,230)",
		mainFourth: "rgb(220,220,220)",
		mainFifth: "rgb(210,210,210)",

		mainContrast: "rgb(50,50,50)",
		mainContrastDark: "rgb(75,75,75)",
		mainContrastDarker: "rgb(100,100,100)",

		accentFirst: "rgb(209,118,95)",
		accentSecond: "rgb(130,45,85)",
		accentThird: "rgb(180,110,80)",
	
		accentContrast: "rgb(255,255,255)",

		negativeFirst: "rgb(190,40,50)",
		negativeSecond: "rgb(150,30,30)",

		positiveFirst: "rgb(50,140,80)",
		positiveSecond: "rgb(35,120,60)",

		neutralFirst: "rgb(60,120,190)",
		neutralSecond: "rgb(100,140,200)",

		colorfulGradient: ["#8a2387", "#e94057", "#f27121"],
		orangeGradient: ["#f57552", "#f8c74a"],
		greenGradient: ["#67b26f", "#4ca2cd"],
		calmGradient: ["#5f2c82", "#49a09d"],
		blueGradient: ["#4facfe", "#00bdc7"],
		purpleGradient: ["#667eea", "#764ba2"],
		greenerGradient: ["#11998e", "#38ef7d"],
		cosmicGradient: ["#ff00cc", "#333399"],
		playfulGradient: ["#fc00ff", "#27bcbe"],
		atlasGradient: ["#feac5e", "#c779d0", "#4bc0c8"],
		paleGradient: ["#2c74d8", "#7989d4"],
		oceanGradient: ["#04bde4", "#0253b9"],

		ChatBot: {
			accentFirst: "#8a2387",
			accentSecond: "#c2374a",
			accentThird: "#cc8932"
		},
		Dashboard: {
			accentFirst: "#4facfe",
			accentSecond: "#00bdc7",
			accentThird: "#6499c7"
		},
		Market: {
			accentFirst: "#c779d0",
			accentSecond: "#b98350",
			accentThird: "#3c8b91",
		},
		Holdings: {
			accentFirst: "#11998e",
			accentSecond: "#4db675",
			accentThird: "#296941"
		},
		Activity: {
			accentFirst: "#667eea",
			accentSecond: "#764ba2",
			accentThird: "#735e88"
		},
		Settings: {
			accentFirst: "#d67054",
			accentSecond: "#cf995a",
			accentThird: "#e7bc4f"
		}
	},
	Dark: {
		mainFirst: "rgb(20,20,20)",
		mainFirstTransparent: "rgba(20,20,20,0.6)",
		mainSecond: "rgb(40,40,40)",
		mainSecondTransparent: "rgba(40,40,40,0.3)",
		mainThird: "rgb(50,50,50)",
		mainFourth: "rgb(60,60,60)",
		mainFifth: "rgb(75,75,75)",

		mainContrast: "rgb(255,255,255)",
		mainContrastDark: "rgb(230,230,230)",
		mainContrastDarker: "rgb(200,200,200)",

		accentFirst: "rgb(209,118,95)",
		accentSecond: "rgb(130,45,85)",
		accentThird: "rgb(180,110,80)",
	
		accentContrast: "rgb(255,255,255)",

		negativeFirst: "rgb(190,40,50)",
		negativeSecond: "rgb(150,30,30)",

		positiveFirst: "rgb(50,140,80)",
		positiveSecond: "rgb(35,120,60)",

		neutralFirst: "rgb(60,120,190)",
		neutralSecond: "rgb(100,140,200)",

		colorfulGradient: ["#8a2387", "#e94057", "#f27121"],
		orangeGradient: ["#f57552", "#f8c74a"],
		greenGradient: ["#67b26f", "#4ca2cd"],
		calmGradient: ["#5f2c82", "#49a09d"],
		blueGradient: ["#4facfe", "#00bdc7"],
		purpleGradient: ["#667eea", "#764ba2"],
		greenerGradient: ["#11998e", "#38ef7d"],
		cosmicGradient: ["#ff00cc", "#333399"],
		playfulGradient: ["#fc00ff", "#27bcbe"],
		atlasGradient: ["#feac5e", "#c779d0", "#4bc0c8"],
		paleGradient: ["#2c74d8", "#7989d4"],
		oceanGradient: ["#04bde4", "#0253b9"],

		ChatBot: {
			accentFirst: "#8a2387",
			accentSecond: "#c2374a",
			accentThird: "#cc8932"
		},
		Dashboard: {
			accentFirst: "#4facfe",
			accentSecond: "#00bdc7",
			accentThird: "#6499c7"
		},
		Market: {
			accentFirst: "#c779d0",
			accentSecond: "#b98350",
			accentThird: "#3c8b91"
		},
		Holdings: {
			accentFirst: "#11998e",
			accentSecond: "#4db675",
			accentThird: "#296941"
		},
		Activity: {
			accentFirst: "#667eea",
			accentSecond: "#764ba2",
			accentThird: "#735e88"
		},
		Settings: {
			accentFirst: "#d67054",
			accentSecond: "#cf995a",
			accentThird: "#e7bc4f"
		}
	},

	getGradient(theme: string, page: string) {
		switch(page) {
			case "ChatBot":
				return this[theme].colorfulGradient;
			case "Dashboard":
				return this[theme].blueGradient;
			case "Market":
				return this[theme].atlasGradient;
			case "Holdings":
				return this[theme].greenerGradient;
			case "Activity":
				return this[theme].purpleGradient;
			case "Settings":
				return this[theme].orangeGradient;
		}
	}
};

export const GlobalStyle = {
	shadowColor: "rgb(0,0,0)",
	shadowOffset: {
		width: 0,
		height: 2,
	},
	shadowOpacity: 0.25,
	shadowRadius: 3.84,
	shadowElevation: 5,
	borderRadius: 10,
};