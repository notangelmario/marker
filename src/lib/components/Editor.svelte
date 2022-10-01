<script lang="ts">
	import { basicSetup } from "codemirror";
	import { EditorView, keymap } from "@codemirror/view";
	import { EditorState } from "@codemirror/state";
	import { indentWithTab } from "@codemirror/commands"
	import { javascript } from "@codemirror/lang-javascript";
	import { editor } from "../stores";
	import { onMount } from "svelte";
	
	
	let editorWrapper;

	onMount(() => {
		editor.set(new EditorView({
			parent: editorWrapper,
			extensions: [
				basicSetup,
				javascript(),
				keymap.of([indentWithTab]),
				EditorState.tabSize.of(4),
			]
		}))
	})
</script>

<div bind:this={editorWrapper} class="editor-wrapper"></div>


<style scoped>
	.editor-wrapper {
		width: 100%;
		height: 100%
	}
</style>
