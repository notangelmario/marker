import monaco from "./monaco";


const modalWidget = (options?: ModalOptions): monaco.editor.IOverlayWidget => ({
	getId: function () {
		return 'miniated.modal';
	},
	getDomNode: function () {
		const domNode = document.createElement('div');
		domNode.id = "miniated-modal";
		domNode.style.opacity = "0";
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
	const modal = document.getElementById("miniated-modal")!;

	modal.style.opacity = "1";

	if (options.autoHide) {
		setTimeout(() => {
			modal.style.opacity = "0";
			setTimeout(() => closeModal(editor), 1000);
		}, 5000)
	}
}

export function closeModal(editor: monaco.editor.IStandaloneCodeEditor) {
	editor.removeOverlayWidget(modalWidget());
}