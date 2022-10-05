import { version } from "../../package.json";
import * as monaco from "monaco-editor";

const statusWidget: monaco.editor.IOverlayWidget = {
	getId: function () {
		return 'pencil.status';
	},
	getDomNode: function () {
		const domNode = document.createElement('div');
		domNode.id = "pencil-status"
		domNode.innerHTML = `
			<span id="status-notice"></span>
			<div class="spacer"></div>
			<span
				id="version-display"
			>
				${version}
			</span>
		`;
		
		return domNode;
	},
	getPosition: function () {
		return null;
	}
};

export function enableStatus(editor: monaco.editor.IStandaloneCodeEditor) {
	editor.addOverlayWidget(statusWidget);
}

export function disableStatus(editor: monaco.editor.IStandaloneCodeEditor) {
	editor.removeOverlayWidget(statusWidget);
}

export function createNotice(text: string) {
	const element = document.getElementById("status-notice");

	if (!element) return;

	element.innerText = text;
	element.style.opacity = "1";

	setTimeout(() => element.style.opacity = "0", 5000)
}