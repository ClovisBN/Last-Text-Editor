class CharacterKeyHandler {
  constructor(textBuffer) {
    this.textBuffer = textBuffer;
  }

  handleCharacterKey(char) {
    if (typeof char === "string" && char.length === 1) {
      if (this.textBuffer) {
        this.textBuffer.insert(char);
      } else {
        console.error("TextBuffer is not defined.");
      }
    } else {
      console.error("Invalid character input.");
    }
  }
}

export default CharacterKeyHandler;
