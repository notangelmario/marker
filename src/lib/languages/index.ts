//@ts-ignore
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
//@ts-ignore
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
//@ts-ignore
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
//@ts-ignore
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
//@ts-ignore
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'

export { initAutoTypings } from "./typescript";

// MonacoEnvironment should be initialized before the editor
export function initLanguageWorkers() {
	self.MonacoEnvironment = {
		getWorker(_, label) {
			if (label === 'json') {
				return new jsonWorker()
			}
			if (label === 'css') {
				return new cssWorker()
			}
			if (label === 'html') {
				return new htmlWorker()
			}
			if (label === 'typescript' || label === 'javascript') {
				return new tsWorker()
			}
			return new editorWorker()
		}	
	}
}
