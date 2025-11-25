<script lang="ts">
    import { onMount } from "svelte";
    import "monaco-editor/min/vs/editor/editor.main.css";
    import type { Lab, Problem } from "$lib/problems";

    import { createEventDispatcher } from "svelte";

    export let lab: Lab;
    export let problem: Problem;
    export let mode: "normal" | "game" = "normal";

    const dispatch = createEventDispatcher();

    let editorContainer: HTMLDivElement;
    let editor: any;
    let activePanel: "console" | "teacher" = "console";

    let showProblem = true;

    // แปลง description (ข้อความยาว) ให้เป็น <pre> ที่อ่านง่าย
    $: formattedDescription = `
<pre class="problem-text">${problem.description}</pre>
`;

    // สำหรับ AI teacher (เดี๋ยวค่อยต่อ backend ทีหลัง)
    type ChatMessage = {
        role: "student" | "teacher";
        text: string;
    };

    let messages: ChatMessage[] = [
        {
            role: "teacher",
            text: "สวัสดีครับ 👋 ในส่วน AI Teacher นี้ คุณสามารถถามเกี่ยวกับโค้ด, error, หรือ logic ของโจทย์นี้ได้เลย ลองพิมพ์คำถามตัวแรกดูครับ",
        },
    ];

    let pendingQuestion = "";
    let aiThinking = false;

    let checkResults = [];
    let solved = false;
    let isChecking = false;

    async function checkSolution() {
        isChecking = true;
        solved = false;
        checkResults = [];

        const code = editor.getValue();

        const res = await fetch("/c-playground/api/check-solution", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                code,
                tests: problem.tests,
                labId: lab.id,
                problemId: problem.id,
            }),
        });

        const data = await res.json();
        isChecking = false;
        checkResults = data.results;
        solved = data.allPassed;

        if (solved) {
            dispatch("success", { problemId: problem.id });
        }

        if (!solved && checkResults.length > 0) {
            activePanel = "teacher";
            const failed = checkResults
                .filter((r: any) => !r.passed)
                .slice(0, 2);
            const details = failed
                .map(
                    (r: any) =>
                        `Input: ${r.input}\nExpected: ${r.expected}\nGot: ${r.output}`,
                )
                .join("\n---\n");

            const prompt = `โค้ดของฉันยังไม่ผ่าน test case เหล่านี้ (จากทั้งหมด ${checkResults.length} cases):\n\n${details}\n\nช่วยแนะนำหน่อยว่าผิดตรงไหน หรือควรแก้อย่างไร?`;

            await askTeacher(prompt);
        }
    }

    async function askTeacher(customQuestion?: any) {
        let question = "";
        if (typeof customQuestion === "string") {
            question = customQuestion;
        } else {
            question = pendingQuestion.trim();
            pendingQuestion = "";
        }

        if (!question) return;
        if (!editor) return;

        // push ฝั่ง student เข้าประวัติ
        messages = [...messages, { role: "student", text: question }];
        aiThinking = true;

        const code = editor.getValue();

        // snapshot messages ตอนนี้ส่งไปให้ server (กัน race condition)
        const history = messages;

        try {
            const res = await fetch("/c-playground/api/teacher", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    labId: lab.id,
                    labTitle: lab.title,
                    problemId: problem.id,
                    problemTitle: problem.title,
                    problemDescription: problem.description,
                    code,
                    consoleOutput,
                    consoleError,
                    messages: history,
                }),
            });

            const data = await res.json();

            if (data.success) {
                messages = [
                    ...history,
                    { role: "teacher", text: data.reply as string },
                ];
            } else {
                messages = [
                    ...history,
                    {
                        role: "teacher",
                        text:
                            "ตอนนี้ระบบครู AI มีปัญหา:\n" +
                            (data.message ?? "unknown error"),
                    },
                ];
            }
        } catch (err: any) {
            messages = [
                ...history,
                {
                    role: "teacher",
                    text: "ไม่สามารถติดต่อเซิร์ฟเวอร์ได้: " + String(err),
                },
            ];
        } finally {
            aiThinking = false;
        }
    }

    let consoleOutput = "";
    let consoleError = "";
    let stdinInput = "";
    let isRunning = false;
    let lastStage = "";

    const STORAGE_KEY_PREFIX = "c_code_";
    const storageKey = () => `${STORAGE_KEY_PREFIX}${problem.id}`;

    onMount(async () => {
        if (typeof window === "undefined") return;

        const monaco = await import("monaco-editor");

        let initial = problem.starterCode;
        try {
            const saved = localStorage.getItem(storageKey());
            if (saved) initial = saved;
        } catch (e) {
            console.warn("LocalStorage not available:", e);
        }

        editor = monaco.editor.create(editorContainer, {
            value: initial,
            language: "cpp",
            theme: "vs-dark",
            automaticLayout: true,
            minimap: { enabled: false },
            fontSize: 14,
        });

        editor.onDidChangeModelContent(() => {
            try {
                localStorage.setItem(storageKey(), editor.getValue());
            } catch (e) {
                console.warn("LocalStorage save failed:", e);
            }
        });
    });

    async function runCode() {
        if (!editor) return;
        const code = editor.getValue();

        consoleOutput = "";
        consoleError = "";
        lastStage = "";
        isRunning = true;

        try {
            const res = await fetch("/c-playground/api/run-cpp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    code,
                    input: stdinInput,
                    labId: lab.id,
                    problemId: problem.id,
                }),
            });

            const data = await res.json();
            lastStage = data.stage ?? "";

            if (data.success) {
                consoleOutput = data.stdout ?? "";
                consoleError = data.stderr ?? "";
            } else {
                consoleOutput = data.stdout ?? "";
                consoleError =
                    (data.message ? data.message + "\n" : "") +
                    (data.stderr ?? "");
            }
        } catch (err: any) {
            consoleError = "Network or server error: " + String(err);
        } finally {
            isRunning = false;
        }
    }
</script>

<div class="page">
    <header class="top">
        <div>
            <h1>{lab.title}</h1>
            <p>{problem.title}</p>
        </div>
        <div>
            <select
                on:change={(e) => {
                    const slug = (e.currentTarget as HTMLSelectElement).value;
                    if (slug && slug !== problem.slug) {
                        window.location.href = `/c-playground/labs/${lab.slug}/${slug}`;
                    }
                }}
            >
                {#each lab.problems as p}
                    <option value={p.slug} selected={p.slug === problem.slug}>
                        {p.title}
                    </option>
                {/each}
            </select>
        </div>
    </header>

    <main class="main">
        <!-- Left: Problem + IDE -->
        <section class="left">
            <div class="problem collapsible">
                <div
                    class="problem-header"
                    on:click={() => (showProblem = !showProblem)}
                >
                    <h2>รายละเอียดโจทย์</h2>
                    <span class="toggle">{showProblem ? "−" : "+"}</span>
                </div>

                {#if showProblem}
                    <div class="problem-body">
                        {@html formattedDescription}
                    </div>
                {/if}
            </div>

            <div class="editor-panel">
                <div class="editor-header">
                    <span>main.cpp</span>
                    <button on:click={runCode} disabled={isRunning}>
                        {#if isRunning}⏳ Running...{:else}▶ Run C++{/if}
                    </button>
                    <button on:click={checkSolution} disabled={isChecking}>
                        {#if isChecking}ตรวจคำตอบ...{:else}✓ Check Answer{/if}
                    </button>
                </div>
                <div class="editor" bind:this={editorContainer}></div>
            </div>
        </section>

        <!-- Right: Input + Console -->
        <section class="right">
            <div>
                <h3>Program Input (stdin)</h3>
                <textarea
                    rows="3"
                    bind:value={stdinInput}
                    placeholder="ตัวอย่าง: 3 5"
                    class="stdin-input"
                />
            </div>

            <div class="tabs">
                <button
                    class:selected={activePanel === "console"}
                    on:click={() => (activePanel = "console")}
                >
                    Console
                </button>
                <button
                    class:selected={activePanel === "teacher"}
                    on:click={() => (activePanel = "teacher")}
                >
                    AI Teacher
                </button>
            </div>

            {#if activePanel === "console"}
                <!-- โหมด Console เหมือนเดิม -->
                <div class="console-block">
                    <h3>Console Output</h3>
                    {#if lastStage}
                        <p class="muted">Stage: {lastStage}</p>
                    {/if}
                    <div class="console">
                        <div class="console-section">
                            <div class="label">stdout</div>
                            <pre>{consoleOutput || "ไม่มี output"}</pre>
                        </div>
                        <div class="console-section">
                            <div class="label error">stderr / errors</div>
                            <pre>{consoleError || "ไม่มี error"}</pre>
                        </div>
                    </div>
                    {#if checkResults.length > 0}
                        <div class="result-panel">
                            {#if solved}
                                <p class="passed">
                                    🎉 คุณทำถูกต้องทุก test case!
                                </p>
                            {:else}
                                <p class="failed">❌ ยังไม่ผ่านทุก test case</p>
                            {/if}

                            <ul>
                                {#each checkResults as r}
                                    <li class:r.passed>
                                        <strong>Test {r.id}</strong>
                                        <div>Input: <code>{r.input}</code></div>
                                        <div>
                                            Expected: <code>{r.expected}</code>
                                        </div>
                                        <div>
                                            Output: <code>{r.output}</code>
                                        </div>
                                        <div>
                                            Status: {r.passed
                                                ? "Passed"
                                                : "Failed"}
                                        </div>
                                    </li>
                                {/each}
                            </ul>
                        </div>
                    {/if}
                </div>
            {:else}
                <!-- โหมด AI Teacher -->
                <div class="teacher-block">
                    <h3>AI Teacher</h3>
                    <p class="muted">
                        ส่วนนี้ไว้คุยกับ AI เกี่ยวกับโค้ดของคุณ เช่น
                        ถามว่าตอนนี้โค้ดผิดตรงไหน หรือควรเริ่มแก้จากอะไรก่อน
                    </p>

                    <div class="chat-window">
                        {#each messages as msg, i}
                            <div
                                class:msg-student={msg.role === "student"}
                                class:msg-teacher={msg.role === "teacher"}
                            >
                                <div class="msg-role">
                                    {msg.role === "student" ? "คุณ" : "Teacher"}
                                </div>
                                <div class="msg-text">{msg.text}</div>
                            </div>
                        {/each}
                        {#if aiThinking}
                            <div class="msg-teacher">
                                <div class="msg-role">Teacher</div>
                                <div class="msg-text muted">
                                    กำลังคิดคำตอบ...
                                </div>
                            </div>
                        {/if}
                    </div>

                    <form
                        class="chat-input"
                        on:submit|preventDefault={askTeacher}
                    >
                        <textarea
                            rows="2"
                            bind:value={pendingQuestion}
                            placeholder="ลองถามเช่น: โค้ดผมยังไม่รองรับกรณีไหนบ้าง? หรือ logic ตรงนี้คิดถูกมั้ย?"
                        />
                        <button type="submit" disabled={aiThinking}>
                            {#if aiThinking}กำลังคิด...{:else}ถาม Teacher{/if}
                        </button>
                    </form>
                </div>
            {/if}
        </section>
    </main>
</div>

<style>
    .page {
        height: 100vh;
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 8px;
        box-sizing: border-box;
        background: radial-gradient(circle at top left, #1f2937, #020617 55%);
        color: #e5e7eb;
        font-family:
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
    }

    .top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 12px;
        border-radius: 10px;
        background: rgba(15, 23, 42, 0.95);
        border: 1px solid rgba(55, 65, 81, 0.8);
    }

    .top h1 {
        margin: 0;
        font-size: 1.1rem;
    }

    .top p {
        margin: 2px 0 0;
        font-size: 0.85rem;
        color: #9ca3af;
    }

    .main {
        flex: 1;
        display: flex;
        gap: 8px;
        min-height: 0;
    }

    .left,
    .right {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 8px;
        min-height: 0; /* 👈 เพิ่มบรรทัดนี้ */
    }

    .left {
        flex: 1.7;
    }

    .problem {
        padding: 8px 10px;
        border-radius: 10px;
        background: rgba(15, 23, 42, 0.95);
        border: 1px solid rgba(55, 65, 81, 0.8);
    }

    .problem h2 {
        margin: 0 0 4px;
        font-size: 0.95rem;
    }

    .problem p {
        margin: 0;
        font-size: 0.85rem;
    }

    .editor-panel {
        flex: 1;
        display: flex;
        flex-direction: column;
        border-radius: 10px;
        overflow: hidden;
        border: 1px solid rgba(55, 65, 81, 0.8);
        background: rgba(15, 23, 42, 0.96);
    }

    .editor-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 6px 10px;
        border-bottom: 1px solid rgba(31, 41, 55, 0.9);
        font-size: 0.8rem;
    }

    .editor-header button {
        font-size: 0.8rem;
        padding: 4px 10px;
        border-radius: 999px;
        border: none;
        cursor: pointer;
        background: linear-gradient(135deg, #2563eb, #4f46e5);
        color: white;
    }

    .editor-header button:disabled {
        opacity: 0.6;
        cursor: default;
    }

    .editor {
        flex: 1;
        min-height: 0;
    }

    .stdin-input {
        width: 100%;
        box-sizing: border-box;
        border-radius: 8px;
        border: 1px solid rgba(55, 65, 81, 0.9);
        background: rgba(15, 23, 42, 0.95);
        color: #e5e7eb;
        font-size: 0.8rem;
        padding: 6px 8px;
        resize: vertical;
        min-height: 60px;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
            "Liberation Mono", "Courier New", monospace;
    }

    .console-block {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 6px;
    }

    .console-block h3 {
        margin: 0;
        font-size: 0.9rem;
    }

    .muted {
        margin: 0;
        font-size: 0.75rem;
        color: #9ca3af;
    }

    .console {
        flex: 1;
        border-radius: 10px;
        border: 1px solid rgba(55, 65, 81, 0.9);
        background: rgba(15, 23, 42, 0.96);
        padding: 6px;
        display: flex;
        flex-direction: column;
        gap: 6px;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
            "Liberation Mono", "Courier New", monospace;
        font-size: 0.78rem;
    }

    .console-section {
        border-radius: 8px;
        border: 1px solid rgba(55, 65, 81, 0.8);
        padding: 4px 6px;
        background: rgba(15, 23, 42, 0.98);
    }

    .console-section pre {
        margin: 0;
        white-space: pre-wrap;
        word-break: break-word;
        max-height: 140px;
        overflow: auto;
    }

    .label {
        font-size: 0.7rem;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: #9ca3af;
        margin-bottom: 2px;
    }

    .label.error {
        color: #fca5a5;
    }

    @media (max-width: 960px) {
        .main {
            flex-direction: column;
        }
    }

    .tabs {
        display: flex;
        gap: 4px;
        margin-top: 4px;
    }

    .tabs button {
        flex: 1;
        font-size: 0.8rem;
        padding: 4px 6px;
        border-radius: 999px;
        border: 1px solid rgba(55, 65, 81, 0.9);
        background: rgba(15, 23, 42, 0.95);
        color: #e5e7eb;
        cursor: pointer;
    }

    .tabs button.selected {
        background: linear-gradient(135deg, #2563eb, #4f46e5);
        border-color: transparent;
    }

    .teacher-block {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 6px;
        min-height: 0;
    }

    /* ตัว chat-window ที่มี scroll */
    .chat-window {
        flex: 1; /* กินพื้นที่ที่เหลือใน teacher-block */
        min-height: 0; /* สำคัญมาก ให้ child scroll ได้ */
        overflow-y: auto; /* เปิด scroll แนวตั้ง */
        padding: 12px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        background: rgba(15, 23, 42, 0.95);
        border-radius: 10px;
        border: 1px solid rgba(55, 65, 81, 0.7);
    }

    .msg-teacher,
    .msg-student {
        max-width: 100%;
        display: flex;
        flex-direction: column;
        gap: 2px;
    }

    .msg-teacher {
        align-items: flex-start;
    }

    .msg-student {
        align-items: flex-end;
    }

    .msg-role {
        font-size: 0.7rem;
        color: #9ca3af;
    }

    .msg-text {
        padding: 4px 8px;
        border-radius: 10px;
        border: 1px solid rgba(55, 65, 81, 0.9);
        background: rgba(15, 23, 42, 0.98);
        max-width: 80%;
        white-space: pre-wrap;
        word-break: break-word;
    }

    .msg-student .msg-text {
        background: linear-gradient(135deg, #2563eb, #4f46e5);
        border-color: transparent;
    }

    .chat-input {
        margin-top: 6px;
        display: flex;
        gap: 6px;
    }

    .chat-input textarea {
        flex: 1;
        border-radius: 8px;
        border: 1px solid rgba(55, 65, 81, 0.9);
        background: rgba(15, 23, 42, 0.95);
        color: #e5e7eb;
        font-size: 0.8rem;
        padding: 4px 6px;
        resize: vertical;
        min-height: 40px;
        font-family: inherit;
    }

    .chat-input button {
        align-self: flex-end;
        font-size: 0.8rem;
        padding: 4px 10px;
        border-radius: 999px;
        border: none;
        cursor: pointer;
        background: linear-gradient(135deg, #22c55e, #16a34a);
        color: white;
    }

    .problem {
        padding: 0;
        border-radius: 10px;
        background: rgba(15, 23, 42, 0.95);
        border: 1px solid rgba(55, 65, 81, 0.8);
    }

    /* Header */
    .problem-header {
        padding: 10px 12px;
        cursor: pointer;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .problem-header h2 {
        margin: 0;
        font-size: 1rem;
    }

    /* Toggle Icon */
    .toggle {
        font-size: 1.4rem;
        color: #94a3b8;
    }

    /* Body (scrollable) */
    .problem-body {
        padding: 10px 12px 16px;
        max-height: 260px; /* ปรับตามชอบ */
        overflow-y: auto;
        border-top: 1px solid rgba(55, 65, 81, 0.6);
    }

    /* Description text */
    .problem-text {
        white-space: pre-wrap;
        line-height: 1.45rem;
        font-size: 0.88rem;
        font-family: ui-monospace, monospace;
        color: #e2e8f0;
    }

    /* ปรับ scrollbar */
    .problem-body::-webkit-scrollbar {
        width: 6px;
    }
    .problem-body::-webkit-scrollbar-thumb {
        background: rgba(148, 163, 184, 0.4);
        border-radius: 4px;
    }

    .result-panel {
        margin-top: 12px;
        padding: 12px;
        background: rgba(15, 23, 42, 0.95);
        border: 1px solid rgba(55, 65, 81, 0.8);
        border-radius: 10px;
    }

    .result-panel .passed {
        color: #4ade80;
        font-weight: bold;
    }

    .result-panel .failed {
        color: #f87171;
        font-weight: bold;
    }

    li {
        margin-bottom: 10px;
        padding: 10px;
        border-radius: 8px;
        background: rgba(30, 41, 59, 0.7);
    }
    li.true {
        border-left: 4px solid #4ade80;
    }
    li.false {
        border-left: 4px solid #f87171;
    }
</style>
