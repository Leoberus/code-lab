export type LoopLevel = {
    id: number;
    title: string;
    description: string;
    target: { x: number; y: number };
    start: { x: number; y: number };
    gridSize: { x: number; y: number };
    map: number[][]; // 0 = Empty, 1 = Wall
    maxCommands: number;
    par: number; // Optimal number of commands
};

// Helper to create empty map
const createMap = (w: number, h: number, walls: { x: number, y: number }[] = []) => {
    const map = Array(h).fill(0).map(() => Array(w).fill(0));
    walls.forEach(p => {
        if (p.y < h && p.x < w) map[p.y][p.x] = 1;
    });
    return map;
};

export const LEVELS: LoopLevel[] = [
    {
        id: 1,
        title: "The Wall",
        description: "Navigate around the wall to reach the flag. You have a limit of 2 commands.",
        target: { x: 5, y: 5 },
        start: { x: 1, y: 1 },
        gridSize: { x: 8, y: 8 },
        map: createMap(8, 8, [
            { x: 3, y: 0 }, { x: 3, y: 1 }, { x: 3, y: 2 }, { x: 3, y: 3 }, { x: 3, y: 4 }
        ]),
        maxCommands: 2,
        par: 2
    },
    {
        id: 2,
        title: "Zig Zag",
        description: "Move through the corridor. Watch out for walls!",
        target: { x: 6, y: 6 },
        start: { x: 0, y: 0 },
        gridSize: { x: 8, y: 8 },
        map: createMap(8, 8, [
            { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 },
            { x: 3, y: 7 }, { x: 3, y: 6 }, { x: 3, y: 5 },
            { x: 5, y: 0 }, { x: 5, y: 1 }, { x: 5, y: 2 }
        ]),
        maxCommands: 4,
        par: 4
    },
    {
        id: 3,
        title: "The Maze",
        description: "Find your way through the maze. Efficiency is key.",
        target: { x: 7, y: 7 },
        start: { x: 0, y: 7 },
        gridSize: { x: 8, y: 8 },
        map: createMap(8, 8, [
            { x: 2, y: 7 }, { x: 2, y: 6 }, { x: 2, y: 5 },
            { x: 4, y: 2 }, { x: 4, y: 3 }, { x: 4, y: 4 },
            { x: 6, y: 7 }, { x: 6, y: 6 }, { x: 6, y: 5 }
        ]),
        maxCommands: 5,
        par: 3
    },
    {
        id: 4,
        title: "Boxed In",
        description: "You are surrounded. Find the gap.",
        target: { x: 4, y: 4 },
        start: { x: 0, y: 0 },
        gridSize: { x: 10, y: 10 },
        map: createMap(10, 10, [
            { x: 3, y: 3 }, { x: 4, y: 3 }, { x: 5, y: 3 },
            { x: 3, y: 4 }, { x: 5, y: 4 },
            { x: 3, y: 5 }, { x: 4, y: 5 }, { x: 5, y: 5 },
            // Outer walls
            { x: 2, y: 2 }, { x: 2, y: 3 }, { x: 2, y: 4 }, { x: 2, y: 5 }, { x: 2, y: 6 },
            { x: 6, y: 2 }, { x: 6, y: 3 }, { x: 6, y: 4 }, { x: 6, y: 5 }, { x: 6, y: 6 }
        ]),
        maxCommands: 6,
        par: 4
    },
    {
        id: 5,
        title: "Grand Finale",
        description: "A complex path requires a complex sequence.",
        target: { x: 9, y: 9 },
        start: { x: 0, y: 0 },
        gridSize: { x: 10, y: 10 },
        map: createMap(10, 10, [
            { x: 2, y: 0 }, { x: 2, y: 1 }, { x: 2, y: 2 }, { x: 2, y: 3 },
            { x: 5, y: 9 }, { x: 5, y: 8 }, { x: 5, y: 7 }, { x: 5, y: 6 },
            { x: 8, y: 0 }, { x: 8, y: 1 }, { x: 8, y: 2 }, { x: 8, y: 3 }
        ]),
        maxCommands: 8,
        par: 5
    }
];
