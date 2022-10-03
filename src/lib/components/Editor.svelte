<script lang="ts">
	import { editor as monacoEditor, KeyMod, KeyCode } from "monaco-editor";
	import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
	import { editor, fileHandle } from "../stores";
	import { onMount } from "svelte";
	import { onClose, onOpen, onSave } from "../file";

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

		var fileAvailable = editorInstance.createContextKey('fileAvailable', !!$fileHandle);


		fileHandle.subscribe((e) => {
			fileAvailable.set(!!e);
		})

		editorInstance.addAction({
			id: "pencil.save",
			label: "Save File",
			precondition: "fileAvailable",
			run: onSave,
			keybindings: [KeyMod.CtrlCmd | KeyCode.KeyS]
		})
		editorInstance.addAction({
			id: "pencil.open",
			label: "Open File...",
			precondition: "fileAvailable",
			run: onOpen,
			keybindings: [KeyMod.CtrlCmd | KeyCode.KeyO]
		})

		document.addEventListener("keydown", (e) => {
			e.stopPropagation();
			
			if (e.ctrlKey && e.key === "s") onSave();
			if (e.ctrlKey && e.key === "o") onOpen();
			if (e.ctrlKey && e.key === "q") onClose();
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
