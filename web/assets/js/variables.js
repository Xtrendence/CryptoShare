let Notify = new Notifier("TopRight");

let theme = empty(localStorage.getItem("theme")) ? "dark" : localStorage.getItem("theme");

let loginToggleTheme = document.getElementById("login-toggle-theme");