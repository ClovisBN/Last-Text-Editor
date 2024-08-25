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
      .map((element) => element.content)
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

          this._ctx.fillText(char, xPosition, y);

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
