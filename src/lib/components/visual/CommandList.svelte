<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { fly, slide } from "svelte/transition";

    export let commands: {
        direction: "UP" | "DOWN" | "LEFT" | "RIGHT";
        iterations: number;
    }[] = [];
    export let maxCommands = 5;
    export let isRunning = false;

    const dispatch = createEventDispatcher();

    function addCommand() {
        if (commands.length < maxCommands) {
            commands = [...commands, { direction: "RIGHT", iterations: 1 }];
        }
    }

    function removeCommand(index: number) {
        commands = commands.filter((_, i) => i !== index);
    }

    function handleRun() {
        dispatch("run");
    }

    function handleReset() {
        dispatch("reset");
    }
</script>

<div class="command-panel">
    <div class="header">
        <h3>COMMAND SEQUENCE</h3>
        <span class="limit {commands.length >= maxCommands ? 'full' : ''}">
            {commands.length} / {maxCommands}
        </span>
    </div>

    <div class="command-list">
        {#each commands as cmd, i}
            <div class="command-item" transition:slide|local>
                <div class="cmd-header">
                    <span class="step-num">#{i + 1}</span>
                    <button
                        class="btn-remove"
                        on:click={() => removeCommand(i)}
                        disabled={isRunning}>×</button
                    >
                </div>

                <div class="cmd-controls">
                    <select bind:value={cmd.direction} disabled={isRunning}>
                        <option value="UP">⬆️ UP</option>
                        <option value="DOWN">⬇️ DOWN</option>
                        <option value="LEFT">⬅️ LEFT</option>
                        <option value="RIGHT">➡️ RIGHT</option>
                    </select>

                    <div class="loop-config">
                        <span class="code"
                            >for (i=0; i &lt; {cmd.iterations}; i++)</span
                        >
                        <input
                            type="range"
                            min="1"
                            max="10"
                            bind:value={cmd.iterations}
                            disabled={isRunning}
                        />
                    </div>
                </div>
            </div>
        {/each}

        {#if commands.length < maxCommands}
            <button class="btn-add" on:click={addCommand} disabled={isRunning}>
                + ADD LOOP
            </button>
        {/if}
    </div>

    <div class="actions">
        <button class="btn-reset" on:click={handleReset} disabled={isRunning}>
            RESET
        </button>
        <button
            class="btn-run"
            on:click={handleRun}
            disabled={isRunning || commands.length === 0}
        >
            {#if isRunning}EXECUTING...{:else}▶ EXECUTE PROTOCOL{/if}
        </button>
    </div>
</div>

<style>
    .command-panel {
        background: rgba(30, 41, 59, 0.9);
        border: 1px solid #334155;
        border-radius: 16px;
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        height: 100%;
        max-height: 600px;
    }

    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #475569;
        padding-bottom: 0.5rem;
    }

    h3 {
        margin: 0;
        font-size: 1rem;
        color: #94a3b8;
        letter-spacing: 1px;
    }

    .limit {
        font-family: monospace;
        background: #1e293b;
        padding: 2px 8px;
        border-radius: 4px;
        color: #64748b;
    }

    .limit.full {
        color: #ef4444;
        border: 1px solid #ef4444;
    }

    .command-list {
        flex: 1;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 0.8rem;
        padding-right: 0.5rem;
    }

    .command-item {
        background: #0f172a;
        border: 1px solid #334155;
        border-radius: 8px;
        padding: 0.8rem;
        position: relative;
    }

    .cmd-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.5rem;
    }

    .step-num {
        font-size: 0.8rem;
        color: #64748b;
        font-weight: bold;
    }

    .btn-remove {
        background: none;
        border: none;
        color: #ef4444;
        font-size: 1.2rem;
        cursor: pointer;
        padding: 0;
        line-height: 1;
    }

    .cmd-controls {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    select {
        background: #1e293b;
        color: white;
        border: 1px solid #475569;
        padding: 0.5rem;
        border-radius: 4px;
        width: 100%;
    }

    .loop-config {
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
    }

    .code {
        font-family: monospace;
        font-size: 0.8rem;
        color: #61afef;
    }

    input[type="range"] {
        width: 100%;
        accent-color: #3b82f6;
    }

    .btn-add {
        background: rgba(59, 130, 246, 0.1);
        border: 1px dashed #3b82f6;
        color: #3b82f6;
        padding: 0.8rem;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;
    }

    .btn-add:hover:not(:disabled) {
        background: rgba(59, 130, 246, 0.2);
    }

    .actions {
        display: flex;
        gap: 1rem;
        margin-top: auto;
        padding-top: 1rem;
        border-top: 1px solid #475569;
    }

    button {
        flex: 1;
        padding: 0.8rem;
        border-radius: 8px;
        font-weight: 700;
        cursor: pointer;
        border: none;
    }

    .btn-run {
        background: linear-gradient(135deg, #2563eb, #4f46e5);
        color: white;
    }

    .btn-reset {
        background: #334155;
        color: #e2e8f0;
    }

    button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
</style>
