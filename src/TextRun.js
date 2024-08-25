class TextRun {
  constructor(content = "", textStyle = {}) {
    this.content = content;
    this.textStyle = textStyle;
  }

  insert(char, index) {
    this.content =
      this.content.slice(0, index) + char + this.content.slice(index);
  }

  delete(index) {
    if (index > 0) {
      this.content =
        this.content.slice(0, index - 1) + this.content.slice(index);
    }
  }

  deleteRange(startIndex, endIndex) {
    this.content =
      this.content.slice(0, startIndex) + this.content.slice(endIndex);
  }

  deleteFrom(startIndex) {
    this.content = this.content.slice(0, startIndex);
  }

  deleteUntil(endIndex) {
    this.content = this.content.slice(endIndex);
  }

  splitAt(index) {
    const remainingContent = this.content.slice(index);
    this.content = this.content.slice(0, index);
    return new TextRun(remainingContent, this.textStyle);
  }

  toJSON() {
    return {
      content: this.content,
      textStyle: this.textStyle,
    };
  }
}

export default TextRun;
