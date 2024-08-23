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

    // Mettre à jour la fin de la sélection en fonction de la nouvelle position
    if (newPosition !== this.textEditor.cursor.position) {
      this.textEditor.selection.updateSelection(newPosition);
      this.textEditor.cursor.visible = false;

      this.textEditor.render();
    }
  }

  handleMouseUp(e) {
    this.textEditor.isMouseDown = false;

    // Vérifier si l'événement `e` est défini et si les propriétés `clientX` et `clientY` sont disponibles
    if (e && typeof e.clientX === "number" && typeof e.clientY === "number") {
      // Récupérer la position globale du curseur lors du relâchement de la souris
      const endPosition = this.textEditor.cursor.getCursorPositionFromMouse(e);

      // Mettre à jour la fin de la sélection avec la position de fin
      this.textEditor.selection.updateSelection(endPosition);
    }

    // Vérifier si la sélection est vide (clic sans glisser)
    const selectionRange = this.textEditor.selection.getSelectionRange();
    if (selectionRange && selectionRange.start === selectionRange.end) {
      // Placer le curseur à la position sélectionnée si aucune sélection n'est effectuée
      this.textEditor.cursor.position = selectionRange.start;
      this.textEditor.textBuffer.setCursorPosition(selectionRange.start);
      this.textEditor.selection.clearSelection();
    }

    // Désactiver la sélection après le relâchement de la souris
    if (this.textEditor.selection.active) {
      this.textEditor.selection.active = false;
      this.textEditor.cursor.visible =
        !this.textEditor.selection.getSelectionRange();
    } else {
      this.textEditor.cursor.visible = true;
    }

    // Redessiner l'interface
    this.textEditor.render();
  }
}

export default MouseHandler;
