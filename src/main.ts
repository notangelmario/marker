/// <reference types="./global.d.ts"/>

import { initStore } from "./lib/store.ts";
import { initEditor } from "./lib/editor.ts";
import { closeModal, openModal } from "./lib/modal.ts";
import { KeyCode, KeyMod } from "monaco-editor";
import "monaco-editor/min/vs/editor/editor.main.css?css";

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