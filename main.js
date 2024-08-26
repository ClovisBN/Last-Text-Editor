import TextEditor from "./src/TextEditor";
import PageSettings from "./src/PageSettings";

const canvas = document.getElementById("editorCanvas");

const pageSettings = new PageSettings();
canvas.width = pageSettings.canvasWidth;
canvas.height = pageSettings.canvasHeight;

const editor = new TextEditor(canvas);

document.getElementById("boldBtn").addEventListener("click", () => {
  editor.applyStyleToSelection({ fontWeight: "bold" });
});

document.getElementById("italicBtn").addEventListener("click", () => {
  editor.applyStyleToSelection({ fontStyle: "italic" });
});

document.getElementById("underlineBtn").addEventListener("click", () => {
  editor.applyStyleToSelection({ textDecoration: "underline" });
});
