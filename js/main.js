function seededRandom(seed) {
    let x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

function getDailyIndex(arrayLength) {
    const today = getTodayString();
    const seed = Number(today.replace(/-/g, ""));
    const random = seededRandom(seed);
    return Math.floor(random * arrayLength);
}

function getTodayString() {
    return new Date().toISOString().slice(0, 10);
}

(function applyDailyLockout() {
    
    const today = getTodayString();
    const lastPlayed = localStorage.getItem("skyblockdle_last_played");

    if(lastPlayed !== today){
        localStorage.removeItem("skyblockdle_guesses");
        localStorage.removeItem("skyblockdle_shareRows");
    }

    function disableInputs() {
        const gi = document.getElementById("guessInput");
        const gb = document.getElementById("guessBtn");
        const al = document.getElementById("alert");
        if (gi) gi.disabled = true;
        if (gb) gb.disabled = true;
        if (al) al.innerHTML = "Come back tomorrow!";
    }

    if (lastPlayed === today) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", disableInputs);
        } else {
            disableInputs();
        }
    }
})();

let guessedItems = [];
let shareRows = [];
let messageTimeout = null
const START_DATE = "2025-11-26";


fetch("js/weaponsList.json")
  .then(res => res.json())
  .then(data => {
    const itemsGiven = data.items;
    const index = getDailyIndex(itemsGiven.length);
    let itemAns = itemsGiven[index];
    let ansData = [itemAns.name, itemAns.id, itemAns.damage, itemAns.strength, itemAns.rarity, itemAns.weapon_type, itemAns.ability]

    let grid = document.getElementById('grid');
    grid.className = "grid";
    let alertBox = document.getElementById("alert");

    function getDayNumber() {
    const start = new Date(START_DATE);
    const today = new Date();

    const diffTime = today - start;
    return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }

    function tempMessage(text, ms = 2000) {
        alertBox.innerHTML = text;

        if (messageTimeout) clearTimeout(messageTimeout);

        messageTimeout = setTimeout(() => {alertBox.innerHTML = "&nbsp;"; messageTimeout = null;}, ms);
    }

    function buildShareRow(cellResults) {
        return cellResults.map(res => {
            if (res === "correct") return "🟩";
            if (res === "present") return "🟨";
            return "🟥";
        }).join("");
    }

const savedGuesses = JSON.parse(localStorage.getItem("skyblockdle_guesses") || "[]");
shareRows = JSON.parse(localStorage.getItem("skyblockdle_shareRows") || "[]");
if (savedGuesses.length > 0) {
    savedGuesses.forEach(name => {
        const foundItem = itemsGiven.find(e => e.name === name);
        if (foundItem) {
            guessedItems.push(foundItem);
            addGrid([foundItem.name, foundItem.id, foundItem.damage, foundItem.strength, foundItem.rarity, foundItem.weapon_type, foundItem.ability], true);
        }
    });

    showShareButton(guessedItems.length);
}

    async function checkAnswer(){
        let guess = document.getElementById("guessInput").value
        let foundItem = itemsGiven.find(e => e.name.toLowerCase() === guess.toLowerCase());
        if(foundItem){
            let itemData = [foundItem.name, foundItem.id, foundItem.damage, foundItem.strength, foundItem.rarity, foundItem.weapon_type, foundItem.ability];
            if(guessedItems.includes(foundItem)){
                tempMessage("You already tried that item!")
                return;
            } else{
                guessedItems.push(foundItem)
                localStorage.setItem("skyblockdle_guesses", JSON.stringify(guessedItems.map(i => i.name)));

                if (!localStorage.getItem("skyblockdle_last_played")) {
                    localStorage.setItem("skyblockdle_last_played", getTodayString());
                }

                alertBox.innerHTML = "&nbsp;"
                document.getElementById("guessInput").value = "";
                addGrid(itemData);
            }

            if(foundItem.name === itemAns.name){
                alertBox.innerHTML = "You won!"
                alertBox.style = "color: #00AA00; text-shadow: 3px 3px 0px #004200ff;"
                document.getElementById("guessInput").value = "";
                document.getElementById("guessBtn").disabled = true;
                document.getElementById("guessInput").disabled = true;
                document.getElementById("guessInput").placeholder = "Yay!";

                localStorage.setItem("skyblockdle_last_played", getTodayString());

                showShareButton(guessedItems.length);
            }
        }else{
            tempMessage("Item not found");
        }
    
    }

    const guessInput = document.getElementById("guessInput");
    const suggestionsBox = document.getElementById("suggestions");
    let suggestionIndex = -1;
    


    guessInput.addEventListener("input", () => {
        const value = guessInput.value.toLowerCase();
        suggestionsBox.innerHTML = "";
        suggestionIndex = -1;

        if (value.length === 0) {
            suggestionsBox.style.display = "none";
            return;
        }

        const matches = itemsGiven
            .filter(item => item.name.toLowerCase().startsWith(value))
            .slice(0, 10);

        if (matches.length === 0) {
            suggestionsBox.style.display = "none";
            return;
        }

        matches.forEach((item, i) => {
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

    guessInput.addEventListener("keydown", (e) => {
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
                guessInput.value = suggestionsBox.children[suggestionIndex].textContent;
            }
            suggestionsBox.style.display = "none";
            if (guessInput.value.trim() !== "") {
                checkAnswer();
            }

            e.preventDefault();
        }
    });

    document.addEventListener("click", (e) => {
        if (!guessInput.contains(e.target)) {
            suggestionsBox.style.display = "none";
        }
    });

    function addGrid(itemData, isRestore = false) {
        let rowResults = [];
        itemData.forEach((element, index) => {
            const cell = document.createElement('div');
            cell.className = "cell";

            if(Array.isArray(element)){
                cell.innerHTML = element.join("<br>")
            } else if (element === null){
                cell.innerHTML = "No ability";
            } else if (element === itemData[2] || element === itemData[3]){
                cell.innerHTML = element
                if(element < ansData[index]){
                    cell.innerHTML += "<span class='arrow'>↑</span>"
                } else if(element > ansData[index]){
                    cell.innerHTML += "<span class='arrow'>↓</span>"
                }
            }else if (element === itemData[0]){
                cell.innerHTML = `<img src='img/${itemData[1].toLowerCase()}.png' alt='${itemData[0]}' title='${itemData[0]}' height='65'>`;
            }else if (element === itemData[1]){
                return;
            }else{
                cell.innerHTML = element
            }

            let result = checkBg(cell, index, element, ansData)
            if (index > 0) rowResults.push(result);

            grid.appendChild(cell);

        });
        if(!isRestore) {
            shareRows.push(buildShareRow(rowResults));
            localStorage.setItem("skyblockdle_shareRows", JSON.stringify(shareRows));
        }
    }

    function checkBg(cell, index, itemData, itemAns){
        let answerVal = itemAns[index]
        if (Array.isArray(itemData) || Array.isArray(answerVal) || itemData === null || answerVal === null) {
            const color = abilityColor(itemData, answerVal);
            cell.classList.add(color);
            return color;
        }

            if(itemData === itemAns[index]){
                cell.classList.add("correct");
                return "correct";
            } else {
                cell.classList.add("absent");
                return "absent"
            }
        };

    function showShareButton(attempts) {
        const btn = document.getElementById("shareBtn");
        btn.style.display = "inline-block";

        btn.addEventListener("click", () =>  {
            const day = getDayNumber();
            let text = "";
            if(attempts <= 1){
                text = `\nSkyblockdle #${day} first try!`+shareRows.join("\n") + "\n<https://skyblockle.vercel.app/>"
            } else {
                text = `\nSkyblockdle #${day} in ${attempts} tries` +shareRows.join("\n") + "\n<https://skyblockle.vercel.app/>"
            }

            navigator.clipboard.writeText(text).then(() => {
                tempMessage("Copied to clipboard!", 1500);
            }).catch(() => {
                tempMessage("Copy failed...", 1500);
            });
        });
    }


    function abilityColor(foundArr, ansArr) {
        foundArr = Array.isArray(foundArr) ? foundArr : [];
        ansArr = Array.isArray(ansArr) ? ansArr : [];

        let matches = foundArr.filter(v => ansArr.includes(v)).length;

        let exactMatch = matches === foundArr.length && matches === ansArr.length;

        if (exactMatch) return "correct";
        if (matches >= 1) return "present";
        return "absent";
    }

    document.getElementById("guessBtn").onclick = checkAnswer;
    });

const pool = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";

function scramble(el) {
  el.textContent = pool[Math.floor(Math.random() * pool.length)];
}

setInterval(() => {
  scramble(document.getElementById("o1"));
  scramble(document.getElementById("o2"));
}, 10);

document.getElementById("infoM").addEventListener("click", () => {
    document.getElementById("info").style.visibility = "visible";
});

document.getElementById("closeM").addEventListener("click", () => {
    document.getElementById("info").style.visibility = "hidden";
});