<script lang="ts">
	import { basicSetup } from "codemirror";
	import { EditorView } from "@codemirror/view";
	import { EditorState } from "@codemirror/state";
	import { javascript } from "@codemirror/lang-javascript";
	import { onMount } from "svelte";

	let editorWrapper;
	let editor: EditorView;
	let doc;

	async function getFile() {
		const [fileHandle] = await window.showOpenFilePicker();

		const file = await fileHandle.getFile();
		console.log(await file.text());
		doc = await file.text();

		editor.dispatch({
			changes: { from: 0, to: editor.state.doc.length, insert: doc }
		});
	}


	onMount(() => {
		editor = new EditorView({
			parent: editorWrapper,
			doc,
			extensions: [
				basicSetup,
				javascript(),
				EditorState.tabSize.of(4),
			]
		})
	})
</script>

<button on:click={getFile}>Click</button>
<div bind:this={editorWrapper} class="editor-wrapper"></div>


<style scoped>
	.editor-wrapper {
		width: 100%;
		height: 100%
	}
</style>
