<script lang="ts">
    export let startX = 0;
    export let endX = 10;
    export let stepX = 1;

    export let startY = 0;
    export let endY = 10;
    export let stepY = 1;

    export let isRunning = false;

    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();

    let activeTab: "x" | "y" = "x";

    function handleRun() {
        dispatch("run");
    }

    function handleReset() {
        dispatch("reset");
    }
</script>

<div class="controls-panel">
    <div class="tabs">
        <button
            class="tab {activeTab === 'x' ? 'active' : ''}"
            on:click={() => (activeTab = "x")}
        >
            X-Axis Loop
        </button>
        <button
            class="tab {activeTab === 'y' ? 'active' : ''}"
            on:click={() => (activeTab = "y")}
        >
            Y-Axis Loop
        </button>
    </div>

    <div class="code-preview">
        {#if activeTab === "x"}
            <span class="keyword">for</span> (
            <span class="type">int</span> x = <span class="var">{startX}</span>;
            x &lt; <span class="var">{endX}</span>; x +=
            <span class="var">{stepX}</span>
            )
        {:else}
            <span class="keyword">for</span> (
            <span class="type">int</span> y = <span class="var">{startY}</span>;
            y &lt; <span class="var">{endY}</span>; y +=
            <span class="var">{stepY}</span>
            )
        {/if}
    </div>

    <div class="sliders">
        {#if activeTab === "x"}
            <div class="control-group">
                <label>
                    Start X (x = {startX})
                    <input
                        type="range"
                        min="0"
                        max="20"
                        bind:value={startX}
                        disabled={isRunning}
                    />
                </label>
            </div>
            <div class="control-group">
                <label>
                    End X (x &lt; {endX})
                    <input
                        type="range"
                        min="1"
                        max="21"
                        bind:value={endX}
                        disabled={isRunning}
                    />
                </label>
            </div>
            <div class="control-group">
                <label>
                    Step X (x += {stepX})
                    <input
                        type="range"
                        min="1"
                        max="5"
                        bind:value={stepX}
                        disabled={isRunning}
                    />
                </label>
            </div>
        {:else}
            <div class="control-group">
                <label>
                    Start Y (y = {startY})
                    <input
                        type="range"
                        min="0"
                        max="20"
                        bind:value={startY}
                        disabled={isRunning}
                    />
                </label>
            </div>
            <div class="control-group">
                <label>
                    End Y (y &lt; {endY})
                    <input
                        type="range"
                        min="1"
                        max="21"
                        bind:value={endY}
                        disabled={isRunning}
                    />
                </label>
            </div>
            <div class="control-group">
                <label>
                    Step Y (y += {stepY})
                    <input
                        type="range"
                        min="1"
                        max="5"
                        bind:value={stepY}
                        disabled={isRunning}
                    />
                </label>
            </div>
        {/if}
    </div>

    <div class="actions">
        <button class="btn-reset" on:click={handleReset} disabled={isRunning}>
            Reset
        </button>
        <button class="btn-run" on:click={handleRun} disabled={isRunning}>
            {#if isRunning}Running...{:else}▶ RUN LOOPS{/if}
        </button>
    </div>
</div>

<style>
    .controls-panel {
        background: rgba(30, 41, 59, 0.8);
        border: 1px solid #334155;
        border-radius: 16px;
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }

    .tabs {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 0.5rem;
    }

    .tab {
        flex: 1;
        padding: 0.5rem;
        background: rgba(15, 23, 42, 0.5);
        border: 1px solid #334155;
        color: #94a3b8;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 600;
    }

    .tab.active {
        background: #3b82f6;
        color: white;
        border-color: #3b82f6;
    }

    .code-preview {
        font-family: "Fira Code", monospace;
        font-size: 1.2rem;
        background: #0f172a;
        padding: 1rem;
        border-radius: 8px;
        border-left: 4px solid #3b82f6;
        color: #e2e8f0;
    }

    .keyword {
        color: #c678dd;
    }
    .type {
        color: #e5c07b;
    }
    .var {
        color: #61afef;
        font-weight: bold;
    }

    .sliders {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        min-height: 200px; /* Prevent layout shift */
    }

    .control-group label {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        font-size: 0.9rem;
        color: #94a3b8;
        font-weight: 600;
    }

    input[type="range"] {
        width: 100%;
        accent-color: #3b82f6;
        height: 6px;
        background: #334155;
        border-radius: 3px;
        outline: none;
    }

    .actions {
        display: flex;
        gap: 1rem;
        margin-top: auto;
    }

    button {
        flex: 1;
        padding: 0.8rem;
        border-radius: 8px;
        font-weight: 700;
        cursor: pointer;
        border: none;
        transition: transform 0.1s;
    }

    button:active {
        transform: scale(0.98);
    }
    button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .btn-run {
        background: linear-gradient(135deg, #2563eb, #4f46e5);
        color: white;
        font-size: 1rem;
        box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
    }

    .btn-reset {
        background: #334155;
        color: #e2e8f0;
    }
</style>
