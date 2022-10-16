import { convertToMarkdown } from "./lib/languages/markdown";

const mainWrapper = document.querySelector("main")!;
const origin = window.location.origin;
let currentEditorValue = "";


window.addEventListener("message", async ev => {
	if (ev.origin !== origin) return;
	if (ev.data === currentEditorValue) return;

	currentEditorValue = ev.data;

	const markdown = await convertToMarkdown(ev.data);
	mainWrapper.innerHTML = markdown;
})