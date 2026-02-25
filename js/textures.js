import { GameState } from "./state.js";

function uniq(arr) {
    return [...new Set(arr)];
}

export function getTextureCandidates(id, material) {
    const normId = id.toLowerCase();
    const vanillaSrc = `img/vanilla/${material.toLowerCase()}.png`;

    if (GameState.furfsky) {
        return uniq([
            `img/furfsky/${normId}.png`,
            vanillaSrc
        ]);
    }

    if (GameState.hplus) {
        return uniq([
            `img/${normId}.png`,
            vanillaSrc
        ]);
    }

    return [vanillaSrc];
}

export function applyTexture(imgEl, id, material) {
    const sources = getTextureCandidates(id, material);
    let idx = 0;

    imgEl.onerror = () => {
        idx++;
        if (idx < sources.length) {
            imgEl.src = sources[idx];
            return;
        }
        imgEl.onerror = null;
    };

    imgEl.src = sources[0];
}
