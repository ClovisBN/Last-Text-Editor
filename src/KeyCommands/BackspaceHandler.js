class BackspaceHandler {
  constructor(textBuffer) {
    this.textBuffer = textBuffer;
  }

  handleBackspace() {
    if (this.textBuffer) {
      this.textBuffer.delete();
    } else {
      console.error("TextBuffer is not defined.");
    }
  }
}

export default BackspaceHandler;
