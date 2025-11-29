// Globals

let gameMode = "daily";
let itemAns = null;
let ansData = null;
let guessedItems = []; //
let shareRows = [];
let messageTimeout = null
const START_DATE = "2025-11-26";
let grid = document.getElementById('grid');
grid.className = "grid";
let alertBox = document.getElementById("alert");
let practiceActive = false;

let hplus = false;

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



function startGame(mode) {
    gameMode = mode;
    
    guessedItems = [];
    shareRows = [];
    grid.innerHTML = "";
    alertBox.innerHTML = "&nbsp;";
    guessInput.disabled = false;
    guessBtn.disabled = false;
    
    if (mode === "daily") {
        loadDailyGame();
    } else {
        loadPracticeGame();
    }
}


function loadPracticeGame(itemsGiven) {
    practiceActive = true;
    document.getElementById("guessInput").placeholder = "Enter guess";
    document.getElementById("guessBtn").disabled = false;
    document.getElementById("guessInput").disabled = false;
    alertBox.innerHTML = "&nbsp;";
    
    // random index
    const randomIndex = Math.floor(Math.random() * itemsGiven.length);
    
    itemAns = itemsGiven[randomIndex];
    ansData = [itemAns.name, itemAns.id, itemAns.damage, itemAns.strength, itemAns.rarity, itemAns.weapon_type, itemAns.ability, itemAns.material];
    
    guessedItems = [];
    shareRows = [];
    
    const cells = grid.querySelectorAll(".cell:not(.title)");
    cells.forEach(cell => cell.remove());
    
    guessInput.disabled = false;
    guessBtn.disabled = false;
    document.getElementById("practiceBtn").style.display = "none";
    document.getElementById("shareBtn").style.display = "none";
}




fetch("js/weaponsList.json")
.then(res => res.json())
.then(data => {
    const itemsGiven = data.items;
    const index = getDailyIndex(itemsGiven.length);
    itemAns = itemsGiven[index];
    ansData = [itemAns.name, itemAns.id, itemAns.damage, itemAns.strength, itemAns.rarity, itemAns.weapon_type, itemAns.ability, itemAns.material];
    
    (function applyDailyLockout() {
        
        const today = getTodayString();
        const lastPlayed = localStorage.getItem("skyblockdle_last_played");
    
        if(lastPlayed && lastPlayed !== today){
            localStorage.removeItem("skyblockdle_guesses");
            localStorage.removeItem("skyblockdle_shareRows");
            localStorage.removeItem("skyblockdle_last_played");
        }
    
        function disableInputs() {
            const gi = document.getElementById("guessInput");
            const gb = document.getElementById("guessBtn");
            const al = document.getElementById("alert");
            if (gi) gi.disabled = true;
            if (gb) gb.disabled = true;
            if (al) al.innerHTML = "Come back tomorrow!";
            const pb = document.getElementById("practiceBtn");
            pb.style.display = "inline-block";
            pb.onclick = () => {
                console.log("Loading practice mode");
                loadPracticeGame(itemsGiven);
            };
            
        }
    
        if (lastPlayed === today) {
            if (document.readyState === "loading") {
                document.addEventListener("DOMContentLoaded", disableInputs);
            } else {
                disableInputs();
            }
        }
    })();


    function getDayNumber() {
    const start = new Date(START_DATE);
    const today = new Date();

    const diffTime = today - start;
    return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }

    function tempMessage(text, ms = 2000) {
        alertBox.innerHTML = text;
        alertBox.style = "color: #FF5555; text-shadow: 3px 3px 0px #3f1515;"

        if (messageTimeout) clearTimeout(messageTimeout);

        messageTimeout = setTimeout(() => {alertBox.innerHTML = "&nbsp;"; messageTimeout = null;}, ms);
    }

    function buildShareRow(cellResults) {
        return cellResults.map(res => {
            if (res === "correct") return "🟩";
            if (res === "won") return "✅";
            if (res === "present") return "🟥";
            if (res === "lost") return "❌";
            return "🟥";
        }).join("");
    }

const savedGuesses = JSON.parse(localStorage.getItem("skyblockdle_guesses") || "[]");
shareRows = JSON.parse(localStorage.getItem("skyblockdle_shareRows") || "[]");
const restoredLastPlayed = localStorage.getItem("skyblockdle_last_played");

if (savedGuesses.length > 0) {
    savedGuesses.forEach(name => {
        const foundItem = itemsGiven.find(e => e.name === name);
        if (foundItem) {
            guessedItems.push(foundItem);
            addGrid([foundItem.name, foundItem.id, foundItem.damage, foundItem.strength, foundItem.rarity, foundItem.weapon_type, foundItem.ability, foundItem.material], true);
        }
    });

    if (restoredLastPlayed === getTodayString()) {
    showShareButton(guessedItems.length);
    }
}

    async function checkAnswer(){
        let guess = document.getElementById("guessInput").value
        let foundItem = itemsGiven.find(e => e.name.toLowerCase() === guess.toLowerCase());
        if(guess.toLowerCase() == "cowshed"){
            tempMessage("Moo! 🐮")
            return;
        }
        if(guess.toLowerCase() == "furrybutts"){
            tempMessage("cute")
            return;
        }
        if(foundItem){
            let itemData = [foundItem.name, foundItem.id, foundItem.damage, foundItem.strength, foundItem.rarity, foundItem.weapon_type, foundItem.ability, foundItem.material];
            if(guessedItems.includes(foundItem)){
                tempMessage("You already tried that item!")
                return;
            } else{
                guessedItems.push(foundItem)
                if (!practiceActive) {
                    localStorage.setItem("skyblockdle_guesses", JSON.stringify(guessedItems.map(i => i.name)));
                }


                alertBox.innerHTML = "&nbsp;"
                document.getElementById("guessInput").value = "";
                addGrid(itemData);
            }

            

            if(foundItem.name === itemAns.name){
                if (!practiceActive) {
                    localStorage.setItem("skyblockdle_last_played", getTodayString());
                    document.getElementById("guessInput").value = "";
                    document.getElementById("guessBtn").disabled = true;
                    document.getElementById("guessInput").disabled = true;
                    setTimeout(() => {
                        alertBox.innerHTML = "You won!"
                        alertBox.style = "color: #00AA00; text-shadow: 3px 3px 0px #004200ff;"
                        document.getElementById("guessInput").placeholder = "Yay!";
        
                        showShareButton(guessedItems.length);
                        
                        const pb = document.getElementById("practiceBtn");
                        pb.style.display = "inline-block";
                    }, 300*6);
                    pb.onclick = () => {
                        console.log("Loading practice mode");
                        loadPracticeGame(itemsGiven);
                    };
                } else{
                    document.getElementById("guessInput").value = "";
                    document.getElementById("guessBtn").disabled = true;
                    document.getElementById("guessInput").disabled = true;
                    setTimeout(() => {
                        alertBox.innerHTML = "Good job!";
                        alertBox.style = "color: #00AA00; text-shadow: 3px 3px 0px #004200ff;"
                        const pb = document.getElementById("practiceBtn");
                        pb.style.display = "inline-block";
                    }, 300*6);
                    pb.onclick = () => {
                        console.log("Loading practice mode");
                        loadPracticeGame(itemsGiven);
                    };
                }
            }
        }else{
            tempMessage("Item not found");
        }
    
    }

    const guessInput = document.getElementById("guessInput");
    const suggestionsBox = document.getElementById("suggestions");
    let suggestionIndex = -1;
    

//autocomplete
    guessInput.addEventListener("input", () => {
        const value = guessInput.value.toLowerCase();
        suggestionsBox.innerHTML = "";
        suggestionIndex = -1;

        if (value.length === 0) {
            suggestionsBox.style.display = "none";
            return;
        }

        const matches = itemsGiven
            .filter(item => item.name.toLowerCase().includes(value))
            .sort((a, b) => {
                const ai = a.name.toLowerCase().indexOf(value);
                const bi = b.name.toLowerCase().indexOf(value);
                if (ai !== bi) return ai - bi;
                return a.name.length - b.name.length;
            })
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

    document.getElementById("hpluscheck").addEventListener("change", (e) => {
        hplus = e.target.checked;
        console.log("Hypixel+ mode:", hplus);
        
        const imgCells = document.querySelectorAll(".imgCell img");
        imgCells.forEach(img => {
            const itemId = img.getAttribute("data-id");
            const material = img.getAttribute("data-material");
            
            if (hplus) {
                img.src = `img/${itemId.toLowerCase()}.png`;
            } else {
                img.src = `img/vanilla/${material.toLowerCase()}.png`;
            }
        });
    });

    function addGrid(itemData, isRestore = false) {
        const ROW_STAGGER_MS = 0;
        const CELL_OFFSET_MS = 300;
        const DURATION_MS = 300;

        const cols = Math.max(grid.querySelectorAll(".cell.title").length, 1);
        const existingCells = grid.querySelectorAll(".cell:not(.title)").length;
        let existingRows = Math.floor(existingCells / cols);
        let rowResults = [];
        let displayIndex = 0;
        itemData.forEach((element, index) => {

        if (index === 1) {
            return;
        }
        if (index === 7) {
            return;
        }
            const cell = document.createElement('div');
            cell.className = "cell";

            if(Array.isArray(element)){
                if (element.length === 0) {
                    cell.textContent = "No ability";
                } else {
                    cell.innerHTML = element.join("<br>");
                }
            } else if (element === itemData[2] || element === itemData[3]){
                cell.innerHTML = element
                if(element < ansData[index]){
                    cell.innerHTML += " <span class='arrow'>↑</span>"
                } else if(element > ansData[index]){
                    cell.innerHTML += " <span class='arrow'>↓</span>"
                }
            }else if (element === itemData[0]){
                let parsedName = itemData[0];
                if(element == "Aspect of the Jerry, Signature Edition"){
                    parsedName = "AOTJ, Signature Edition"
                } else if (element == "§4Sin§5seeker Scythe"){
                    parsedName = "Sinseeker Scythe"
                }
                const imgSrc = hplus ? `img/${itemData[1].toLowerCase()}.png` : `img/vanilla/${itemData[7].toLowerCase()}.png`;
                cell.innerHTML = `<div class="imgCell"><img src='${imgSrc}' alt='${parsedName}' data-id='${itemData[1]}' data-material='${itemData[7]}' title='${parsedName}' height='55px'><div>${parsedName}</div></div>`;
            }else{
                cell.innerHTML = element
            }

        let result = checkBg(cell, index, element, ansData);

            //if (index > 0) rowResults.push(result);
            if (typeof result !== "undefined") rowResults.push(result);
            
            if (!cell.classList.contains('title')) {
                if (isRestore) {
                    cell.style.animation = 'none';
                    cell.style.opacity = '1';
                    cell.style.transform = 'none';
                } else {
                    const rowBaseDelay = existingRows * ROW_STAGGER_MS;
                    const cellDelay = rowBaseDelay + (displayIndex * CELL_OFFSET_MS);
                    cell.style.animation = `reveal ${DURATION_MS}ms ease ${cellDelay}ms both`;
                }
                displayIndex++;
        }

            grid.appendChild(cell);

        });
        if (!isRestore && rowResults.length > 0) {
        shareRows.push(buildShareRow(rowResults));
        if (!practiceActive) {
            localStorage.setItem("skyblockdle_shareRows", JSON.stringify(shareRows));
        }
    }
    }

    function checkBg(cell, index, itemData, itemAns){
        let answerVal = itemAns[index]
         if (index === 7) {
            return;
        } 
        if (Array.isArray(itemData) || Array.isArray(answerVal) || itemData === null || answerVal === null) {
            const color = abilityColor(itemData, answerVal);
            cell.classList.add(color);
            return color;
        }

            if(itemData === itemAns[index]){
                if(index === 0){
                   cell.classList.add("won");
                   return "won"
                }
                cell.classList.add("correct");
                return "correct";
            } else {
                if(index === 0){
                   cell.classList.add("lost"); 
                   return "lost"
                }
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
                text = `Skyblockdle #${day} first try!\n`+shareRows.join("\n") + "\n<https://skyblockle.vercel.app/>"
            } else {
                text = `Skyblockdle #${day} in ${attempts} tries\n` +shareRows.join("\n") + "\n<https://skyblockle.vercel.app/>"
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


//first time popup
const modalShown = localStorage.getItem("modalShown");

if (!modalShown) {
    const modal = document.getElementById("info");
    modal.style.visibility = "visible"; 

    localStorage.setItem("modalShown", "true");
}

document.getElementById("infoM").addEventListener("click", () => {
    document.getElementById("info").style.visibility = "visible";
});

document.getElementById("closeM").addEventListener("click", () => {
    document.getElementById("info").style.visibility = "hidden";
});