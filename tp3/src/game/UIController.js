export class UIController {
    constructor() {
        this.toast = document.getElementById("toast");
    }

    flashToast(message, duration = 3000, persist = false) {
        this.toast.innerText = message;
        this.toast.className = this.toast.className.replace("hidden", "") + ' show';
        if (!persist) {
            setTimeout(() => this.hideToast(), duration);
        }
    }

    hideToast() {
        this.toast.className = this.toast.className.replace("show", "") + ' hide';
        setTimeout(() => this.toast.className = this.toast.className.replace("hide", "") + ' hidden', 200);
    }
}