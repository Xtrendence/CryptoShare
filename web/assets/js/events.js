buttonCreateAccount.addEventListener("click", () => {
	let popup = new Popup(300, 190, "Account Creation", '<span>Would you like to create your new account?</span>');
	popup.show();
});

loginToggleTheme.addEventListener("click", () => {
	if(loginToggleTheme.classList.contains("active")) {
		setTheme("dark");
	} else {
		setTheme("light");
	}
});