// FUNNY
// Change the tab icon to a purple heart symbol
const link = document.createElement('link');
link.rel = 'icon';
link.href = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="purple" viewBox="0 0 16 16"><text x="0" y="12" font-size="12">💜</text></svg>';
document.head.appendChild(link);

// TIMER
// Language settings
const translationsTimer = {
    "en": {
        connecting: "Connecting...",
        refreshTooltip: "Click to refresh.",
        muteTooltip: "Currently not-muted. Click to mute.",
        unmuteTooltip: "Currently muted. Click to unmute.",
        blurTooltip: "Toggle NSFW Blur. Click to blur.",
        unblurTooltip: "Toggle NSFW Blur. Click to unblur.",
        civitaiTooltip: "Go to CivitAI.",
        pinggyMessage: "Recreate the Pinggy tunnel!",
        error: "Error: ",
    },
    "ru": {
        connecting: "Подключение...",
        refreshTooltip: "Нажмите, чтобы обновить.",
        muteTooltip: "Звук включен. Нажмите, чтобы отключить.",
        unmuteTooltip: "Звук отключен. Нажмите, чтобы включить.",
        blurTooltip: "Переключить размытие NSFW. Нажмите, чтобы размыть.",
        unblurTooltip: "Переключить размытие NSFW. Нажмите, чтобы убрать размытие.",
        civitaiTooltip: "Перейти на CivitAI.",
        pinggyMessage: "Пересоздайте туннель Pinggy!",
        error: "Ошибка: ",
    },
};

// Detect UserLang
const userLang = (navigator.language || navigator.userLanguage).split('-')[0];
const t = translationsTimer[userLang] || translationsTimer["en"]; // Fallback to English if language not supported

// Constants
const CLOCK_ICON = "file=extensions/timer/__files__/icon/clock.svg";
const ALARM_BELL_ICON = "file=extensions/timer/__files__/icon/alarm-bell.svg";
const ALARM_BELL_CANCELLED_ICON = "file=extensions/timer/__files__/icon/alarm-bell-cancelled.svg";
const EYE_ICON = "file=extensions/timer/__files__/icon/eye.svg";
const EYE_CANCELLED_ICON = "file=extensions/timer/__files__/icon/eye-cancelled.svg";
const CIVITAI_ICON = "file=extensions/timer/__files__/icon/CivitAi_Icon.svg";
const CIVITAI_URL = "https://civitai.com/models";
const TIMER_FILE = "file=static/timer.txt";
const PINGGY_TIMER_FILE = "file=static/timer-pinggy.txt";

// Timer class
class Timer {
    constructor(element, isPinggy) {
        this.element = element;
        this.startTime = null;
        this.timeout = null;
        this.isPinggy = isPinggy;
    }

    start() {
        this.refresh();
    }

    update() {
        const now = Date.now() / 1000;
        let timeLeft = this.isPinggy ? this.startTime - now : now - this.startTime; // Countdown for pinggy

        if (this.isPinggy && timeLeft <= 0) {
            this.stop();
            this.element.innerText = t.pinggyMessage;
            return; // Stop further updates
        }

        const hours = String(Math.floor(timeLeft / 3600)).padStart(2, '0');
        const minutes = String(Math.floor((timeLeft / 60) % 60)).padStart(2, '0');
        const seconds = String(Math.floor(timeLeft % 60)).padStart(2, '0');

        this.element.innerText = `${hours}:${minutes}:${seconds}`;

        this.timeout = setTimeout(() => this.update(), 1000);
    }

    async refresh() {
        clearTimeout(this.timeout);
        this.element.innerText = t.connecting;

        const currentUrl = window.location.href;
        this.isPinggy = currentUrl.includes("a.free.pinggy.link");
        const timerFile = this.isPinggy ? PINGGY_TIMER_FILE : TIMER_FILE;

        try {
            const response = await fetch(timerFile);
            if (!response.ok) {
                throw new Error(`Error fetching timer: ${response.status} ${response.statusText}`);
            }
            const text = await response.text();
            this.startTime = parseInt(text);
            if (isNaN(this.startTime)) {
                throw new Error("Invalid timer value: NaN");
            }
            this.update();
        } catch (error) {
            console.error("Error refreshing timer:", error);
            this.element.innerText = t.error + error.message;
        }
    }

    stop() {
        clearTimeout(this.timeout);
    }
}

// Helper function for creating elements
function createElement(tag, className, attributes = {}, children = []) {
    const element = document.createElement(tag);
    element.className = className;
    for (const [key, value] of Object.entries(attributes)) {
        element.setAttribute(key, value);
    }
    children.forEach(child => element.appendChild(child));
    return element;
}

// Toggle functions
function toggleNotification(audio, button, image) {
    audio.muted = !audio.muted;
    audio.currentTime = 0; // Reset audio to start
    if (!audio.muted) {
        audio.play().catch(e => console.error("Error playing notification sound:", e));
    }
    button.title = audio.muted ? t.unmuteTooltip : t.muteTooltip;
    button.style.borderColor = audio.muted ? "#FF005D" : "#00FF8C";
    button.style.backgroundColor = audio.muted ? "rgba(255, 0, 93, 0.08)" : "rgba(0, 255, 140, 0.08)";
    image.src = audio.muted ? ALARM_BELL_CANCELLED_ICON : ALARM_BELL_ICON;
}

function toggleNSFWBlur(button, image) {
    const t2iGallery = gradioApp().querySelector("#txt2img_gallery_container");
    const i2iGallery = gradioApp().querySelector("#img2img_gallery_container");
    const isBlurred = button.classList.toggle("nsfw_blurred");

    button.title = isBlurred ? t.unblurTooltip : t.blurTooltip;
    button.style.borderColor = isBlurred ? "#FF005D" : "#00FF8C";
    button.style.backgroundColor = isBlurred ? "rgba(255, 0, 93, 0.08)" : "rgba(0, 255, 140, 0.08)";
    image.src = isBlurred ? EYE_CANCELLED_ICON : EYE_ICON;

    [t2iGallery, i2iGallery].forEach((gallery) => {
        gallery.classList.toggle("anxety_blur", isBlurred);
    });
}

// Main function
function createTimer() {
    const app = gradioApp();
    const quickSettings = app.querySelector("#quicksettings");
    const audio = app.querySelector("#audio_notification > audio");

    // Create main div
    const mainDiv = createElement("div", "justify-start", {
        style: "display: flex; gap: 8px; user-select: none; margin-block: -8px; align-items: center; z-index: 999;"
    });

    // Timer
    const timerDiv = createElement("div", "gr-box", {
        style: "display: flex; gap: 0.3rem; align-items: center; padding: 3px 5px; border: solid 1px #00FFFF; border-radius: 10px; background-color: rgba(0, 255, 255, 0.08) !important; cursor: pointer;",
        title: t.refreshTooltip
    });
    const timerImage = createElement("img", "", { src: CLOCK_ICON, width: 24 });
    const timerElement = createElement("div", "", {
        style: "font-family: monospace; color: #00FFFF; text-align: center; flex-grow: 1;",
        textContent: t.connecting
    });
    timerDiv.append(timerImage, timerElement);
    const timer = new Timer(timerElement);
    timerDiv.addEventListener("click", () => timer.refresh());
    mainDiv.appendChild(timerDiv);

    // Audio notification
    const audioDiv = createElement("div", "gr-box", {
        style: "transition: all 0.15s ease; display: flex; align-items: center; padding: 5px; border: solid 1px #00FF8C; border-radius: 10px; background-color: rgba(0, 255, 140, 0.08) !important; cursor: pointer; height: auto; width: auto;",
        title: t.muteTooltip
    });
    const audioImage = createElement("img", "", { src: ALARM_BELL_ICON, width: 20 });
    audioDiv.appendChild(audioImage);
    audioDiv.addEventListener("click", () => toggleNotification(audio, audioDiv, audioImage));
    mainDiv.appendChild(audioDiv);

    // NSFW Blur
    const nsfwDiv = createElement("div", "gr-box", {
        style: "transition: all 0.15s ease; display: flex; align-items: center; padding: 5px; border: solid 1px #00FF8C; border-radius: 10px; background-color: rgba(0, 255, 140, 0.08) !important; cursor: pointer; height: auto; width: auto;",
        title: t.blurTooltip
    });
    const nsfwImage = createElement("img", "", { src: EYE_ICON, width: 20 });
    nsfwDiv.appendChild(nsfwImage);
    nsfwDiv.addEventListener("click", () => toggleNSFWBlur(nsfwDiv, nsfwImage));
    mainDiv.appendChild(nsfwDiv);

    // CivitAI link
    const civitDiv = createElement("div", "gr-box", {
        style: "display: flex; align-items: center; padding: 5px; border: solid 1px #3399FF; border-radius: 10px; background-color: rgba(51, 153, 255, 0.08) !important; cursor: pointer; height: auto; width: auto;",
        title: t.civitaiTooltip
    });
    const civitImage = createElement("img", "", { src: CIVITAI_ICON, width: 20 });
    civitDiv.appendChild(civitImage);
    civitDiv.addEventListener("click", () => window.open(CIVITAI_URL, '_blank'));
    mainDiv.appendChild(civitDiv);

    timer.start();

    // Inject blur CSS
    if (!document.getElementById("nsfw-blur-css")) {
        const style = document.createElement("style");
        style.id = "nsfw-blur-css";
        style.innerHTML = `
            .anxety_blur {
                filter: blur(10px) grayscale(1) brightness(0.3);
                transition: filter 0.2s ease;
            }
            .anxety_blur:hover {
                filter: blur(0px) grayscale(0) brightness(1);
            }
        `;
        document.head.appendChild(style);
    }

    // INIT
    quickSettings.parentNode.insertBefore(mainDiv, quickSettings.nextSibling);
}

onUiLoaded(createTimer);