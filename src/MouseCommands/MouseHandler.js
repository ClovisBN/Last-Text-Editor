class MouseHandler {
  constructor(textEditor) {
    this.textEditor = textEditor;
  }

  handleMouseDown(e) {
    this.textEditor.isMouseDown = true;

    if (e.target !== this.textEditor.canvas) {
      return;
    }

    // Récupérer la position globale du curseur lors du clic
    const startPosition = this.textEditor.cursor.getCursorPositionFromMouse(e);

    // Initialiser la sélection avec la position de départ
    this.textEditor.selection.startSelection(startPosition);

    // Mettre à jour la position du curseur
    this.textEditor.cursor.visible = false;
    this.textEditor.textBuffer.setCursorPosition(startPosition);
    this.textEditor.cursor.position = startPosition;

    // Rendre le curseur visible et redessiner l'interface
    this.textEditor.cursor.visible = true;
    this.textEditor.render();
  }

  handleMouseMove(e) {
    if (!this.textEditor.isMouseDown) return;

    const newPosition = this.textEditor.cursor.getCursorPositionFromMouse(e);

    if (newPosition !== this.textEditor.cursor.position) {
      this.textEditor.selection.updateSelection(newPosition);
      this.textEditor.cursor.visible = false;

      this.textEditor.render();
    }
  }

  handleMouseUp(e) {
    this.textEditor.isMouseDown = false;

    if (e && typeof e.clientX === "number" && typeof e.clientY === "number") {
      const endPosition = this.textEditor.cursor.getCursorPositionFromMouse(e);

      this.textEditor.selection.updateSelection(endPosition);
    }

    const selectionRange = this.textEditor.selection.getSelectionRange();
    if (selectionRange && selectionRange.start === selectionRange.end) {
      this.textEditor.cursor.position = selectionRange.start;
      this.textEditor.textBuffer.setCursorPosition(selectionRange.start);
      this.textEditor.selection.clearSelection();
    }

    if (this.textEditor.selection.active) {
      this.textEditor.selection.active = false;
      this.textEditor.cursor.visible =
        !this.textEditor.selection.getSelectionRange();
    } else {
      this.textEditor.cursor.visible = true;
    }

    this.textEditor.render();
  }
}

export default MouseHandler;
