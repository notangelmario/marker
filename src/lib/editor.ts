import * as monaco from "monaco-editor";
import { onClose, onOpen, onSave } from "./file";
import { Store } from "./store";

// Monaco editor doesn't have an API to change default keybindings
// so we have to tap into internal api to change default keybindings
export const updateKeyBinding = (editor: monaco.editor.IStandaloneCodeEditor, id: string, newKeyBinding: number) => {
	const action = editor.getAction(id);

	//@ts-ignore 
	editor._standaloneKeybindingService.addDynamicKeybinding(`-${id}`, undefined, () => {})
	//@ts-ignore 
	editor._standaloneKeybindingService.addDynamicKeybinding(id, newKeyBinding, () => action.run())
}

export function initEditor(editorWrapper: HTMLElement, store: Store) {
	// const theme = store.get("theme");
	const theme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"

	window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
		monaco.editor.setTheme(e.matches ? "vs-dark" : "vs");
	})

	const editor = monaco.editor.create(editorWrapper, {
		smoothScrolling: true,
		automaticLayout: true,
		padding: {
			top: 32,
		},
		theme: theme === "dark" ? "vs-dark" : "vs"
	})

	addActions(editor, store);

	// Rebind command palette to CTRL+P
	// To make things easier for Chromebook users
	updateKeyBinding(editor, "editor.action.quickCommand", monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyP);
	
	return { editor }
}

function addActions(editor: monaco.editor.IStandaloneCodeEditor, store: Store) {
	const editorFileAvailableContext = editor.createContextKey<boolean>('fileAvailable', false);

	editor.addAction({
		id: "pencil.open_file",
		label: "Open File...",
		run: () => {
			onOpen(store, editor).then(() => {
				editorFileAvailableContext.set(true);
			});
		},
		keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyO]
	})
	editor.addAction({
		id: "pencil.save_file",
		label: "Save File",
		precondition: "fileAvailable",
		run: () => {
			const fileHandle = store.get("fileHandle");
			fileHandle && onSave(fileHandle, editor)
		},
		keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS]
	})
	editor.addAction({
		id: "pencil.close_file",
		label: "Close File",
		precondition: "fileAvailable",
		run: () => {
			onClose(editor);
			editorFileAvailableContext.set(false);
		},
		keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyQ]
	})
	// editorInstance.addAction({
	// 	id: "editor.change_theme",
	// 	label: "Toggle Dark/Light Theme",
	// 	run: () => {
	// 		const theme = store.get("theme");

	// 		if (!theme || theme === "light") {
	// 			editorInstance.updateOptions({
	// 				theme: "vs-dark"
	// 			})

	// 			store.set("theme", "dark")
	// 		} else if (theme === "dark"){
	// 			editorInstance.updateOptions({
	// 				theme: "vs"
	// 			})

	// 			store.set("theme", "light")
	// 		}
	// 	}
	// })
}