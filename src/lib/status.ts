import { version } from "../../package.json";
import * as monaco from "monaco-editor";

const statusWidget: monaco.editor.IOverlayWidget = {
	getId: function () {
		return 'miniated.status';
	},
	getDomNode: function () {
		const domNode = document.createElement('div');
		domNode.id = "miniated-status"
		domNode.innerHTML = `
			<p id="status-notice"></p>
			<div class="spacer"></div>
			<p
				id="version-display"
			>
				${version}
			</p>
		`;
		
		return domNode;
	},
	getPosition: function () {
		return null;
	}
};

export function initStatus(editor: monaco.editor.IStandaloneCodeEditor) {
	editor.addOverlayWidget(statusWidget);
}

export function createNotice(text: string) {
	const element = document.getElementById("miniated-notice");

	if (!element) return;

	element.innerText = text;
	element.style.opacity = "1";

	setTimeout(() => element.style.opacity = "0", 5000)
}