<script lang="ts">
    import CodeLab from "$lib/components/CodeLab.svelte";
    export let data;
    const { lab, problem } = data;
</script>

<CodeLab {lab} {problem} />
