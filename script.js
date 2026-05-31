const pages = Array.from(document.querySelectorAll(".page"));
const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");
const pageCounter = document.getElementById("pageCounter");
const progressBar = document.getElementById("progressBar");
const book = document.getElementById("book");

const animationDuration = 920;
let currentPage = 0;
let isAnimating = false;
let touchStartX = 0;
let touchEndX = 0;

function updateInterface() {
  pages.forEach((page, index) => {
    const isCurrent = index === currentPage;
    page.classList.toggle("is-active", isCurrent);
    page.classList.remove("is-ready-next");
    page.style.zIndex = isCurrent ? pages.length + 2 : pages.length - index;
  });

  pageCounter.textContent = `Page ${currentPage + 1} of ${pages.length}`;
  progressBar.style.width = `${((currentPage + 1) / pages.length) * 100}%`;
  prevBtn.disabled = currentPage === 0 || isAnimating;
  nextBtn.disabled = currentPage === pages.length - 1 || isAnimating;
  nextBtn.querySelector("span").textContent = currentPage === pages.length - 2 ? "Finish" : "Next Page";
}

function clearAnimationState(oldPage, newPage) {
  pages.forEach((page) => {
    page.classList.remove("is-turning-next", "is-turning-prev", "is-ready-next");
  });

  oldPage.classList.remove("is-active");
  newPage.classList.add("is-active");
  currentPage = pages.indexOf(newPage);
  isAnimating = false;
  book.classList.remove("is-animating");
  updateInterface();
}

function turnPage(direction) {
  if (isAnimating) return;

  const targetPage = currentPage + direction;
  if (targetPage < 0 || targetPage >= pages.length) return;

  isAnimating = true;
  book.classList.add("is-animating");

  const oldPage = pages[currentPage];
  const newPage = pages[targetPage];
  const animationClass = direction > 0 ? "is-turning-next" : "is-turning-prev";

  prevBtn.disabled = true;
  nextBtn.disabled = true;

  if (direction > 0) {
    newPage.classList.add("is-ready-next");
    newPage.style.zIndex = pages.length + 1;
    oldPage.style.zIndex = pages.length + 4;
    oldPage.classList.add(animationClass);
  } else {
    oldPage.style.zIndex = pages.length + 1;
    newPage.classList.add(animationClass, "is-active");
    newPage.style.zIndex = pages.length + 4;
  }

  window.setTimeout(() => clearAnimationState(oldPage, newPage), animationDuration);
}

nextBtn.addEventListener("click", () => turnPage(1));
prevBtn.addEventListener("click", () => turnPage(-1));

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight" || event.key === "PageDown") {
    turnPage(1);
  }

  if (event.key === "ArrowLeft" || event.key === "PageUp") {
    turnPage(-1);
  }
});

book.addEventListener("touchstart", (event) => {
  touchStartX = event.changedTouches[0].screenX;
}, { passive: true });

book.addEventListener("touchend", (event) => {
  touchEndX = event.changedTouches[0].screenX;
  const distance = touchEndX - touchStartX;

  if (Math.abs(distance) < 55) return;

  if (distance < 0) {
    turnPage(1);
  } else {
    turnPage(-1);
  }
}, { passive: true });

updateInterface();
