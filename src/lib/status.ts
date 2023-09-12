import { version } from "../../package.json";
import * as monaco from "monaco-editor";

const statusWidget: monaco.editor.IOverlayWidget = {
	getId: function () {
		return 'marker.status';
	},
	getDomNode: function () {
		const domNode = document.createElement('div');
		domNode.id = "marker-status"
		domNode.innerHTML = `
			<p id="vim-mode-display"></p>
			<p id="status-notice" style="opacity: 0;"></p>
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
	const element = document.getElementById("status-notice");

	if (!element) return;

	element.innerText = text;
	element.style.opacity = "1";

	setTimeout(() => element.style.opacity = "0", 5000)
}
