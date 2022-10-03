<script lang="ts">
	import { editor as monacoEditor, KeyMod, KeyCode } from "monaco-editor";
	import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
	import { CommandsRegistry } from 'monaco-editor/esm/vs/platform/commands/common/commands'
	import { editor, fileHandle } from "../stores";
	import { onMount } from "svelte";
	import { onClose, onOpen, onSave } from "../file";

	let editorWrapper;
	
	// Monaco editor doesn't have an API to change default keybindings
	// so we have to tap into internal api to change default keybindings
	export const updateKeyBinding = (editor: monacoEditor.ICodeEditor, id: string, newKeyBinding?: number) => {
		//@ts-ignore 
		editor._standaloneKeybindingService.addDynamicKeybinding(`-${id}`, undefined, () => {})

		if (newKeyBinding) {
			const { handler, when } = CommandsRegistry.getCommand(id) ?? {}
			if (handler) {
				//@ts-ignore 
				editor._standaloneKeybindingService.addDynamicKeybinding(id, newKeyBinding, handler, when)
			}
		}
	}

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
			run: onOpen,
			keybindings: [KeyMod.CtrlCmd | KeyCode.KeyO]
		})
		editorInstance.addAction({
			id: "pencil.close",
			label: "Close File",
			precondition: "fileAvailable",
			run: onClose,
			keybindings: [KeyMod.CtrlCmd | KeyCode.KeyQ]
		})
		
		// Rebind command palette to CTRL+P
		// To make things easier for Chromebook users
		updateKeyBinding(editorInstance, "editor.action.quickCommand", KeyMod.CtrlCmd | KeyCode.KeyP);
		
		// Don't touch this unless you find some way
		// to make monaco catch key presses even when unfocused
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
