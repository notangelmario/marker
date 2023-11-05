import { marked } from "marked";
import { createNotice } from "../status";
import monaco from "../monaco";
import { writeTextFile } from "@tauri-apps/api/fs";
import { save as saveFile } from "@tauri-apps/api/dialog";
import { appWindow, WebviewWindow } from "@tauri-apps/api/window";

export function addMarkdownActions(editor: monaco.editor.IStandaloneCodeEditor) {
	editor.addAction({
		id: "marker.export_markdown_html",
		precondition: "fileAvailable",
		label: "Export Markdown File to HTML...",
		run: async () => {
			exportToHtml(editor);
		}
	});
	editor.addAction({
		id: "marker.open_markdown_preview",
		label: "Open Markdown Preview",
		precondition: "fileAvailable",
		run: async () => {
			const previewWindow = openPreviewWindow(editor);

			if (previewWindow) {
				startPreviewWatcher(editor, previewWindow);
			} else {
				createNotice("Could not open preview window.");
			}
		}
	});
}

export function openPreviewWindow(editor: monaco.editor.IStandaloneCodeEditor) {
	const previewWindow = new WebviewWindow("markdownPreview", {
		width: 1024,
		height: 600,
		url: "markdown-preview.html",
	})

	previewWindow.once("loaded", () => {
		previewWindow.emit("load-content", editor.getValue());
	})
	
	return previewWindow;
}

export function startPreviewWatcher(editor: monaco.editor.IStandaloneCodeEditor, previewWindow: WebviewWindow) {
	const dispose = editor.getModel()?.onDidChangeContent(() => {
		previewWindow.emit("load-content", editor.getValue());
	})

	appWindow.onCloseRequested(() => {
		stopPreviewWatcher(previewWindow);
		dispose?.dispose();
	})
	
	previewWindow.onCloseRequested(() => {
		stopPreviewWatcher(previewWindow);
		dispose?.dispose();
	})
}

export function stopPreviewWatcher(previewWindow: WebviewWindow) {
	previewWindow.close();
}


export async function convertToMarkdown(src: string): Promise<string> {
	return await marked.parse(src, {
		async: true,
		gfm: true
	})
}

export async function exportToHtml(editor: monaco.editor.IStandaloneCodeEditor) {
	if (editor.getModel()?.getLanguageId() !== "markdown") {
		createNotice("Can't export non-markdown files");
		return;
	}

	const filePath = await saveFile({
		filters: [{
			name: "Markdown",
			extensions: ["md"]
		}]
	});


	if (filePath) {
		if (editor.getValue()) {
			try {
				const markdownHtml = await convertToMarkdown(editor.getValue());

				const html = `
					<!DOCTYPE html/>
					<html>
						<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/pixelbrackets/gfm-stylesheet/dist/gfm.min.css" />
						<body>
							${markdownHtml}
						</body>
					</html>
				`


				await writeTextFile(filePath, html);
				createNotice("Succesfully exported to HTML!");
			} catch (e) {
				createNotice("Something went wrong");
			}
		} else {
			createNotice("Can't export empty file");
		}
	} else {
		createNotice("Could not export to file");
	}
}
