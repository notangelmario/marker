import monaco from "monaco-editor";
import { AutoTypings, LocalStorageCache } from "monaco-editor-auto-typings";

export function initAutoTypings(editor: monaco.editor.IStandaloneCodeEditor) {
	console.log("initAutoTypings");
	AutoTypings.create(editor, {
		sourceCache: new LocalStorageCache(),
	});
}
