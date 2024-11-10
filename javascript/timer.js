// Script Author: NoCrypt; Modified by: ANXETY

let startTime;
let timeout;
const app = gradioApp();

// Timer Funcs

const padZero = (i) => (i < 10 ? "0" + i : i);
const floor = (x) => Math.floor(x);

function updateTimer(el, startTime, timeout) {
  const now = Date.now() / 1000;
  const elapsed = floor(now - startTime);
  const hours = padZero(floor(elapsed / 3600));
  const minutes = padZero(floor((elapsed / 60) % 60));
  const seconds = padZero(floor(elapsed % 60));

  el.innerText = `${hours}:${minutes}:${seconds}`;

  if (elapsed % 30 === 0) {
    refreshTimer(el, startTime, true);
    return;
  }

  timeout = setTimeout(() => updateTimer(el, startTime, timeout), 1000);
}

async function refreshTimer(timerEl, startTime, notext = false) {
  if (timeout) {
    clearTimeout(timeout);
    timeout = null;
  }
  if (!notext) {
    timerEl.innerText = "Connecting...";
  }
  try {
    const response = await fetch("file=static/timer.txt");
    if (response.status === 404) {
      timerEl.innerText = "Error. Session disconnected!";
      return;
    }
    const text = await response.text();
    startTime = parseInt(text);
    if (isNaN(startTime)) {
      timerEl.innerText = "Error. NaN stuff... Maybe network error.";
    } else {
      updateTimer(timerEl, startTime, timeout);
    }
  } catch (err) {
    console.log(err);
    timerEl.innerText = "Error. " + err;
  }
}

// Toggle Funcs

toggleNotification = (audioEl, divEl, imgEl) => {
  audioEl.muted = !audioEl.muted;
  audioEl.currentTime = 0;
  audioEl.play();
  divEl.title = !audioEl.muted ? "Currently not-muted. Click to mute." : "Currently muted. Click to unmute.";
  divEl.style.borderColor = !audioEl.muted ? "#00FF8C" : "#FF005D";
  divEl.style.backgroundColor = !audioEl.muted ? "rgba(0, 255, 140, 0.08)" : "rgba(255, 0, 93, 0.08)";
  imgEl.src = audioEl.muted ? "https://raw.githubusercontent.com/anxety-solo/webui_timer/refs/heads/main/__files__/icon/alarm-bell-cancelled.svg" : "https://raw.githubusercontent.com/anxety-solo/webui_timer/refs/heads/main/__files__/icon/alarm-bell.svg";
};

toggleNSFWBlur = (divEl, imgEl) => {
  const t2iGallery = app.querySelector("#txt2img_gallery_container");
  const i2iGallery = app.querySelector("#img2img_gallery_container");
  const isBlurred = divEl.classList.toggle("nsfw_blurred");

  divEl.title = `Toggle NSFW Blur. Click to ${isBlurred ? "unblur" : "blur"}`;
  divEl.style.borderColor = isBlurred ? "#FF005D" : "#00FF8C";
  divEl.style.backgroundColor = isBlurred ? "rgba(255, 0, 93, 0.08)" : "rgba(0, 255, 140, 0.08)";
  imgEl.src = isBlurred ? "https://raw.githubusercontent.com/anxety-solo/webui_timer/refs/heads/main/__files__/icon/eye-cancelled.svg" : "https://raw.githubusercontent.com/anxety-solo/webui_timer/refs/heads/main/__files__/icon/eye.svg";

  [t2iGallery, i2iGallery].forEach((gallery) => {
    gallery.classList.toggle("anxety_blur", isBlurred);
  });
};

// Main Func

function createTimer() {
  // Main Code
  const quickSettings = app.querySelector("#quicksettings");
  const audioEl = app.querySelector("#audio_notification > audio");

  const mainDiv = document.createElement("div");
  mainDiv.className = "justify-start";
  mainDiv.style = "display: flex; gap: 10px; user-select: none; margin-block: -10px;";

  // Timer Code

  const div2 = document.createElement("div");
  div2.className = "gr-box";
  div2.style = "display: flex; gap: 0.3rem; align-items: center; padding: 3px 5px; border: solid 1px #00FFFF; border-radius: 10px; background-color: rgba(0, 255, 255, 0.08) !important; cursor: pointer; z-index: 999;";
  div2.title = "Click to refresh";

  const img = document.createElement("img");
  img.src = "https://raw.githubusercontent.com/anxety-solo/webui_timer/refs/heads/main/__files__/icon/clock.svg";
  img.width = 24;

  const timerEl = document.createElement("div");
  timerEl.style = "font-family: monospace; color: #00FFFF";
  timerEl.textContent = "Connecting...";

  div2.append(img, timerEl);
  div2.addEventListener("click", () => refreshTimer(timerEl));

  mainDiv.appendChild(div2);

  // Audio Code

  const audioMuteDiv = document.createElement("div");
  audioMuteDiv.className = "gr-box";
  audioMuteDiv.style = "display: flex; align-items: center; padding: 3px 5px; border: solid 1px #00FF8C; border-radius: 10px; background-color: rgba(0, 255, 140, 0.08) !important; cursor: pointer; z-index: 999;";
  audioMuteDiv.title = "Currently not-muted. Click to mute";

  const img2 = document.createElement("img");
  img2.src = "https://raw.githubusercontent.com/anxety-solo/webui_timer/refs/heads/main/__files__/icon/alarm-bell.svg";
  img2.width = 20;

  audioMuteDiv.appendChild(img2);
  audioMuteDiv.onclick = () => toggleNotification(audioEl, audioMuteDiv, img2);

  mainDiv.appendChild(audioMuteDiv);

  // NSFW Code

  const NSFWBlurDiv = document.createElement("div");
  NSFWBlurDiv.className = "gr-box";
  NSFWBlurDiv.style = "display: flex; align-items: center; padding: 3px 5px; border: solid 1px #00FF8C; border-radius: 10px; background-color: rgba(0, 255, 140, 0.08) !important; cursor: pointer; z-index: 999;";
  NSFWBlurDiv.title = "Toggle NSFW Blur. Click to blur";

  const img3 = document.createElement("img");
  img3.src = "https://raw.githubusercontent.com/anxety-solo/webui_timer/refs/heads/main/__files__/icon/eye.svg";
  img3.width = 20;

  NSFWBlurDiv.appendChild(img3);
  NSFWBlurDiv.onclick = () => toggleNSFWBlur(NSFWBlurDiv, img3);

  mainDiv.appendChild(NSFWBlurDiv);

  // inject blur CSS
  if (!document.getElementById("nsfw-blur-css")) {
    const style = document.createElement("style");
    style.id = "nsfw-blur-css";
    style.innerHTML = `.anxety_blur { filter: blur(12px) grayscale(0.85) brightness(0.3); transition: filter 0.2s ease; } .anxety_blur:hover { filter: blur(0px) grayscale(0) brightness(1); }`;
    document.head.appendChild(style);
  }

  // CivitAi Code

  const CivitAiDiv = document.createElement("div");
  CivitAiDiv.className = "gr-box";
  CivitAiDiv.style = "display: flex; align-items: center; padding: 3px 5px; border: solid 1px #3399FF; border-radius: 10px; background-color: rgba(51, 153, 255, 0.08) !important; cursor: pointer; z-index: 999;";
  CivitAiDiv.title = "More models. Go to CivitAi";

  const img4 = document.createElement("img");
  img4.src = "https://raw.githubusercontent.com/anxety-solo/webui_timer/refs/heads/main/__files__/icon/CivitAi_Icon.svg";
  img4.width = 20;

  CivitAiDiv.appendChild(img4);
  CivitAiDiv.addEventListener("click", function () {
    window.open("https://civitai.com/models", "_blank");
  }); // Open New Tab

  mainDiv.appendChild(CivitAiDiv);

  // Refresh Code

  quickSettings.parentNode.insertBefore(mainDiv, quickSettings.nextSibling);
  refreshTimer(timerEl);
}

onUiLoaded(createTimer);