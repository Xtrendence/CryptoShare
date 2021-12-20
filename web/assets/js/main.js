detectMobile() ? document.body.id = "mobile" : document.body.id = "desktop";

setTheme(applicationTheme);

updatePasswordFields();

attemptLogin();