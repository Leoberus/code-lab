<script lang="ts">
    import GridMap from "$lib/components/visual/GridMap.svelte";
    import CommandList from "$lib/components/visual/CommandList.svelte";
    import { LEVELS, type LoopLevel } from "$lib/game/loopLevels";
    import { onMount } from "svelte";

    let currentLevelIndex = 0;
    $: level = LEVELS[currentLevelIndex];

    // Game State
    let currentX = 0;
    let currentY = 0;
    let visited: { x: number; y: number }[] = [];
    let isRunning = false;
    let attempts = 0;

    // Command State
    let commands: {
        direction: "UP" | "DOWN" | "LEFT" | "RIGHT";
        iterations: number;
    }[] = [];

    let status: "idle" | "success" | "fail" = "idle";
    let message = "";
    let stars = 0;

    // Initialize level
    $: if (level) {
        loadLevel(level);
    }

    function loadLevel(l: LoopLevel) {
        currentX = l.start.x;
        currentY = l.start.y;
        visited = [];
        commands = [];
        status = "idle";
        message = l.description;
        attempts = 0;
        stars = 0;
    }

    function reset() {
        currentX = level.start.x;
        currentY = level.start.y;
        visited = [];
        status = "idle";
        message = level.description;
    }

    async function runLoop() {
        if (isRunning) return;
        isRunning = true;
        visited = [];
        currentX = level.start.x;
        currentY = level.start.y;
        status = "idle";
        attempts++;

        // Execute Command Queue
        for (const cmd of commands) {
            // Inner Loop for each command
            for (let i = 0; i < cmd.iterations; i++) {
                let nextX = currentX;
                let nextY = currentY;

                if (cmd.direction === "UP") nextY++;
                if (cmd.direction === "DOWN") nextY--; // Wait, coordinates: Y=0 is bottom?
                // In GridMap, we mapped visual row 0 to maxY-1.
                // Let's stick to Cartesian: Y increases UP.
                // GridMap logic: coordY = maxY - 1 - visualRow.
                // So visualRow = maxY - 1 - coordY.
                // If I increase Y, visualRow decreases (moves up). Correct.

                if (cmd.direction === "LEFT") nextX--;
                if (cmd.direction === "RIGHT") nextX++;

                // Check Bounds
                if (
                    nextX < 0 ||
                    nextX >= level.gridSize.x ||
                    nextY < 0 ||
                    nextY >= level.gridSize.y
                ) {
                    fail("❌ Out of bounds!");
                    return;
                }

                // Check Walls
                if (level.map[nextY][nextX] === 1) {
                    fail("💥 CRASH! You hit a wall.");
                    return;
                }

                // Move
                currentX = nextX;
                currentY = nextY;
                visited = [...visited, { x: currentX, y: currentY }];

                await new Promise((r) => setTimeout(r, 300));
            }
        }

        // Check Win Condition
        if (currentX === level.target.x && currentY === level.target.y) {
            handleWin();
        } else {
            fail(
                `❌ Stopped at (${currentX}, ${currentY}). Target is (${level.target.x}, ${level.target.y}).`,
            );
        }

        isRunning = false;
    }

    function fail(msg: string) {
        status = "fail";
        message = msg;
        isRunning = false;
    }

    function handleWin() {
        status = "success";
        // Calculate stars based on par (commands used)
        if (commands.length <= level.par) stars = 3;
        else if (commands.length <= level.par + 2) stars = 2;
        else stars = 1;

        message = `🎉 MISSION ACCOMPLISHED!`;
    }

    function nextLevel() {
        if (currentLevelIndex < LEVELS.length - 1) {
            currentLevelIndex++;
        }
    }
</script>

<div class="cyberpunk-container">
    <div class="scanlines"></div>

    <header>
        <div class="header-left">
            <a href="/game" class="back-link">← EXIT</a>
            <div class="level-badge">LEVEL {level.id}</div>
        </div>
        <h1 class="neon-text">LOOP PROTOCOL</h1>
        <div class="header-right">
            <div class="attempts">ATTEMPTS: {attempts}</div>
        </div>
    </header>

    <main>
        <section class="game-area">
            <div class="hud">
                <div class="mission-box">
                    <span class="label">MISSION OBJECTIVE</span>
                    <p>{message}</p>
                </div>
                {#if status === "success"}
                    <div class="stars-display">
                        {#each Array(3) as _, i}
                            <span class="star {i < stars ? 'active' : ''}"
                                >★</span
                            >
                        {/each}
                    </div>
                {/if}
            </div>

            <GridMap
                maxX={level.gridSize.x}
                maxY={level.gridSize.y}
                {currentX}
                {currentY}
                targetX={level.target.x}
                targetY={level.target.y}
                map={level.map}
                {visited}
            />

            {#if status === "success"}
                <div class="victory-overlay">
                    <div class="victory-card">
                        <h2>SYSTEM HACKED</h2>
                        <div class="final-stars">
                            {#each Array(3) as _, i}
                                <span class="star {i < stars ? 'active' : ''}"
                                    >★</span
                                >
                            {/each}
                        </div>
                        <button class="next-btn" on:click={nextLevel}>
                            INITIALIZE NEXT LEVEL
                        </button>
                    </div>
                </div>
            {/if}
        </section>

        <section class="controls-area">
            <CommandList
                bind:commands
                maxCommands={level.maxCommands}
                {isRunning}
                on:run={runLoop}
                on:reset={reset}
            />
        </section>
    </main>
</div>

<style>
    :global(body) {
        margin: 0;
        background: #050510;
        color: #e0f2fe;
        font-family: "Outfit", sans-serif;
    }

    .cyberpunk-container {
        min-height: 100vh;
        padding: 2rem;
        background: radial-gradient(circle at 50% 50%, #1a1a40 0%, #050510 100%),
            linear-gradient(0deg, rgba(0, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 255, 0.05) 1px, transparent 1px);
        background-size:
            100% 100%,
            40px 40px,
            40px 40px;
        position: relative;
        overflow: hidden;
    }

    .scanlines {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(
                rgba(18, 16, 16, 0) 50%,
                rgba(0, 0, 0, 0.25) 50%
            ),
            linear-gradient(
                90deg,
                rgba(255, 0, 0, 0.06),
                rgba(0, 255, 0, 0.02),
                rgba(0, 0, 255, 0.06)
            );
        background-size:
            100% 2px,
            3px 100%;
        pointer-events: none;
        z-index: 100;
    }

    header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
        border-bottom: 1px solid rgba(0, 255, 255, 0.3);
        padding-bottom: 1rem;
    }

    .neon-text {
        font-family: "Orbitron", sans-serif; /* Fallback to sans-serif if not loaded */
        font-size: 2.5rem;
        color: #fff;
        text-shadow:
            0 0 5px #fff,
            0 0 10px #fff,
            0 0 20px #0ff,
            0 0 40px #0ff,
            0 0 80px #0ff;
        margin: 0;
        letter-spacing: 4px;
    }

    .level-badge {
        background: rgba(0, 255, 255, 0.1);
        border: 1px solid #0ff;
        padding: 0.5rem 1rem;
        color: #0ff;
        font-weight: bold;
        letter-spacing: 2px;
        box-shadow: 0 0 10px rgba(0, 255, 255, 0.2);
    }

    .back-link {
        color: #94a3b8;
        text-decoration: none;
        font-weight: 600;
        margin-right: 1rem;
        transition: color 0.2s;
    }
    .back-link:hover {
        color: #0ff;
    }

    .game-area {
        background: rgba(10, 10, 25, 0.8);
        border: 1px solid rgba(0, 255, 255, 0.2);
        border-radius: 4px;
        padding: 2rem;
        min-height: 400px;
        position: relative;
        box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
        margin-bottom: 2rem;
    }

    .hud {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 3rem;
    }

    .mission-box {
        border-left: 3px solid #f0f;
        padding-left: 1rem;
        background: linear-gradient(90deg, rgba(255, 0, 255, 0.1), transparent);
    }

    .mission-box .label {
        font-size: 0.7rem;
        color: #f0f;
        letter-spacing: 2px;
        font-weight: bold;
    }

    .mission-box p {
        margin: 0.5rem 0 0;
        font-size: 1.1rem;
        color: #fff;
        text-shadow: 0 0 5px rgba(255, 255, 255, 0.5);
    }

    .stars-display {
        display: flex;
        gap: 0.5rem;
    }

    .star {
        font-size: 2rem;
        color: #333;
        text-shadow: none;
    }

    .star.active {
        color: #fbbf24;
        text-shadow: 0 0 10px #fbbf24;
        animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    .victory-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(5px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 50;
        animation: fadeIn 0.3s ease;
    }

    .victory-card {
        background: #050510;
        border: 2px solid #0f0;
        padding: 3rem;
        text-align: center;
        box-shadow: 0 0 30px rgba(0, 255, 0, 0.3);
        transform: skew(-5deg);
    }

    .victory-card h2 {
        color: #0f0;
        font-size: 2.5rem;
        margin: 0 0 2rem;
        text-shadow: 0 0 10px #0f0;
        letter-spacing: 4px;
    }

    .final-stars {
        display: flex;
        justify-content: center;
        gap: 1rem;
        margin-bottom: 2rem;
    }

    .final-stars .star {
        font-size: 3rem;
    }

    .next-btn {
        background: #0f0;
        color: #000;
        border: none;
        padding: 1rem 2rem;
        font-size: 1.2rem;
        font-weight: bold;
        letter-spacing: 2px;
        cursor: pointer;
        transition: all 0.2s;
        text-transform: uppercase;
    }

    .next-btn:hover {
        background: #fff;
        box-shadow: 0 0 20px #0f0;
    }

    @keyframes popIn {
        from {
            transform: scale(0);
        }
        to {
            transform: scale(1);
        }
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }
</style>
