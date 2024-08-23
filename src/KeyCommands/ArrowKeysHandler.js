class ArrowKeysHandler {
  constructor(textBuffer) {
    this.textBuffer = textBuffer;
  }

  moveCursorLeft() {
    if (!this.textBuffer) {
      console.error("TextBuffer is not defined.");
      return;
    }

    if (this.textBuffer.cursorPosition > 0) {
      this.textBuffer.cursorPosition--;
    }
  }

  moveCursorRight() {
    if (!this.textBuffer) {
      console.error("TextBuffer is not defined.");
      return;
    }

    if (this.textBuffer.cursorPosition < this.textBuffer.getText().length) {
      this.textBuffer.cursorPosition++;
    }
  }

  moveCursorUp() {
    if (!this.textBuffer) {
      console.error("TextBuffer is not defined.");
      return;
    }

    const { paragraphIndex, relativeIndex } =
      this.textBuffer.getParagraphIndexFromGlobal(
        this.textBuffer.cursorPosition
      );

    if (paragraphIndex > 0) {
      const previousParagraph = this.textBuffer.paragraphs[paragraphIndex - 1];
      const previousParagraphLength = previousParagraph.elements.reduce(
        (acc, element) => acc + element.textRun.content.length,
        0
      );
      const newRelativeIndex = Math.min(relativeIndex, previousParagraphLength);

      this.textBuffer.setCursorPosition(
        this.textBuffer.cursorPosition - relativeIndex - 1 + newRelativeIndex
      );
    }
  }

  moveCursorDown() {
    if (!this.textBuffer) {
      console.error("TextBuffer is not defined.");
      return;
    }

    const { paragraphIndex, relativeIndex } =
      this.textBuffer.getParagraphIndexFromGlobal(
        this.textBuffer.cursorPosition
      );

    if (paragraphIndex < this.textBuffer.paragraphs.length - 1) {
      const nextParagraph = this.textBuffer.paragraphs[paragraphIndex + 1];
      const nextParagraphLength = nextParagraph.elements.reduce(
        (acc, element) => acc + element.textRun.content.length,
        0
      );
      const newRelativeIndex = Math.min(relativeIndex, nextParagraphLength);

      this.textBuffer.setCursorPosition(
        this.textBuffer.cursorPosition +
          1 +
          this.textBuffer.paragraphs[paragraphIndex].elements.reduce(
            (acc, element) => acc + element.textRun.content.length,
            0
          ) +
          newRelativeIndex
      );
    }
  }
}

export default ArrowKeysHandler;
