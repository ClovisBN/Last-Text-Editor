import TextRun from "./TextRun";

class Paragraph {
  constructor(elements = null, paragraphStyle = {}) {
    this.elements = elements || [new TextRun()];
    this.paragraphStyle = paragraphStyle;
  }

  applyStyleToRange(startIndex, endIndex, style) {
    let currentIndex = 0;
    const newElements = [];

    for (let element of this.elements) {
      const elementLength = element.content.length;

      if (
        currentIndex + elementLength < startIndex ||
        currentIndex > endIndex
      ) {
        // Element is completely outside the range
        newElements.push(element);
      } else {
        // Element is partially or completely within the range
        const elementStartIndex = Math.max(startIndex - currentIndex, 0);
        const elementEndIndex = Math.min(
          endIndex - currentIndex,
          elementLength
        );

        const styledParts = element.applyStyle(
          elementStartIndex,
          elementEndIndex,
          style
        );
        newElements.push(...styledParts);
      }

      currentIndex += elementLength;
    }

    this.elements = newElements;
  }

  getTotalLength() {
    return this.elements.reduce(
      (acc, element) => acc + (element?.content?.length || 0),
      0
    );
  }

  getElementLengthUpTo(elementIndex) {
    return this.elements
      .slice(0, elementIndex)
      .reduce((acc, element) => acc + (element?.content?.length || 0), 0);
  }

  removeEmptyTextRuns(cursorPosition) {
    this.elements = this.elements.filter(
      (element) =>
        element?.content !== "" || cursorPosition <= element.content.length
    );
    if (this.elements.length === 0) {
      this.elements.push(new TextRun());
    }
  }

  insert(char, relativeIndex) {
    const { textRun, runIndex } =
      this.getTextRunFromRelativeIndex(relativeIndex);
    textRun.insert(char, runIndex);
  }

  delete(relativeIndex) {
    const { textRun, runIndex } =
      this.getTextRunFromRelativeIndex(relativeIndex);
    textRun.delete(runIndex);
  }

  deleteRange(startIndex, endIndex) {
    const { textRun: startTextRun, runIndex: startRunIndex } =
      this.getTextRunFromRelativeIndex(startIndex);
    const { textRun: endTextRun, runIndex: endRunIndex } =
      this.getTextRunFromRelativeIndex(endIndex);
    startTextRun.deleteRange(startRunIndex, endRunIndex);
  }

  deleteFrom(startIndex) {
    const { textRun, runIndex } = this.getTextRunFromRelativeIndex(startIndex);
    textRun.deleteFrom(runIndex);
  }

  deleteUntil(endIndex) {
    const { textRun, runIndex } = this.getTextRunFromRelativeIndex(endIndex);
    textRun.deleteUntil(runIndex);
  }

  mergeWith(nextParagraph) {
    this.elements.push(...nextParagraph.elements);
  }

  splitAt(relativeIndex) {
    const newElements = this.elements.slice();
    const remainingElements = [];
    for (let i = 0; i < newElements.length; i++) {
      if (relativeIndex <= newElements[i].content.length) {
        remainingElements.push(newElements.splice(i)[0].splitAt(relativeIndex));
        break;
      }
      relativeIndex -= newElements[i].content.length;
    }
    return new Paragraph(remainingElements, this.paragraphStyle);
  }

  isEmpty() {
    return this.elements.every((element) => element.content === "");
  }

  getText() {
    return this.elements.map((element) => element.content).join("");
  }

  toJSON() {
    return {
      elements: this.elements.map((element) => element.toJSON()),
      paragraphStyle: this.paragraphStyle,
    };
  }

  getTextRunFromRelativeIndex(relativeIndex) {
    let accumulatedLength = 0;
    for (const element of this.elements) {
      const textRunLength = element.content.length;
      if (relativeIndex <= accumulatedLength + textRunLength) {
        return {
          textRun: element,
          runIndex: relativeIndex - accumulatedLength,
        };
      }
      accumulatedLength += textRunLength;
    }
    return {
      textRun: this.elements[this.elements.length - 1],
      runIndex: this.elements[this.elements.length - 1].content.length,
    };
  }
}

export default Paragraph;
