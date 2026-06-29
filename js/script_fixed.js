const FORMSPREE_ENDPOINT = "https://formspree.io/f/xnjkdeyb"; //https://formspree.io/f/xnjkdeyb
const DATE_RESPONSES_STORAGE_KEY = "mia_date_responses";

const HEART_MESSAGES = [
    "Je t'aime",
    "Ma petite crème fouettée sucrée au sucre",
    "Us forever",
    "Ma princesse",
    "Mia",
    "Mon chaton",
    "❤️‍🔥🫀💍"
];

const PLAYLIST = [
    { title: "Stephen Sanchez - Until I Found You", file: "assets/music/Stephen Sanchez - Until I Found You .mp3" },
    { title: "JAWNY - Honeypie", file: "assets/music/JAWNY - Honeypie .mp3" },
    { title: "Benson Boone - Beautiful Things", file: "assets/music/Benson Boone - Beautiful Things .mp3" },
    { title: "Damiano David - The first time", file: "assets/music/Damiano David - The first time .mp3" },
    { title: "Ed Sheeran - Perfect", file: "assets/music/Ed Sheeran - Perfect.mp3" },
    { title: "Taylor Swift - Love Story", file: "assets/music/Taylor Swift - Love Story .mp3" }
];

const LETTER_TEXT = `Hey my kitten ❤️‍🔥,

I'm writing you this letter to tell you just how much I love you.

You are an incredible person; I truly admire you so much.
I know I'm not perfect, but I hope this webpage makes you happy. It took me a while to create it.
I love you, my love don't ever change. I promise we're going to get married and have children.

I love you madly,
Paul

Mimi, bye-bye 😘`;

const MOIS_FR = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const WHEEL_SEGMENTS = [
    { decoy: "#ff2f73", reveal: "#FF8AD8", compliment: "You look stunning" },
    { decoy: "#FCCA00", reveal: "#FF4365", compliment: "Your smile makes me smile" },
    { decoy: "#00d9ff", reveal: "#E0115F", compliment: "You are my best friend" },
    { decoy: "#c400ff", reveal: "#FF6FB5", compliment: "You are the most beautiful person in the world" },
    { decoy: "#ff5da2", reveal: "#C724B1", compliment: "You are irresistible" },
    { decoy: "#7b1fa2", reveal: "#FF3D81", compliment: "I love you a little more every day" }
];

const viewedCards = new Set();

/* ============================================================
   UTILITAIRES
============================================================ */

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function distance(x1, y1, x2, y2) {
    return Math.hypot(x2 - x1, y2 - y1);
}

function isSameDay(a, b) {
    return a.getFullYear() === b.getFullYear()
        && a.getMonth() === b.getMonth()
        && a.getDate() === b.getDate();
}

function spawnFloatingHearts(container, count = 15) {
    if (!container || container.childElementCount > 0) return;
    const emojis = ["❤️", "💖", "💕", "🌸", "❤️‍🔥"];
    for (let i = 0; i < count; i++) {
        const heart = document.createElement("div");
        heart.classList.add("bg-heart");
        heart.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        heart.style.left = Math.random() * 100 + "%";
        heart.style.animationDuration = (Math.random() * 4 + 4) + "s";
        heart.style.animationDelay = (Math.random() * 5) + "s";
        container.appendChild(heart);
    }
}

/* ============================================================
   ESQUIVE GÉNÉRIQUE D'UN BOUTON "NO"
   
   - maxDodges > 0 : esquive N fois, puis se laisse toucher (affiche "Oh😔",
     attend 2s, repart pour N nouvelles esquives, indéfiniment)
   - maxDodges = 0 : esquive à l'INFINI, jamais cliquable
============================================================ */

function createDodgingNoButton(container, button, onFinalClick, maxDodges) {
    let dodgeCount = 0;
    let isFrozen = false;

    const originalPosition = {
        position: button.style.position || "",
        left:     button.style.left     || "",
        top:      button.style.top      || "",
        transform: button.style.transform || ""
    };

    function resetPosition() {
        button.style.position  = originalPosition.position;
        button.style.left      = originalPosition.left;
        button.style.top       = originalPosition.top;
        button.style.transform = originalPosition.transform;
    }

    function dodge(e) {
        // Si bouton immobilisé (maxDodges atteint), on ne le fait plus esquiver
        if (isFrozen) return;

        const rect = button.getBoundingClientRect();
        const buttonX = rect.left + rect.width  / 2;
        const buttonY = rect.top  + rect.height / 2;
        const dist = Math.hypot(e.clientX - buttonX, e.clientY - buttonY);

        if (dist < 90) {
            // Si maxDodges = 0 → esquive infinie, on n'incrémente pas de compteur bloquant
            if (maxDodges > 0) {
                dodgeCount++;

                if (dodgeCount >= maxDodges) {
                    // Immobilise le bouton après N esquives
                    isFrozen = true;
                    resetPosition();
                    onFinalClick(); // affiche "Oh😔" et attend que resetNoButtonGame() soit appelé
                    return;
                }
            }

            // Repositionnement aléatoire dans le conteneur
            const containerRect = container.getBoundingClientRect();
            const maxX = containerRect.width  - rect.width;
            const maxY = containerRect.height - rect.height;

            button.style.position  = "absolute";
            button.style.left      = Math.max(0, Math.random() * maxX) + "px";
            button.style.top       = Math.max(0, Math.random() * maxY) + "px";
            button.style.transform = "none";
        }
    }

    window.addEventListener("mousemove", dodge);

    // Sur mobile : esquive au touchmove
    window.addEventListener("touchmove", e => {
        if (e.touches.length > 0) {
            dodge({ clientX: e.touches[0].clientX, clientY: e.touches[0].clientY });
        }
    }, { passive: true });

    // Clic sur le bouton : ne fait RIEN (ni pour infini, ni avant d'être immobilisé)
    // → quand isFrozen = true, onFinalClick a déjà été appelé via dodge()
    button.addEventListener("click", e => {
        e.preventDefault();
        // Bouton immobilisé : rien à faire ici, onFinalClick déjà déclenché
        // Bouton non immobilisé : clic dans le vide, on ignore
    });

    return {
        reset() {
            dodgeCount = 0;
            isFrozen   = false;
            resetPosition();
        }
    };
}

/* ============================================================
   ÉTAT GLOBAL
============================================================ */

let isPopupOpen = false;

/* ============================================================
   COEURS DE FOND
============================================================ */

const heartsContainer = document.getElementById("hearts-container");
const hearts = [];

HEART_MESSAGES.forEach(message => {
    const heartElement = document.createElement("div");
    heartElement.classList.add("heart");
    heartElement.textContent = message;
    heartsContainer.appendChild(heartElement);

    hearts.push({
        element: heartElement,
        x: Math.random() * (window.innerWidth - 120),
        y: Math.random() * (window.innerHeight - 110),
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        angle: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 4,
        scale: 0.7 + Math.random() * 0.8
    });
});

function animateHearts() {
    if (!isPopupOpen) {
        hearts.forEach(heart => {
            heart.x += heart.vx;
            heart.y += heart.vy;

            if (heart.x <= 0 || heart.x >= window.innerWidth - 120) heart.vx *= -1;
            if (heart.y <= 0 || heart.y >= window.innerHeight - 110) heart.vy *= -1;

            heart.angle += heart.rotationSpeed;

            heart.element.style.transform = `
                translate3d(${heart.x}px, ${heart.y}px, 0)
                rotate(${heart.angle}deg)
                scale(${heart.scale})
            `;
        });
    }
    requestAnimationFrame(animateHearts);
}

animateHearts();

window.addEventListener("resize", () => {
    hearts.forEach(heart => {
        heart.x = Math.min(heart.x, window.innerWidth - 120);
        heart.y = Math.min(heart.y, window.innerHeight - 110);
    });
});

/* ============================================================
   MENU MUSIQUE
============================================================ */

const heartBtn  = document.getElementById("heart-btn");
const menu      = document.getElementById("menu");
const musicBtn  = document.getElementById("music-btn");
const music     = document.getElementById("music");
const prevBtn   = document.getElementById("prev-btn");
const nextBtn   = document.getElementById("next-btn");

let currentTrack = 0;

function loadTrack(index) {
    music.src = PLAYLIST[index].file;
    musicBtn.textContent = "▶ " + PLAYLIST[index].title;
}

function playTrack(index) {
    currentTrack = index;
    loadTrack(currentTrack);
    music.play();
    musicBtn.textContent = "⏸ " + PLAYLIST[currentTrack].title;
}

loadTrack(currentTrack);

heartBtn.addEventListener("click", () => menu.classList.toggle("open"));

musicBtn.addEventListener("click", () => {
    if (music.paused) {
        music.play();
        musicBtn.textContent = "⏸ " + PLAYLIST[currentTrack].title;
    } else {
        music.pause();
        musicBtn.textContent = "▶ " + PLAYLIST[currentTrack].title;
    }
});

nextBtn.addEventListener("click", () => playTrack((currentTrack + 1) % PLAYLIST.length));
prevBtn.addEventListener("click", () => playTrack((currentTrack - 1 + PLAYLIST.length) % PLAYLIST.length));
music.addEventListener("ended", () => playTrack((currentTrack + 1) % PLAYLIST.length));

/* ============================================================
   CARTE 1 — CHRONOMÈTRE DE LA RELATION
============================================================ */

const firstBox             = document.querySelector(".box-1");
const timerPopup           = document.getElementById("timer-popup");
const closeTimer           = document.getElementById("close-timer");
const timerDisplay         = document.getElementById("relationship-timer");
const timerHeartsContainer = document.getElementById("timer-hearts");

let timerInterval;

function updateRelationshipTimer() {
    const startDate = new Date(2025, 11, 8, 18, 17, 35);
    const now = new Date();

    let years   = now.getFullYear()  - startDate.getFullYear();
    let months  = now.getMonth()     - startDate.getMonth();
    let days    = now.getDate()      - startDate.getDate();
    let hours   = now.getHours()     - startDate.getHours();
    let minutes = now.getMinutes()   - startDate.getMinutes();
    let seconds = now.getSeconds()   - startDate.getSeconds();

    if (seconds < 0) { seconds += 60; minutes--; }
    if (minutes < 0) { minutes += 60; hours--; }
    if (hours   < 0) { hours   += 24; days--; }
    if (days    < 0) { days += new Date(now.getFullYear(), now.getMonth(), 0).getDate(); months--; }
    if (months  < 0) { months  += 12; years--; }

    const plural = (v, s, p) => v > 1 ? p : s;

    timerDisplay.innerHTML = `
        <div class="time-box">${years}<br>${plural(years,   "year",   "years")}</div>
        <div class="time-box">${months}<br>${plural(months, "month",  "months")}</div>
        <div class="time-box">${days}<br>${plural(days,     "day",    "days")}</div>
        <div class="time-box">${hours}<br>${plural(hours,   "hour",   "hours")}</div>
        <div class="time-box">${minutes}<br>${plural(minutes,"minute","minutes")}</div>
        <div class="time-box">${seconds}<br>${plural(seconds,"second","seconds")}</div>
    `;
}

firstBox.addEventListener("click", () => {
    markCardViewed(1);
    isPopupOpen = true;
    timerPopup.style.display = "block";
    spawnFloatingHearts(timerHeartsContainer);
    setTimeout(() => timerPopup.classList.add("active"), 10);
    updateRelationshipTimer();
    timerInterval = setInterval(updateRelationshipTimer, 1000);
});

closeTimer.addEventListener("click", () => {
    isPopupOpen = false;
    timerPopup.classList.remove("active");
    clearInterval(timerInterval);
    setTimeout(() => { timerPopup.style.display = "none"; maybeOfferSurprise(); }, 400);
});

/* ============================================================
   CARTE 2 — JARDIN DE FLEURS
============================================================ */

const secondBox   = document.querySelector(".box-2");
const flowersPopup = document.getElementById("flowers-popup");
const closeFlowers = document.getElementById("close-flowers");
const flowersRoot  = document.getElementById("flowers");

secondBox.addEventListener("click", () => {
    markCardViewed(2);
    isPopupOpen = true;
    flowersPopup.style.display = "block";
    flowersRoot.classList.remove("grown");
    setTimeout(() => {
        flowersPopup.classList.add("active");
        requestAnimationFrame(() => flowersRoot.classList.add("grown"));
    }, 10);
});

closeFlowers.addEventListener("click", () => {
    isPopupOpen = false;
    flowersPopup.classList.remove("active");
    setTimeout(() => { flowersPopup.style.display = "none"; maybeOfferSurprise(); }, 400);
});

function buildBloom(bloomEl, petalCount, radius) {
    for (let i = 0; i < petalCount; i++) {
        const petal = document.createElement("div");
        petal.className = "petal";
        petal.style.transform = `rotate(${(360 / petalCount) * i}deg)`;
        petal.style.height    = radius + "px";
        petal.style.marginTop = (-radius) + "px";
        bloomEl.appendChild(petal);
    }
    const core = document.createElement("div");
    core.className = "core";
    bloomEl.appendChild(core);
}

buildBloom(document.getElementById("bloom1"), 8, 36);
buildBloom(document.getElementById("bloom2"), 9, 42);
buildBloom(document.getElementById("bloom3"), 7, 34);

const heartsLayer  = document.getElementById("flowers-hearts");
const heartColors  = ["#ff2bd6","#ff5da2","#ff2974","#c400ff","#00eaff","#ff8af0","#ff0090"];

for (let i = 0; i < 26; i++) {
    const h     = document.createElement("div");
    h.className = "flower-heart";
    const color    = heartColors[Math.floor(Math.random() * heartColors.length)];
    const duration = 7 + Math.random() * 8;
    h.textContent  = "❤";
    h.style.left   = Math.random() * 100 + "%";
    h.style.color  = color;
    h.style.fontSize   = (12 + Math.random() * 22) + "px";
    h.style.textShadow = `0 0 6px ${color}, 0 0 14px ${color}, 0 0 24px ${color}`;
    h.style.setProperty("--d", (30 + Math.random() * 70).toFixed(1));
    h.style.setProperty("--s", (0.6 + Math.random() * 0.9).toFixed(2));
    h.style.animationDuration = duration.toFixed(2) + "s";
    h.style.animationDelay   = (-Math.random() * duration).toFixed(2) + "s";
    heartsLayer.appendChild(h);
}

const flowersScene      = document.getElementById("flowers-scene");
const flowersCursorGlow = document.getElementById("flowers-cursor-glow");
const flowersHint       = document.getElementById("flowers-hint");

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;

function updatePointer(x, y) {
    if (!flowersPopup.classList.contains("active")) return;
    mouseX = x; mouseY = y;
    flowersCursorGlow.style.transform = `translate(${x}px, ${y}px)`;
    flowersHint.classList.add("fade");
}

flowersScene.addEventListener("mousemove", e => updatePointer(e.clientX, e.clientY));

const flowers = [
    { el: document.getElementById("f1"), baseFan: -40, windAmp: 6, windFreq: 0.55, phase: 0   },
    { el: document.getElementById("f2"), baseFan: -25, windAmp: 5, windFreq: 0.42, phase: 1.4 },
    { el: document.getElementById("f3"), baseFan: -10, windAmp: 7, windFreq: 0.50, phase: 2.7 }
];

let flowersBaseX = 0;
function updateFlowersBase() { flowersBaseX = flowersRoot.getBoundingClientRect().left; }
updateFlowersBase();
window.addEventListener("resize", updateFlowersBase);

function animateFlowers(time) {
    if (flowersPopup.classList.contains("active")) {
        const t  = time * 0.001;
        const dx = mouseX - flowersBaseX;
        flowers.forEach(f => {
            const wind = Math.sin(t * f.windFreq + f.phase) * f.windAmp
                       + Math.sin(t * f.windFreq * 2.3 + f.phase * 1.7) * (f.windAmp * 0.25);
            const total = f.baseFan + wind + clamp(dx / 20, -25, 25);
            f.el.style.transform = `rotate(${total}deg)`;
        });
    }
    requestAnimationFrame(animateFlowers);
}
requestAnimationFrame(animateFlowers);

/* ============================================================
   CARTE 3 — PARTICULES NÉON
============================================================ */

const thirdBox           = document.querySelector(".box-3");
const particlesPopup     = document.getElementById("particles-popup");
const closeParticles     = document.getElementById("close-particles");
const particlesContent   = document.getElementById("particles-content");
const canvas             = document.getElementById("canvas");
const ctx                = canvas.getContext("2d");
const particlesCursorGlow = document.getElementById("particles-cursor-glow");

const PARTICLE_COUNT = 2000;
const particlesArray = [];

let particlesAnimationId;
let heartFormed      = false;
let globalAlphaValue = 1.0;

particlesContent.addEventListener("mousemove", e => {
    const rect = particlesContent.getBoundingClientRect();
    particlesCursorGlow.style.transform =
        `translate3d(${e.clientX - rect.left}px, ${e.clientY - rect.top}px, 0)`;
});

thirdBox.addEventListener("click", () => {
    markCardViewed(3);
    isPopupOpen = true;
    particlesPopup.style.display = "block";
    setTimeout(() => {
        particlesPopup.classList.add("active");
        resizeCanvas();
        initParticles();
        heartFormed      = false;
        globalAlphaValue = 1.0;
        animateCanvas();
    }, 10);
});

closeParticles.addEventListener("click", () => {
    isPopupOpen = false;
    particlesPopup.classList.remove("active");
    setTimeout(() => {
        particlesPopup.style.display = "none";
        cancelAnimationFrame(particlesAnimationId);
        particlesArray.length = 0;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        maybeOfferSurprise();
    }, 400);
});

function resizeCanvas() {
    canvas.width  = particlesContent.clientWidth;
    canvas.height = particlesContent.clientHeight;
}
window.addEventListener("resize", resizeCanvas);

function neonColor() { return `hsl(${Math.random() * 360}, 100%, 65%)`; }

class Particle {
    constructor() {
        this.x  = Math.random() * canvas.width;
        this.y  = Math.random() * canvas.height;
        this.tx = this.x; this.ty = this.y;
        this.vx = (Math.random() - 0.5) * 3;
        this.vy = (Math.random() - 0.5) * 3;
        this.size  = Math.random() * 1.8 + 1;
        this.color = neonColor();
    }
    update() {
        if (heartFormed) {
            const dx = this.tx - this.x, dy = this.ty - this.y;
            this.vx += dx * 0.006; this.vy += dy * 0.006;
            this.vx *= 0.93;       this.vy *= 0.93;
        } else {
            if (this.x < 0 || this.x > canvas.width)  this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height)  this.vy *= -1;
            this.vx *= 0.998; this.vy *= 0.998;
        }
        this.x += this.vx; this.y += this.vy;
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}

function initParticles() {
    particlesArray.length = 0;
    for (let i = 0; i < PARTICLE_COUNT; i++) particlesArray.push(new Particle());
}

function createHeartPoints(cx, cy) {
    const points = [];
    const scale  = Math.min(canvas.width, canvas.height) / 45;
    for (let t = 0; t < Math.PI * 2; t += 0.003) {
        const x = 16 * Math.pow(Math.sin(t), 3);
        const y = 13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t);
        points.push({ x: cx + x * scale, y: cy - y * scale });
    }
    return points;
}

function formHeart(cx, cy) {
    const heartPoints = createHeartPoints(cx, cy);
    particlesArray.forEach((p, i) => {
        const target = heartPoints[Math.floor(i * heartPoints.length / PARTICLE_COUNT)];
        p.tx = target.x + (Math.random() - 0.5) * 20;
        p.ty = target.y + (Math.random() - 0.5) * 20;
    });
    heartFormed = true;
}

function explodeParticles() {
    particlesArray.forEach(p => {
        const angle = Math.random() * Math.PI * 2;
        const power = Math.random() * 10 + 4;
        p.vx = Math.cos(angle) * power;
        p.vy = Math.sin(angle) * power;
    });
    heartFormed = false;
}

canvas.addEventListener("click", e => {
    const rect = canvas.getBoundingClientRect();
    if (!heartFormed) formHeart(e.clientX - rect.left, e.clientY - rect.top);
    else              explodeParticles();
});

function animateCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (heartFormed) { if (globalAlphaValue > 0.45) globalAlphaValue -= 0.01; }
    else if (globalAlphaValue < 1.0)                  globalAlphaValue += 0.02;
    ctx.globalAlpha = globalAlphaValue;
    ctx.globalCompositeOperation = "lighter";
    particlesArray.forEach(p => { p.update(); p.draw(); });
    particlesAnimationId = requestAnimationFrame(animateCanvas);
}

/* ============================================================
   CARTE 4 — LETTRE
============================================================ */

const fourthBox             = document.querySelector(".box-4");
const letterPopup           = document.getElementById("letter-popup");
const closeLetter           = document.getElementById("close-letter");
const envelopeWrapper       = document.querySelector(".envelope-wrapper");
const typewriterElement     = document.getElementById("typewriter-text");
const letterHeartsContainer = document.getElementById("letter-hearts");

let letterCharIndex = 0;
let typingInterval;

function startTyping() {
    typewriterElement.textContent = "";
    letterCharIndex = 0;
    clearInterval(typingInterval);
    typingInterval = setInterval(() => {
        if (letterCharIndex < LETTER_TEXT.length) {
            typewriterElement.textContent += LETTER_TEXT.charAt(letterCharIndex++);
            const paper = document.querySelector(".paper");
            paper.scrollTop = paper.scrollHeight;
        } else {
            clearInterval(typingInterval);
        }
    }, 50);
}

fourthBox.addEventListener("click", () => {
    markCardViewed(4);
    isPopupOpen = true;
    letterPopup.style.display = "block";
    spawnFloatingHearts(letterHeartsContainer);
    setTimeout(() => letterPopup.classList.add("active"), 10);
});

envelopeWrapper.addEventListener("click", () => {
    if (!envelopeWrapper.classList.contains("open")) {
        envelopeWrapper.classList.add("open");
        setTimeout(startTyping, 1500);
    }
});

closeLetter.addEventListener("click", () => {
    isPopupOpen = false;
    letterPopup.classList.remove("active");
    setTimeout(() => {
        letterPopup.style.display = "none";
        envelopeWrapper.classList.remove("open");
        typewriterElement.textContent = "";
        letterCharIndex = 0;
        clearInterval(typingInterval);
        maybeOfferSurprise();
    }, 400);
});

/* ============================================================
   CARTE 5 — DEMANDE DE RENDEZ-VOUS
============================================================ */

const fifthBox            = document.querySelector(".box-5");
const datePopup           = document.getElementById("date-popup");
const closeDate           = document.getElementById("close-date");
const dateHeartsContainer = document.getElementById("date-hearts");
const dateSteps           = Array.from(document.querySelectorAll("#date-content .date-step"));

const btnYes      = document.getElementById("btn-yes");
const btnNo       = document.getElementById("btn-no");
const noErrorMsg  = document.getElementById("no-error-msg");
const noZone      = document.querySelector(".date-question-buttons");

const themeCards     = Array.from(document.querySelectorAll(".theme-card"));
const validateTheme  = document.getElementById("validate-theme");

const locationInput    = document.getElementById("location-input");
const validateLocation = document.getElementById("validate-location");

const calPrev            = document.getElementById("cal-prev");
const calNext            = document.getElementById("cal-next");
const calMonthLabel      = document.getElementById("cal-month-label");
const calendarGrid       = document.getElementById("calendar-grid");
const validateCalendar   = document.getElementById("validate-calendar");

const finalSummary = document.getElementById("final-summary");
const closeFinal   = document.getElementById("close-final");

const dateAnswers = { theme: null, location: "", date: null };
let calendarViewDate     = new Date();
let selectedCalendarDate = null;

function goToDateStep(stepIndex) {
    dateSteps.forEach(step =>
        step.classList.toggle("active", Number(step.dataset.step) === stepIndex)
    );
}

function resetDateFlow() {
    dateAnswers.theme = null;
    dateAnswers.location = "";
    dateAnswers.date = null;
    themeCards.forEach(c => c.classList.remove("selected"));
    validateTheme.disabled    = true;
    locationInput.value       = "";
    validateLocation.disabled = true;
    selectedCalendarDate      = null;
    calendarViewDate          = new Date();
    validateCalendar.disabled = true;
    noErrorMsg.textContent    = "";
    noButtonGame.reset();
    goToDateStep(0);
}

fifthBox.addEventListener("click", () => {
    markCardViewed(5);
    isPopupOpen = true;
    datePopup.style.display = "block";
    spawnFloatingHearts(dateHeartsContainer);
    resetDateFlow();
    setTimeout(() => datePopup.classList.add("active"), 10);
});

function closeDatePopup() {
    isPopupOpen = false;
    datePopup.classList.remove("active");
    setTimeout(() => { datePopup.style.display = "none"; maybeOfferSurprise(); }, 400);
}

closeDate.addEventListener("click",  closeDatePopup);
closeFinal.addEventListener("click", closeDatePopup);

/* ---- Bouton "No" de la carte 5 : esquive 10 fois puis se laisse toucher ---- */

function handleNoButtonReached() {
    // Le bouton est maintenant immobilisé : on affiche "Oh😔"
    noErrorMsg.classList.remove("shake");
    void noErrorMsg.offsetWidth;
    noErrorMsg.textContent = "Oh😔";
    noErrorMsg.classList.add("shake");

    // Après 2 s, on efface le message et on repart pour 10 nouvelles esquives
    setTimeout(() => {
        noErrorMsg.textContent = "";
        noButtonGame.reset();  // remet dodgeCount à 0 et débloque l'esquive
    }, 2000);
}

// maxDodges = 10 → esquive 10 fois, puis se laisse "toucher" (déclenche handleNoButtonReached)
const noButtonGame = createDodgingNoButton(noZone, btnNo, handleNoButtonReached, 10);

btnYes.addEventListener("click", () => goToDateStep(1));

/* ---- Étape 1 : thème ---- */

themeCards.forEach(card => {
    card.addEventListener("click", () => {
        themeCards.forEach(c => c.classList.remove("selected"));
        card.classList.add("selected");
        dateAnswers.theme     = card.dataset.theme;
        validateTheme.disabled = false;
    });
});

validateTheme.addEventListener("click", () => goToDateStep(2));

/* ---- Étape 2 : lieu ---- */

locationInput.addEventListener("input", () => {
    validateLocation.disabled = locationInput.value.trim().length === 0;
});

validateLocation.addEventListener("click", () => {
    dateAnswers.location = locationInput.value.trim();
    renderCalendar();
    goToDateStep(3);
});

/* ---- Étape 3 : calendrier ---- */

function renderCalendar() {
    const year  = calendarViewDate.getFullYear();
    const month = calendarViewDate.getMonth();
    calMonthLabel.textContent = `${MOIS_FR[month]} ${year}`;
    calendarGrid.innerHTML    = "";

    const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7;
    const daysInMonth   = new Date(year, month + 1, 0).getDate();
    const today         = new Date();

    for (let i = 0; i < firstDayIndex; i++) calendarGrid.appendChild(document.createElement("span"));

    for (let day = 1; day <= daysInMonth; day++) {
        const cellDate = new Date(year, month, day);
        const cell     = document.createElement("button");
        cell.type      = "button";
        cell.className = "calendar-day";
        cell.textContent = day;
        if (isSameDay(cellDate, today))                                    cell.classList.add("today");
        if (selectedCalendarDate && isSameDay(cellDate, selectedCalendarDate)) cell.classList.add("selected");
        cell.addEventListener("click", () => {
            selectedCalendarDate    = cellDate;
            validateCalendar.disabled = false;
            renderCalendar();
        });
        calendarGrid.appendChild(cell);
    }
}

calPrev.addEventListener("click", () => { calendarViewDate.setMonth(calendarViewDate.getMonth() - 1); renderCalendar(); });
calNext.addEventListener("click", () => { calendarViewDate.setMonth(calendarViewDate.getMonth() + 1); renderCalendar(); });

validateCalendar.addEventListener("click", () => {
    dateAnswers.date = selectedCalendarDate;
    finalizeDateAnswers();
    goToDateStep(4);
});

/* ---- Étape 4 : message final ---- */

function finalizeDateAnswers() {
    const dateLabel = dateAnswers.date
        ? dateAnswers.date.toLocaleDateString("fr-FR", { day:"numeric", month:"long", year:"numeric" })
        : "";
    finalSummary.textContent = `${dateAnswers.theme} — le ${dateLabel} — ${dateAnswers.location}`;
    saveAndSendDateResponse({
        theme: dateAnswers.theme,
        location: dateAnswers.location,
        date: dateAnswers.date ? dateAnswers.date.toISOString() : null,
        submittedAt: new Date().toISOString()
    });
}

function saveAndSendDateResponse(response) {
    const allResponses = JSON.parse(localStorage.getItem(DATE_RESPONSES_STORAGE_KEY) || "[]");
    allResponses.push(response);
    localStorage.setItem(DATE_RESPONSES_STORAGE_KEY, JSON.stringify(allResponses));

    if (!FORMSPREE_ENDPOINT) {
        console.info("Formspree non configuré : réponse seulement sauvegardée localement.", response);
        return;
    }
    fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({
            _subject: "💌 Nouvelle réponse de Mia sur le site !",
            theme: response.theme, lieu: response.location,
            date: response.date,   envoye_le: response.submittedAt
        })
    }).catch(err => console.error("Échec envoi e-mail :", err));
}

/* ============================================================
   CARTE 6 — ROUE DE L'AMOUR
============================================================ */

const WHEEL_SEGMENT_COUNT = WHEEL_SEGMENTS.length;
const WHEEL_SEGMENT_ANGLE = 360 / WHEEL_SEGMENT_COUNT;

const sixthBox              = document.querySelector(".box-6");
const wheelPopup            = document.getElementById("wheel-popup");
const closeWheel            = document.getElementById("close-wheel");
const wheelHeartsContainer  = document.getElementById("wheel-hearts");
const wheelEl               = document.getElementById("wheel");
const spinBtn               = document.getElementById("spin-btn");

let wheelBuilt    = false;
let wheelRotation = 0;
let isSpinning    = false;
let wheelDrawPile = [];

function pieSlicePath(startDeg, endDeg) {
    const steps  = 8;
    const points = ["50% 50%"];
    for (let i = 0; i <= steps; i++) {
        const angle = startDeg + (endDeg - startDeg) * (i / steps);
        const rad   = (angle * Math.PI) / 180;
        points.push(`${(50 + 50 * Math.sin(rad)).toFixed(2)}% ${(50 - 50 * Math.cos(rad)).toFixed(2)}%`);
    }
    return `polygon(${points.join(",")})`;
}

function buildWheel() {
    if (wheelBuilt) return;
    const wheelSize    = wheelEl.offsetWidth || 300;
    const radiusPx     = wheelSize * 0.36;
    const textWidthPx  = wheelSize * 0.36;

    WHEEL_SEGMENTS.forEach((segment, i) => {
        const startAngle = i * WHEEL_SEGMENT_ANGLE;
        const endAngle   = startAngle + WHEEL_SEGMENT_ANGLE;
        const midAngle   = startAngle + WHEEL_SEGMENT_ANGLE / 2;
        const clipPath   = pieSlicePath(startAngle, endAngle);

        const reveal        = document.createElement("div");
        reveal.className    = "wedge-reveal";
        reveal.style.clipPath  = clipPath;
        reveal.style.background = segment.reveal;
        const label         = document.createElement("span");
        label.className     = "wedge-text";
        label.textContent   = segment.compliment;
        label.style.width   = `${textWidthPx}px`;
        label.style.transform = `translate(-50%, -50%) rotate(${midAngle}deg) translateY(-${radiusPx}px)`;
        reveal.appendChild(label);

        const cover         = document.createElement("div");
        cover.className     = "wedge-cover";
        cover.dataset.index = i;
        cover.style.clipPath   = clipPath;
        cover.style.background = segment.decoy;

        wheelEl.appendChild(reveal);
        wheelEl.appendChild(cover);
    });
    wheelBuilt = true;
}

function shuffledSegmentIndices() {
    const indices = WHEEL_SEGMENTS.map((_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices;
}

function resetWheel() {
    wheelDrawPile = shuffledSegmentIndices();
    wheelEl.querySelectorAll(".wedge-cover").forEach(cover => {
        cover.style.transition = "none";
        cover.classList.remove("fallen");
    });
    wheelRotation = 0;
    wheelEl.style.transition = "none";
    wheelEl.style.transform  = "rotate(0deg)";
    requestAnimationFrame(() => {
        wheelEl.style.transition = "";
        wheelEl.querySelectorAll(".wedge-cover").forEach(c => c.style.transition = "");
    });
    isSpinning    = false;
    spinBtn.disabled = false;
}

function pickNextSegmentIndex() {
    if (wheelDrawPile.length > 0) return wheelDrawPile.pop();
    return Math.floor(Math.random() * WHEEL_SEGMENT_COUNT);
}

function spinWheel() {
    if (isSpinning) return;
    isSpinning       = true;
    spinBtn.disabled = true;

    const targetIndex   = pickNextSegmentIndex();
    const segmentCenter = targetIndex * WHEEL_SEGMENT_ANGLE + WHEEL_SEGMENT_ANGLE / 2;
    const jitter        = (Math.random() - 0.5) * (WHEEL_SEGMENT_ANGLE * 0.5);
    const requiredAngle = ((-(segmentCenter + jitter) % 360) + 360) % 360;
    const extraTurns    = 5 + Math.floor(Math.random() * 3);
    const currentMod    = ((wheelRotation % 360) + 360) % 360;
    const delta         = ((requiredAngle - currentMod) + 360) % 360;
    wheelRotation      += extraTurns * 360 + delta;
    wheelEl.style.transform = `rotate(${wheelRotation}deg)`;

    wheelEl.addEventListener("transitionend", function onSpinEnd() {
        wheelEl.removeEventListener("transitionend", onSpinEnd);
        revealSegment(targetIndex);
        isSpinning       = false;
        spinBtn.disabled = false;
    }, { once: true });
}

function revealSegment(index) {
    const cover = wheelEl.querySelector(`.wedge-cover[data-index="${index}"]`);
    if (cover) cover.classList.add("fallen");
}

sixthBox.addEventListener("click", () => {
    isPopupOpen = true;
    wheelPopup.style.display = "block";
    spawnFloatingHearts(wheelHeartsContainer);
    buildWheel();
    resetWheel();
    setTimeout(() => wheelPopup.classList.add("active"), 10);
});

closeWheel.addEventListener("click", () => {
    isPopupOpen = false;
    wheelPopup.classList.remove("active");
    setTimeout(() => {
        wheelPopup.style.display = "none";
        markCardViewed(6);
        maybeOfferSurprise();
    }, 400);
});

spinBtn.addEventListener("click", spinWheel);

/* ============================================================
   SURPRISE FINALE — FEU D'ARTIFICE
============================================================ */

const surpriseOverlay  = document.getElementById("surprise-overlay");
const yesSurpriseBtn   = document.getElementById("yes-surprise");
const noSurpriseBtn    = document.getElementById("no-surprise");
const surpriseErrorMsg = document.getElementById("surprise-no-error");

const fireworksShow  = document.getElementById("fireworks-show");
const fwCanvas       = document.getElementById("fireworks-canvas");
const fwCtx          = fwCanvas.getContext("2d");
const endFireworksBtn = document.getElementById("end-fireworks");

const FIREWORK_PHOTOS  = ["assets/image/Nous1.jpg","assets/image/Nous2.jpg","assets/image/Nous3.jpg","assets/image/Nous4.jpg","assets/image/Nous5.jpg","assets/image/Nous6.jpg","assets/image/Nous7.jpg"];
const FIREWORK_COLORS  = ["#ff2f73","#ff6fb5","#c724b1","#7b1fa2","#FCCA00","#00d9ff","#ff8ad8"];
const MAX_FIREWORK_PARTICLES = 15000;

let surpriseOffered    = false;
let fwParticles        = [];
let fwRockets          = [];
let photoFireworkActive = false;
let nextRocketIsPhoto  = false;
let fireworksAnimId    = null;
let rocketSchedulerId  = null;
let photoWaitIntervalId = null;
let fwLastTime         = 0;

const photoTargetSets  = [];

/* ---- Bouton "No" de la surprise : esquive à l'INFINI (maxDodges = 0) ---- */
const surpriseNoZone      = document.querySelector("#surprise-box .date-question-buttons");

// maxDodges = 0 → esquive pour toujours, jamais cliquable
const surpriseNoButtonGame = createDodgingNoButton(
    surpriseNoZone,
    noSurpriseBtn,
    () => {}, // ne sera jamais appelé
    0
);

/* ---- Déclenchement de la surprise ---- */

function markCardViewed(number) { viewedCards.add(number); }

function maybeOfferSurprise() {
    if (surpriseOffered || viewedCards.size < 6) return;
    surpriseOffered        = true;
    isPopupOpen            = true;
    surpriseErrorMsg.textContent = "";
    surpriseNoButtonGame.reset();
    surpriseOverlay.style.display = "flex";
    requestAnimationFrame(() => surpriseOverlay.classList.add("active"));
}

yesSurpriseBtn.addEventListener("click", () => {
    surpriseOverlay.classList.remove("active");
    setTimeout(() => { surpriseOverlay.style.display = "none"; startFireworksShow(); }, 400);
});

/* ---- Préchargement photos ---- */

FIREWORK_PHOTOS.forEach(src => {
    const img    = new Image();
    img.onload   = () => { const t = sampleImageTargets(img); if (t.length) photoTargetSets.push(t); };
    img.onerror  = () => {};
    img.src      = src;
});

function sampleImageTargets(img) {
    const sampleSize = 260;
    const ratio      = img.naturalHeight / img.naturalWidth;
    const off        = document.createElement("canvas");
    off.width        = sampleSize;
    off.height       = Math.max(1, Math.round(sampleSize * ratio));
    const offCtx     = off.getContext("2d");
    offCtx.drawImage(img, 0, 0, off.width, off.height);
    const data       = offCtx.getImageData(0, 0, off.width, off.height).data;
    const targets    = [];
    for (let y = 0; y < off.height; y += 2) {
        for (let x = 0; x < off.width; x += 2) {
            const i = (y * off.width + x) * 4;
            if (data[i + 3] < 40) continue;
            targets.push({ dx: (x / off.width) - 0.5, dy: (y / off.height) - 0.5, color: `rgb(${data[i]},${data[i+1]},${data[i+2]})` });
        }
    }
    return targets;
}

function createHeartTargets() {
    const targets = [];
    for (let t = 0; t < Math.PI * 2; t += 0.16) {
        const x = 16 * Math.pow(Math.sin(t), 3);
        const y = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
        targets.push({ dx: x / 32, dy: y / 32, color: null });
    }
    return targets;
}

/* ---- Moteur feu d'artifice ---- */

function resizeFireworksCanvas() {
    fwCanvas.width  = window.innerWidth;
    fwCanvas.height = window.innerHeight;
    fwCtx.fillStyle = "#08001a";
    fwCtx.fillRect(0, 0, fwCanvas.width, fwCanvas.height);
}
window.addEventListener("resize", () => { if (fireworksShow.classList.contains("active")) resizeFireworksCanvas(); });

class FireworkRocket {
    constructor(targetX, targetY, isPhoto = false) {
        this.x        = targetX;
        this.startY   = fwCanvas.height;
        this.y        = this.startY;
        this.targetX  = targetX;
        this.targetY  = targetY;
        this.progress = 0;
        this.duration = 700 + Math.random() * 400;
        this.color    = FIREWORK_COLORS[Math.floor(Math.random() * FIREWORK_COLORS.length)];
        this.done     = false;
        this.isPhoto  = isPhoto;
    }
    update(dt) {
        this.progress += dt;
        const t    = clamp(this.progress / this.duration, 0, 1);
        const ease = 1 - Math.pow(1 - t, 2);
        this.y     = this.startY + (this.targetY - this.startY) * ease;
        if (t >= 1 && !this.done) { this.done = true; explodeFirework(this.x, this.y, this.color, this.isPhoto); }
    }
    draw() {
        fwCtx.beginPath();
        fwCtx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        fwCtx.fillStyle   = this.color;
        fwCtx.shadowColor = this.color;
        fwCtx.shadowBlur  = 12;
        fwCtx.fill();
    }
}

class FireworkParticle {
    constructor(x, y, color, isPhoto = false) {
        this.x  = x; this.y = y;
        this.color  = color;
        this.isPhoto = isPhoto;
        this.size   = 2 + Math.random() * 2;
        this.alpha  = 1;
        this.mode   = "burst";
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 6;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.tx = null; this.ty = null;
        this.age           = 0;
        this.assembleDelay = 280 + Math.random() * 220;
        this.life          = 1100 + Math.random() * 500;
    }
    setTarget(tx, ty, holdMs) {
        this.tx   = tx; this.ty = ty;
        this.mode = "assemble";
        this.life = this.assembleDelay + holdMs + 600;
    }
    update(dt) {
        this.age  += dt;
        const step = dt / 16.6;
        if (this.mode === "assemble" && this.age > this.assembleDelay) {
            const dx = this.tx - this.x, dy = this.ty - this.y;
            this.vx += dx * 0.035; this.vy += dy * 0.035;
            this.vx *= 0.80;       this.vy *= 0.80;
        } else {
            this.vy += 0.045; this.vx *= 0.985;
        }
        this.x += this.vx * step; this.y += this.vy * step;
        const fadeStart = this.life - 500;
        this.alpha = this.age > fadeStart ? clamp(1 - (this.age - fadeStart) / 500, 0, 1) : 1;
    }
    isDead() { return this.age >= this.life; }
    draw() {
        fwCtx.globalAlpha = this.alpha;
        fwCtx.beginPath();
        fwCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        fwCtx.fillStyle   = this.color;
        fwCtx.shadowBlur  = this.isPhoto ? 0 : 8;
        if (!this.isPhoto) fwCtx.shadowColor = this.color;
        fwCtx.fill();
    }
}

function spawnClassicBurst(x, y, color, count) {
    for (let i = 0; i < count; i++) fwParticles.push(new FireworkParticle(x, y, color, false));
}

function explodeFirework(x, y, baseColor, isPhoto) {
    if (isPhoto && photoTargetSets.length > 0) {
        const size    = Math.min(window.innerWidth, window.innerHeight) * 0.8;
        const targets = photoTargetSets[Math.floor(Math.random() * photoTargetSets.length)];
        targets.forEach(target => {
            const color = target.color || baseColor;
            const p     = new FireworkParticle(x, y, color, true);
            p.size      = 1.0;
            p.setTarget(x + target.dx * size, y + target.dy * size, 4500);
            fwParticles.push(p);
        });
        return;
    }
    if (fwParticles.length > 2000) { spawnClassicBurst(x, y, baseColor, 30); return; }
    const roll = Math.random();
    if (roll >= 0.5) { spawnClassicBurst(x, y, baseColor, 40 + Math.floor(Math.random() * 20)); return; }
    const size    = 260 + Math.random() * 80;
    const targets = createHeartTargets();
    targets.forEach(target => {
        const p   = new FireworkParticle(x, y, baseColor, false);
        p.size    = 3;
        p.setTarget(x + target.dx * size, y + target.dy * size, 2000);
        fwParticles.push(p);
    });
}

function launchRocket() {
    if (photoFireworkActive || nextRocketIsPhoto) return;
    fwRockets.push(new FireworkRocket(
        window.innerWidth  * (0.12 + Math.random() * 0.76),
        window.innerHeight * (0.16 + Math.random() * 0.34),
        false
    ));
}

function scheduleNextRocket() {
    if (photoFireworkActive || nextRocketIsPhoto) return;
    if (photoTargetSets.length > 0 && Math.random() < 0.15) {
        nextRocketIsPhoto   = true;
        photoWaitIntervalId = setInterval(() => {
            if (fwParticles.length === 0 && fwRockets.length === 0) {
                clearInterval(photoWaitIntervalId);
                photoFireworkActive = true;
                fwRockets.push(new FireworkRocket(window.innerWidth / 2, window.innerHeight * 0.35, true));
            }
        }, 150);
        return;
    }
    rocketSchedulerId = setTimeout(() => { launchRocket(); scheduleNextRocket(); }, 550 + Math.random() * 700);
}

function animateFireworks(time) {
    const dt  = fwLastTime ? Math.min(time - fwLastTime, 40) : 16;
    fwLastTime = time;
    fwCtx.globalAlpha = 1;
    fwCtx.globalCompositeOperation = "source-over";
    fwCtx.fillStyle = "rgba(8, 0, 20, 0.28)";
    fwCtx.fillRect(0, 0, fwCanvas.width, fwCanvas.height);
    fwCtx.globalCompositeOperation = "lighter";
    fwRockets.forEach(r => { r.update(dt); r.draw(); });
    fwRockets    = fwRockets.filter(r => !r.done);
    fwParticles.forEach(p => { p.update(dt); p.draw(); });
    fwParticles  = fwParticles.filter(p => !p.isDead());
    if (photoFireworkActive && fwParticles.length === 0 && fwRockets.length === 0) {
        photoFireworkActive = false;
        nextRocketIsPhoto   = false;
        scheduleNextRocket();
    }
    fwCtx.globalAlpha  = 1;
    fireworksAnimId    = requestAnimationFrame(animateFireworks);
}

function startFireworksShow() {
    isPopupOpen         = true;
    fwLastTime          = 0;
    fwParticles         = [];
    fwRockets           = [];
    nextRocketIsPhoto   = false;
    photoFireworkActive = false;
    resizeFireworksCanvas();
    fireworksShow.style.display = "block";
    requestAnimationFrame(() => fireworksShow.classList.add("active"));
    for (let i = 0; i < 3; i++) setTimeout(launchRocket, i * 300);
    scheduleNextRocket();
    fireworksAnimId = requestAnimationFrame(animateFireworks);
}

function stopFireworksShow() {
    clearTimeout(rocketSchedulerId);
    clearInterval(photoWaitIntervalId);
    cancelAnimationFrame(fireworksAnimId);
    fireworksShow.classList.remove("active");
    setTimeout(() => {
        fireworksShow.style.display = "none";
        fwCtx.clearRect(0, 0, fwCanvas.width, fwCanvas.height);
        fwParticles     = [];
        fwRockets       = [];
        isPopupOpen     = false;
        surpriseOffered = false;
        viewedCards.clear();
    }, 400);
}

endFireworksBtn.addEventListener("click", stopFireworksShow);
