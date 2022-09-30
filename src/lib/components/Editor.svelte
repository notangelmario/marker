<script lang="ts">
	import { basicSetup } from "codemirror";
	import { EditorView } from "@codemirror/view";
	import { EditorState } from "@codemirror/state";
	import { javascript } from "@codemirror/lang-javascript";
	import { onMount } from "svelte";

	let editorWrapper;

	onMount(() => {
		let editor = new EditorView({
			parent: editorWrapper,
			extensions: [
				basicSetup,
				javascript(),
				EditorState.tabSize.of(4),
			]
		})
	})
</script>

<div bind:this={editorWrapper} class="editor-wrapper"></div>


<style scoped>
	.editor-wrapper {
		width: 100%;
		height: 100%
	}
</style>
