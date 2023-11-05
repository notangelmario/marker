import { convertToMarkdown } from "./lib/languages/markdown";
import { emit, listen } from "@tauri-apps/api/event";

const mainWrapper = document.querySelector("main")!;
let currentEditorValue = "";

emit("loaded", true)

listen("load-content", async (ev) => {
	const payload = ev.payload as string;
	if (ev.payload === currentEditorValue) return;

	currentEditorValue = payload;

	const markdown = await convertToMarkdown(payload);
	mainWrapper.innerHTML = markdown;
})
