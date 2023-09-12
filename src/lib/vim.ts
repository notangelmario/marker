import monaco from "./monaco";
import { VimMode } from "monaco-vim";
import { onCreate, onSave } from "./file";
import { Store } from "./store";

export function addVimActions(editor: monaco.editor.IStandaloneCodeEditor, store: Store, fileAvailableContext: monaco.editor.IContextKey<boolean>) {
	VimMode.Vim.defineEx('write', 'w', function() {
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
	});

	VimMode.Vim.defineEx('palette', 'p', function() {
		editor.trigger('keyboard', 'editor.action.quickCommand', null);
	});
}
