// Script Author: NoCrypt; Modified by: ANXETY

let startTime;
let timeout;
const app = gradioApp();
const audioEl = new Audio('static/notification.mp3');
const funnyAudioEl = new Audio('static/notification-funny.mp3');
let notificationMode = 0; // 0: off, 1: normal, 2: funny

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

// Toggle Notification Func

function toggleNotification(divEl, imgEl) {
  notificationMode = (notificationMode + 1) % 3; // Cycle through modes
  let audioToPlay = notificationMode === 2 ? funnyAudioEl : audioEl;

  if (notificationMode === 0) {
    audioEl.pause();
    audioEl.currentTime = 0;
    divEl.style.borderColor = "#FF005D"; // Red for off
    divEl.style.backgroundColor = "rgba(255, 0, 93, 0.08)";
    divEl.title = "Notifications are off.";
  } else {
    audioToPlay.currentTime = 0;
    audioToPlay.play();
    divEl.style.borderColor = notificationMode === 1 ? "#00FF8C" : "#3399FF"; // Green for normal, Blue for funny
    divEl.style.backgroundColor = notificationMode === 1 ? "rgba(0, 255, 140, 0.08)" : "rgba(51, 153, 255, 0.08)";
    divEl.title = notificationMode === 1 ? "Normal notifications are on." : "Funny notifications are on.";
  }

  imgEl.src = notificationMode === 0 ? 
    "https://huggingface.co/NagisaNao/icon_for_webUiTimer/raw/main/icon/alarm-bell-cancelled-filled-svgrepo-com.svg" : 
    "https://huggingface.co/NagisaNao/icon_for_webUiTimer/raw/main/icon/alarm-bell-filled-svgrepo-com.svg";
}

// Toggle NSFW Blur Func

function toggleNSFWBlur(divEl, imgEl) {
  const t2iGallery = app.querySelector("#txt2img_gallery_container");
  const i2iGallery = app.querySelector("#img2img_gallery_container");
  const isBlurred = divEl.classList.toggle("nsfw_blurred");

  divEl.title = `Toggle NSFW Blur. Click to ${isBlurred ? "unblur" : "blur"}`;
  divEl.style.borderColor = isBlurred ? "#FF005D" : "#00FF8C";
  divEl.style.backgroundColor = isBlurred ? "rgba(255, 0, 93, 0.08)" : "rgba(0, 255, 140, 0.08)";
  imgEl.src = isBlurred ? "https://huggingface.co/NagisaNao/icon_for_webUiTimer/raw/main/icon/eye-cancelled-filled-svgrepo-com.svg" : "https://huggingface.co/NagisaNao/icon_for_webUiTimer/raw/main/icon/eye-filled-svgrepo-com.svg";

  [t2iGallery, i2iGallery].forEach((gallery) => {
    gallery.classList.toggle("anxety_blur", isBlurred);
  });
}

// Main Func

function createTimer() {
  const quickSettings = app.querySelector("#quicksettings");

  const mainDiv = document.createElement("div");
  mainDiv.className = "justify-start";
  mainDiv.style = "display: flex; gap: 10px; user-select: none; margin-block: -10px;";

  // Timer Code
  const div2 = document.createElement("div");
  div2.className = "gr-box";
  div2.style = "display: flex; gap: 0.3rem; align-items: center; padding: 3px 5px; border: solid 1px #00FFFF; border-radius: 10px; background-color: rgba(0, 255, 255, 0.08) !important; cursor: pointer; z-index: 999;";
  div2.title = "Click to refresh";

  const img = document.createElement("img");
  img.src = "https://huggingface.co/NagisaNao/icon_for_webUiTimer/raw/main/icon/clock-filled-svgrepo-com.svg";
  img.width = 24;

  const timerEl = document.createElement("div");
  timerEl.style = "font-family: monospace; color: #00FFFF";
  timerEl.textContent = "Connecting...";

  div2.append(img, timerEl);
  div2.addEventListener("click", () => refreshTimer(timerEl));

  mainDiv.appendChild(div2);

  // Notification Code
  const audioMuteDiv = document.createElement("div");
  audioMuteDiv.className = "gr-box";
  audioMuteDiv.style = "display: flex; align-items: center; padding: 3px 5px; border: solid 1px #00FF8C; border-radius: 10px; background-color: rgba(0, 255, 140, 0.08) !important; cursor: pointer; z-index: 999;";
  audioMuteDiv.title = "Click to toggle notifications";

  const img2 = document.createElement("img");
  img2.src = "https://huggingface.co/NagisaNao/icon_for_webUiTimer/raw/main/icon/alarm-bell-filled-svgrepo-com.svg";
  img2.width = 20;

  audioMuteDiv.appendChild(img2);
  audioMuteDiv.onclick = () => toggleNotification(audioMuteDiv, img2);

  mainDiv.appendChild(audioMuteDiv);

  // NSFW Code
  const NSFWBlurDiv = document.createElement("div");
  NSFWBlurDiv.className = "gr-box";
  NSFWBlurDiv.style = "display: flex; align-items: center; padding: 3px 5px; border: solid 1px #00FF8C; border-radius: 10px; background-color: rgba(0, 255, 140, 0.08) !important; cursor: pointer; z-index: 999;";
  NSFWBlurDiv.title = "Toggle NSFW Blur. Click to blur";

  const img3 = document.createElement("img");
  img3.src = "https://huggingface.co/NagisaNao/icon_for_webUiTimer/raw/main/icon/eye-filled-svgrepo-com.svg";
  img3.width = 20;

  NSFWBlurDiv.appendChild(img3);
  NSFWBlurDiv.onclick = () => toggleNSFWBlur(NSFWBlurDiv, img3);

  mainDiv.appendChild(NSFWBlurDiv);

  // CivitAi Code
  const CivitAiDiv = document.createElement("div");
  CivitAiDiv.className = "gr-box";
  CivitAiDiv.style = "display: flex; align-items: center; padding: 3px 5px; border: solid 1px #3399FF; border-radius: 10px; background-color: rgba(51, 153, 255, 0.08) !important; cursor: pointer; z-index: 999;";
  CivitAiDiv.title = "More models. Go to CivitAi";

  const img4 = document.createElement("img");
  img4.src = "https://huggingface.co/NagisaNao/icon_for_webUiTimer/raw/main/icon/CivitAi_Icon.svg";
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