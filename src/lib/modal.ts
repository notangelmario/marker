import * as monaco from "monaco-editor";

const modalWidget = (options?: ModalOptions): monaco.editor.IOverlayWidget => ({
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

export function openModal(editor: monaco.editor.IStandaloneCodeEditor, options: ModalOptions) {
	editor.addOverlayWidget(modalWidget(options));

	if (options.autoHide) {
		setTimeout(() => closeModal(editor), 5000)
	}
}

export function closeModal(editor: monaco.editor.IStandaloneCodeEditor) {
	editor.removeOverlayWidget(modalWidget());
}