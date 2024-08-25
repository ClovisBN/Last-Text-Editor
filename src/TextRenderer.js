class TextRenderer {
  constructor(ctx, pageSettings, fontSize = 20) {
    this._ctx = ctx;
    this.pageSettings = pageSettings;

    this._fontSize = fontSize;
    this._lineHeight = fontSize * 1.2;

    this._dpr = window.devicePixelRatio || 1;

    this._initializeCanvas();

    this._ctx.font = `${fontSize}px Arial`;
    this._ctx.textBaseline = "top";
    this._maxWidth = this.pageSettings.contentWidth;
  }

  _initializeCanvas() {
    this._ctx.canvas.width = this.pageSettings.canvasWidth * this._dpr;
    this._ctx.canvas.height = this.pageSettings.canvasHeight * this._dpr;

    this._ctx.canvas.style.width = `${this.pageSettings.canvasWidth}px`;
    this._ctx.canvas.style.height = `${this.pageSettings.canvasHeight}px`;

    this._ctx.scale(this._dpr, this._dpr);
  }

  get lineHeight() {
    return this._lineHeight;
  }

  get fontSize() {
    return this._fontSize;
  }

  wrapText(paragraph) {
    const lines = [];
    const words = paragraph.elements
      .map((element) => {
        // Considérer un `TextRun` valide même si son contenu est vide
        if (element && typeof element.content === "string") {
          return element.content;
        } else {
          console.error("Invalid element found in paragraph: ", element);
          return ""; // Eviter les erreurs si un élément est invalide
        }
      })
      .join("")
      .split(" ");
    let line = "";

    words.forEach((word, index) => {
      let testLine = line + word + " ";
      let testWidth = this._ctx.measureText(testLine).width;

      if (testWidth > this._maxWidth && index > 0) {
        lines.push(line);
        line = word + " ";
      } else {
        line = testLine;
      }
    });

    lines.push(line);
    return lines;
  }

  render(textBuffer, cursor) {
    this._clearCanvas(); // Ensure canvas is cleared before rendering

    let globalCursorIndex = cursor.position;
    let y = this.pageSettings.marginTop;
    let cursorX = null,
      cursorY = null;

    textBuffer.paragraphs.forEach((paragraph) => {
      const lines = this.wrapText(paragraph);
      let lineStartIndex = 0;

      lines.forEach((line) => {
        let xPosition = this.pageSettings.marginLeft;

        for (let k = 0; k < line.length; k++) {
          const char = line[k];
          const { textRun } = this.getTextRunFromLinePosition(
            paragraph,
            lineStartIndex + k
          );

          if (textRun) {
            this._applyTextStyle(textRun.textStyle || {});
          }

          this._ctx.fillText(char, xPosition, y);

          if (
            textRun &&
            textRun.textStyle &&
            textRun.textStyle.textDecoration === "underline"
          ) {
            const charWidth = this._ctx.measureText(char).width;
            this._ctx.beginPath();
            this._ctx.moveTo(xPosition, y + this._fontSize);
            this._ctx.lineTo(xPosition + charWidth, y + this._fontSize);
            this._ctx.strokeStyle = this._ctx.fillStyle;
            this._ctx.lineWidth = 1;
            this._ctx.stroke();
          }

          if (globalCursorIndex === lineStartIndex + k) {
            cursorX = xPosition;
            cursorY = y;
          }

          xPosition += this._ctx.measureText(char).width;
        }

        y += this._lineHeight;
        lineStartIndex += line.length;
      });

      globalCursorIndex -= lineStartIndex;
    });

    if (cursorX !== null && cursorY !== null) {
      cursor.draw(this._ctx, cursorX, cursorY, this._fontSize);
    }
  }

  _applyTextStyle(textStyle) {
    this._ctx.font = `${this._fontSize}px Arial`;

    if (textStyle.fontWeight) {
      this._ctx.font = `${textStyle.fontWeight} ${this._ctx.font}`;
    }
    if (textStyle.fontStyle) {
      this._ctx.font = `${textStyle.fontStyle} ${this._ctx.font}`;
    }
  }

  _clearCanvas() {
    this._ctx.clearRect(
      0,
      0,
      this.pageSettings.canvasWidth,
      this.pageSettings.canvasHeight
    );
  }

  getTextRunFromLinePosition(paragraph, linePosition) {
    let accumulatedLength = 0;
    for (const element of paragraph.elements) {
      const textRunLength = element.content.length;
      if (linePosition < accumulatedLength + textRunLength) {
        return {
          textRun: element,
          runIndex: linePosition - accumulatedLength,
        };
      }
      accumulatedLength += textRunLength;
    }
    return { textRun: null, runIndex: 0 };
  }
}

export default TextRenderer;
