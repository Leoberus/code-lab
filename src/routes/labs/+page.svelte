<script lang="ts">
    export let data;
    const { labs } = data;
</script>

<h1>Labs</h1>
<ul>
    {#each labs as lab}
        <li>
            <h2>{lab.title}</h2>
            <p>{lab.description}</p>
            <!-- ลิงก์ไปโจทย์แรกของแต่ละ lab -->
            <a href={`/labs/${lab.slug}/${lab.problems[0].slug}`}>
                ไปยังโจทย์แรก
            </a>
        </li>
    {/each}
</ul>
