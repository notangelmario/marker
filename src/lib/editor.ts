import monaco from "./monaco";
import { onClose, onOpen, onSave, initDropFile, initLaunchWithFile, onCreate, startAutosave } from "./file";
import { Store } from "./store";
import { addMarkdownActions } from "./languages/markdown";

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
		minimap: {
			autohide: true,
		},
		fontFamily: "Fira Code",
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
	
	editor.focus();

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

	initDropFile(document.body, editor, store, fileAvailableContext, disableAutosave);
	initLaunchWithFile(editor, store, fileAvailableContext, disableAutosave);

	addMarkdownActions(editor);

	editor.addAction({
		id: "marker.open_file",
		label: "Open File...",
		run: async () => {
			const fileHandle = await onOpen(store, editor, fileAvailableContext);
			if (!fileHandle) return;
			disableAutosave = startAutosave(editor, fileHandle);
		},
		keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyO]
	})

	// console.log(editor.getModel()?.getLanguageId());
	
	editor.addAction({
		id: "marker.save_file",
		label: "Save File",
		precondition: "fileAvailable",
		run: () => {
			const fileHandle = store.get<FileSystemFileHandle>("fileHandle");

			// In case fileAvaiableContext is true
			// but it is not stored in store
			// try to create a new file handle
			// Do not touch this. It's only a safety precaution
			//
			// The user would rather have to see another popup
			// then to lose all work on a specific file
			if (!fileHandle) {
				onCreate(editor, store, fileAvailableContext);
			} else {
				onSave(fileHandle, editor);
			}
		},
		keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS]
	})
	editor.addAction({
		id: "marker.create_file",
		label: "Create New File...",
		precondition: "!fileAvailable",
		run: async () => {
			const fileHandle = await onCreate(editor, store, fileAvailableContext);
			if (!fileHandle) return; 
			disableAutosave = startAutosave(editor, fileHandle);
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
			window.open("https://github.com/fructoland/marker", "_blank", "noopener noreferrer")
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