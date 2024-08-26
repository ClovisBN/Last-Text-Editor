class Cursor {
  constructor(textEditor, renderer, pageSettings) {
    this._position = 0;
    this._visible = true;
    this._blinkInterval = null;
    this._textEditor = textEditor;
    this._renderer = renderer;
    this._pageSettings = pageSettings;
  }

  get position() {
    return this._position;
  }

  set position(value) {
    this._position = value;
  }

  get visible() {
    return this._visible;
  }

  set visible(value) {
    this._visible = value;
  }

  draw(ctx, x, y, fontSize) {
    if (this._visible) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + fontSize);
      ctx.strokeStyle = "black";
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  toggleVisibility() {
    this._visible = !this._visible;
  }

  startBlinking() {
    this._blinkInterval = setInterval(() => {
      if (!this._textEditor.selection.getSelectionRange()) {
        this.toggleVisibility();
      }
      this._textEditor.render();
    }, 500);
  }

  stopBlinking() {
    this._visible = true;
    if (this._blinkInterval) {
      clearInterval(this._blinkInterval);
      this._blinkInterval = null;
    }
    this._textEditor.render();
  }

  getCursorPositionFromMouse(e) {
    const rect = this._textEditor.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    let cursorPosition = 0;
    let accumulatedHeight = this._pageSettings.marginTop;

    for (let i = 0; i < this._textEditor.textBuffer.paragraphs.length; i++) {
      const paragraph = this._textEditor.textBuffer.paragraphs[i];
      const lines = this._renderer.wrapText(paragraph);

      for (let j = 0; j < lines.length; j++) {
        const line = lines[j];
        const lineHeight = this._renderer.lineHeight;

        if (y >= accumulatedHeight && y < accumulatedHeight + lineHeight) {
          return this._getCursorPositionOnLine(x, line, cursorPosition);
        }

        accumulatedHeight += lineHeight;
        cursorPosition += line.length;
      }

      cursorPosition;
    }

    if (y > accumulatedHeight) {
      const lastParagraph =
        this._textEditor.textBuffer.paragraphs[
          this._textEditor.textBuffer.paragraphs.length - 1
        ];
      const lastLine = this._renderer.wrapText(lastParagraph).pop();
      return this._handleClickOutsideLine(
        x,
        lastLine,
        cursorPosition - lastLine.length
      );
    }

    if (y < this._pageSettings.marginTop) {
      const firstParagraph = this._textEditor.textBuffer.paragraphs[0];
      const firstLine = this._renderer.wrapText(firstParagraph)[0];
      return this._handleClickOutsideLine(x, firstLine, 0);
    }

    return cursorPosition - 1;
  }

  _handleClickOutsideLine(x, line, basePosition) {
    const lineStartX = this._pageSettings.marginLeft;
    const lineEndX = lineStartX + this._renderer._ctx.measureText(line).width;

    if (x <= lineStartX) {
      return basePosition;
    } else if (x >= lineEndX) {
      return basePosition + line.length - 1;
    } else {
      return this._getCursorPositionOnLine(x, line, basePosition);
    }
  }

  _getCursorPositionOnLine(x, line, basePosition = 0) {
    if (!line) return basePosition;

    const lineStartX = this._pageSettings.marginLeft;
    const lineEndX = lineStartX + this._renderer._ctx.measureText(line).width;

    if (x <= lineStartX) {
      return basePosition;
    } else if (x >= lineEndX) {
      return basePosition + line.length - 1;
    } else {
      let closestPosition = basePosition;
      let closestDistance = Infinity;

      for (let i = 0; i < line.length; i++) {
        const charX =
          lineStartX + this._renderer._ctx.measureText(line.slice(0, i)).width;
        const distance = Math.abs(x - charX);
        if (distance < closestDistance) {
          closestPosition = basePosition + i;
          closestDistance = distance;
        }
      }

      return closestPosition;
    }
  }
}

export default Cursor;
