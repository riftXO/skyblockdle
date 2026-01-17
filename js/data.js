import { GameState } from "./state.js";
import { getDailyIndex, pairOf } from "./utils.js";

export async function loadWeapons() {
    const res = await fetch("js/weaponsList.json");
    const data = await res.json();
    GameState.items = data.items;
}

export function initDailyAnswer() {
    const items = GameState.items;
    const index = getDailyIndex(items.length);
    const item = items[index];

    const group = pairOf(item.name);
    GameState.itemAns = group ? { ...item, name: group } : item;

    GameState.ansData = [
        GameState.itemAns.name,
        GameState.itemAns.id,
        GameState.itemAns.damage,
        GameState.itemAns.strength,
        GameState.itemAns.rarity,
        GameState.itemAns.weapon_type,
        GameState.itemAns.ability,
        GameState.itemAns.material
    ];
}
