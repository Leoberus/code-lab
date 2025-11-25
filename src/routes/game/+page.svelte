<script lang="ts">
    import { onMount } from "svelte";
    import { gameStore } from "$lib/gameStore";
    import { labs } from "$lib/problems";

    // Flatten problems for the map
    // In a real game, this might be a custom map structure.
    // For now, we'll just sequence all problems from all labs.
    const allProblems = labs.flatMap((lab) => lab.problems);

    onMount(() => {
        gameStore.init();
    });

    $: currentState = $gameStore;

    function isUnlocked(problemId: string) {
        return currentState.unlockedNodes.includes(problemId);
    }

    function isCompleted(problemId: string) {
        return currentState.completedNodes.includes(problemId);
    }
</script>

<div class="game-container">
    <header class="game-hud">
        <div class="player-info">
            <div class="avatar">👾</div>
            <div class="stats">
                <div class="level">LEVEL {currentState.level}</div>
                <div class="xp-bar">
                    <div
                        class="xp-fill"
                        style="width: {currentState.xp % 100}%"
                    ></div>
                </div>
                <div class="xp-text">{currentState.xp} XP</div>
            </div>
        </div>
        <h1 class="game-title">CODE ADVENTURE</h1>
    </header>

    <main class="map-view">
        <div class="map-path">
            {#each allProblems as problem, i}
                {@const unlocked = isUnlocked(problem.id)}
                {@const completed = isCompleted(problem.id)}

                <div
                    class="map-node-container {i % 2 === 0 ? 'left' : 'right'}"
                >
                    {#if i > 0}
                        <div
                            class="path-line {isUnlocked(problem.id)
                                ? 'active'
                                : ''}"
                        ></div>
                    {/if}

                    <a
                        href={unlocked ? `/game/${problem.id}` : "#"}
                        class="map-node {unlocked
                            ? 'unlocked'
                            : 'locked'} {completed ? 'completed' : ''}"
                    >
                        <div class="node-icon">
                            {#if completed}
                                ⭐
                            {:else if unlocked}
                                ⚔️
                            {:else}
                                🔒
                            {/if}
                        </div>
                        <div class="node-info">
                            <span class="node-title">{problem.title}</span>
                            {#if completed}
                                <span class="node-status">COMPLETED</span>
                            {/if}
                        </div>
                    </a>
                </div>
            {/each}
        </div>
    </main>
</div>

<style>
    :global(body) {
        margin: 0;
        background: #0f172a;
        color: white;
        font-family: "Outfit", sans-serif;
    }

    .game-container {
        min-height: 100vh;
        background: radial-gradient(circle at center, #1e293b 0%, #020617 100%);
        display: flex;
        flex-direction: column;
    }

    .game-hud {
        position: sticky;
        top: 0;
        z-index: 100;
        background: rgba(15, 23, 42, 0.9);
        backdrop-filter: blur(10px);
        padding: 1rem 2rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #334155;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    }

    .player-info {
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    .avatar {
        font-size: 2.5rem;
        background: #334155;
        width: 60px;
        height: 60px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        border: 2px solid #60a5fa;
    }

    .stats {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .level {
        font-weight: 800;
        color: #60a5fa;
        font-size: 1.2rem;
    }

    .xp-bar {
        width: 150px;
        height: 8px;
        background: #334155;
        border-radius: 4px;
        overflow: hidden;
    }

    .xp-fill {
        height: 100%;
        background: linear-gradient(90deg, #3b82f6, #8b5cf6);
        transition: width 0.3s ease;
    }

    .xp-text {
        font-size: 0.8rem;
        color: #94a3b8;
    }

    .game-title {
        font-size: 1.5rem;
        font-weight: 900;
        letter-spacing: 2px;
        background: linear-gradient(135deg, #fff, #94a3b8);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin: 0;
    }

    .map-view {
        flex: 1;
        padding: 4rem 2rem;
        display: flex;
        justify-content: center;
    }

    .map-path {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0; /* Gap handled by padding/margin in nodes */
        width: 100%;
        max-width: 600px;
        position: relative;
    }

    .map-node-container {
        position: relative;
        width: 100%;
        display: flex;
        justify-content: center;
        padding: 2rem 0;
    }

    /* Zig-zag layout effect */
    .map-node-container.left {
        justify-content: flex-start;
        padding-left: 20%;
    }
    .map-node-container.right {
        justify-content: flex-end;
        padding-right: 20%;
    }

    .path-line {
        position: absolute;
        width: 4px;
        background: #334155;
        top: -2rem; /* Connect to previous */
        bottom: 50%;
        left: 50%;
        transform: translateX(-50%);
        z-index: 0;
        /* This is a simplification. A real zig-zag line needs SVG or complex CSS */
        /* For now, let's just make a straight line down the center for simplicity in this MVP */
        display: none;
    }

    /* Let's do a central spine instead for MVP stability */
    .map-path::before {
        content: "";
        position: absolute;
        top: 0;
        bottom: 0;
        left: 50%;
        width: 4px;
        background: #1e293b;
        transform: translateX(-50%);
        z-index: 0;
    }

    .map-node-container {
        justify-content: center !important; /* Force center for MVP */
        padding: 0 !important;
        margin-bottom: 3rem;
    }

    .map-node {
        position: relative;
        z-index: 1;
        width: 280px;
        background: #1e293b;
        border: 2px solid #334155;
        border-radius: 16px;
        padding: 1rem;
        display: flex;
        align-items: center;
        gap: 1rem;
        text-decoration: none;
        color: white;
        transition: all 0.2s ease;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
    }

    .map-node.unlocked {
        border-color: #60a5fa;
        background: #0f172a;
        cursor: pointer;
    }

    .map-node.unlocked:hover {
        transform: scale(1.05);
        box-shadow: 0 0 20px rgba(96, 165, 250, 0.4);
    }

    .map-node.completed {
        border-color: #10b981;
        background: rgba(16, 185, 129, 0.1);
    }

    .map-node.locked {
        opacity: 0.5;
        filter: grayscale(1);
        cursor: not-allowed;
    }

    .node-icon {
        font-size: 2rem;
        width: 50px;
        height: 50px;
        background: #0f172a;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .node-info {
        display: flex;
        flex-direction: column;
    }

    .node-title {
        font-weight: 700;
        font-size: 1.1rem;
    }

    .node-status {
        font-size: 0.75rem;
        color: #10b981;
        font-weight: 600;
        letter-spacing: 1px;
    }
</style>
