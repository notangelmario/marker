import { editor } from "monaco-editor";

const modalWidget = (options?: ModalOptions): editor.IOverlayWidget => ({
	getId: function () {
		return 'pencil.modal';
	},
	getDomNode: function () {
		const domNode = document.createElement('div');
		domNode.id = "pencil-modal"
		domNode.innerHTML = options?.text || "";
		
		return domNode;
	},
	getPosition: function () {
		return null;
	}
});

interface ModalOptions {
	autoHide?: boolean
	text: string
}

export function openModal(editorInstance: editor.IStandaloneCodeEditor, options: ModalOptions) {
	editorInstance.addOverlayWidget(modalWidget(options));

	if (options.autoHide) {
		setTimeout(() => closeModal(editorInstance), 5000)
	}
}

export function closeModal(editorInstance: editor.IStandaloneCodeEditor) {
	editorInstance.removeOverlayWidget(modalWidget());
}