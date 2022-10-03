import "./app.css";
import { initStore } from "./lib/store";
import { initEditor } from "./lib/editor";

const editorWrapper = document.getElementById("app");

const { store, persistentStore } = initStore();

const getFileHandle = () => store.get("fileHandle");

const { editorFileAvailableContext } = initEditor(editorWrapper, getFileHandle);