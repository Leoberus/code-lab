<script lang="ts">
    import { page } from "$app/stores";
    import { labs } from "$lib/problems";
    import CodeLab from "$lib/components/CodeLab.svelte";
    import { gameStore } from "$lib/gameStore";
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";

    // Get levelId from URL
    $: levelId = $page.params.levelId;

    // Find the problem
    $: problem = labs.flatMap((l) => l.problems).find((p) => p.id === levelId);
    $: lab = labs.find((l) => l.problems.some((p) => p.id === levelId));

    // Determine next problem
    $: allProblems = labs.flatMap((l) => l.problems);
    $: currentIndex = allProblems.findIndex((p) => p.id === levelId);
    $: nextProblem =
        currentIndex !== -1 && currentIndex < allProblems.length - 1
            ? allProblems[currentIndex + 1]
            : null;

    let showSuccessModal = false;

    onMount(() => {
        gameStore.init();
        // Redirect if locked
        const state = $gameStore;
        if (!state.unlockedNodes.includes(levelId)) {
            goto("/game");
        }
    });

    function handleSuccess() {
        showSuccessModal = true;
        gameStore.addXp(100); // Award 100 XP
        gameStore.completeNode(levelId, nextProblem?.id);
    }

    function goNext() {
        if (nextProblem) {
            goto(`/game/${nextProblem.id}`);
        } else {
            goto("/game");
        }
    }
</script>

{#if problem && lab}
    <div class="game-wrapper">
        <div class="game-header">
            <a href="/game" class="back-btn">← MAP</a>
            <div class="level-info">
                <span class="level-badge">LEVEL {currentIndex + 1}</span>
                <span class="xp-gain">+100 XP</span>
            </div>
        </div>

        <CodeLab {lab} {problem} mode="game" on:success={handleSuccess} />

        {#if showSuccessModal}
            <div class="modal-overlay">
                <div class="modal">
                    <div class="modal-icon">🏆</div>
                    <h2>MISSION COMPLETE!</h2>
                    <p>You earned <strong>100 XP</strong></p>
                    <div class="actions">
                        <a href="/game" class="btn secondary">Back to Map</a>
                        {#if nextProblem}
                            <button on:click={goNext} class="btn primary"
                                >Next Level ▶</button
                            >
                        {/if}
                    </div>
                </div>
            </div>
        {/if}
    </div>
{:else}
    <div class="error">Problem not found</div>
{/if}

<style>
    :global(body) {
        margin: 0;
        overflow: hidden; /* Prevent double scrollbars */
    }

    .game-wrapper {
        height: 100vh;
        display: flex;
        flex-direction: column;
        background: #0f172a;
    }

    .game-header {
        height: 50px;
        background: #1e293b;
        border-bottom: 1px solid #334155;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 1rem;
    }

    .back-btn {
        color: #94a3b8;
        text-decoration: none;
        font-weight: 600;
        font-size: 0.9rem;
        padding: 4px 8px;
        border-radius: 4px;
        transition: background 0.2s;
    }

    .back-btn:hover {
        background: #334155;
        color: white;
    }

    .level-info {
        display: flex;
        gap: 1rem;
        align-items: center;
    }

    .level-badge {
        background: #3b82f6;
        color: white;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 0.8rem;
        font-weight: 700;
    }

    .xp-gain {
        color: #fbbf24;
        font-weight: 600;
        font-size: 0.9rem;
    }

    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        animation: fadeIn 0.3s ease;
    }

    .modal {
        background: #1e293b;
        border: 2px solid #3b82f6;
        border-radius: 16px;
        padding: 2rem;
        text-align: center;
        width: 300px;
        box-shadow: 0 0 50px rgba(59, 130, 246, 0.3);
        animation: slideUp 0.3s ease;
    }

    .modal-icon {
        font-size: 4rem;
        margin-bottom: 1rem;
    }

    .modal h2 {
        margin: 0;
        color: white;
        font-size: 1.5rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 1px;
    }

    .modal p {
        color: #94a3b8;
        margin: 0.5rem 0 2rem;
    }

    .modal strong {
        color: #fbbf24;
    }

    .actions {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .btn {
        padding: 0.8rem;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        text-decoration: none;
        border: none;
        font-size: 1rem;
        transition: transform 0.1s;
    }

    .btn:active {
        transform: scale(0.98);
    }

    .btn.primary {
        background: linear-gradient(135deg, #2563eb, #4f46e5);
        color: white;
    }

    .btn.secondary {
        background: #334155;
        color: #e2e8f0;
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }

    @keyframes slideUp {
        from {
            transform: translateY(20px);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }
</style>
