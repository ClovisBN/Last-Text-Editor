import TextEditor from "./src/TextEditor";
import PageSettings from "./src/PageSettings";

const canvas = document.getElementById("editorCanvas");

// Utilisation de PageSettings pour définir les dimensions du canvas
const pageSettings = new PageSettings();
canvas.width = pageSettings.canvasWidth; // Accéder via getter
canvas.height = pageSettings.canvasHeight; // Accéder via getter

const editor = new TextEditor(canvas);

// Ajout de gestionnaires pour les boutons de style
document.getElementById("boldBtn").addEventListener("click", () => {
  editor.applyStyleToSelection({ fontWeight: "bold" });
});

document.getElementById("italicBtn").addEventListener("click", () => {
  editor.applyStyleToSelection({ fontStyle: "italic" });
});

document.getElementById("underlineBtn").addEventListener("click", () => {
  editor.applyStyleToSelection({ textDecoration: "underline" });
});
