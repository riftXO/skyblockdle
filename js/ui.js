import {GameState, daggers} from "./state.js";
import {checkAnswer} from "./game.js";

const grid = document.getElementById("grid");
const alertBox = document.getElementById("alert");
const guessInput = document.getElementById("guessInput");
const guessBtn = document.getElementById("guessBtn");
const suggestionsBox = document.getElementById("suggestions");

/* ---------------- alertbox temp message thingy ---------------- */

let messageTimeout = null;

export function tempMessage(text, ms = 2000) {
    alertBox.innerHTML = text;
    alertBox.style = "color: #FF5555; text-shadow: 3px 3px 0px #3f1515;";

    if (messageTimeout) clearTimeout(messageTimeout);

    messageTimeout = setTimeout(() => {
        alertBox.innerHTML = "&nbsp;";
        messageTimeout = null;
    }, ms);
}

export function setAlert(text, isWin = false) {
    const alertBox = document.getElementById("alert");
    alertBox.innerHTML = text;

    if (isWin) {
        alertBox.style =
            "color: #00AA00; text-shadow: 3px 3px 0px #004200ff;";
    }
}

export function clearAlert() {
    const alertBox = document.getElementById("alert");
    alertBox.innerHTML = "&nbsp;";
}

/* ---------------- ui setup ---------------- */

export function setupUI() {
    grid.className = "grid";

    guessBtn.onclick = checkAnswer;

    setupAutocomplete();
    setupHypixelToggle();
    setupModal();
    setupScramble();
}

export function enableInput() {
    guessInput.disabled = false;
    guessBtn.disabled = false;
    guessInput.placeholder = "Enter weapon";
}

export function showShareButton(attempts) {
    const btn = document.getElementById("shareBtn");
    btn.style.display = "inline-block";

    btn.onclick = () => {
        const day = getDayNumber();
        let text = "";
        if (attempts <= 1) {
            text = `Skyblockle #${day} first try!\n${GameState.shareRows.join("\n")}\n<https://skyblockle.vercel.app/>`;
        } else {
            text = `Skyblockle #${day} in ${attempts} tries\n${GameState.shareRows.join("\n")}\n<https://skyblockle.vercel.app/>`;
        }

        navigator.clipboard.writeText(text)
            .then(() => tempMessage("Copied to clipboard!", 1500))
            .catch(() => tempMessage("Copy failed...", 1500));
    };
}


export function getDayNumber() {
    const start = new Date(GameState.START_DATE || "2025-11-26");
    const today = new Date();
    const diffTime = today - start;
    return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

/* ---------------- autocomplete ---------------- */

function setupAutocomplete() {
    let suggestionIndex = -1;

    guessInput.addEventListener("input", () => {
        const value = guessInput.value.toLowerCase();
        suggestionsBox.innerHTML = "";
        suggestionIndex = -1;

        if (value.length === 0) {
            suggestionsBox.style.display = "none";
            return;
        }

        let allMatches = [];

        for (const pair in daggers) {
            if (pair.toLowerCase().includes(value)) {
                const kwMatchPos = pair.toLowerCase().indexOf(value);
                daggers[pair].forEach(dagger => {
                    allMatches.push({ name: dagger, pos: kwMatchPos });
                });
            }
        }

        GameState.items.forEach(item => {
            if (item.name.toLowerCase().includes(value)) {
                if (!allMatches.some(m => m.name === item.name)) {
                    allMatches.push({
                        name: item.name,
                        pos: item.name.toLowerCase().indexOf(value)
                    });
                }
            }
        });

        const combinedMatches = allMatches.sort((a, b) => {
                if (a.pos !== b.pos) return a.pos - b.pos;
                return a.name.length - b.name.length;
            }).slice(0, 10);

        if (combinedMatches.length === 0) {
            suggestionsBox.style.display = "none";
            return;
        }

        combinedMatches.forEach((item, i) => {
            const div = document.createElement("div");
            div.textContent = item.name;
            div.style.padding = "6px";
            div.style.cursor = "pointer";

            div.addEventListener("mouseover", () => {
                suggestionIndex = i;
                highlightSuggestions();
            });

            div.addEventListener("mousedown", () => {
                guessInput.value = item.name;
                suggestionsBox.style.display = "none";
            });

            suggestionsBox.appendChild(div);
        });

        suggestionsBox.style.display = "block";
    });

    function highlightSuggestions() {
        [...suggestionsBox.children].forEach((child, i) => {
            child.style.background = (i === suggestionIndex) ? "#333" : "transparent";
        });
    }

    guessInput.addEventListener("keydown", e => {
        const count = suggestionsBox.children.length;

        if (e.key === "ArrowDown" && count > 0) {
            suggestionIndex = (suggestionIndex + 1) % count;
            highlightSuggestions();
            e.preventDefault();
            return;
        }

        if (e.key === "ArrowUp" && count > 0) {
            suggestionIndex = (suggestionIndex - 1 + count) % count;
            highlightSuggestions();
            e.preventDefault();
            return;
        }

        if (e.key === "Enter") {
            if (suggestionIndex >= 0 && count > 0) {
                guessInput.value =
                    suggestionsBox.children[suggestionIndex].textContent;
            }
            suggestionsBox.style.display = "none";
            if (guessInput.value.trim() !== "") checkAnswer();
            e.preventDefault();
        }
    });

    document.addEventListener("click", e => {
        if (!guessInput.contains(e.target)) {
            suggestionsBox.style.display = "none";
        }
    });
}

/* ---------------- h+ toggle ---------------- */

function setupHypixelToggle() {
    const checkbox = document.getElementById("hpluscheck");
    GameState.hplus = checkbox.checked;

    checkbox.addEventListener("change", e => {
        GameState.hplus = e.target.checked;

        document.querySelectorAll(".imgCell img").forEach(img => {
            const id = img.dataset.id;
            const material = img.dataset.material;

            img.src = GameState.hplus
                ? `img/${id.toLowerCase()}.png`
                : `img/vanilla/${material.toLowerCase()}.png`;
        });
    });
}

/* ---------------- info modal ---------------- */

function setupModal() {
    const modal = document.getElementById("info");
    const infoBtn = document.getElementById("infoM");
    const closeBtn = document.getElementById("closeM");

    if (!localStorage.getItem("modalShown")) {
        modal.style.visibility = "visible";
        localStorage.setItem("modalShown", "true");
    }

    infoBtn.onclick = () => modal.style.visibility = "visible";
    closeBtn.onclick = () => modal.style.visibility = "hidden";
}

/* ---------------- obfus effect ---------------- */

function setupScramble() {
    const pool = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
    const o1 = document.getElementById("o1");
    const o2 = document.getElementById("o2");

    function scramble(el) {
        el.textContent = pool[Math.floor(Math.random() * pool.length)];
    }

    setInterval(() => {
        scramble(o1);
        scramble(o2);
    }, 0);
}