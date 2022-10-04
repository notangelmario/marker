import "./app.css";
import { initStore } from "./lib/store";
import { initEditor } from "./lib/editor";
import { closeModal, openModal } from "./lib/modal";
import { KeyCode, KeyMod } from "monaco-editor";

const editorWrapper = document.getElementById("app")!;

const { store } = initStore();
const { editorInstance } = initEditor(editorWrapper, store);

editorInstance.focus();

// Handles tutorial
if (!store.get("visited")) {
	openModal(editorInstance, { autoHide: false, text: "Press Ctrl+P to get started" })

	const triggered = editorInstance.createContextKey<boolean>("intro-triggered", false);
	
	editorInstance.addCommand(KeyMod.CtrlCmd | KeyCode.KeyP, () => {
		triggered.set(true);
		store.set("visited", true)

		editorInstance.trigger("ctrl+p", "editor.action.quickCommand", null);

		closeModal(editorInstance);
	}, "!intro-triggered")
}