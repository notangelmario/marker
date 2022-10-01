<script lang="ts">
	import Editor from './lib/components/Editor.svelte';
	import MenuBar from './lib/components/MenuBar.svelte';
</script>

<main>
	<MenuBar />
	<Editor />
</main>

<style>
	main {
		height: 100%;
		display: flex;
		flex-flow: column;
		flex-wrap: nowrap;
	}
</style>
