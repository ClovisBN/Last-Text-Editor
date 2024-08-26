class KeyController {
  constructor(textEditor) {
    this.textEditor = textEditor;
  }

  handleKeydown(e) {
    const {
      cursor,
      selection,
      textBuffer,
      characterKeyHandler,
      arrowKeysHandler,
      backspaceHandler,
      enterKeyHandler,
    } = this.textEditor;

    cursor.stopBlinking();

    const selectionRange = selection.getSelectionRange();

    if (selectionRange) {
      if (["Backspace", "Delete", "Enter"].includes(e.key)) {
        textBuffer.deleteRange(selectionRange.start, selectionRange.end);
        cursor.position = selectionRange.start;
        selection.clearSelection();
        if (e.key === "Enter") {
          textBuffer.splitParagraph();
        }
      } else if (e.key.length === 1) {
        textBuffer.deleteRange(selectionRange.start, selectionRange.end);
        characterKeyHandler.handleCharacterKey(e.key);
        cursor.position = textBuffer.getCursorPosition();
        selection.clearSelection();
      } else {
        cursor.position =
          e.key === "ArrowLeft" ? selectionRange.start : selectionRange.end;
        selection.clearSelection();
      }
    } else {
      switch (e.key) {
        case "ArrowLeft":
          arrowKeysHandler.moveCursorLeft();
          break;
        case "ArrowRight":
          arrowKeysHandler.moveCursorRight();
          break;
        case "ArrowUp":
          arrowKeysHandler.moveCursorUp();
          break;
        case "ArrowDown":
          arrowKeysHandler.moveCursorDown();
          break;
        case "Backspace":
          backspaceHandler.handleBackspace();
          break;
        case "Enter":
          enterKeyHandler.handleEnterKey();
          break;
        default:
          if (e.key.length === 1) {
            characterKeyHandler.handleCharacterKey(e.key);
          } else {
            console.warn(`Unrecognized key: ${e.key}`);
          }
          break;
      }
      cursor.position = textBuffer.getCursorPosition();
    }

    if (process.env.NODE_ENV === "development") {
      console.log(JSON.stringify(textBuffer.toJSON(), null, 2));
    }

    this.textEditor.render();
    cursor.startBlinking();
  }
}

export default KeyController;
