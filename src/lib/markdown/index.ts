import { marked } from "marked";
import { createNotice } from "../status";
import monaco from "../monaco";
import { writeFile } from "../file";

export async function convertToMarkdown(src: string): Promise<string> {
	return await marked.parse(src, {
		async: true,
		gfm: true
	})
}

export async function exportToMarkdown(editor: monaco.editor.IStandaloneCodeEditor) {
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
						<style>
							* {
								font-family: Arial, Helvetica, sans-serif;
							}
						</style>
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