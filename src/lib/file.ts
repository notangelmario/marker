import monaco from "./monaco";
import { createNotice } from "./status";
import { Store } from "./store";
import { open as openFile, save as saveFile } from "@tauri-apps/api/dialog";
import { readTextFile, writeTextFile } from "@tauri-apps/api/fs";
import { listen } from "@tauri-apps/api/event";

export function startAutosave(editor: monaco.editor.IStandaloneCodeEditor, filePath: string) {
	const interval = setInterval(async () => {
		const contents = editor.getValue()

		writeTextFile(filePath, contents).then(() => {
			createNotice("Autosaved!");
		});
	}, 120000);

	return () => {
		clearInterval(interval);
	}
}

export async function showOpenFilePicker() {
	try {
		const selected = await openFile({
			multiple: false,
			directory: false,
			filters: pickerFilters
		})

		return selected as string
	} catch {
		return null
	}
}

export async function initDropFileListener(editor: monaco.editor.IStandaloneCodeEditor, store: Store, fileAvailableContext: monaco.editor.IContextKey<boolean>) {
	listen("tauri://file-drop", (event) => {
		const filePath = (event.payload as string[])[0];

		console.log(event);

		if (filePath) {
			setEditorText(editor, filePath, store, fileAvailableContext);
		}
	})

}

export async function setEditorText(editor: monaco.editor.IStandaloneCodeEditor, filePath: string, store: Store, fileAvailableContext: monaco.editor.IContextKey<boolean>) {
	const fileContents = await readTextFile(filePath);

	const ext = getExtension(filePath);

	monaco.editor.getModels().forEach((model) => model.dispose());
	editor.setModel(monaco.editor.createModel(fileContents, fileTypes.get(ext)/*, monaco.Uri.file(file.name)*/));

	setTimeout(() => {
		editor.focus();
	}, 100);

	fileAvailableContext.set(true);
	store.set("filePath", filePath);
}

export async function showSaveFilePicker() {
	try {
		const selected = await saveFile({
			filters: pickerFilters
		})

		return selected as string
	} catch {
		return null
	}
	
}

export async function onCreate(editor: monaco.editor.IStandaloneCodeEditor, store: Store, fileAvailableContext: monaco.editor.IContextKey<boolean>) {
	const filePath = await showSaveFilePicker();


	if (filePath) {
		if (editor.getValue()) {
			await writeTextFile(filePath, editor.getValue());
		}

		setEditorText(editor, filePath, store, fileAvailableContext);

		return filePath;
	}

	return null;
}

export async function onSave(filePath: string, editor: monaco.editor.IStandaloneCodeEditor) {
	await writeTextFile(filePath, editor.getValue());
	createNotice("Saved!");
}


export async function onOpen(store: Store, editor: monaco.editor.IStandaloneCodeEditor, fileAvailableContext: monaco.editor.IContextKey<boolean>) {
	const filePath = await showOpenFilePicker();


	if (filePath) {
		await setEditorText(editor, filePath, store, fileAvailableContext);

		return filePath;
	}

	return null;
}

export function onClose(editor: monaco.editor.IStandaloneCodeEditor, store: Store, fileAvailableContext: monaco.editor.IContextKey<boolean>) {
	editor.setValue("");
	store.set("fileHandle", null);
	fileAvailableContext.set(false);
}

export function getExtension(fname: string) {
	return fname.slice((Math.max(0, fname.lastIndexOf(".")) || Infinity) + 1);
}

export const pickerFilters = [
	{
		name: "Markdown",
		extensions: ["md"]
	},
	{
		name: "Text",
		extensions: ["txt"]
	},
	{
		name: "Shell Script",
		extensions: ["sh"]
	},
	{
		name: "C",
		extensions: ["c"]
	},
	{
		name: "C++",
		extensions: ["cpp"]
	},
	{
		name: "Python",
		extensions: ["py"]
	},
	{
		name: "CSS",
		extensions: ["css"]
	},
	{
		name: "HTML",
		extensions: ["html"]
	},
	{
		name: "JSON",
		extensions: ["json"]
	},
	{
		name: "JavaScript",
		extensions: ["js"]
	},
	{
		name: "TypeScript",
		extensions: ["ts"]
	}
]

export const fileTypes = new Map<string, string>([
	["txt", "plaintext"],
	["sh", "shell"],
	["bash", "shell"],
	["c", "c"],
	["cpp", "cpp"],
	["py", "python"],
	["md", "markdown"],
	["css", "css"],
	["html", "html"],
	["json", "json"],
	["webmanifest", "json"],
	["js", "javascript"],
	["mjs", "javascript"],
	["ts", "typescript"]
])