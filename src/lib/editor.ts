import { editor, KeyMod, KeyCode } from "monaco-editor";
import { onClose, onOpen, onSave } from "./file";
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import { CommandsRegistry } from 'monaco-editor/esm/vs/platform/commands/common/commands'

// Monaco editor doesn't have an API to change default keybindings
// so we have to tap into internal api to change default keybindings
export const updateKeyBinding = (editor: editor.ICodeEditor, id: string, newKeyBinding?: number) => {
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

export function initEditor(editorWrapper: HTMLElement, store: Map<string, any>) {
	window.MonacoEnvironment = {
		getWorker () {
			return new EditorWorker()
		}
	}
	  

	const editorInstance = editor.create(editorWrapper, {
		smoothScrolling: true,
		automaticLayout: true,
		padding: {
			top: 32,
		},
		language: "vs"
	})

	var editorFileAvailableContext = editorInstance.createContextKey<boolean>('fileAvailable', false);

	editorInstance.addAction({
		id: "pencil.open_file",
		label: "Open File...",
		run: () => {
			onOpen(store, editorInstance).then(() => {
				editorFileAvailableContext.set(true);
			});
		},
		keybindings: [KeyMod.CtrlCmd | KeyCode.KeyO]
	})
	editorInstance.addAction({
		id: "pencil.save_file",
		label: "Save File",
		precondition: "fileAvailable",
		run: () => {
			const fileHandle = store.get("fileHandle");
			fileHandle && onSave(fileHandle, editorInstance)
		},
		keybindings: [KeyMod.CtrlCmd | KeyCode.KeyS]
	})
	editorInstance.addAction({
		id: "pencil.close_file",
		label: "Close File",
		precondition: "fileAvailable",
		run: () => {
			onClose(editorInstance);
			editorFileAvailableContext.set(false);
		},
		keybindings: [KeyMod.CtrlCmd | KeyCode.KeyQ]
	})
	editorInstance.addAction({
		id: "editor.change_theme",
		label: "Toggle Dark/Light Theme",
		run: () => {
			const theme = store.get("theme");

			if (!theme || theme === "light") {
				editorInstance.updateOptions({
					theme: "vs-dark"
				})

				store.set("theme", "dark")
			} else if (theme === "dark"){
				editorInstance.updateOptions({
					theme: "vs"
				})

				store.set("theme", "light")
			}
		}
	})
	
	// Rebind command palette to CTRL+P
	// To make things easier for Chromebook users
	updateKeyBinding(editorInstance, "editor.action.quickCommand", KeyMod.CtrlCmd | KeyCode.KeyP);
	
	return { editorFileAvailableContext, editorInstance }
}