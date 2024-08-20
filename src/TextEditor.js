import TextBuffer from "./TextBuffer";
import PageSettings from "./PageSettings";
import TextRenderer from "./TextRenderer";
import Cursor from "./Cursor";
import TextSelection from "./TextSelection";

class TextEditor {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");

    // Utilisation de PageSettings pour définir les dimensions du canvas
    this.pageSettings = new PageSettings();

    this.canvas.width = this.pageSettings.getCanvasWidth();
    this.canvas.height = this.pageSettings.getCanvasHeight();

    this.textBuffer = new TextBuffer();
    this.cursor = new Cursor();
    this.renderer = new TextRenderer(this.ctx, this.pageSettings); // Passer PageSettings à TextRenderer
    this.selection = new TextSelection();

    this.cursorBlinkInterval = null;
    this.isMouseDown = false;

    this.initialize();
  }

  initialize() {
    document.addEventListener("keydown", (e) => this.handleKeydown(e));
    document.addEventListener("mousedown", (e) => this.handleMouseDown(e));
    document.addEventListener("mousemove", (e) => this.handleMouseMove(e));
    document.addEventListener("mouseup", () => this.handleMouseUp());
    this.canvas.addEventListener("click", () => this.canvas.focus());
    this.canvas.tabIndex = 1000;
    this.startCursorBlinking();
    this.render();
  }

  handleMouseDown(e) {
    this.isMouseDown = true;

    // Vérifiez si le clic s'est produit dans le canvas
    if (e.target !== this.canvas) {
      return;
    }

    // Obtenez l'index global du curseur à partir de la position de la souris
    const globalIndex = this.getCursorPositionFromMouse(e);

    // Effacer le curseur actuel
    this.cursor.visible = false;
    this.render(); // Redessine tout sans le curseur

    // Mettre à jour la position logique du curseur dans le TextBuffer
    this.textBuffer.setCursorPosition(globalIndex);

    // Mettre à jour la position visuelle du curseur
    this.cursor.position = globalIndex;

    // Effacer toute sélection existante
    this.selection.clearSelection();

    // Redessiner l'interface avec le curseur mis à jour
    this.cursor.visible = true;
    this.render();
  }

  handleMouseMove(e) {
    if (!this.isMouseDown) return;

    // Obtenez la nouvelle position globale du curseur
    const newPosition = this.getCursorPositionFromMouse(e);

    // Si la sélection est active, mettez-la à jour
    if (this.selection.active) {
      this.selection.updateSelection(newPosition);
      this.cursor.visible = false;
    } else {
      // Si la sélection n'est pas encore active, démarrez-la
      this.selection.startSelection(newPosition);
      this.selection.updateSelection(newPosition);
    }

    // Redessinez l'interface avec la sélection mise à jour
    this.render();
  }

  handleMouseUp() {
    this.isMouseDown = false;

    const selectionRange = this.selection.getSelectionRange();

    // Vérifier si la sélection a le même index de début et de fin
    if (selectionRange && selectionRange.start === selectionRange.end) {
      // Placer le curseur à cet index
      this.cursor.position = selectionRange.start;
      this.textBuffer.setCursorPosition(selectionRange.start);
      this.selection.clearSelection(); // Effacer la sélection
    }

    // Si une sélection est active, la rendre inactive après le relâchement
    if (this.selection.active) {
      this.selection.active = false;
      this.cursor.visible = !this.selection.getSelectionRange();
    } else {
      this.cursor.visible = true;
    }

    // Redessinez l'interface
    this.render();
  }

  handleKeydown(e) {
    this.stopCursorBlinking();

    const selectionRange = this.selection.getSelectionRange();

    if (selectionRange) {
      switch (e.key) {
        case "Backspace":
        case "Delete":
          this.textBuffer.deleteRange(selectionRange.start, selectionRange.end);
          this.cursor.position = selectionRange.start;
          this.selection.clearSelection();
          break;

        case "ArrowLeft":
          this.cursor.position = selectionRange.start;
          this.selection.clearSelection();
          break;

        case "ArrowRight":
          this.cursor.position = selectionRange.end;
          this.selection.clearSelection();
          break;
        case "Enter":
          this.textBuffer.deleteRange(selectionRange.start, selectionRange.end);
          this.cursor.position = selectionRange.start;
          this.selection.clearSelection();
          this.textBuffer.splitParagraph();
          break;

        default:
          if (e.key.length === 1) {
            this.textBuffer.deleteRange(
              selectionRange.start,
              selectionRange.end
            );
            this.textBuffer.insert(e.key);
            this.cursor.position = this.textBuffer.getCursorPosition();
            this.selection.clearSelection();
          }
          break;
      }
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

    let cursorPosition = this.renderer.getCursorPositionFromCoordinates(
      x,
      y,
      this.textBuffer
    );

    const totalTextHeight = this.renderer.getTotalTextHeight(this.textBuffer);

    if (y > totalTextHeight) {
      const lastParagraph =
        this.textBuffer.paragraphs[this.textBuffer.paragraphs.length - 1];
      const lastLine = this.renderer.wrapText(lastParagraph).pop();

      const lineStartX = this.pageSettings.getMarginLeft();
      const lineEndX =
        lineStartX + this.renderer._ctx.measureText(lastLine).width;

      if (x <= lineStartX) {
        cursorPosition = this.textBuffer.getText().length - lastLine.length + 1;
      } else if (x >= lineEndX) {
        cursorPosition = this.textBuffer.getText().length;
      } else {
        let closestPosition =
          this.textBuffer.getText().length - lastLine.length;
        let closestDistance = Infinity;

        for (let i = 0; i < lastLine.length; i++) {
          const charX =
            lineStartX +
            this.renderer._ctx.measureText(lastLine.slice(0, i)).width;
          const distance = Math.abs(x - charX);
          if (distance < closestDistance) {
            closestPosition =
              this.textBuffer.getText().length - lastLine.length + i;
            closestDistance = distance;
          }
        }

        cursorPosition = closestPosition;
      }
    }

    return cursorPosition;
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
