class EnterKeyHandler {
  constructor(textBuffer) {
    this.textBuffer = textBuffer;
  }

  handleEnterKey() {
    if (this.textBuffer) {
      this.textBuffer.splitParagraph();
    } else {
      console.error("TextBuffer is not defined.");
    }
  }
}

export default EnterKeyHandler;
