function setTheme(theme) {
	if(theme === "light") {
		loginToggleTheme.classList.add("active");

		localStorage.setItem("theme", "light");

		document.documentElement.classList.add("light");
		document.documentElement.classList.remove("dark");

		particlesJS("background", particlesConfigLight);
	} else {
		loginToggleTheme.classList.remove("active");

		localStorage.setItem("theme", "dark");

		document.documentElement.classList.remove("light");
		document.documentElement.classList.add("dark");

		particlesJS("background", particlesConfigDark);
	}
}