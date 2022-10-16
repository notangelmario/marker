import { convertToMarkdown } from "./lib/languages/markdown";

const origin = window.location.origin;
const mainWrapper = document.querySelector("main")!;
let currentEditorValue = "";

window.addEventListener("message", async (ev) => {	
	if (ev.origin !== origin) return;
	if (ev.data === currentEditorValue) return;

	currentEditorValue = ev.data;
	const markdown = await convertToMarkdown(ev.data);

	mainWrapper.innerHTML = markdown; 
})