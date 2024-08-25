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
    let y = renderer.pageSettings.marginTop;

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
          let xPosition = renderer.pageSettings.marginLeft;

          for (let k = 0; k < line.length; k++) {
            const char = line[k];
            const charPosition = lineStart + k;

            const { textRun } = renderer.getTextRunFromLinePosition(
              paragraph,
              lineStart + k
            );

            if (textRun) {
              renderer._applyTextStyle(textRun.textStyle);
            }

            const charWidth = ctx.measureText(char).width;

            if (
              charPosition >= selectionStartInLine &&
              charPosition < selectionEndInLine
            ) {
              ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
              ctx.fillRect(xPosition, y, charWidth, renderer.fontSize);

              // Dessine le texte sélectionné sur le surlignement
              ctx.fillStyle = textRun.textStyle?.color || "black";
              ctx.fillText(char, xPosition, y);
            }

            xPosition += charWidth;
          }
        }

        totalChars += line.length;
        y += renderer.lineHeight;
      }
    }
  }
}

export default TextSelection;
