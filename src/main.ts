import monaco from "./lib/monaco";
//@ts-ignore
import { registerSW } from 'virtual:pwa-register'
import { initStore } from "./lib/store";
import { initEditor } from "./lib/editor";
import { closeModal, openModal } from "./lib/modal";
import { initLanguageWorkers } from "./lib/languages";
import { createNotice, enableStatus } from "./lib/status";

const editorWrapper = document.getElementById("app")!;

const store = initStore();
initLanguageWorkers();
const editor = initEditor(editorWrapper, store);
enableStatus(editor);

registerSW({
  onNeedRefresh() {
  	createNotice("Pencil will update next time")
  },
  onOfflineReady() {
  	createNotice("Pencil is ready to be used offline")
  },
})

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