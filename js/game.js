import { GameState, daggers } from "./state.js";
import { pairOf, getTodayString } from "./utils.js";
import { addGrid, buildShareRow } from "./grid.js";
import { tempMessage, setAlert, clearAlert, showShareButton, enableInput } from "./ui.js";

(function applyDailyLockout() {
        
    const today = getTodayString();
    const lastPlayed = localStorage.getItem("skyblockdle_last_played");
    const guessesDate = localStorage.getItem("skyblockdle_guesses_date");

    if ((lastPlayed && lastPlayed !== today) || (guessesDate && guessesDate !== today)) {
    localStorage.removeItem("skyblockdle_guesses");
        localStorage.removeItem("skyblockdle_shareRows");
        localStorage.removeItem("skyblockdle_last_played");
        localStorage.removeItem("skyblockdle_guesses_date");
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
            loadPracticeGame(GameState.items);
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

(function restoreDailyGame() {
    if (!GameState.items || GameState.items.length === 0) {
    console.log("Loading last session");
    setTimeout(restoreDailyGame, 300);
    return;
    }
    const savedGuesses = JSON.parse(localStorage.getItem("skyblockdle_guesses") || "[]");
    GameState.shareRows = JSON.parse(localStorage.getItem("skyblockdle_shareRows") || "[]");
    const restoredLastPlayed = localStorage.getItem("skyblockdle_last_played");
    const savedGuessesDate = localStorage.getItem("skyblockdle_guesses_date");

    const todayStr = getTodayString();

    // restore if guesses are from today OR the user already completed today's game
    const shouldRestore = (savedGuessesDate === todayStr && savedGuesses.length > 0)
                          || (restoredLastPlayed === todayStr && (savedGuesses.length > 0 || shareRows.length > 0));

    if (shouldRestore) {
        savedGuesses.forEach(name => {
            const foundItem = GameState.items.find(e => e.name === name);
            if (foundItem) {
                GameState.guessedItems.push(foundItem);
                addGrid([
                    foundItem.name,
                    foundItem.id,
                    foundItem.damage,
                    foundItem.strength,
                    foundItem.rarity,
                    foundItem.weapon_type,
                    foundItem.ability,
                    foundItem.material
                ], true);
                    buildShareRow(GameState.shareRows);
            }
        });

        if (restoredLastPlayed === getTodayString()) {
            showShareButton(GameState.guessedItems.length);
        }
    } else {
        localStorage.removeItem("skyblockdle_guesses");
        localStorage.removeItem("skyblockdle_shareRows");
        localStorage.removeItem("skyblockdle_guesses_date");
    }
})();

function loadPracticeGame(itemsGiven) {
    GameState.practiceActive = true;
    enableInput();
    clearAlert();

    
    // random index
    const randomIndex = Math.floor(Math.random() * itemsGiven.length);
    const groupName = pairOf(itemsGiven[randomIndex].name);
    
    if (groupName) {
        GameState.itemAns = {...itemsGiven[randomIndex], name: groupName};
    } else {
        GameState.itemAns = itemsGiven[randomIndex];
    }

    GameState.ansData = [GameState.itemAns.name, GameState.itemAns.id, GameState.itemAns.damage, GameState.itemAns.strength, GameState.itemAns.rarity, GameState.itemAns.weapon_type, GameState.itemAns.ability, GameState.itemAns.material];
    
    GameState.guessedItems = [];
    GameState.shareRows = [];
    
    const cells = grid.querySelectorAll(".cell:not(.title)");
    cells.forEach(cell => cell.remove());
    
    guessInput.disabled = false;
    guessBtn.disabled = false;
    document.getElementById("practiceBtn").style.display = "none";
    document.getElementById("shareBtn").style.display = "none";
}

export function checkAnswer() {
    let guess = document.getElementById("guessInput").value
        let foundItem = GameState.items.find(e => e.name.toLowerCase() === guess.toLowerCase());

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

            const guessedNames = GameState.guessedItems.map(i => i.name)
            const pairGroup = pairOf(foundItem.name)
            const pairItems = pairGroup ? daggers[pairGroup] : [foundItem.name]
            const alreadyGuessed = pairItems.some(name => guessedNames.includes(name))
            if(alreadyGuessed){
                tempMessage("You already tried that item!")
                return;
            } else{
                GameState.guessedItems.push(foundItem)
                if (!GameState.practiceActive) {
                    localStorage.setItem("skyblockdle_guesses", JSON.stringify(GameState.guessedItems.map(i => i.name)));
                    localStorage.setItem("skyblockdle_guesses_date", getTodayString());
                }
                clearAlert();
                document.getElementById("guessInput").value = "";
                addGrid(itemData);
            }

            

            if(foundItem.name  === GameState.itemAns.name || pairOf(foundItem.name) === GameState.itemAns.name){
                if (!GameState.practiceActive) {
                    localStorage.setItem("skyblockdle_last_played", getTodayString());
                    document.getElementById("guessInput").value = "";
                    document.getElementById("guessBtn").disabled = true;
                    document.getElementById("guessInput").disabled = true;
                    const pb = document.getElementById("practiceBtn");
                    setTimeout(() => {
                        setAlert("You won!", true);
                        document.getElementById("guessInput").placeholder = "Yay!";
        
                        showShareButton(GameState.guessedItems.length);
                        pb.style.display = "inline-block";
                        pb.onclick = () => {
                        console.log("Loading practice mode");
                        loadPracticeGame(GameState.items);
                    };
                    }, 300*6);

                } else{
                    document.getElementById("guessInput").value = "";
                    document.getElementById("guessBtn").disabled = true;
                    document.getElementById("guessInput").disabled = true;
                    setTimeout(() => {
                        document.getElementById("guessInput").placeholder = "Yay!"
                        setAlert("Good job!", true);
                        const pb = document.getElementById("practiceBtn");
                        pb.style.display = "inline-block";
                        pb.onclick = () => {
                        console.log("Loading practice mode");
                        loadPracticeGame(GameState.items);
                    };
                    }, 300*6);
                }
            } else {
                setTimeout(() => {
                    tempMessage("Not correct! Try again!");
                }, 300*6);
            }
        }else{
            tempMessage("Item not found");
        }
}

export function startGame(mode) {
    GameState.gameMode = mode;
    GameState.guessedItems = [];
    GameState.shareRows = [];
}