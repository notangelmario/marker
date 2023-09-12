import { marked } from "marked";
import { createNotice } from "../status";
import monaco from "../monaco";
import { writeFile } from "../file";

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
	const preview = window.open("/markdown-preview.html", "blank", "width=800,height=600");

	if (preview) {
		preview.window.onload = () => {
			preview.postMessage(editor.getValue());
		}
	}
	
	return preview;
}

export function startPreviewWatcher(editor: monaco.editor.IStandaloneCodeEditor, previewWindow: Window) {
	const dispose = editor.getModel()?.onDidChangeContent(() => {
		previewWindow.postMessage(editor.getValue())
	})
	
	const interval = setInterval(() => {
		if (previewWindow.closed) {
			stopPreviewWatcher(interval, previewWindow);
			dispose?.dispose();
		}
	}, 2000);

	return interval;
}

export function stopPreviewWatcher(previewInterval: number, previewWindow: Window) {
	clearInterval(previewInterval);
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

	const fileHandle = await window.showSaveFilePicker({
		excludeAcceptAllOption: true,
		suggestedName: "markdown-export.html",
		types: [
			{
				accept: {
					"text/html": ".html"
				}
			}
		]
	});


	if (fileHandle) {
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


				await writeFile(fileHandle, html);
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
