import monaco from "./monaco";
import { createNotice } from "./status";
import { Store } from "./store";

export function startAutosave(editor: monaco.editor.IStandaloneCodeEditor, fileHandle: FileSystemFileHandle) {
	const interval = setInterval(async () => {
		const contents = editor.getValue()

		if (await fileHandle.queryPermission({ mode: "readwrite" }) === "granted") {

			writeFile(fileHandle, contents).then(() => {
				createNotice("Autosaved!");
			});
		};
	}, 120000);

	return () => {
		clearInterval(interval);
	}
}

export async function showOpenFilePicker() {
	try {
		const [fileSystemHandle] = await window.showOpenFilePicker({
			multiple: false,
		});

		return fileSystemHandle
	} catch {
		return null
	}
}

export async function writeFile(fileHandle: FileSystemFileHandle, contents: string) {
	const writable = await fileHandle.createWritable();
	await writable.write({
		data: contents,
		type: "write"
	});
	await writable.close();
}

export async function setEditorText(editor: monaco.editor.IStandaloneCodeEditor, fileHandle: FileSystemFileHandle, store: Store, fileAvailableContext: monaco.editor.IContextKey<boolean>) {
	const file = await fileHandle.getFile();

	const ext = getExtension(file.name);

	monaco.editor.getModels().forEach((model) => model.dispose());
	editor.setModel(monaco.editor.createModel(await file.text(), fileTypes.get(ext), monaco.Uri.file(file.name)));
	
	fileAvailableContext.set(true);
	store.set("fileHandle", fileHandle);
}

export async function showSaveFilePicker() {
	try {
		const handle = await window.showSaveFilePicker({
			excludeAcceptAllOption: true,
			suggestedName: "new.txt",
			types: Array.from(fileTypes.keys())
				.filter((v) => !!fileMimeTypes.get(v))
				.map((v) => ({
					accept: {
    					[fileMimeTypes.get(v)!]: "." + v
    				}
				}))
		});
		
		return handle;
	} catch {
		return null
	}
	
}

export async function onCreate(editor: monaco.editor.IStandaloneCodeEditor, store: Store, fileAvailableContext: monaco.editor.IContextKey<boolean>) {
	const fileHandle = await showSaveFilePicker();


	if (fileHandle) {
		if (editor.getValue()) {
			await writeFile(fileHandle, editor.getValue());
		}

		setEditorText(editor, fileHandle, store, fileAvailableContext);

		return fileHandle;
	}

	return null;
}

export async function onSave(fileHandle: FileSystemFileHandle, editor: monaco.editor.IStandaloneCodeEditor) {
	await writeFile(fileHandle, editor.getValue());
	createNotice("Saved!");
}


export async function onOpen(store: Store, editor: monaco.editor.IStandaloneCodeEditor, fileAvailableContext: monaco.editor.IContextKey<boolean>) {
	const fileHandle = await showOpenFilePicker();


	if (fileHandle) {
		await setEditorText(editor, fileHandle, store, fileAvailableContext);

		return fileHandle;
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

export function initDropFile(element: HTMLElement, editor: monaco.editor.IStandaloneCodeEditor, store: Store, fileAvailableContext: monaco.editor.IContextKey<boolean>, _disableAutosave: () => void) {
	async function dropHandler(e: DragEvent) {
		console.log('File(s) dropped');
	  
		e.preventDefault();
		
		if (e.dataTransfer?.items) {
			const fileHandleRaw = await Array.from(e.dataTransfer.items)[0].getAsFileSystemHandle()
			if (fileHandleRaw?.kind !== "file") return;

			const fileHandle = fileHandleRaw as FileSystemFileHandle;
			setEditorText(editor, fileHandle, store, fileAvailableContext);
			_disableAutosave = startAutosave(editor, fileHandle);
		}
	}
	
	element.addEventListener("drop", dropHandler, false);
}

export function initLaunchWithFile(editor: monaco.editor.IStandaloneCodeEditor, store: Store, fileAvailableContext: monaco.editor.IContextKey<boolean>, _disableAutosave: () => void) {
	
	(window as any).launchQueue.setConsumer((launchParams: any) => {
		// Nothing to do when the queue is empty.
		if (!launchParams.files.length) {
			return;
		}
		const fileHandle = launchParams.files[0];

		setEditorText(editor, fileHandle, store, fileAvailableContext)

		_disableAutosave = startAutosave(editor, fileHandle);
  });
}

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

export const fileMimeTypes = new Map<string, string>([
	["txt", "text/plain"],
	["sh", "text/x-shellscript"],
	["c", "text/x-c"],
	["py", "text/x-python"],
	["md", "text/markdown"],
	["css", "text/css"],
	["html", "text/html"],
	["json", "application/json"],
	["webmanifest", "application/manifest+json"],
	["js", "text/javascript"],
	["ts", "text/x-typescript"]
])
