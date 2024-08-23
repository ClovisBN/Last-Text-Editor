class TextSelection {
  constructor() {
    this._start = null;
    this._end = null;
    this._active = false;
  }

  get start() {
    return this._start;
  }

  get end() {
    return this._end;
  }

  get active() {
    return this._active;
  }

  set active(value) {
    this._active = value;
  }

  startSelection(position) {
    this._start = position;
    this._end = position;
    this._active = true;
  }

  updateSelection(position) {
    if (this._active) {
      this._end = position;
    }
  }

  clearSelection() {
    this._start = null;
    this._end = null;
    this._active = false;
  }

  getSelectionRange() {
    if (this._start === null || this._end === null) {
      return null;
    }

    return {
      start: Math.min(this._start, this._end),
      end: Math.max(this._start, this._end),
    };
  }

  drawSelection(ctx, textBuffer, cursor, renderer) {
    const range = this.getSelectionRange();
    if (!range) return;

    const paragraphs = textBuffer.paragraphs;
    let totalChars = 0;
    let y = renderer.pageSettings.marginTop; // Utilisation de la marge supérieure

    for (let i = 0; i < paragraphs.length; i++) {
      const paragraph = paragraphs[i];
      const lines = renderer.wrapText(paragraph);

      for (let j = 0; j < lines.length; j++) {
        const line = lines[j];
        const lineStart = totalChars;
        const lineEnd = totalChars + line.length;

        if (range.end < lineStart) {
          break;
        }

        const selectionStartInLine = Math.max(range.start, lineStart);
        const selectionEndInLine = Math.min(range.end, lineEnd);

        if (selectionStartInLine < selectionEndInLine) {
          const startWidth = ctx.measureText(
            line.substring(0, selectionStartInLine - lineStart)
          ).width;
          const endWidth = ctx.measureText(
            line.substring(0, selectionEndInLine - lineStart)
          ).width;

          const xStart = startWidth + renderer.pageSettings.marginLeft; // Utilisation de la marge gauche
          const xEnd = endWidth + renderer.pageSettings.marginLeft;

          if (!isNaN(xStart) && !isNaN(xEnd) && !isNaN(y)) {
            const rectHeight = renderer.fontSize; // Adapte le surlignement à la taille de la police

            ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
            ctx.fillRect(xStart, y, xEnd - xStart, rectHeight);

            // Redessiner le texte par-dessus la sélection
            ctx.fillStyle = "black";
            ctx.fillText(
              line.substring(
                selectionStartInLine - lineStart,
                selectionEndInLine - lineStart
              ),
              xStart,
              y
            );
          }
        }

        totalChars += line.length;
        y += renderer.lineHeight;
      }
    }
  }
}

export default TextSelection;
