import monaco from "./lib/monaco";
import { registerSW } from 'virtual:pwa-register'
import { initStore } from "./lib/store";
import { initEditor } from "./lib/editor";
import { closeModal, openModal } from "./lib/modal";
import { initAutoTypings, initLanguageWorkers } from "./lib/languages";
import { createNotice, initStatus } from "./lib/status";
import { isCompat } from "./lib/compat";

const editorWrapper = document.getElementById("app")!;

if (isCompat) {
	const store = initStore();
	initLanguageWorkers();
	const editor = initEditor(editorWrapper, store);
	initStatus(editor);
	initAutoTypings(editor);

	window.onbeforeunload = () => {
		if (editor.getValue() !== "") {
			return "You have unsaved changes. Are you sure you want to leave?";
		}

		return;
	}

	registerSW({
	  onNeedRefresh() {
	  	createNotice("Marker will update at the next restart");
	  },
	  onOfflineReady() {
	  	createNotice("Marker is ready to be used offline");
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
			openModal(editor, { autoHide: true, text: "This is the Command Palette! This is how you get around Marker! Have fun!" })
		}, "!intro-triggered")
	}
} else {
	const unsupportedWrapper = document.getElementById("unsupported")!;
	editorWrapper.style.display = "none";
	unsupportedWrapper.style.display = "block";
}
