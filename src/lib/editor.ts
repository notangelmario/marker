import monaco from "./monaco";
import { initVimMode } from "monaco-vim";
import { onClose, onOpen, onSave, onCreate, startAutosave, initDropFileListener } from "./file";
import { Store } from "./store";
import { addMarkdownActions } from "./languages/markdown";
import { open } from "@tauri-apps/api/shell";
import { addVimActions } from "./vim";
import { createNotice } from "./status";

// Monaco editor doesn't have an API to change default keybindings
// so we have to tap into internal api to change default keybindings
// This is a hacky solution and will probably break in the future
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
		dragAndDrop: true,
		automaticLayout: true,
		minimap: {
			autohide: true,
		},
		fontFamily: "'Fira Code', sans-serif",
		fontLigatures: true,
		padding: {
			top: 32,
			bottom: 16
		},
		theme: theme === "dark" ? "vs-dark" : "vs",
		insertSpaces: false,
		tabSize: 4,
	})

	// Disables default browser keybindings
	disableBrowserKeybindings();

	addActions(editor, store);

	// Rebind command palette to CTRL+P
	// To make things easier for Chromebook users
	updateKeyBinding(editor, "editor.action.quickCommand", monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyP);

	// Hacky fix to autofocus
	setTimeout(() => {
		editor.focus();
	}, 100);

	return editor;
}

export function disableBrowserKeybindings() {
	document.addEventListener("keydown", (e) => {
		if ((e.ctrlKey || e.metaKey) && ["s", "o", "p"].includes(e.key)) {
			e.preventDefault();
		}
	})
}

function addActions(editor: monaco.editor.IStandaloneCodeEditor, store: Store) {
	let disableAutosave: () => void = () => null;
	const fileAvailableContext = editor.createContextKey<boolean>("fileAvailable", false);

	addMarkdownActions(editor);

	initDropFileListener(editor, store, fileAvailableContext);
	addVimActions(editor, store, fileAvailableContext);
	editor.addAction({
		id: "editor.toggle_vim_mode",
		label: "Toggle Vim Mode",
		run: () => {
			const vimMode = store.get("vimMode");

			if (!vimMode) {
				const newVimMode = initVimMode(editor, document.getElementById("vim-mode-display")!);

				createNotice("Vim Mode Enabled, use :p to open command palette");

				store.set("vimMode", newVimMode);
			} else {
				// @ts-ignore: monaco-vim doesn't have types and I'm too lazy to write them
				vimMode.dispose();

				store.set("vimMode", null);
			}
		},
	})

	editor.addAction({
		id: "marker.open_file",
		label: "Open File...",
		run: async () => {
			const filePath = await onOpen(store, editor, fileAvailableContext);
			if (!filePath) return;
			disableAutosave = startAutosave(editor, filePath);
		},
		keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyO]
	})

	// console.log(editor.getModel()?.getLanguageId());
	
	editor.addAction({
		id: "marker.save_file",
		label: "Save File",
		precondition: "fileAvailable",
		run: () => {
			const filePath = store.get<string>("filePath");

			// In case fileAvaiableContext is true
			// but it is not stored in store
			// try to create a new file handle
			// Do not touch this. It's only a safety precaution
			//
			// The user would rather have to see another popup
			// then to lose all work on a specific file
			if (!filePath) {
				onCreate(editor, store, fileAvailableContext);
			} else {
				onSave(filePath, editor);
			}
		},
		keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS]
	})
	editor.addAction({
		id: "marker.create_file",
		label: "Create New File...",
		precondition: "!fileAvailable",
		run: async () => {
			const filePath = await onCreate(editor, store, fileAvailableContext);
			if (!filePath) return; 
			disableAutosave = startAutosave(editor, filePath);
		},
		keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS]
	});
	
	editor.addAction({
		id: "marker.close_file",
		label: "Close File",
		precondition: "fileAvailable",
		run: () => {
			onClose(editor, store, fileAvailableContext)
			disableAutosave();
		},
		keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyQ]
	});
	
	editor.addAction({
		id: "marker.open_repo",
		label: "Show Marker on GitHub",
		run: () => {
			open("https://github.com/notangelmario/marker")
		},
		contextMenuGroupId: "9_marker"
	});
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
