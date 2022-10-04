import { editor, KeyMod, KeyCode } from "monaco-editor";
import { onClose, onOpen, onSave } from "./file";
import { Store } from "./store";
//@ts-ignore
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";


// Monaco editor doesn't have an API to change default keybindings
// so we have to tap into internal api to change default keybindings
export const updateKeyBinding = (editor: editor.IStandaloneCodeEditor, id: string, newKeyBinding: number) => {
	const action = editor.getAction(id);

	//@ts-ignore 
	editor._standaloneKeybindingService.addDynamicKeybinding(`-${id}`, undefined, () => {})
	//@ts-ignore 
	editor._standaloneKeybindingService.addDynamicKeybinding(id, newKeyBinding, () => action.run())
}

export function initEditor(editorWrapper: HTMLElement, store: Store) {
	// const theme = store.get("theme");
	const theme = window.matchMedia("(prefers-colors-scheme: dark)") ? "dark" : "light"

	self.MonacoEnvironment = {
		getWorker () {
			return new editorWorker();
		}
	}


	const editorInstance = editor.create(editorWrapper, {
		smoothScrolling: true,
		automaticLayout: true,
		padding: {
			top: 32,
		},
		theme: theme === "dark" ? "vs-dark" : "vs"
	})

	addActions(editorInstance, store);

	// Rebind command palette to CTRL+P
	// To make things easier for Chromebook users
	updateKeyBinding(editorInstance, "editor.action.quickCommand", KeyMod.CtrlCmd | KeyCode.KeyP);
	
	return { editorInstance }
}

function addActions(editorInstance: editor.IStandaloneCodeEditor, store: Store) {
	const editorFileAvailableContext = editorInstance.createContextKey<boolean>('fileAvailable', false);

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