import { loadWeapons, initDailyAnswer } from "./data.js";
import { setupUI } from "./ui.js";

async function main() {
    await loadWeapons();
    initDailyAnswer();
    setupUI();
}

main();