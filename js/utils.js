import { daggers } from "./state.js";

export function pairOf(name) {
    for (const dag in daggers)
        if (daggers[dag].includes(name)) return dag;
    return null;
}

export function seededRandom(seed) {
    let x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

export function getTodayString() {
    return new Date().toISOString().slice(0, 10);
}

export function getDailyIndex(arrayLength) {
    const seed = Number(getTodayString().replace(/-/g, ""));
    return Math.floor(seededRandom(seed) * arrayLength);
}