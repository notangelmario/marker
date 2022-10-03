<script lang="ts">
	import { editor as monacoEditor, KeyMod, KeyCode, Uri } from "monaco-editor";
	import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
	import { editor, fileHandle } from "../stores";
	import { onMount } from "svelte";
	import { onOpen, onSave } from "../file";

	let editorWrapper;

	onMount(() => {
        self.MonacoEnvironment = {
            getWorker: function (_moduleId: any, label: string) {
                return new editorWorker();
            }
        };

		const editorInstance = monacoEditor.create(editorWrapper, {
			smoothScrolling: true,
		})

		var saveable = editorInstance.createContextKey('saveable', !!$fileHandle);
		var closable = editorInstance.createContextKey('closable', !!$fileHandle);


		fileHandle.subscribe((e) => {
			saveable.set(!!e);
		})

		editorInstance.addAction({
			id: "pencil.save",
			label: "Save File",
			run: onSave,
			precondition: "saveable",
			keybindings: [KeyMod.CtrlCmd | KeyCode.KeyS]
		})
		editorInstance.addAction({
			id: "pencil.open",
			label: "Open File...",
			run: onOpen,
			keybindings: [KeyMod.CtrlCmd | KeyCode.KeyO]
		})

		document.addEventListener('keydown', (e) => {
			e.preventDefault();
			e.stopPropagation();
			
			if (e.ctrlKey && e.key === "o") onOpen();
		}, false);

		editor.set(editorInstance);
	})
</script>

<div bind:this={editorWrapper} class="editor-wrapper"></div>


<style scoped>
	.editor-wrapper {
		width: 100%;
		flex: 1;
		overflow-y: scroll;
	}
</style>
