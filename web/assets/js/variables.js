let Notify = new Notifier("TopRight");

let theme = empty(localStorage.getItem("theme")) ? "dark" : localStorage.getItem("theme");

let buttonCreateAccount = document.getElementById("button-create-account");

let loginToggleTheme = document.getElementById("login-toggle-theme");