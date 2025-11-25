<script lang="ts">
    import { fade, scale } from "svelte/transition";

    export let maxX = 10;
    export let maxY = 10;
    export let currentX = 0;
    export let currentY = 0;
    export let targetX = 5;
    export let targetY = 5;
    export let map: number[][] = []; // 0 = Empty, 1 = Wall
    export let visited: { x: number; y: number }[] = [];

    // Helper to check if a cell is a wall
    $: isWall = (x: number, y: number) => {
        if (!map || !map[y] || map[y][x] === undefined) return false;
        return map[y][x] === 1;
    };
</script>

<div class="grid-container" style="--cols: {maxX}; --rows: {maxY}">
    <!-- Grid Cells -->
    {#each Array(maxY) as _, y}
        {#each Array(maxX) as _, x}
            <!-- Invert Y so 0 is at bottom for display logic if needed, 
                 but typically arrays are [y][x] from top-left. 
                 Let's stick to standard array mapping: map[y][x] where y=0 is top.
                 BUT, Cartesian coordinates usually have (0,0) at bottom-left.
                 Let's map visual row `r` to coordinate `y`.
                 If we want (0,0) at bottom-left:
                 Visual Row 0 (top) -> y = maxY - 1
                 Visual Row maxY-1 (bottom) -> y = 0
            -->
            {@const coordY = maxY - 1 - y}
            {@const coordX = x}

            <div
                class="cell {isWall(coordX, coordY) ? 'wall' : ''}"
                class:axis={coordX === 0 || coordY === 0}
            >
                <!-- Coordinate Label (optional) -->
                {#if coordX === 0 && coordY % 5 === 0}
                    <span class="label-y">{coordY}</span>
                {/if}
                {#if coordY === 0 && coordX % 5 === 0}
                    <span class="label-x">{coordX}</span>
                {/if}

                <!-- Visited Marker -->
                {#if visited.some((p) => p.x === coordX && p.y === coordY)}
                    <div
                        class="breadcrumb"
                        transition:fade={{ duration: 200 }}
                    ></div>
                {/if}

                <!-- Target -->
                {#if coordX === targetX && coordY === targetY}
                    <div class="target" transition:scale>🚩</div>
                {/if}

                <!-- Character -->
                {#if coordX === currentX && coordY === currentY}
                    <div class="character" transition:scale={{ duration: 200 }}>
                        👾
                    </div>
                {/if}
            </div>
        {/each}
    {/each}
</div>

<style>
    .grid-container {
        display: grid;
        grid-template-columns: repeat(var(--cols), 1fr);
        grid-template-rows: repeat(var(--rows), 1fr);
        gap: 2px;
        width: 100%;
        aspect-ratio: 1; /* Keep it square */
        background: rgba(15, 23, 42, 0.5);
        border: 2px solid #334155;
        border-radius: 8px;
        padding: 4px;
        position: relative;
    }

    .cell {
        background: rgba(30, 41, 59, 0.3);
        border-radius: 2px;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .cell.wall {
        background: #475569;
        border: 1px solid #64748b;
        box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.5);
    }

    .cell.wall::after {
        content: "";
        position: absolute;
        inset: 2px;
        border: 1px dashed #94a3b8;
        opacity: 0.3;
    }

    .cell.axis {
        background: rgba(51, 65, 85, 0.5);
    }

    .label-x {
        position: absolute;
        bottom: -20px;
        font-size: 0.7rem;
        color: #94a3b8;
    }

    .label-y {
        position: absolute;
        left: -20px;
        font-size: 0.7rem;
        color: #94a3b8;
    }

    .character {
        font-size: 1.5rem;
        z-index: 10;
        filter: drop-shadow(0 0 5px #3b82f6);
    }

    .target {
        font-size: 1.5rem;
        z-index: 5;
        filter: drop-shadow(0 0 5px #ef4444);
    }

    .breadcrumb {
        width: 30%;
        height: 30%;
        background: #3b82f6;
        border-radius: 50%;
        opacity: 0.5;
    }
</style>
