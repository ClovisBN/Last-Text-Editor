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

  applyStyle(startIndex, endIndex, style) {
    // Split the content into three parts: before, within, and after the style range
    const before = this.content.slice(0, startIndex);
    const within = this.content.slice(startIndex, endIndex);
    const after = this.content.slice(endIndex);

    // Create new TextRuns
    const beforeRun = before ? new TextRun(before, this.textStyle) : null;
    const styledRun = new TextRun(within, { ...this.textStyle, ...style });
    const afterRun = after ? new TextRun(after, this.textStyle) : null;

    // Return an array of the new TextRuns
    return [beforeRun, styledRun, afterRun].filter(Boolean);
  }

  toJSON() {
    return {
      textRun: {
        content: this.content,
        textStyle: this.textStyle,
      },
    };
  }
}

export default TextRun;
