import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// Types
export type GameState = {
    xp: number;
    level: number;
    unlockedNodes: string[]; // List of problem IDs or Level IDs that are unlocked
    completedNodes: string[];
};

const DEFAULT_STATE: GameState = {
    xp: 0,
    level: 1,
    unlockedNodes: ['lab01-p1'], // Start with the first problem unlocked
    completedNodes: []
};

// Create store
function createGameStore() {
    const { subscribe, set, update } = writable<GameState>(DEFAULT_STATE);

    return {
        subscribe,
        init: () => {
            if (browser) {
                const stored = localStorage.getItem('code_adventure_state');
                if (stored) {
                    try {
                        set(JSON.parse(stored));
                    } catch (e) {
                        console.error('Failed to load game state', e);
                    }
                }
            }
        },
        addXp: (amount: number) => update(state => {
            const newState = { ...state, xp: state.xp + amount };
            // Simple level up logic: Level = 1 + floor(XP / 100)
            newState.level = 1 + Math.floor(newState.xp / 100);
            saveState(newState);
            return newState;
        }),
        completeNode: (nodeId: string, nextNodeId?: string) => update(state => {
            if (state.completedNodes.includes(nodeId)) return state;

            const newState = {
                ...state,
                completedNodes: [...state.completedNodes, nodeId]
            };

            if (nextNodeId && !newState.unlockedNodes.includes(nextNodeId)) {
                newState.unlockedNodes = [...newState.unlockedNodes, nextNodeId];
            }

            saveState(newState);
            return newState;
        }),
        reset: () => {
            set(DEFAULT_STATE);
            saveState(DEFAULT_STATE);
        }
    };
}

function saveState(state: GameState) {
    if (browser) {
        localStorage.setItem('code_adventure_state', JSON.stringify(state));
    }
}

export const gameStore = createGameStore();
