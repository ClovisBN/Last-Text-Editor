class TextRenderer {
  constructor(ctx, width, height, fontSize = 20, padding = 10) {
    this._ctx = ctx;
    this._width = width;
    this._height = height;
    this._fontSize = fontSize;
    this._lineHeight = fontSize * 1.2;
    this._padding = padding; // Assurez-vous que padding est bien défini ici

    this._dpr = window.devicePixelRatio || 1;

    this._ctx.canvas.width = width * this._dpr;
    this._ctx.canvas.height = height * this._dpr;

    this._ctx.canvas.style.width = `${width}px`;
    this._ctx.canvas.style.height = `${height}px`;

    this._ctx.scale(this._dpr, this._dpr);

    this._ctx.font = `${fontSize}px Arial`;
    this._ctx.textBaseline = "top";
    this._maxWidth = this._width - 2 * this._padding;
  }

  // Getter pour accéder à padding
  get padding() {
    return this._padding;
  }

  get lineHeight() {
    return this._lineHeight;
  }

  // Getter pour la taille de la police
  get fontSize() {
    return this._fontSize;
  }

  wrapText(paragraph) {
    const lines = [];
    const words = paragraph.split(" ");
    let line = "";

    for (let n = 0; n < words.length; n++) {
      let testLine = line + words[n] + " ";
      let metrics = this._ctx.measureText(testLine);
      let testWidth = metrics.width;

      if (testWidth > this._maxWidth && n > 0) {
        lines.push(line);
        line = words[n] + " ";
      } else {
        line = testLine;
      }
    }
    lines.push(line);
    return lines;
  }

  getCursorPositionFromCoordinates(x, y, textBuffer) {
    let cursorPosition = 0;
    const paragraphs = textBuffer.paragraphs;
    let yPosition = this._padding;

    for (let i = 0; i < paragraphs.length; i++) {
      const lines = this.wrapText(paragraphs[i]);
      for (let j = 0; j < lines.length; j++) {
        const line = lines[j];
        const lineHeight = this._lineHeight;

        if (y >= yPosition && y < yPosition + lineHeight) {
          let xPosition = this._padding;

          for (let k = 0; k < line.length; k++) {
            const charWidth = this._ctx.measureText(line[k]).width;

            if (x >= xPosition && x < xPosition + charWidth) {
              return cursorPosition + k; // Supprimer l'ajout de i
            }
            xPosition += charWidth;
          }

          if (x >= xPosition) {
            return cursorPosition + line.length; // Supprimer l'ajout de i
          }
        }

        cursorPosition += line.length;
        yPosition += lineHeight;
      }

      cursorPosition += 1; // Pour le saut de ligne
    }

    return cursorPosition;
  }

  render(textBuffer, cursor) {
    this._ctx.clearRect(0, 0, this._width, this._height);

    const paragraphs = textBuffer.paragraphs;
    let y = this._padding;
    let cursorX = null;
    let cursorY = null;
    let globalCursorIndex = cursor.position;

    for (let i = 0; i < paragraphs.length; i++) {
      let paragraph = paragraphs[i];
      const lines = this.wrapText(paragraph);
      let lineStartIndex = 0;

      for (let j = 0; j < lines.length; j++) {
        let line = lines[j];
        this._ctx.fillText(line, this._padding, y);

        if (
          globalCursorIndex >= lineStartIndex &&
          globalCursorIndex <= lineStartIndex + line.length
        ) {
          cursorX =
            this._ctx.measureText(
              line.substring(0, globalCursorIndex - lineStartIndex)
            ).width + this._padding;
          cursorY = y;
        }

        lineStartIndex += line.length;
        y += this._lineHeight;
      }

      // Mettre à jour l'index global sans ajouter l'index du paragraphe
      globalCursorIndex -= lineStartIndex;
    }

    if (cursorX !== null && cursorY !== null) {
      cursor.draw(this._ctx, cursorX, cursorY, this._fontSize);
    }
  }
}

export default TextRenderer;
