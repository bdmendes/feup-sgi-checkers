export class UIController {
    constructor() {
        this.toast = document.getElementById("toast");
        this.lastHideTimeout = null;
        this.lastFadeTimeout = null;
    }

    flashToast(message, duration = 3000, persist = false) {
        this.toast.innerText = message;
        this.toast.className = this.toast.className.replace("hidden", "") + ' show';
        if (!persist) {
            clearTimeout(this.lastTimeout);
            clearTimeout(this.lastFadeTimeout);
            this.lastTimeout = setTimeout(() => this.hideToast(), duration);
        }
    }

    hideToast() {
        this.toast.className = this.toast.className.replace("show", "") + ' hide';
        this.lastFadeTimeout = setTimeout(() => this.toast.className = this.toast.className.replace("hide", "") + ' hidden', 400);
    }
}
