import { editor, KeyMod, KeyCode } from "monaco-editor";
import { onClose, onOpen, onSave } from "./file";
import { CommandsRegistry } from 'monaco-editor/esm/vs/platform/commands/common/commands'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';

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

export function initEditor(editorWrapper: HTMLElement, getFileHandle: () => FileSystemFileHandle | null) {
	self.MonacoEnvironment = {
		getWorker: function (_moduleId: any, label: string) {
			return new editorWorker();
		}
	};

	const editorInstance = editor.create(editorWrapper, {
		smoothScrolling: true,
	})

	var editorFileAvailableContext = editorInstance.createContextKey<boolean>('fileAvailable', false);

	editorInstance.addAction({
		id: "pencil.save",
		label: "Save File",
		precondition: "fileAvailable",
		run: () => {
			onSave(getFileHandle(), editorInstance)
		},
		keybindings: [KeyMod.CtrlCmd | KeyCode.KeyS]
	})
	editorInstance.addAction({
		id: "pencil.open",
		label: "Open File...",
		run: () => {
			onOpen(editorInstance).then(() => {
				editorFileAvailableContext.set(true);
			});
		},
		keybindings: [KeyMod.CtrlCmd | KeyCode.KeyO]
	})
	editorInstance.addAction({
		id: "pencil.close",
		label: "Close File",
		precondition: "fileAvailable",
		run: () => {
			onClose(editorInstance);
			editorFileAvailableContext.set(false);
		},
		keybindings: [KeyMod.CtrlCmd | KeyCode.KeyQ]
	})
	
	// Rebind command palette to CTRL+P
	// To make things easier for Chromebook users
	updateKeyBinding(editorInstance, "editor.action.quickCommand", KeyMod.CtrlCmd | KeyCode.KeyP);
	
	// Don't touch this unless you find some way
	// to make monaco catch key presses even when unfocused
	document.addEventListener("keydown", (e) => {
		e.stopPropagation();
		
		if (e.ctrlKey && e.key === "s") onSave(getFileHandle(), editorInstance);
		if (e.ctrlKey && e.key === "o") onOpen(editorInstance);
		if (e.ctrlKey && e.key === "q") onClose(editorInstance);

	}, false);

	return { editorFileAvailableContext, editorInstance }
}