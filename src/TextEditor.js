import TextBuffer from "./TextBuffer.js";
import TextRenderer from "./TextRenderer.js";
import Cursor from "./Cursor.js";
import TextSelection from "./TextSelection.js";

class TextEditor {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");

    this.canvas.width = 400; // Exemple de largeur
    this.canvas.height = 300; // Exemple de hauteur

    this.textBuffer = new TextBuffer();
    this.cursor = new Cursor();
    this.renderer = new TextRenderer(this.ctx, canvas.width, canvas.height);
    this.selection = new TextSelection();

    this.cursorBlinkInterval = null;
    this.isMouseDown = false;

    this.initialize();
  }

  initialize() {
    this.canvas.addEventListener("keydown", (e) => this.handleKeydown(e));
    this.canvas.addEventListener("mousedown", (e) => this.handleMouseDown(e));
    this.canvas.addEventListener("mousemove", (e) => this.handleMouseMove(e));
    this.canvas.addEventListener("mouseup", () => this.handleMouseUp());
    this.canvas.addEventListener("click", () => this.canvas.focus());
    this.canvas.tabIndex = 1000;
    this.startCursorBlinking();
    this.render();
  }

  handleMouseDown(e) {
    this.isMouseDown = true;
    const position = this.getCursorPositionFromMouse(e);

    // Mettre à jour la position du curseur logique dans le TextBuffer
    this.textBuffer.setCursorPosition(position);

    // Mettre à jour la position du curseur visuel
    this.cursor.position = position;

    this.selection.clearSelection(); // Effacer la sélection s'il y en a une
    this.render();

    // Ajouter un timeout pour vérifier si l'utilisateur maintient le clic
    this.mouseDownTimeout = setTimeout(() => {
      if (this.isMouseDown) {
        this.selection.startSelection(position); // Démarrer la sélection si l'utilisateur maintient le clic
      }
    }, 150); // Délai en millisecondes avant d'activer la sélection
  }

  handleMouseMove(e) {
    if (this.isMouseDown) {
      const newPosition = this.getCursorPositionFromMouse(e);

      // Si la sélection est active, mettre à jour la sélection
      if (this.selection.active) {
        this.selection.updateSelection(newPosition);
        this.cursor.visible = false;
      } else {
        // Sinon, déplacez simplement le curseur
        this.cursor.position = newPosition;
      }
      this.render();
    }
  }

  handleMouseUp() {
    this.isMouseDown = false;
    clearTimeout(this.mouseDownTimeout); // Annuler le timeout si la souris est relâchée avant la fin du délai

    // Si une sélection est active, la rendre inactive après le relâchement
    if (this.selection.active) {
      this.selection.active = false;
      this.cursor.visible = !this.selection.getSelectionRange();
    } else {
      this.cursor.visible = true;
    }

    this.render();
  }

  handleKeydown(e) {
    this.stopCursorBlinking();

    const selectionRange = this.selection.getSelectionRange();

    if (selectionRange) {
      // Si une sélection est active et que l'utilisateur appuie sur "Backspace" ou "Delete"
      if (e.key === "Backspace" || e.key === "Delete") {
        this.textBuffer.deleteRange(selectionRange.start, selectionRange.end);
        this.cursor.position = selectionRange.start; // Placer le curseur au début de la sélection supprimée
        this.selection.clearSelection(); // Effacer la sélection après la suppression
      } else if (e.key === "ArrowLeft") {
        this.cursor.position = selectionRange.start;
      } else if (e.key === "ArrowRight") {
        this.cursor.position = selectionRange.end;
      }
      this.selection.clearSelection();
    } else {
      switch (e.key) {
        case "ArrowLeft":
          this.textBuffer.moveCursorLeft();
          break;
        case "ArrowRight":
          this.textBuffer.moveCursorRight();
          break;
        case "ArrowUp":
          this.textBuffer.moveCursorUp();
          break;
        case "ArrowDown":
          this.textBuffer.moveCursorDown();
          break;
        case "Backspace":
          this.textBuffer.delete();
          break;
        case "Enter":
          this.textBuffer.splitParagraph();
          break;
        default:
          if (e.key.length === 1) {
            this.textBuffer.insert(e.key);
          }
          break;
      }
      this.cursor.position = this.textBuffer.getCursorPosition();
    }

    // Afficher la structure JSON actuelle
    console.log(JSON.stringify(this.textBuffer.toJSON(), null, 2));

    this.render();
    this.startCursorBlinking();
  }

  getCursorPositionFromMouse(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    return this.renderer.getCursorPositionFromCoordinates(
      x,
      y,
      this.textBuffer
    );
  }

  render() {
    this.renderer.render(this.textBuffer, this.cursor);
    this.selection.drawSelection(
      this.ctx,
      this.textBuffer,
      this.cursor,
      this.renderer
    );
  }

  stopCursorBlinking() {
    this.cursor.visible = true;
    if (this.cursorBlinkInterval) {
      clearInterval(this.cursorBlinkInterval);
      this.cursorBlinkInterval = null;
    }
    this.render();
  }

  startCursorBlinking() {
    this.cursorBlinkInterval = setInterval(() => {
      if (!this.selection.getSelectionRange()) {
        this.cursor.toggleVisibility();
      }
      this.render();
    }, 500);
  }
}

export default TextEditor;
