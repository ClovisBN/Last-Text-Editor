import Paragraph from "./Paragraph";

class TextBuffer {
  constructor() {
    this.paragraphs = [new Paragraph()];
    this.cursorPosition = 0;
  }

  applyStyleToSelection(selection, style) {
    const range = selection.getSelectionRange();
    if (!range) return;

    const {
      paragraphIndex: startParagraphIndex,
      relativeIndex: startRelativeIndex,
    } = this.getParagraphIndexFromGlobal(range.start);

    const {
      paragraphIndex: endParagraphIndex,
      relativeIndex: endRelativeIndex,
    } = this.getParagraphIndexFromGlobal(range.end);

    if (startParagraphIndex === endParagraphIndex) {
      // Apply style within a single paragraph
      this.paragraphs[startParagraphIndex].applyStyleToRange(
        startRelativeIndex,
        endRelativeIndex,
        style
      );
    } else {
      this.paragraphs[startParagraphIndex].applyStyleToRange(
        startRelativeIndex,
        this.paragraphs[startParagraphIndex].getTotalLength(),
        style
      );

      for (let i = startParagraphIndex + 1; i < endParagraphIndex; i++) {
        this.paragraphs[i].applyStyleToRange(
          0,
          this.paragraphs[i].getTotalLength(),
          style
        );
      }

      this.paragraphs[endParagraphIndex].applyStyleToRange(
        0,
        endRelativeIndex,
        style
      );
    }
  }

  getParagraphIndexFromGlobal(globalIndex) {
    let accumulatedLength = 0;
    for (let i = 0; i < this.paragraphs.length; i++) {
      const paragraphLength = this.paragraphs[i].getTotalLength();
      if (globalIndex <= accumulatedLength + paragraphLength) {
        return {
          paragraphIndex: i,
          relativeIndex: globalIndex - accumulatedLength,
        };
      }
      accumulatedLength += paragraphLength + 1;
    }
    const lastParagraph = this.paragraphs[this.paragraphs.length - 1];
    return {
      paragraphIndex: this.paragraphs.length - 1,
      relativeIndex: lastParagraph.getTotalLength(),
    };
  }

  removeEmptyTextRuns() {
    this.paragraphs.forEach((paragraph) => {
      paragraph.removeEmptyTextRuns(this.cursorPosition);
    });
  }

  getGlobalIndexFromParagraphAndElement(paragraphIndex, elementIndex) {
    return (
      this.paragraphs
        .slice(0, paragraphIndex)
        .reduce((acc, p) => acc + p.getTotalLength() + 1, 0) +
      this.paragraphs[paragraphIndex].getElementLengthUpTo(elementIndex)
    );
  }

  setCursorPosition(globalIndex) {
    this.cursorPosition = globalIndex;
  }

  getCursorPosition() {
    return this.cursorPosition;
  }

  insert(char) {
    const { paragraphIndex, relativeIndex } = this.getParagraphIndexFromGlobal(
      this.cursorPosition
    );
    const paragraph = this.paragraphs[paragraphIndex];
    paragraph.insert(char, relativeIndex);
    this.cursorPosition++;
  }

  delete() {
    const { paragraphIndex, relativeIndex } = this.getParagraphIndexFromGlobal(
      this.cursorPosition
    );

    if (this.isParagraphEmpty(paragraphIndex) && paragraphIndex > 0) {
      this.deleteEmptyParagraph(paragraphIndex);
      return;
    }

    if (relativeIndex === 0 && paragraphIndex > 0) {
      this.mergeWithPreviousParagraph(paragraphIndex);
      return;
    }

    if (this.cursorPosition > 0) {
      const paragraph = this.paragraphs[paragraphIndex];
      paragraph.delete(relativeIndex);
      this.cursorPosition--;
    }
  }

  deleteEmptyParagraph(paragraphIndex) {
    if (this.isParagraphEmpty(paragraphIndex)) {
      if (paragraphIndex > 0) {
        this.paragraphs.splice(paragraphIndex, 1);
        this.cursorPosition--;
      } else {
        this.cursorPosition = 0;
      }
    }
  }

  deleteRange(start, end) {
    const {
      paragraphIndex: startParagraphIndex,
      relativeIndex: startRelativeIndex,
    } = this.getParagraphIndexFromGlobal(start);
    const {
      paragraphIndex: endParagraphIndex,
      relativeIndex: endRelativeIndex,
    } = this.getParagraphIndexFromGlobal(end);

    if (startParagraphIndex === endParagraphIndex) {
      const paragraph = this.paragraphs[startParagraphIndex];
      paragraph.deleteRange(startRelativeIndex, endRelativeIndex);
      this.cursorPosition = start;
    } else {
      const startParagraph = this.paragraphs[startParagraphIndex];
      const endParagraph = this.paragraphs[endParagraphIndex];

      startParagraph.deleteFrom(startRelativeIndex);
      endParagraph.deleteUntil(endRelativeIndex);

      if (endParagraphIndex > startParagraphIndex + 1) {
        this.paragraphs.splice(
          startParagraphIndex + 1,
          endParagraphIndex - startParagraphIndex - 1
        );
      }

      startParagraph.mergeWith(endParagraph);
      this.paragraphs.splice(endParagraphIndex, 1);

      this.cursorPosition = start;
    }

    this.removeEmptyTextRuns();
  }

  mergeWithPreviousParagraph(paragraphIndex) {
    const currentParagraph = this.paragraphs[paragraphIndex];
    const previousParagraph = this.paragraphs[paragraphIndex - 1];
    previousParagraph.mergeWith(currentParagraph);
    this.paragraphs.splice(paragraphIndex, 1);
    this.cursorPosition--;
  }

  splitParagraph() {
    const { paragraphIndex, relativeIndex } = this.getParagraphIndexFromGlobal(
      this.cursorPosition
    );
    const paragraph = this.paragraphs[paragraphIndex];
    const newParagraph = paragraph.splitAt(relativeIndex);
    this.paragraphs.splice(paragraphIndex + 1, 0, newParagraph);
    this.cursorPosition += 1;
  }

  isParagraphEmpty(paragraphIndex) {
    return this.paragraphs[paragraphIndex].isEmpty();
  }

  getText() {
    return this.paragraphs.map((paragraph) => paragraph.getText()).join("\n");
  }

  toJSON() {
    let accumulatedLength = 0;

    const content = this.paragraphs.map((paragraph) => {
      const paragraphContent = paragraph.getText();
      const startIndex = accumulatedLength;
      const endIndex = startIndex + paragraphContent.length;

      accumulatedLength = endIndex + 1;

      return {
        startIndex: startIndex,
        endIndex: endIndex,
        paragraph: paragraph.toJSON(),
      };
    });

    return {
      documentTitle: "My Document Title",
      documentId: "123456789",
      body: {
        content: content,
      },
    };
  }
}

export default TextBuffer;
