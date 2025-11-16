<script lang="ts">
    export let data;
    const { labs } = data;
</script>

<div class="page">
    <header class="header">
        <h1>CodeLab – Labs Overview</h1>
        <p>เลือกหัวข้อที่ต้องการฝึกเพื่อเริ่มต้นการเรียนรู้</p>
    </header>

    <section class="lab-grid">
        {#each labs as lab}
            <div class="lab-card">
                <h2>{lab.title}</h2>
                <p class="desc">{lab.description}</p>

                <a
                    class="start-btn"
                    href={`labs/${lab.slug}/${lab.problems[0].slug}`}
                >
                    ▶ เริ่มทำโจทย์แรก
                </a>
            </div>
        {/each}
    </section>
</div>

<style>
    .page {
        padding: 24px 32px;
        color: #e5e7eb;
        font-family: system-ui, sans-serif;
        background: radial-gradient(circle at top left, #1f2937, #020617 55%);
        min-height: 100vh;
    }

    .header h1 {
        margin: 0;
        font-size: 1.8rem;
        font-weight: 700;
    }

    .header p {
        margin-top: 6px;
        color: #9ca3af;
        font-size: 0.95rem;
    }

    .lab-grid {
        margin-top: 24px;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
        gap: 16px;
    }

    .lab-card {
        background: rgba(15, 23, 42, 0.93);
        border: 1px solid rgba(55, 65, 81, 0.6);
        border-radius: 12px;
        padding: 16px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        transition:
            transform 0.15s ease,
            border-color 0.15s ease;
    }

    .lab-card:hover {
        border-color: rgba(96, 165, 250, 0.6);
        transform: translateY(-3px);
    }

    h2 {
        margin: 0;
        font-size: 1.2rem;
        color: #93c5fd;
    }

    .desc {
        margin: 10px 0 16px;
        font-size: 0.9rem;
        color: #cbd5e1;
        line-height: 1.4rem;
    }

    .start-btn {
        align-self: flex-start;
        padding: 6px 12px;
        background: linear-gradient(135deg, #2563eb, #4f46e5);
        color: white;
        border-radius: 999px;
        font-size: 0.85rem;
        text-decoration: none;
        transition: opacity 0.15s ease;
    }

    .start-btn:hover {
        opacity: 0.85;
    }
</style>
