import * as monaco from "monaco-editor";
import { initStore } from "./lib/store";
import { initEditor } from "./lib/editor";
import { closeModal, openModal } from "./lib/modal";
import { initLanguages } from "./lib/languages";

const editorWrapper = document.getElementById("app")!;

const store = initStore();
initLanguages();
const editor = initEditor(editorWrapper, store);

editor.focus();

// Handles tutorial
if (!store.get("visited")) {
	openModal(editor, { autoHide: false, text: "Press Ctrl+P to get started" })

	const triggered = editor.createContextKey<boolean>("intro-triggered", false);
	
	editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyP, () => {
		triggered.set(true);
		store.set("visited", true)

		editor.trigger("ctrl+p", "editor.action.quickCommand", null);

		closeModal(editor);
		openModal(editor, { autoHide: true, text: "This is the Command Palette! This is how you get around Pencil! Have fun!" })
	}, "!intro-triggered")
}