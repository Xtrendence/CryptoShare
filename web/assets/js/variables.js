let Notify = new Notifier("TopRight");

let theme = empty(localStorage.getItem("theme")) ? "dark" : localStorage.getItem("theme");

let divPageLogin = document.getElementById("login-page");

let inputLoginUsername = document.getElementById("input-login-username");
let inputLoginPassword = document.getElementById("input-login-password");
let inputCreateUsername = document.getElementById("input-create-username");
let inputCreatePassword = document.getElementById("input-create-password");
let inputCreateRepeatPassword = document.getElementById("input-create-repeat-password");

let buttonNewAccount = document.getElementById("button-new-account");
let buttonLoginAccount = document.getElementById("button-login-account");
let buttonExistingAccount = document.getElementById("button-existing-account");
let buttonCreateAccount = document.getElementById("button-create-account");

let loginToggleTheme = document.getElementById("login-toggle-theme");