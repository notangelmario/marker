<script lang="ts">
	import { basicSetup } from "codemirror";
	import { EditorView, keymap } from "@codemirror/view";
	import { EditorState } from "@codemirror/state";
	import { indentWithTab } from "@codemirror/commands"
	import { javascript } from "@codemirror/lang-javascript";
	import { editor, fileHandle } from "../stores";
	import { writeFile } from "../file";
	import { onMount } from "svelte";
	
	let editorWrapper;

	function onSave() {
		writeFile($fileHandle, $editor.state.doc as unknown as string)
	}

	onMount(() => {
		editor.set(new EditorView({
			parent: editorWrapper,
			extensions: [
				basicSetup,
				javascript(),
				keymap.of([
					indentWithTab,
					{
						key: "Ctrl-s",
					    run() { onSave(); return true }
					}
				]),
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
