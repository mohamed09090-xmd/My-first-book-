const AUTHENTICATOR_SECRET = "ALNN2A4BPFUMDW5EQIFANSPRBDYDA7FZ";
const AUTH_SESSION_KEY = "last-train-home-authenticated";
const TOTP_PERIOD_SECONDS = 30;
const TOTP_ALLOWED_WINDOW = 1;
const FRONTEND_CACHE_NAME = "last-train-home-runtime-v1.5";
const PRELOAD_ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./manifest.json",
  "./assets/cover.svg",
  "./assets/favicon.svg",
  "./assets/icon.svg"
];

const authGate = document.getElementById("authGate");
const appShell = document.getElementById("appShell");
const authForm = document.getElementById("authForm");
const authCodeInput = document.getElementById("authCode");
const authMessage = document.getElementById("authMessage");
const authSubmit = document.getElementById("authSubmit");
const lockBtn = document.getElementById("lockBtn");

const pages = Array.from(document.querySelectorAll(".page"));
const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");
const restartBtn = document.getElementById("restartBtn");
const pageCounter = document.getElementById("pageCounter");
const progressBar = document.getElementById("progressBar");
const book = document.getElementById("book");

let currentPage = 0;
let isAnimating = false;
let touchStartX = 0;
let touchEndX = 0;
let didSwipe = false;
let failedAuthAttempts = 0;
let authCooldownUntil = 0;

const animationClasses = [
  "is-turning-next",
  "is-turning-prev-away",
  "is-ready-next",
  "is-ready-prev"
];

function removeAnimationClasses(page) {
  animationClasses.forEach((className) => page.classList.remove(className));
}

function isAuthenticated() {
  return sessionStorage.getItem(AUTH_SESSION_KEY) === "true";
}

function showAuthMessage(message, type) {
  authMessage.textContent = message;
  authMessage.classList.remove("is-error", "is-success");

  if (type) {
    authMessage.classList.add(type);
  }
}

function unlockStory() {
  sessionStorage.setItem(AUTH_SESSION_KEY, "true");
  document.body.classList.remove("auth-locked");
  document.body.classList.add("auth-unlocked");
  appShell.setAttribute("aria-hidden", "false");
  authGate.setAttribute("aria-hidden", "true");
  showAuthMessage("Access granted.", "is-success");
  updateInterface();
  warmUpBookPages();
}

function lockStory() {
  sessionStorage.removeItem(AUTH_SESSION_KEY);
  document.body.classList.remove("auth-unlocked");
  document.body.classList.add("auth-locked");
  appShell.setAttribute("aria-hidden", "true");
  authGate.setAttribute("aria-hidden", "false");
  authCodeInput.value = "";
  showAuthMessage("", "");
  currentPage = 0;
  isAnimating = false;
  book.classList.remove("is-animating");
  updateInterface();
  requestAnimationFrame(() => authCodeInput.focus());
}

function base32Decode(secret) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const cleaned = secret.toUpperCase().replace(/[=\s-]/g, "");
  const output = [];
  let bits = 0;
  let value = 0;

  for (const character of cleaned) {
    const index = alphabet.indexOf(character);

    if (index === -1) {
      throw new Error("Invalid Base32 secret.");
    }

    value = (value << 5) | index;
    bits += 5;

    if (bits >= 8) {
      output.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return output;
}

function rotateLeft(value, shift) {
  return (value << shift) | (value >>> (32 - shift));
}

function sha1(messageBytes) {
  const data = messageBytes.slice();
  const bitLength = data.length * 8;
  data.push(0x80);

  while (data.length % 64 !== 56) {
    data.push(0);
  }

  const highLength = Math.floor(bitLength / 0x100000000);
  const lowLength = bitLength >>> 0;

  data.push((highLength >>> 24) & 255);
  data.push((highLength >>> 16) & 255);
  data.push((highLength >>> 8) & 255);
  data.push(highLength & 255);
  data.push((lowLength >>> 24) & 255);
  data.push((lowLength >>> 16) & 255);
  data.push((lowLength >>> 8) & 255);
  data.push(lowLength & 255);

  let h0 = 0x67452301;
  let h1 = 0xefcdab89;
  let h2 = 0x98badcfe;
  let h3 = 0x10325476;
  let h4 = 0xc3d2e1f0;

  for (let chunk = 0; chunk < data.length; chunk += 64) {
    const words = new Array(80);

    for (let index = 0; index < 16; index += 1) {
      const offset = chunk + index * 4;
      words[index] = (
        (data[offset] << 24) |
        (data[offset + 1] << 16) |
        (data[offset + 2] << 8) |
        data[offset + 3]
      ) >>> 0;
    }

    for (let index = 16; index < 80; index += 1) {
      words[index] = rotateLeft(
        words[index - 3] ^ words[index - 8] ^ words[index - 14] ^ words[index - 16],
        1
      ) >>> 0;
    }

    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;
    let e = h4;

    for (let index = 0; index < 80; index += 1) {
      let f;
      let k;

      if (index < 20) {
        f = (b & c) | ((~b) & d);
        k = 0x5a827999;
      } else if (index < 40) {
        f = b ^ c ^ d;
        k = 0x6ed9eba1;
      } else if (index < 60) {
        f = (b & c) | (b & d) | (c & d);
        k = 0x8f1bbcdc;
      } else {
        f = b ^ c ^ d;
        k = 0xca62c1d6;
      }

      const temp = (rotateLeft(a, 5) + f + e + k + words[index]) >>> 0;
      e = d;
      d = c;
      c = rotateLeft(b, 30) >>> 0;
      b = a;
      a = temp;
    }

    h0 = (h0 + a) >>> 0;
    h1 = (h1 + b) >>> 0;
    h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0;
  }

  return [h0, h1, h2, h3, h4].flatMap((word) => [
    (word >>> 24) & 255,
    (word >>> 16) & 255,
    (word >>> 8) & 255,
    word & 255
  ]);
}

function hmacSha1(keyBytes, messageBytes) {
  let key = keyBytes.slice();

  if (key.length > 64) {
    key = sha1(key);
  }

  while (key.length < 64) {
    key.push(0);
  }

  const innerPad = key.map((byte) => byte ^ 0x36);
  const outerPad = key.map((byte) => byte ^ 0x5c);
  const innerHash = sha1(innerPad.concat(messageBytes));
  return sha1(outerPad.concat(innerHash));
}

function counterToBytes(counter) {
  const bytes = new Array(8).fill(0);
  let value = counter;

  for (let index = 7; index >= 0; index -= 1) {
    bytes[index] = value & 255;
    value = Math.floor(value / 256);
  }

  return bytes;
}

function generateTotpCode(counter) {
  const secretBytes = base32Decode(AUTHENTICATOR_SECRET);
  const hmac = hmacSha1(secretBytes, counterToBytes(counter));
  const offset = hmac[hmac.length - 1] & 0x0f;
  const binary = (
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff)
  ) >>> 0;

  return String(binary % 1000000).padStart(6, "0");
}

function isValidTotp(code) {
  const currentCounter = Math.floor(Date.now() / 1000 / TOTP_PERIOD_SECONDS);

  for (let offset = -TOTP_ALLOWED_WINDOW; offset <= TOTP_ALLOWED_WINDOW; offset += 1) {
    if (generateTotpCode(currentCounter + offset) === code) {
      return true;
    }
  }

  return false;
}

function handleAuthSubmit(event) {
  event.preventDefault();

  const now = Date.now();

  if (now < authCooldownUntil) {
    const seconds = Math.ceil((authCooldownUntil - now) / 1000);
    showAuthMessage(`Too many attempts. Try again in ${seconds} seconds.`, "is-error");
    return;
  }

  const code = authCodeInput.value.replace(/\D/g, "").slice(0, 6);
  authCodeInput.value = code;

  if (!/^\d{6}$/.test(code)) {
    showAuthMessage("Enter a valid 6-digit code.", "is-error");
    playAuthErrorAnimation();
    return;
  }

  authSubmit.disabled = true;

  if (isValidTotp(code)) {
    failedAuthAttempts = 0;
    window.setTimeout(() => {
      authSubmit.disabled = false;
      unlockStory();
    }, 180);
    return;
  }

  authSubmit.disabled = false;
  failedAuthAttempts += 1;

  if (failedAuthAttempts >= 5) {
    failedAuthAttempts = 0;
    authCooldownUntil = Date.now() + 30000;
    showAuthMessage("Too many incorrect attempts. Try again in 30 seconds.", "is-error");
  } else {
    showAuthMessage("Invalid code. Check your authenticator app and try again.", "is-error");
  }

  playAuthErrorAnimation();
}

function playAuthErrorAnimation() {
  authGate.classList.remove("has-error");
  void authGate.offsetWidth;
  authGate.classList.add("has-error");
}
function requestIdleTask(callback) {
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(callback, { timeout: 1200 });
    return;
  }

  window.setTimeout(callback, 0);
}

function preloadImageAsset(source) {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = resolve;
    image.onerror = resolve;
    image.decoding = "async";
    image.src = source;

    if (image.decode) {
      image.decode().then(resolve).catch(resolve);
    }
  });
}

function cacheAssetsForFastReading() {
  if (!("caches" in window) || window.location.protocol === "file:") return;

  requestIdleTask(() => {
    caches
      .open(FRONTEND_CACHE_NAME)
      .then((cache) => cache.addAll(PRELOAD_ASSETS))
      .catch(() => {});
  });
}

function warmUpBookPages() {
  requestIdleTask(() => {
    const preloadJobs = Array.from(document.images).map((image) => preloadImageAsset(image.currentSrc || image.src));

    Promise.all(preloadJobs).finally(() => {
      pages.forEach((page) => {
        page.classList.add("is-preloaded");
        page.getBoundingClientRect();
      });

      book.classList.add("is-warmed");
    });
  });
}


function updateInterface() {
  pages.forEach((page, index) => {
    const isCurrent = index === currentPage;
    removeAnimationClasses(page);
    page.classList.toggle("is-active", isCurrent);
    page.setAttribute("aria-hidden", String(!isCurrent));
    page.style.zIndex = isCurrent ? pages.length + 2 : pages.length - index;
  });

  pageCounter.textContent = `Page ${currentPage + 1} of ${pages.length}`;
  progressBar.style.width = `${((currentPage + 1) / pages.length) * 100}%`;
  prevBtn.disabled = currentPage === 0 || isAnimating;
  nextBtn.disabled = currentPage === pages.length - 1 || isAnimating;
  nextBtn.querySelector("span").textContent = currentPage === pages.length - 2 ? "Finish" : "Next Page";
}

function completeTurn(oldPage, newPage) {
  pages.forEach(removeAnimationClasses);
  oldPage.classList.remove("is-active");
  newPage.classList.add("is-active");
  currentPage = pages.indexOf(newPage);
  isAnimating = false;
  book.classList.remove("is-animating");
  updateInterface();
}

function turnPage(direction) {
  if (!isAuthenticated() || isAnimating) return;

  const targetPage = currentPage + direction;
  if (targetPage < 0 || targetPage >= pages.length) return;

  isAnimating = true;
  book.classList.add("is-animating");

  const oldPage = pages[currentPage];
  const newPage = pages[targetPage];
  const readyClass = direction > 0 ? "is-ready-next" : "is-ready-prev";
  const turningClass = direction > 0 ? "is-turning-next" : "is-turning-prev-away";

  prevBtn.disabled = true;
  nextBtn.disabled = true;

  newPage.classList.add(readyClass);
  newPage.style.zIndex = pages.length + 1;
  oldPage.style.zIndex = pages.length + 4;

  const finishTurn = (event) => {
    if (event.target !== oldPage) return;
    completeTurn(oldPage, newPage);
  };

  oldPage.addEventListener("animationend", finishTurn, { once: true });

  requestAnimationFrame(() => {
    oldPage.classList.add(turningClass);
  });
}

function restartStory() {
  if (!isAuthenticated() || isAnimating) return;
  currentPage = 0;
  isAnimating = false;
  book.classList.remove("is-animating");
  updateInterface();
  book.scrollIntoView({ behavior: "smooth", block: "center" });
}

function handleBookClick(event) {
  if (!isAuthenticated() || isAnimating || didSwipe) {
    didSwipe = false;
    return;
  }

  if (event.target.closest("a, button")) return;

  const rect = book.getBoundingClientRect();
  const xPosition = event.clientX - rect.left;
  const leftZone = rect.width * 0.28;
  const rightZone = rect.width * 0.72;

  if (xPosition <= leftZone) {
    turnPage(-1);
  } else if (xPosition >= rightZone) {
    turnPage(1);
  }
}

authForm.addEventListener("submit", handleAuthSubmit);
authCodeInput.addEventListener("input", () => {
  authCodeInput.value = authCodeInput.value.replace(/\D/g, "").slice(0, 6);
});
lockBtn.addEventListener("click", lockStory);
nextBtn.addEventListener("click", () => turnPage(1));
prevBtn.addEventListener("click", () => turnPage(-1));
restartBtn.addEventListener("click", restartStory);
book.addEventListener("click", handleBookClick);

document.addEventListener("keydown", (event) => {
  if (!isAuthenticated()) return;

  if (event.key === "ArrowRight" || event.key === "PageDown") {
    turnPage(1);
  }

  if (event.key === "ArrowLeft" || event.key === "PageUp") {
    turnPage(-1);
  }

  if (event.key === "Home") {
    restartStory();
  }
});

book.addEventListener("touchstart", (event) => {
  touchStartX = event.changedTouches[0].screenX;
  didSwipe = false;
}, { passive: true });

book.addEventListener("touchend", (event) => {
  if (!isAuthenticated()) return;

  touchEndX = event.changedTouches[0].screenX;
  const distance = touchEndX - touchStartX;

  if (Math.abs(distance) < 55) return;

  didSwipe = true;

  if (distance < 0) {
    turnPage(1);
  } else {
    turnPage(-1);
  }
}, { passive: true });

if ("serviceWorker" in navigator && window.location.protocol !== "file:") {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  });
}

cacheAssetsForFastReading();
updateInterface();

if (isAuthenticated()) {
  unlockStory();
} else {
  lockStory();
}
