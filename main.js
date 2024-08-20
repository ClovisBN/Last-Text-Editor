import TextEditor from "./src/TextEditor";
import PageSettings from "./src/PageSettings";

const canvas = document.getElementById("editorCanvas");

// Utilisation de PageSettings pour définir les dimensions du canvas
const pageSettings = new PageSettings();
canvas.width = pageSettings.getCanvasWidth();
canvas.height = pageSettings.getCanvasHeight();

const editor = new TextEditor(canvas);
