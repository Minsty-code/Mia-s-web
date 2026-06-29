const FORMSPREE_ENDPOINT = ""; //https://formspree.io/f/xnjkdeyb
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

const LETTER_TEXT = `Coucou mon chaton ❤️‍🔥,

Je t'écrit une lettre pour te dire à quel point je t'aime.

Tu es une personne incoyable vraiment je t'admire beaucoup.
Je sais que je suis pas parfait mais j'éspère que cette page internet te fera plaisir. J'ai mis du temps à la créer.
Je t'aime mon amour ne change pas je te promet qu'on va se marier et avoir des enfants.

Je t'aime à la folie,
Paul

Mimi bye bye 😘`;

const MOIS_FR = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
];

const WHEEL_SEGMENTS = [
    { decoy: "#ff2f73", reveal: "#FF8AD8", compliment: "Tu es magnifique" },
    { decoy: "#FCCA00", reveal: "#FF4365", compliment: "Ton sourire me fait sourire" },
    { decoy: "#00d9ff", reveal: "#E0115F", compliment: "Tu es ma meilleure amie" },
    { decoy: "#c400ff", reveal: "#FF6FB5", compliment: "Tu es la plus belle du monde" },
    { decoy: "#ff5da2", reveal: "#C724B1", compliment: "Tu es à craquer" },
    { decoy: "#7b1fa2", reveal: "#FF3D81", compliment: "Je t'aime un peu plus chaque jour" }
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

/** Ajoute des petits coeurs flottants dans un conteneur (popups lettre / rendez-vous). */
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
   ÉTAT GLOBAL
============================================================ */

// Bloqueur global : true quand une popup est ouverte, pour figer les coeurs de fond
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
    // On ne bouge les coeurs de fond QUE si aucune popup n'est ouverte
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

const heartBtn = document.getElementById("heart-btn");
const menu = document.getElementById("menu");
const musicBtn = document.getElementById("music-btn");
const music = document.getElementById("music");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");

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

heartBtn.addEventListener("click", () => {
    menu.classList.toggle("open");
});

musicBtn.addEventListener("click", () => {
    if (music.paused) {
        music.play();
        musicBtn.textContent = "⏸ " + PLAYLIST[currentTrack].title;
    } else {
        music.pause();
        musicBtn.textContent = "▶ " + PLAYLIST[currentTrack].title;
    }
});

nextBtn.addEventListener("click", () => {
    playTrack((currentTrack + 1) % PLAYLIST.length);
});

prevBtn.addEventListener("click", () => {
    playTrack((currentTrack - 1 + PLAYLIST.length) % PLAYLIST.length);
});

music.addEventListener("ended", () => {
    playTrack((currentTrack + 1) % PLAYLIST.length);
});

/* ============================================================
   CARTE 1 — CHRONOMÈTRE DE LA RELATION
============================================================ */

const firstBox = document.querySelector(".box-1");
const timerPopup = document.getElementById("timer-popup");
const closeTimer = document.getElementById("close-timer");
const timerDisplay = document.getElementById("relationship-timer");
const timerHeartsContainer = document.getElementById("timer-hearts");

let timerInterval;

function updateRelationshipTimer() {
    const startDate = new Date(2025, 11, 8, 18, 17, 35);
    const now = new Date();

    let years = now.getFullYear() - startDate.getFullYear();
    let months = now.getMonth() - startDate.getMonth();
    let days = now.getDate() - startDate.getDate();
    let hours = now.getHours() - startDate.getHours();
    let minutes = now.getMinutes() - startDate.getMinutes();
    let seconds = now.getSeconds() - startDate.getSeconds();

    if (seconds < 0) { seconds += 60; minutes--; }
    if (minutes < 0) { minutes += 60; hours--; }
    if (hours < 0) { hours += 24; days--; }

    if (days < 0) {
        const previousMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        days += previousMonth.getDate();
        months--;
    }

    if (months < 0) { months += 12; years--; }

    const plural = (value, singular, pluralForm) => (value > 1 ? pluralForm : singular);

    timerDisplay.innerHTML = `
        <div class="time-box">${years}<br>${plural(years, "année", "années")}</div>
        <div class="time-box">${months}<br>mois</div>
        <div class="time-box">${days}<br>${plural(days, "jour", "jours")}</div>
        <div class="time-box">${hours}<br>${plural(hours, "heure", "heures")}</div>
        <div class="time-box">${minutes}<br>${plural(minutes, "minute", "minutes")}</div>
        <div class="time-box">${seconds}<br>${plural(seconds, "seconde", "secondes")}</div>
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

    setTimeout(() => {
        timerPopup.style.display = "none";
        maybeOfferSurprise();
    }, 400);

    clearInterval(timerInterval);
});

/* ============================================================
   CARTE 2 — JARDIN DE FLEURS
============================================================ */

const secondBox = document.querySelector(".box-2");
const flowersPopup = document.getElementById("flowers-popup");
const closeFlowers = document.getElementById("close-flowers");
const flowersRoot = document.getElementById("flowers");

/* ---- Ouverture / fermeture ---- */

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

    setTimeout(() => {
        flowersPopup.style.display = "none";
        maybeOfferSurprise();
    }, 400);
});

/* ---- Construction des fleurs (pétales + coeur central) ---- */

function buildBloom(bloomEl, petalCount, radius) {
    for (let i = 0; i < petalCount; i++) {
        const petal = document.createElement("div");
        petal.className = "petal";

        const angle = (360 / petalCount) * i;
        petal.style.transform = `rotate(${angle}deg)`;
        petal.style.height = radius + "px";
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

/* ---- Coeurs flottants en arrière-plan de la scène ---- */

const heartsLayer = document.getElementById("flowers-hearts");

const heartColors = ["#ff2bd6", "#ff5da2", "#ff2974", "#c400ff", "#00eaff", "#ff8af0", "#ff0090"];

for (let i = 0; i < 26; i++) {
    const h = document.createElement("div");
    h.className = "flower-heart";

    const color = heartColors[Math.floor(Math.random() * heartColors.length)];
    const duration = 7 + Math.random() * 8;

    h.textContent = "❤";
    h.style.left = Math.random() * 100 + "%";
    h.style.color = color;
    h.style.fontSize = (12 + Math.random() * 22) + "px";
    h.style.textShadow = `0 0 6px ${color}, 0 0 14px ${color}, 0 0 24px ${color}`;
    h.style.setProperty("--d", (30 + Math.random() * 70).toFixed(1));
    h.style.setProperty("--s", (0.6 + Math.random() * 0.9).toFixed(2));
    h.style.animationDuration = duration.toFixed(2) + "s";
    h.style.animationDelay = (-Math.random() * duration).toFixed(2) + "s";

    heartsLayer.appendChild(h);
}

/* ---- Suivi de la souris (halo + esquive de l'indice) ---- */

const flowersScene = document.getElementById("flowers-scene");
const flowersCursorGlow = document.getElementById("flowers-cursor-glow");
const flowersHint = document.getElementById("flowers-hint");

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;

function updatePointer(x, y) {
    // Ne réagit que si la popup "fleurs" est active
    if (!flowersPopup.classList.contains("active")) return;

    mouseX = x;
    mouseY = y;

    flowersCursorGlow.style.transform = `translate(${x}px, ${y}px)`;
    flowersHint.classList.add("fade");
}

flowersScene.addEventListener("mousemove", e => updatePointer(e.clientX, e.clientY));

/* ---- Physique des fleurs (vent + influence de la souris) ---- */

const flowers = [
    { el: document.getElementById("f1"), baseFan: -40, windAmp: 6, windFreq: 0.55, phase: 0 },
    { el: document.getElementById("f2"), baseFan: -25, windAmp: 5, windFreq: 0.42, phase: 1.4 },
    { el: document.getElementById("f3"), baseFan: -10, windAmp: 7, windFreq: 0.50, phase: 2.7 }
];

let flowersBaseX = 0;

function updateFlowersBase() {
    flowersBaseX = flowersRoot.getBoundingClientRect().left;
}

updateFlowersBase();
window.addEventListener("resize", updateFlowersBase);

function animateFlowers(time) {
    if (flowersPopup.classList.contains("active")) {
        const t = time * 0.001;
        const dx = mouseX - flowersBaseX;

        flowers.forEach(f => {
            const wind =
                Math.sin(t * f.windFreq + f.phase) * f.windAmp +
                Math.sin(t * f.windFreq * 2.3 + f.phase * 1.7) * (f.windAmp * 0.25);

            const mouseInfluence = clamp(dx / 20, -25, 25);
            const total = f.baseFan + wind + mouseInfluence;

            f.el.style.transform = `rotate(${total}deg)`;
        });
    }

    requestAnimationFrame(animateFlowers);
}

requestAnimationFrame(animateFlowers);

/* ============================================================
   CARTE 3 — PARTICULES NÉON (coeur qui se forme au clic)
============================================================ */

const thirdBox = document.querySelector(".box-3");
const particlesPopup = document.getElementById("particles-popup");
const closeParticles = document.getElementById("close-particles");
const particlesContent = document.getElementById("particles-content");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const particlesCursorGlow = document.getElementById("particles-cursor-glow");

const PARTICLE_COUNT = 2000; // Fluidité maximale garantie à 60 FPS
const particlesArray = [];

let particlesAnimationId;
let heartFormed = false;
let globalAlphaValue = 1.0; // Atténue la lueur du coeur pour qu'il soit moins brillant à la fin

/* ---- Halo néon sous le curseur ---- */

particlesContent.addEventListener("mousemove", e => {
    const rect = particlesContent.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    particlesCursorGlow.style.transform = `translate3d(${x}px, ${y}px, 0)`;
});

/* ---- Ouverture / fermeture ---- */

thirdBox.addEventListener("click", () => {
        
    markCardViewed(3);
    isPopupOpen = true;
    particlesPopup.style.display = "block";

    setTimeout(() => {
        particlesPopup.classList.add("active");
        resizeCanvas();

        initParticles();
        heartFormed = false;
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

/* ---- Canevas et particules ---- */

function resizeCanvas() {
    canvas.width = particlesContent.clientWidth;
    canvas.height = particlesContent.clientHeight;
}

window.addEventListener("resize", resizeCanvas);

function neonColor() {
    return `hsl(${Math.random() * 360}, 100%, 65%)`;
}

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.tx = this.x;
        this.ty = this.y;
        this.vx = (Math.random() - 0.5) * 3;
        this.vy = (Math.random() - 0.5) * 3;
        this.size = Math.random() * 1.8 + 1;
        this.color = neonColor();
    }

    update() {
        if (heartFormed) {
            const dx = this.tx - this.x;
            const dy = this.ty - this.y;

            this.vx += dx * 0.006;
            this.vy += dy * 0.006;
            this.vx *= 0.93;
            this.vy *= 0.93;
        } else {
            if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

            this.vx *= 0.998;
            this.vy *= 0.998;
        }

        this.x += this.vx;
        this.y += this.vy;
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
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        particlesArray.push(new Particle());
    }
}

function createHeartPoints(cx, cy) {
    const points = [];
    const scale = Math.min(canvas.width, canvas.height) / 45;

    for (let t = 0; t < Math.PI * 2; t += 0.003) {
        const x = 16 * Math.pow(Math.sin(t), 3);
        const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);

        points.push({ x: cx + x * scale, y: cy - y * scale });
    }

    return points;
}

function formHeart(cx, cy) {
    const heartPoints = createHeartPoints(cx, cy);

    particlesArray.forEach((p, i) => {
        const target = heartPoints[Math.floor(i * heartPoints.length / PARTICLE_COUNT)];
        const spread = 20;

        p.tx = target.x + (Math.random() - 0.5) * spread;
        p.ty = target.y + (Math.random() - 0.5) * spread;
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
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    if (!heartFormed) {
        formHeart(clickX, clickY);
    } else {
        explodeParticles();
    }
});

function animateCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Quand le coeur est formé, on descend doucement l'opacité globale pour éviter un effet "brûlé"
    if (heartFormed) {
        if (globalAlphaValue > 0.45) globalAlphaValue -= 0.01;
    } else if (globalAlphaValue < 1.0) {
        globalAlphaValue += 0.02;
    }

    ctx.globalAlpha = globalAlphaValue;
    ctx.globalCompositeOperation = "lighter";

    particlesArray.forEach(p => {
        p.update();
        p.draw();
    });

    particlesAnimationId = requestAnimationFrame(animateCanvas);
}

/* ============================================================
   CARTE 4 — LETTRE
============================================================ */

const fourthBox = document.querySelector(".box-4");
const letterPopup = document.getElementById("letter-popup");
const closeLetter = document.getElementById("close-letter");
const envelopeWrapper = document.querySelector(".envelope-wrapper");
const typewriterElement = document.getElementById("typewriter-text");
const letterHeartsContainer = document.getElementById("letter-hearts");

let letterCharIndex = 0;
let typingInterval;

function startTyping() {
    typewriterElement.textContent = "";
    letterCharIndex = 0;
    clearInterval(typingInterval);

    typingInterval = setInterval(() => {
        if (letterCharIndex < LETTER_TEXT.length) {
            typewriterElement.textContent += LETTER_TEXT.charAt(letterCharIndex);
            letterCharIndex++;

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

const fifthBox = document.querySelector(".box-5");
const datePopup = document.getElementById("date-popup");
const closeDate = document.getElementById("close-date");
const dateHeartsContainer = document.getElementById("date-hearts");
const dateSteps = Array.from(document.querySelectorAll("#date-content .date-step"));

const btnYes = document.getElementById("btn-yes");
const btnNo = document.getElementById("btn-no");
const noErrorMsg = document.getElementById("no-error-msg");
const noZone = document.querySelector(".date-question-buttons");

const themeCards = Array.from(document.querySelectorAll(".theme-card"));
const validateTheme = document.getElementById("validate-theme");

const locationInput = document.getElementById("location-input");
const validateLocation = document.getElementById("validate-location");

const calPrev = document.getElementById("cal-prev");
const calNext = document.getElementById("cal-next");
const calMonthLabel = document.getElementById("cal-month-label");
const calendarGrid = document.getElementById("calendar-grid");
const validateCalendar = document.getElementById("validate-calendar");

const finalSummary = document.getElementById("final-summary");
const closeFinal = document.getElementById("close-final");

const dateAnswers = { theme: null, location: "", date: null };

let calendarViewDate = new Date();
let selectedCalendarDate = null;

/* ---- Navigation entre les étapes ---- */

function goToDateStep(stepIndex) {
    dateSteps.forEach(step => {
        step.classList.toggle("active", Number(step.dataset.step) === stepIndex);
    });
}

function resetDateFlow() {
    dateAnswers.theme = null;
    dateAnswers.location = "";
    dateAnswers.date = null;

    themeCards.forEach(card => card.classList.remove("selected"));
    validateTheme.disabled = true;

    locationInput.value = "";
    validateLocation.disabled = true;

    selectedCalendarDate = null;
    calendarViewDate = new Date();
    validateCalendar.disabled = true;

    noErrorMsg.textContent = "";
    resetNoButtonGame();

    goToDateStep(0);
}

/* ---- Ouverture / fermeture de la popup ---- */

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

    setTimeout(() => {
        datePopup.style.display = "none";
        maybeOfferSurprise();
    }, 400);
}

closeDate.addEventListener("click", closeDatePopup);
closeFinal.addEventListener("click", closeDatePopup);

/* ---- Étape 0 : Yes / No qui esquive la souris ---- */
/* (la mécanique d'esquive est partagée avec le bouton "No" de la surprise finale,
   voir createDodgingNoButton() dans la section SURPRISE FINALE plus bas) */

function showNoButtonError() {
    noErrorMsg.classList.remove("shake");
    void noErrorMsg.offsetWidth; // force le redémarrage de l'animation si on reclique vite
    noErrorMsg.textContent = "❌ Erreur : ce bouton n'existe pas pour toi 😏";
    noErrorMsg.classList.add("shake");
}

const noButtonGame = createDodgingNoButton(noZone, btnNo, showNoButtonError);

function resetNoButtonGame() {
    noButtonGame.reset();
    noErrorMsg.textContent = "";
}

btnYes.addEventListener("click", () => goToDateStep(1));

/* ---- Étape 1 : choix du thème ---- */

themeCards.forEach(card => {
    card.addEventListener("click", () => {
        themeCards.forEach(c => c.classList.remove("selected"));
        card.classList.add("selected");

        dateAnswers.theme = card.dataset.theme;
        validateTheme.disabled = false;
    });
});

validateTheme.addEventListener("click", () => goToDateStep(2));

/* ---- Étape 2 : lieu du rendez-vous ---- */

locationInput.addEventListener("input", () => {
    validateLocation.disabled = locationInput.value.trim().length === 0;
});

validateLocation.addEventListener("click", () => {
    dateAnswers.location = locationInput.value.trim();
    renderCalendar();
    goToDateStep(3);
});

/* ---- Étape 3 : calendrier stylisé ---- */

function renderCalendar() {
    const year = calendarViewDate.getFullYear();
    const month = calendarViewDate.getMonth();

    calMonthLabel.textContent = `${MOIS_FR[month]} ${year}`;
    calendarGrid.innerHTML = "";

    // Décalage pour que la semaine commence le lundi
    const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();

    for (let i = 0; i < firstDayIndex; i++) {
        calendarGrid.appendChild(document.createElement("span"));
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const cellDate = new Date(year, month, day);

        const cell = document.createElement("button");
        cell.type = "button";
        cell.className = "calendar-day";
        cell.textContent = day;

        if (isSameDay(cellDate, today)) cell.classList.add("today");
        if (selectedCalendarDate && isSameDay(cellDate, selectedCalendarDate)) cell.classList.add("selected");

        cell.addEventListener("click", () => {
            selectedCalendarDate = cellDate;
            validateCalendar.disabled = false;
            renderCalendar();
        });

        calendarGrid.appendChild(cell);
    }
}

calPrev.addEventListener("click", () => {
    calendarViewDate.setMonth(calendarViewDate.getMonth() - 1);
    renderCalendar();
});

calNext.addEventListener("click", () => {
    calendarViewDate.setMonth(calendarViewDate.getMonth() + 1);
    renderCalendar();
});

validateCalendar.addEventListener("click", () => {
    dateAnswers.date = selectedCalendarDate;
    finalizeDateAnswers();
    goToDateStep(4);
});

/* ---- Étape 4 : message final + sauvegarde/envoi ---- */

function finalizeDateAnswers() {
    const dateLabel = dateAnswers.date
        ? dateAnswers.date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
        : "";

    finalSummary.textContent = `${dateAnswers.theme} — le ${dateLabel} — ${dateAnswers.location}`;

    saveAndSendDateResponse({
        theme: dateAnswers.theme,
        location: dateAnswers.location,
        date: dateAnswers.date ? dateAnswers.date.toISOString() : null,
        submittedAt: new Date().toISOString()
    });
}

/** Enregistre la réponse en local, et l'envoie par e-mail si Formspree est configuré (voir CONFIGURATION en haut du fichier). */
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
            theme: response.theme,
            lieu: response.location,
            date: response.date,
            envoye_le: response.submittedAt
        })
    }).catch(err => {
        console.error("Échec de l'envoi de la réponse par e-mail :", err);
    });
}

/* ============================================================
   CARTE 6 — ROUE DE L'AMOUR
============================================================ */

const WHEEL_SEGMENT_COUNT = WHEEL_SEGMENTS.length;
const WHEEL_SEGMENT_ANGLE = 360 / WHEEL_SEGMENT_COUNT;

const sixthBox = document.querySelector(".box-6");
const wheelPopup = document.getElementById("wheel-popup");
const closeWheel = document.getElementById("close-wheel");
const wheelHeartsContainer = document.getElementById("wheel-hearts");
const wheelEl = document.getElementById("wheel");
const spinBtn = document.getElementById("spin-btn");

let wheelBuilt = false;
let wheelRotation = 0;
let isSpinning = false;
let wheelDrawPile = []; // pioche sans doublon pour le tour en cours

/** Calcule le tracé (clip-path) d'une part de camembert, du centre vers le bord, entre deux angles donnés. */
function pieSlicePath(startDeg, endDeg) {
    const steps = 8;
    const points = ["50% 50%"];

    for (let i = 0; i <= steps; i++) {
        const angle = startDeg + (endDeg - startDeg) * (i / steps);
        const rad = (angle * Math.PI) / 180;
        const x = 50 + 50 * Math.sin(rad);
        const y = 50 - 50 * Math.cos(rad);

        points.push(`${x.toFixed(2)}% ${y.toFixed(2)}%`);
    }

    return `polygon(${points.join(",")})`;
}

/** Construit une fois les 8 parts de la roue : une "plaquette" de couleur unie au-dessus, un compliment caché dessous. */
function buildWheel() {
    if (wheelBuilt) return;

    const wheelSize = wheelEl.offsetWidth || 300; // taille réelle (non affectée par le scale du popup)
    const radiusPx = wheelSize * 0.36;
    const textWidthPx = wheelSize * 0.36;

    WHEEL_SEGMENTS.forEach((segment, i) => {
        const startAngle = i * WHEEL_SEGMENT_ANGLE;
        const endAngle = startAngle + WHEEL_SEGMENT_ANGLE;
        const midAngle = startAngle + WHEEL_SEGMENT_ANGLE / 2;
        const clipPath = pieSlicePath(startAngle, endAngle);

        const reveal = document.createElement("div");
        reveal.className = "wedge-reveal";
        reveal.style.clipPath = clipPath;
        reveal.style.background = segment.reveal;

        const label = document.createElement("span");
        label.className = "wedge-text";
        label.textContent = segment.compliment;
        label.style.width = `${textWidthPx}px`;
        label.style.transform = `translate(-50%, -50%) rotate(${midAngle}deg) translateY(-${radiusPx}px)`;
        reveal.appendChild(label);

        const cover = document.createElement("div");
        cover.className = "wedge-cover";
        cover.dataset.index = i;
        cover.style.clipPath = clipPath;
        cover.style.background = segment.decoy;

        wheelEl.appendChild(reveal);
        wheelEl.appendChild(cover);
    });

    wheelBuilt = true;
}

/** Mélange les indices des segments (Fisher-Yates), pour piocher sans doublon tant que le tour n'est pas terminé. */
function shuffledSegmentIndices() {
    const indices = WHEEL_SEGMENTS.map((_, i) => i);

    for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    return indices;
}

/** Remet la roue à zéro à chaque ouverture de la popup : plaquettes remises, nouvelle pioche sans doublon. */
function resetWheel() {
    wheelDrawPile = shuffledSegmentIndices();

    wheelEl.querySelectorAll(".wedge-cover").forEach(cover => {
        cover.style.transition = "none";
        cover.classList.remove("fallen");
    });

    wheelRotation = 0;
    wheelEl.style.transition = "none";
    wheelEl.style.transform = "rotate(0deg)";

    requestAnimationFrame(() => {
        wheelEl.style.transition = "";
        wheelEl.querySelectorAll(".wedge-cover").forEach(cover => {
            cover.style.transition = "";
        });
    });

    isSpinning = false;
    spinBtn.disabled = false;
}

/** Choisit le prochain segment : sans doublon tant que le tour en cours n'est pas épuisé, puis complètement aléatoire. */
function pickNextSegmentIndex() {
    if (wheelDrawPile.length > 0) return wheelDrawPile.pop();
    return Math.floor(Math.random() * WHEEL_SEGMENT_COUNT);
}

function spinWheel() {
    if (isSpinning) return;

    isSpinning = true;
    spinBtn.disabled = true;

    const targetIndex = pickNextSegmentIndex();
    const segmentCenter = targetIndex * WHEEL_SEGMENT_ANGLE + WHEEL_SEGMENT_ANGLE / 2;

    // Petit décalage aléatoire à l'intérieur de la part, pour ne pas toujours atterrir pile au centre
    const jitter = (Math.random() - 0.5) * (WHEEL_SEGMENT_ANGLE * 0.5);

    // Angle (mod 360) à atteindre pour amener le centre de cette part sous le repère du haut
    const requiredAngle = ((-(segmentCenter + jitter) % 360) + 360) % 360;

    const extraTurns = 5 + Math.floor(Math.random() * 3); // 5 à 7 tours complets, pour l'effet
    const currentMod = ((wheelRotation % 360) + 360) % 360;
    const delta = ((requiredAngle - currentMod) + 360) % 360;

    wheelRotation += extraTurns * 360 + delta;
    wheelEl.style.transform = `rotate(${wheelRotation}deg)`;

    wheelEl.addEventListener("transitionend", function onSpinEnd() {
        wheelEl.removeEventListener("transitionend", onSpinEnd);
        revealSegment(targetIndex);

        isSpinning = false;
        spinBtn.disabled = false;
    }, { once: true });
}

/** Fait "tomber" la plaquette de couleur du segment gagné, révélant le compliment en dessous. */
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
        // Carte 6 (la dernière) : on marque la vue puis on vérifie si la surprise doit apparaître
        markCardViewed(6);
        maybeOfferSurprise();
    }, 400);
});

spinBtn.addEventListener("click", spinWheel);
/* ============================================================
   ESQUIVE GÉNÉRIQUE D'UN BOUTON "NO" (carte 5 + surprise finale)
============================================================ */

/**
 * Rend un bouton "fuyant" : il esquive le curseur dès qu'on l'approche, sauf
 * une fois sur 10 où il reste immobile et cliquable (mais le clic reste refusé,
 * voir onFailedClick). Retourne { reset() } pour réinitialiser le jeu à chaque
 * ouverture de popup.
 */
function createDodgingNoButton(zone, button, onFailedClick) {
    const DODGE_RADIUS = 90;
    const DODGE_COOLDOWN_MS = 200; // laisse le saut précédent se terminer avant le suivant (évite le tremblement)
    const STAY_EVERY_NTH = 10; // exactement 1 fois sur 10 (pas du hasard), le bouton reste immobile

    let isNear = false;
    let approachCount = 0;
    let stayThisRound = false;
    let lastDodgeTime = 0;

    // Esquive = un vrai saut loin du curseur, pas un petit tremblement sur place
    function dodge(pointerX, pointerY) {
        const zoneRect = zone.getBoundingClientRect();
        const btnRect = button.getBoundingClientRect();

        const maxX = Math.max(0, zoneRect.width - btnRect.width);
        const maxY = Math.max(0, zoneRect.height - btnRect.height);

        let newX = 0;
        let newY = 0;
        let attempts = 0;
        let isFarEnough = false;

        // On cherche une vraie position éloignée du curseur (pas juste une position aléatoire)
        while (!isFarEnough && attempts < 12) {
            newX = Math.random() * maxX;
            newY = Math.random() * maxY;

            const d = distance(
                pointerX - zoneRect.left, pointerY - zoneRect.top,
                newX + btnRect.width / 2, newY + btnRect.height / 2
            );

            isFarEnough = d > DODGE_RADIUS * 1.4;
            attempts++;
        }

        button.style.left = `${newX}px`;
        button.style.top = `${newY + btnRect.height / 2}px`;
    }

    zone.addEventListener("pointermove", e => {
        const btnRect = button.getBoundingClientRect();
        const btnCenterX = btnRect.left + btnRect.width / 2;
        const btnCenterY = btnRect.top + btnRect.height / 2;
        const isClose = distance(e.clientX, e.clientY, btnCenterX, btnCenterY) < DODGE_RADIUS;

        if (!isClose) {
            isNear = false; // le curseur s'est éloigné : la prochaine approche sera une nouvelle approche
            return;
        }

        if (!isNear) {
            // Nouvelle approche détectée
            isNear = true;
            approachCount++;
            stayThisRound = approachCount % STAY_EVERY_NTH === 0;

            if (!stayThisRound) {
                dodge(e.clientX, e.clientY);
                lastDodgeTime = performance.now();
            }
            return;
        }

        // Le curseur continue de suivre le bouton pendant la même approche
        if (!stayThisRound && performance.now() - lastDodgeTime > DODGE_COOLDOWN_MS) {
            dodge(e.clientX, e.clientY);
            lastDodgeTime = performance.now();
        }
        // Si stayThisRound est vrai, le bouton ne bouge plus du tout pour cette approche : il est cliquable.
    });

    // Filet de sécurité : si jamais le clic démarre alors que le bouton aurait dû esquiver, on esquive avant qu'il ne se valide
    button.addEventListener("pointerdown", e => {
        if (!stayThisRound) {
            e.preventDefault();
            dodge(e.clientX, e.clientY);
            lastDodgeTime = performance.now();
        }
    });

    // Si un clic est malgré tout détecté (esquive ratée, ou la fois où il ne bouge pas), ce n'est jamais un vrai "Non"
    button.addEventListener("click", e => {
        e.preventDefault();
        if (onFailedClick) onFailedClick();
    });

    return {
        reset() {
            isNear = false;
            approachCount = 0;
            stayThisRound = false;
            lastDodgeTime = 0;
            button.style.left = "";
            button.style.top = "";
        }
    };
}

/* ============================================================
   SURPRISE FINALE — FEU D'ARTIFICE
   (apparaît au retour à l'accueil une fois les 6 cartes vues)
============================================================ */

const surpriseOverlay = document.getElementById("surprise-overlay");
const yesSurpriseBtn = document.getElementById("yes-surprise");
const noSurpriseBtn = document.getElementById("no-surprise");
const noSurpriseZone = document.querySelector("#surprise-box .date-question-buttons");
const surpriseErrorMsg = document.getElementById("surprise-no-error");

const fireworksShow = document.getElementById("fireworks-show");
const fwCanvas = document.getElementById("fireworks-canvas");
const fwCtx = fwCanvas.getContext("2d");
const endFireworksBtn = document.getElementById("end-fireworks");

// 📸 Ajoute ici les chemins de tes photos pour qu'elles explosent en mosaïque dans le feu d'artifice.
// Exemple : const FIREWORK_PHOTOS = ["assets/image/fireworks/nous1.jpg", "assets/image/fireworks/nous2.jpg"];
// Photos plutôt carrées = meilleur résultat. Si le tableau est vide, le feu d'artifice utilise
// seulement des coeurs et des boules classiques.
const FIREWORK_PHOTOS = ["assets/image/Nous1.jpg", "assets/image/Nous2.jpg", "assets/image/Nous3.jpg", "assets/image/Nous4.jpg", "assets/image/Nous5.jpg", "assets/image/Nous6.jpg", "assets/image/Nous7.jpg"];

const FIREWORK_COLORS = ["#ff2f73", "#ff6fb5", "#c724b1", "#7b1fa2", "#FCCA00", "#00d9ff", "#ff8ad8"];
const MAX_FIREWORK_PARTICLES = 2200; // garde-fou pour rester fluide si plusieurs explosions se chevauchent

let surpriseOffered = false;
let fwParticles = [];
let fwRockets = [];
let fireworksAnimId = null;
let rocketSchedulerId = null;
let fwLastTime = 0;

const photoTargetSets = []; // un tableau de points {dx, dy, color} par photo chargée (offsets normalisés)

/* ---- Préchargement des photos pour la mosaïque ---- */

FIREWORK_PHOTOS.forEach(src => {
    const img = new Image();

    img.onload = () => {
        console.log("Image chargée :", src);
        try {
            const targets = sampleImageTargets(img);
            if (targets.length) photoTargetSets.push(targets);
        } catch (err) {
            // "Tainted canvas" : arrive si la page est ouverte en double-clic (file://) ET que l'image
            // a un attribut crossOrigin, ou si l'image vient d'un autre domaine. Sert la page via un
            // petit serveur local (ex: VS Code "Live Server", ou `python3 -m http.server`) si ça persiste.
            console.warn("Impossible de lire les pixels de la photo (canvas \"tainted\") :", src, err);
        }
    };

    img.onerror = () => console.warn("Photo du feu d'artifice introuvable :", src);
    img.src = src;
});

/** Échantillonne une image en une grille de points colorés (offsets normalisés autour du centre). */
function sampleImageTargets(img) {
    const sampleSize = 34; // résolution de la mosaïque : plus petit = plus fluide, plus grand = plus détaillé
    const ratio = img.naturalHeight / img.naturalWidth;

    const off = document.createElement("canvas");
    off.width = sampleSize;
    off.height = Math.max(1, Math.round(sampleSize * ratio));

    const offCtx = off.getContext("2d");
    offCtx.drawImage(img, 0, 0, off.width, off.height);

    const data = offCtx.getImageData(0, 0, off.width, off.height).data;
    const targets = [];

    for (let y = 0; y < off.height; y++) {
        for (let x = 0; x < off.width; x++) {
            const i = (y * off.width + x) * 4;
            if (data[i + 3] < 40) continue; // pixel transparent : on ignore

            targets.push({
                dx: (x / off.width) - 0.5,
                dy: (y / off.height) - 0.5,
                color: `rgb(${data[i]},${data[i + 1]},${data[i + 2]})`
            });
        }
    }

    return targets;
}

/** Points d'un coeur (même courbe paramétrique que la carte 3), normalisés autour du centre. */
function createHeartTargets() {
    const targets = [];

    for (let t = 0; t < Math.PI * 2; t += 0.16) {
        const x = 16 * Math.pow(Math.sin(t), 3);
        const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));

        targets.push({ dx: x / 32, dy: y / 32, color: null });
    }

    return targets;
}

/* ---- Bouton "No" qui esquive, comme à l'étape 0 de la demande de rendez-vous ---- */

const surpriseNoGame = createDodgingNoButton(noSurpriseZone, noSurpriseBtn, () => {
    surpriseErrorMsg.classList.remove("shake");
    void surpriseErrorMsg.offsetWidth; // force le redémarrage de l'animation si on reclique vite
    surpriseErrorMsg.textContent = "❌ Error: this button still doesn't exist for you ";
    surpriseErrorMsg.classList.add("shake");
});

/* ---- Déclenchement : une fois les 6 cartes vues, au retour à l'accueil ---- */

function markCardViewed(number) {
    viewedCards.add(number);
}

function maybeOfferSurprise() {
    if (surpriseOffered || viewedCards.size < 6) return;

    surpriseOffered = true;
    isPopupOpen = true; // gèle les coeurs de fond, comme pour les autres popups
    surpriseNoGame.reset();
    surpriseErrorMsg.textContent = "";
    surpriseOverlay.style.display = "flex";

    requestAnimationFrame(() => surpriseOverlay.classList.add("active"));
}

yesSurpriseBtn.addEventListener("click", () => {
    surpriseOverlay.classList.remove("active");

    setTimeout(() => {
        surpriseOverlay.style.display = "none";
        startFireworksShow();
    }, 400);
});

/* ---- Moteur du feu d'artifice ---- */

function resizeFireworksCanvas() {
    fwCanvas.width = window.innerWidth;
    fwCanvas.height = window.innerHeight;
    fwCtx.fillStyle = "#08001a";
    fwCtx.fillRect(0, 0, fwCanvas.width, fwCanvas.height);
}

window.addEventListener("resize", () => {
    if (fireworksShow.classList.contains("active")) resizeFireworksCanvas();
});

/** Une fusée qui monte du bas de l'écran jusqu'à son point d'explosion. */
class FireworkRocket {
    constructor(targetX, targetY) {
        this.x = targetX;
        this.startY = fwCanvas.height;
        this.y = this.startY;
        this.targetX = targetX;
        this.targetY = targetY;
        this.progress = 0;
        this.duration = 700 + Math.random() * 400;
        this.color = FIREWORK_COLORS[Math.floor(Math.random() * FIREWORK_COLORS.length)];
        this.done = false;
    }

    update(dt) {
        this.progress += dt;
        const t = clamp(this.progress / this.duration, 0, 1);
        const ease = 1 - Math.pow(1 - t, 2);

        this.y = this.startY + (this.targetY - this.startY) * ease;

        if (t >= 1 && !this.done) {
            this.done = true;
            explodeFirework(this.x, this.y, this.color);
        }
    }

    draw() {
        fwCtx.beginPath();
        fwCtx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        fwCtx.fillStyle = this.color;
        fwCtx.shadowColor = this.color;
        fwCtx.shadowBlur = 12;
        fwCtx.fill();
    }
}

/** Une étincelle d'explosion : part dans tous les sens, puis peut s'assembler vers une cible (coeur / photo). */
class FireworkParticle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = 2 + Math.random() * 2;
        this.alpha = 1;
        this.mode = "burst";

        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 6;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;

        this.tx = null;
        this.ty = null;
        this.age = 0;
        this.assembleDelay = 280 + Math.random() * 220;
        this.life = 1100 + Math.random() * 500;
    }

    /** Donne une cible à l'étincelle : après un court délai, elle s'y assemble et y reste un moment (mosaïque). */
    setTarget(tx, ty, holdMs) {
        this.tx = tx;
        this.ty = ty;
        this.mode = "assemble";
        this.life = this.assembleDelay + holdMs + 600;
    }

    update(dt) {
        this.age += dt;
        const step = dt / 16.6;

        if (this.mode === "assemble" && this.age > this.assembleDelay) {
            const dx = this.tx - this.x;
            const dy = this.ty - this.y;
            this.vx += dx * 0.012;
            this.vy += dy * 0.012;
            this.vx *= 0.86;
            this.vy *= 0.86;
        } else {
            this.vy += 0.045; // gravité
            this.vx *= 0.985;
        }

        this.x += this.vx * step;
        this.y += this.vy * step;

        const fadeStart = this.life - 500;
        this.alpha = this.age > fadeStart ? clamp(1 - (this.age - fadeStart) / 500, 0, 1) : 1;
    }

    isDead() {
        return this.age >= this.life;
    }

    draw() {
        fwCtx.globalAlpha = this.alpha;
        fwCtx.beginPath();
        fwCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        fwCtx.fillStyle = this.color;
        fwCtx.shadowColor = this.color;
        fwCtx.shadowBlur = 8;
        fwCtx.fill();
    }
}

/** Explosion "boule classique" : pas de forme, juste des étincelles qui partent dans tous les sens. */
function spawnClassicBurst(x, y, color, count) {
    for (let i = 0; i < count; i++) {
        fwParticles.push(new FireworkParticle(x, y, color));
    }
}

/** Choisit le type d'explosion (boule / coeur / photo) et prépare les étincelles correspondantes. */
function explodeFirework(x, y, baseColor) {
    // Garde-fou perf : trop de particules déjà à l'écran → on retombe sur une boule simple, plus légère
    if (fwParticles.length > MAX_FIREWORK_PARTICLES) {
        spawnClassicBurst(x, y, baseColor, 35);
        return;
    }

    const hasPhotos = photoTargetSets.length > 0;
    const roll = Math.random();

    let mode = "burst";
    if (hasPhotos && roll < 0.3) mode = "photo";
    else if (roll < (hasPhotos ? 0.65 : 0.5)) mode = "heart";

    if (mode === "burst") {
        spawnClassicBurst(x, y, baseColor, 70 + Math.floor(Math.random() * 40));
        return;
    }

    const size = 200 + Math.random() * 90;
    const targets = mode === "photo"
        ? photoTargetSets[Math.floor(Math.random() * photoTargetSets.length)]
        : createHeartTargets();

    targets.forEach(target => {
        const color = target.color || baseColor;
        const p = new FireworkParticle(x, y, color);
        p.size = mode === "photo" ? 2.4 : 3;
        p.setTarget(x + target.dx * size, y + target.dy * size, 1100);
        fwParticles.push(p);
    });
}

function launchRocket() {
    const targetX = window.innerWidth * (0.12 + Math.random() * 0.76);
    const targetY = window.innerHeight * (0.16 + Math.random() * 0.34);

    fwRockets.push(new FireworkRocket(targetX, targetY));
}

function scheduleNextRocket() {
    const delay = 550 + Math.random() * 700;
    rocketSchedulerId = setTimeout(() => {
        launchRocket();
        scheduleNextRocket();
    }, delay);
}

function animateFireworks(time) {
    const dt = fwLastTime ? Math.min(time - fwLastTime, 40) : 16;
    fwLastTime = time;

    // Traînée légère façon ciel nocturne (le fond ne se réefface jamais complètement d'un coup)
    fwCtx.globalAlpha = 1;
    fwCtx.globalCompositeOperation = "source-over";
    fwCtx.fillStyle = "rgba(8, 0, 20, 0.28)";
    fwCtx.fillRect(0, 0, fwCanvas.width, fwCanvas.height);

    fwCtx.globalCompositeOperation = "lighter";

    fwRockets.forEach(r => { r.update(dt); r.draw(); });
    fwRockets = fwRockets.filter(r => !r.done);

    fwParticles.forEach(p => { p.update(dt); p.draw(); });
    fwParticles = fwParticles.filter(p => !p.isDead());

    fwCtx.globalAlpha = 1;
    fireworksAnimId = requestAnimationFrame(animateFireworks);
}

function startFireworksShow() {
    isPopupOpen = true;
    fwLastTime = 0;
    fwParticles = [];
    fwRockets = [];

    resizeFireworksCanvas();

    fireworksShow.style.display = "block";
    requestAnimationFrame(() => fireworksShow.classList.add("active"));

    // Petite salve immédiate pour démarrer fort, comme un vrai spectacle
    for (let i = 0; i < 3; i++) {
        setTimeout(launchRocket, i * 300);
    }

    scheduleNextRocket();
    fireworksAnimId = requestAnimationFrame(animateFireworks);
}

function stopFireworksShow() {
    clearTimeout(rocketSchedulerId);
    cancelAnimationFrame(fireworksAnimId);

    fireworksShow.classList.remove("active");

    setTimeout(() => {
        fireworksShow.style.display = "none";
        fwCtx.clearRect(0, 0, fwCanvas.width, fwCanvas.height);
        fwParticles = [];
        fwRockets = [];
        isPopupOpen = false; // retour à la page normale, les coeurs de fond reprennent

        // Réarme la surprise : si on revisite une carte et qu'on revient à l'accueil,
        // la question / le feu d'artifice pourront réapparaître.
        surpriseOffered = false;
    }, 400);
}

endFireworksBtn.addEventListener("click", stopFireworksShow);
