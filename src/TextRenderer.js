import PageSettings from "./PageSettings";

class TextRenderer {
  constructor(ctx, pageSettings, fontSize = 20) {
    this._ctx = ctx;
    this.pageSettings = pageSettings; // Utilisation de la classe PageSettings pour les dimensions

    this._fontSize = fontSize;
    this._lineHeight = fontSize * 1.2;

    this._dpr = window.devicePixelRatio || 1;

    this._ctx.canvas.width = this.pageSettings.getCanvasWidth() * this._dpr;
    this._ctx.canvas.height = this.pageSettings.getCanvasHeight() * this._dpr;

    this._ctx.canvas.style.width = `${this.pageSettings.getCanvasWidth()}px`;
    this._ctx.canvas.style.height = `${this.pageSettings.getCanvasHeight()}px`;

    this._ctx.scale(this._dpr, this._dpr);

    this._ctx.font = `${fontSize}px Arial`;
    this._ctx.textBaseline = "top";
    this._maxWidth = this.pageSettings.getContentWidth();
  }

  // Getter pour accéder à la hauteur de ligne
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
    let yPosition = this.pageSettings.getMarginTop(); // Utilisation de la marge supérieure

    for (let i = 0; i < paragraphs.length; i++) {
      const lines = this.wrapText(paragraphs[i]);
      for (let j = 0; j < lines.length; j++) {
        const line = lines[j];
        const lineHeight = this._lineHeight;

        if (y >= yPosition && y < yPosition + lineHeight) {
          let xPosition = this.pageSettings.getMarginLeft(); // Utilisation de la marge gauche

          // Si le clic est à gauche du début de la ligne
          if (x < xPosition) {
            return cursorPosition; // Début de la ligne
          }

          for (let k = 0; k < line.length; k++) {
            const charWidth = this._ctx.measureText(line[k]).width;

            if (x >= xPosition && x < xPosition + charWidth) {
              return cursorPosition + k; // Position exacte dans la ligne
            }
            xPosition += charWidth;
          }

          // Si le clic est à droite de la fin de la ligne
          if (x >= xPosition) {
            return cursorPosition + line.length - 1; // Fin de la ligne
          }
        }

        cursorPosition += line.length;
        yPosition += lineHeight;
      }

      cursorPosition; // Pour le saut de ligne
    }

    return cursorPosition; // Retourne l'index global à la fin du texte si le clic est en dehors de tout texte
  }

  render(textBuffer, cursor) {
    this._ctx.clearRect(
      0,
      0,
      this.pageSettings.getCanvasWidth(),
      this.pageSettings.getCanvasHeight()
    );

    const paragraphs = textBuffer.paragraphs;
    let y = this.pageSettings.getMarginTop(); // Utilisation de la marge supérieure
    let cursorX = null;
    let cursorY = null;
    let globalCursorIndex = cursor.position;

    for (let i = 0; i < paragraphs.length; i++) {
      let paragraph = paragraphs[i];
      const lines = this.wrapText(paragraph);
      let lineStartIndex = 0;

      for (let j = 0; j < lines.length; j++) {
        let line = lines[j];
        this._ctx.fillText(line, this.pageSettings.getMarginLeft(), y); // Utilisation de la marge gauche

        if (
          globalCursorIndex >= lineStartIndex &&
          globalCursorIndex <= lineStartIndex + line.length
        ) {
          cursorX =
            this._ctx.measureText(
              line.substring(0, globalCursorIndex - lineStartIndex)
            ).width + this.pageSettings.getMarginLeft();
          cursorY = y;
        }

        lineStartIndex += line.length;
        y += this._lineHeight;
      }

      globalCursorIndex -= lineStartIndex;
    }

    if (cursorX !== null && cursorY !== null) {
      cursor.draw(this._ctx, cursorX, cursorY, this._fontSize);
    }
  }

  getTotalTextHeight(textBuffer) {
    const paragraphs = textBuffer.paragraphs;
    let totalHeight = 0;

    for (let i = 0; i < paragraphs.length; i++) {
      const lines = this.wrapText(paragraphs[i]);
      totalHeight += lines.length * this._lineHeight;
    }

    return totalHeight + this.pageSettings.getMarginTop(); // Ajouter la marge supérieure
  }
}

export default TextRenderer;
