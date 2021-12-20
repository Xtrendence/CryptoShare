let Notify = new Notifier("TopRight");

let DOMCache = document.getElementById("dom-cache");

let applicationTheme = empty(localStorage.getItem("theme")) ? "dark" : localStorage.getItem("theme");
let applicationBackground = empty(localStorage.getItem("background")) ? "animated" : localStorage.getItem("background");

let divAnimatedBackground = document.getElementById("animated-background");
let divStaticBackground = document.getElementById("static-background");

let divLoading = document.getElementById("loading-overlay");

let divPageLogin = document.getElementById("login-page");
let divPageApp = document.getElementById("app-page");

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

let divNavbarWrapper = document.getElementById("navbar-wrapper");
let divNavbar = document.getElementById("navbar");

let divSettingsNavbar = document.getElementById("settings-navbar");
let divPageSettings = document.getElementById("settings-page");

let settingsToggleTheme = document.getElementById("settings-toggle-theme");
let settingsToggleBackground = document.getElementById("settings-toggle-background");

let buttonSettingsLogout = document.getElementById("button-settings-logout");