/*
* Website: https://www.xtrendence.com
* Portfolio: https://www.xtrendence.dev
* GitHub: https://www.github.com/Xtrendence
*/
class Popup {
	constructor(width, height, title, html, options = {}) {
		this.width = width;
		this.height = height;
		this.title = title;
		this.html = html;
		this.options = options;
		this.events = {};
	}

	generateID() {
		let id = this.generateHex(8);
		while(document.getElementById(id)) {
			id = this.generateHex(8);
		}

		return id;
	}

	generateHex(size) {
		return [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join("");
	}

	hasEvent(event) {
		return Object.keys(this.events).includes(event);
	}

	on(event, callback) {
		this.events[event] = callback;
	}

	off(event) {
		delete this.events[event];
	}

	show() {
		this.id = this.generateID();

		this.element = document.createElement("div");
		this.element.setAttribute("class", "popup-wrapper");

		if("page" in this.options) {
			this.element.classList.add(this.options.page);
		}

		this.setSize(this.width, this.height);
		
		this.top = document.createElement("div");
		this.top.setAttribute("class", "top");

		let spanTitle = document.createElement("span");
		spanTitle.setAttribute("class", "title noselect");
		spanTitle.textContent = this.title;
		
		let buttonClose = document.createElement("button");
		buttonClose.setAttribute("title", "Close");
		buttonClose.id = "popup-button-close";
		buttonClose.setAttribute("class", "icon-close");
		buttonClose.innerHTML = '<svg width="1792" height="1792" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"><path d="M1490 1322q0 40-28 68l-136 136q-28 28-68 28t-68-28l-294-294-294 294q-28 28-68 28t-68-28l-136-136q-28-28-28-68t28-68l294-294-294-294q-28-28-28-68t28-68l136-136q28-28 68-28t68 28l294 294 294-294q28-28 68-28t68 28l136 136q28 28 28 68t-28 68l-294 294 294 294q28 28 28 68z"/></svg>';
		buttonClose.addEventListener("click", () => {			
			if(this.hasEvent("close")) {
				this.events["close"]();
			}

			this.hide();
		});

		this.top.appendChild(buttonClose);
		this.top.appendChild(spanTitle);
		this.element.appendChild(this.top);

		this.bottom = document.createElement("div");
		this.bottom.setAttribute("class", "bottom");

		this.content = document.createElement("div");
		this.content.setAttribute("class", "content");
		this.content.innerHTML = this.html;
		this.content = this.addButtons(this.content);

		this.bottom.appendChild(this.content);

		this.element.id = this.id;
		this.element.appendChild(this.bottom);

		this.overlay = document.createElement("div");
		this.overlay.setAttribute("class", "popup-overlay");
		this.overlay.addEventListener("click", () => {
			buttonClose.click();
		});

		divAppContent.appendChild(this.overlay);
		divAppContent.appendChild(this.element);

		this.updateHeight();
	}

	hide() {
		this.overlay.remove();
		this.element.remove();
	}

	addButtons(content) {
		let div = document.createElement("div");
		div.setAttribute("class", "popup-button-wrapper");

		if(!("cancelText" in this.options) || this.options.cancelText !== "-") {
			let buttonCancel = document.createElement("button");
			buttonCancel.id = "popup-button-cancel";
			buttonCancel.setAttribute("class", "button-cancel");
			buttonCancel.textContent = ("cancelText" in this.options) ? this.options.cancelText : "Cancel";
			buttonCancel.addEventListener("click", () => {
				if(this.hasEvent("cancel")) {
					this.events["cancel"]();
					return;
				}
				this.hide();
			});
			
			div.appendChild(buttonCancel);
		}

		if(!("confirmText" in this.options) || this.options.confirmText !== "-") {
			let buttonConfirm = document.createElement("button");
			buttonConfirm.id = "popup-button-confirm";
			buttonConfirm.setAttribute("class", "button-confirm");
			buttonConfirm.textContent = ("confirmText" in this.options) ? this.options.confirmText : "Confirm";
			buttonConfirm.addEventListener("click", () => {
				if(this.hasEvent("confirm")) {
					this.events["confirm"]();
					return;
				}
				this.hide();
			});
			
			div.appendChild(buttonConfirm);
		}

		content.appendChild(div);

		return content;
	}

	updateHeight() {
		if(this.height === "auto") {
			let top = this.element.getElementsByClassName("top")[0];
			let content = this.element.getElementsByClassName("content")[0];

			let height = top.scrollHeight + content.scrollHeight + 40;

			if(height > window.innerHeight - 80) {
				height = window.innerHeight - 80;
			}

			this.element.style.height =  height + "px";
			this.element.style.top = `calc(50% - ${height / 2}px)`;
		}
	}

	setSize(width, height) {
		if(window.innerWidth <= width) {
			width = "full";
		}

		if(window.innerHeight <= height) {
			height = "full";
		}

		if(width === "full") {
			this.width = "calc(100% - 40px)";
			this.element.style.width = this.width;
			this.element.style.left = "20px";
			this.element.classList.add("full-width");
		} else {
			this.width = width;
			this.element.style.width = width + "px";
			this.element.style.left = `calc(50% - ${width / 2}px)`;
			this.element.classList.remove("full-width");
		}
		
		if(height === "full") {
			this.height = "calc(100% - 80px)";
			this.element.style.height = this.height;
			this.element.style.top = "40px";
			this.element.classList.add("full-height");
		} else {
			this.height = height;
			this.element.style.height = height + "px";
			this.element.style.top = `calc(50% - ${height / 2}px)`;
			this.element.classList.remove("full-height");
		}
	}

	setTitle(title) {
		try {
			this.element.getElementsByClassName("title")[0].textContent = title;
		} catch(error) {
			console.log(error);
		}
	}

	setHTML(html) {
		this.html = html;
		
		try {
			if(!this.empty(this.content.innerHTML)) {
				this.content.innerHTML = html;
				this.content = this.addButtons(this.content);

				this.element.getElementsByClassName("content")[0].remove();
				this.element.getElementsByClassName("bottom")[0].appendChild(this.content);

				this.updateHeight();
			}
		} catch(error) {
			console.log(error);
		}
	}

	setOptions(options = {}) {
		this.options = options;
	}

	updateButtons() {
		if("cancelText" in this.options) {
			this.element.getElementsByClassName("button-cancel")[0].textContent = this.options.cancelText;
		}

		if("confirmText" in this.options) {
			this.element.getElementsByClassName("button-confirm")[0].textContent = this.options.confirmText;
		}
	}

	empty(value) {
		if(typeof value === "object" && value !== null && Object.keys(value).length === 0) {
			return true;
		}
		
		if(value === null || typeof value === "undefined" || value.toString().trim() === "") {
			return true;
		}

		return false;
	}
}