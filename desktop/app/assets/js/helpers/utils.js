function getIP() {
	return window.location.hostname;
}

function getPort() {
	let port = window.location.port;

	if(empty(port)) {
		port = getProtocol() === "https:" ? 443 : 80;
	}

	return parseInt(port);
}

function getPath() {
	return window.location.pathname;
}

function getProtocol() {
	return window.location.protocol;
}

// Encrypts the values of an object.
function encryptObjectValues(password, object) {
	let encrypted = {};
	let keys = Object.keys(object);

	keys.map(key => {
		let value = object[key].toString();
		let ciphertext = CryptoFN.encryptAES(value, password);
		encrypted[key] = ciphertext;
	});

	return encrypted;
}

// Decrypts the values of an object.
function decryptObjectValues(password, object) {
	let decrypted = {};
	let keys = Object.keys(object);

	keys.map(key => {
		let value = object[key];

		try {
			let plaintext = CryptoFN.decryptAES(value, password);
			decrypted[key] = plaintext;
		} catch(error) {
			decrypted[key] = value;
		}
	});

	return decrypted;
}

// Converts HTML tags to avoid them being rendered. Prevents XSS attacks.
function stripHTMLCharacters(string) {
	string = replaceAll(string, "<", "&lt;");
	string = replaceAll(string, ">", "&gt;");
	return string;
}

// Determines if a UNIX timestamp is older than 24 hours.
function refetchRequired(time) {
	let refetchTime = 86400;
	return (Math.floor(new Date().getTime() / 1000)) - refetchTime > parseInt(time);
}

// Determines if a variable is empty.
function empty(value) {
	if(typeof value === "object" && value !== null && Object.keys(value).length === 0) {
		return true;
	}

	if(value === null || typeof value === "undefined" || value.toString().trim() === "") {
		return true;
	}

	return false;
}

// Determines if a string is valid JSON.
function validJSON(json) {
	try {
		let object = JSON.parse(json);
		if(object && typeof object === "object") {
			return true;
		}
	}
	catch(e) { }
	return false;
}

// Determines whether or not a username is valid.
function validUsername(username) {
	try {
		if(username.length > 16) {
			return false;
		}

		return (/^[A-Za-z0-9]+$/.test(username));
	} catch(error) {
		console.log(error);
		return false;
	}
}

// Formats percentages to two decimal places, and adds a "+" prefix if the number isn't negative.
function formatPercentage(number) {
	if(!empty(number)) {
		return number.toFixed(2).includes("-") ? number.toFixed(2) : "+" + number.toFixed(2);
	} else {
		return "-";
	}
}

// Separates a number by thousands.
function separateThousands(number) {
	try {
		let parts = number.toString().split(".");
		parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		return parts.join(".");
	} catch(error) {
		return "0";
	}
}

// Abbreviates a number.
function abbreviateNumber(num, digits) {
	let si = [
		{ value: 1, symbol: "" },
		{ value: 1E3, symbol: "k" },
		{ value: 1E6, symbol: "M" },
		{ value: 1E9, symbol: "B" },
		{ value: 1E12, symbol: "T" },
		{ value: 1E15, symbol: "P" },
		{ value: 1E18, symbol: "E" }
	];
	let rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
	let i;
	for(i = si.length - 1; i > 0; i--) {
		if(num >= si[i].value) {
			break;
		}
	}
	return (num / si[i].value).toFixed(digits).replace(rx, "$1") + si[i].symbol;
}

// Gets the value of a CSS variable.
function cssValue(element, variable) {
	return getComputedStyle(element).getPropertyValue(variable);
}

// Returns the amount of local storage space that's used.
function getLocalStorageUsedSize() {
	return JSON.stringify(localStorage).length / 1000;
}

// Sums up two numbers.
function sum(total, num) {
	return total + num;
}

// Returns time in the format "HH:MM".
function formatHour(date) {
	let hours = ("00" + date.getHours()).slice(-2);
	let minutes = ("00" + date.getMinutes()).slice(-2);
	return hours + ":" + minutes;
}

// Returns time in the format "HH-MM".
function formatHourHyphenated(date) {
	let hours = ("00" + date.getHours()).slice(-2);
	let minutes = ("00" + date.getMinutes()).slice(-2);
	return hours + "-" + minutes;
}

// Returns the time in the format "HH:MM:SS".
function formatSeconds(date) {
	let hours = ("00" + date.getHours()).slice(-2);
	let minutes = ("00" + date.getMinutes()).slice(-2);
	let seconds = ("00" + date.getSeconds()).slice(-2);
	return hours + ":" + minutes + ":" + seconds;
}

// Returns the time in the format "HH-MM-SS".
function formatSecondsHyphenated(date) {
	let hours = ("00" + date.getHours()).slice(-2);
	let minutes = ("00" + date.getMinutes()).slice(-2);
	let seconds = ("00" + date.getSeconds()).slice(-2);
	return hours + "-" + minutes + "-" + seconds;
}

// Returns the date in a valid SQL format.
function formatDateSQL(date) {
	return date.toISOString().split("T")[0] + " " + date.toTimeString().split(" ")[0];
}

// Returns the date in the format "YYYY / MM / DD".
function formatDate(date) {
	let day = date.getDate();
	let month = date.getMonth() + 1;
	let year = date.getFullYear();
	return year + " / " + ("0" + month).slice(-2) + " / " + ("0" + day).slice(-2);
}

// Returns the date in the format "DD / MM / YYYY".
function formatDateHuman(date) {
	let day = date.getDate();
	let month = date.getMonth() + 1;
	let year = date.getFullYear();
	return ("0" + day).slice(-2) + " / " + ("0" + month).slice(-2) + " / " + year;
}

// Returns the date in the format "YYYY-MM-DD".
function formatDateHyphenated(date) {
	let day = date.getDate();
	let month = date.getMonth() + 1;
	let year = date.getFullYear();
	return year + "-" + ("0" + month).slice(-2) + "-" + ("0" + day).slice(-2);
}

// Returns the date in the format "DD-MM-YYYY".
function formatDateHyphenatedHuman(date) {
	let day = date.getDate();
	let month = date.getMonth() + 1;
	let year = date.getFullYear();
	return ("0" + day).slice(-2) + "-" + ("0" + month).slice(-2) + "-" + year;
}

// Adds a given number of days to a date.
function addDays(date, days) {
	date.setDate(date.getDate() + days);
	return date;
}

// Returns an array containing the dates of days within a given range in the format "YYYY-MM-DD".
function dayRangeArray(from, to) {
	let dayInSeconds = 86400 * 1000;
	let fromTime = from.getTime();
	let toTime = to.getTime();
	let days = [];

	for(let i = fromTime; i < toTime; i += dayInSeconds) {
		let date = formatDateHyphenated(new Date(i));
		days.push(date);
	}

	days.length = 365;

	return days;
}

// Returns the date of a year before a given date.
function previousYear(date) {
	let day = date.getDate();
	let month = date.getMonth() + 1;
	let year = date.getFullYear() - 1;
	return new Date(Date.parse(year + "-" + month + "-" + day));
}

// Returns the date of a month before a given date.
function previousMonth(date) {
	return new Date(date.getTime() - 2592000 * 1000);
}

// Returns the date of a week before a given date.
function previousWeek(date) {
	return new Date(date.getTime() - (60 * 60 * 24 * 6 * 1000));
}

// Converts a positive number to a negative one.
function positiveToNegative(number) {
	return -Math.abs(number);
}

// Capitalizes the first letter of a string.
function capitalizeFirstLetter(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

// Capitalizes the first letter of each word in a string.
function titleCase(string) {
	return string.replace(/(^\w|\s\w)/g, m => m.toUpperCase());
}

// Inserts an HTML node after another.
function insertAfter(newNode, referenceNode) {
	referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

// Returns a random number within a given range.
function randomBetween(min, max) {
	return min + Math.floor(Math.random() * (max - min + 1));
}

// Gets the previous non-null value in an object given a starting index.
function previousValueInObject(object, start) {
	let keys = Object.keys(object);

	for(let i = start; i >= 0; i--) {
		try {
			if(!empty(object[keys[i]])) {
				return object[keys[i]];
			}
		} catch(error) {
			continue;
		}
	}
}

// Gets the next non-null value in an object given a starting index.
function nextValueInObject(object, start) {
	let keys = Object.keys(object);

	for(let i = start; i < keys.length; i++) {
		try {
			if(!empty(object[keys[i]])) {
				return object[keys[i]];
			}
		} catch(error) {
			continue;
		}
	}
}

// Gets the previous non-null value in an array given a starting index.
function previousValueInArray(array, start) {
	for(let i = start; i >= 0; i--) {
		try {
			if(!empty(array[i])) {
				return array[i];
			}
		} catch(error) {
			continue;
		}
	}
}

// Replaces all occurences of a string with another string in a given string.
function replaceAll(str, str1, str2, ignore) {
	return str.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g,"\\$&"),(ignore?"gi":"g")),(typeof(str2)=="string")?str2.replace(/\$/g,"$$$$"):str2);
}

// Replaces all occurences of a string with another string in a given string.
String.prototype.replaceAll = function(str1, str2, ignore) {
	return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g,"\\$&"),(ignore?"gi":"g")),(typeof(str2)=="string")?str2.replace(/\$/g,"$$$$"):str2);
}

// Determines whether or not the user is on a mobile device based on their user agent.
function detectMobile() {
	let check = false;
	(function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
	return check;
}