<script lang="ts">
    import { fly, fade } from "svelte/transition";
    import { cubicOut } from "svelte/easing";

    export let max = 20;
    export let currentPos = 0;
    export let targetPos = 15; // The goal
    export let visited: number[] = []; // Positions visited during the loop

    // Calculate position in percentage
    $: getLeft = (val: number) => {
        return (val / max) * 100;
    };
</script>

<div class="number-line-container">
    <div class="line"></div>

    <!-- Ticks -->
    {#each Array(max + 1) as _, i}
        <div class="tick" style="left: {getLeft(i)}%">
            <div class="tick-mark"></div>
            <span class="tick-label">{i}</span>
        </div>
    {/each}

    <!-- Target (Star) -->
    <div class="target" style="left: {getLeft(targetPos)}%">⭐</div>

    <!-- Visited Markers (Breadcrumbs) -->
    {#each visited as pos}
        <div class="breadcrumb" style="left: {getLeft(pos)}%" transition:fade>
            •
        </div>
    {/each}

    <!-- Character -->
    <div class="character" style="left: {getLeft(currentPos)}%">
        <div class="avatar">👾</div>
        <div class="pos-label">i = {currentPos}</div>
    </div>
</div>

<style>
    .number-line-container {
        position: relative;
        width: 100%;
        height: 150px;
        margin-top: 50px;
    }

    .line {
        position: absolute;
        top: 50%;
        left: 0;
        width: 100%;
        height: 4px;
        background: #475569;
        border-radius: 2px;
    }

    .tick {
        position: absolute;
        top: 50%;
        transform: translateX(-50%);
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .tick-mark {
        width: 2px;
        height: 12px;
        background: #64748b;
        margin-top: -6px; /* Center on line */
    }

    .tick-label {
        margin-top: 8px;
        font-size: 0.75rem;
        color: #94a3b8;
    }

    .target {
        position: absolute;
        top: 20%;
        transform: translateX(-50%);
        font-size: 2rem;
        filter: drop-shadow(0 0 10px rgba(251, 191, 36, 0.6));
        z-index: 10;
    }

    .breadcrumb {
        position: absolute;
        top: 48%;
        transform: translate(-50%, -50%);
        color: #3b82f6;
        font-size: 2rem;
        line-height: 0;
        z-index: 5;
    }

    .character {
        position: absolute;
        top: 0; /* Above line */
        transform: translateX(-50%);
        display: flex;
        flex-direction: column;
        align-items: center;
        transition: left 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); /* Bouncy transition */
        z-index: 20;
    }

    .avatar {
        font-size: 2.5rem;
        background: #1e293b;
        border: 2px solid #3b82f6;
        border-radius: 50%;
        width: 50px;
        height: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 10px rgba(59, 130, 246, 0.4);
    }

    .pos-label {
        margin-top: 4px;
        background: #3b82f6;
        color: white;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 0.7rem;
        font-weight: bold;
    }
</style>
