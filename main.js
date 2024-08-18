import TextEditor from "./src/TextEditor";

const canvas = document.getElementById("editorCanvas");
canvas.width = 500;
canvas.height = 300;

const editor = new TextEditor(canvas);
