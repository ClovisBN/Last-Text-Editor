class TextBuffer {
  constructor() {
    this.paragraphs = [
      {
        elements: [
          {
            textRun: {
              content: "",
              textStyle: {},
            },
          },
        ],
        paragraphStyle: {},
      },
    ]; // Store each paragraph separately
    this.cursorPosition = 0; // Global cursor position
  }

  // Method to remove empty text runs, except if the cursor is on them
  removeEmptyTextRuns() {
    this.paragraphs.forEach((paragraph, i) => {
      paragraph.elements = paragraph.elements.filter((element, j) => {
        const startPosition = this.getGlobalIndexFromParagraphAndElement(i, j);
        const endPosition = startPosition + element.textRun.content.length;

        return (
          element.textRun.content !== "" ||
          (this.cursorPosition >= startPosition &&
            this.cursorPosition <= endPosition)
        );
      });

      if (paragraph.elements.length === 0) {
        paragraph.elements.push({
          textRun: {
            content: "",
            textStyle: {},
          },
        });
      }
    });
  }

  getGlobalIndexFromParagraphAndElement(paragraphIndex, elementIndex) {
    return (
      this.paragraphs
        .slice(0, paragraphIndex)
        .reduce(
          (acc, p) =>
            acc +
            p.elements.reduce(
              (elAcc, el) => elAcc + el.textRun.content.length,
              0
            ) +
            1,
          0
        ) +
      this.paragraphs[paragraphIndex].elements
        .slice(0, elementIndex)
        .reduce((acc, el) => acc + el.textRun.content.length, 0)
    );
  }

  getParagraphIndexFromGlobal(globalIndex) {
    let accumulatedLength = 0;
    for (let i = 0; i < this.paragraphs.length; i++) {
      const paragraphLength = this.paragraphs[i].elements.reduce(
        (acc, element) => acc + element.textRun.content.length,
        0
      );
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
      relativeIndex: lastParagraph.elements.reduce(
        (acc, element) => acc + element.textRun.content.length,
        0
      ),
    };
  }

  getTextRunFromRelativeIndex(paragraph, relativeIndex) {
    let accumulatedLength = 0;
    for (const element of paragraph.elements) {
      const textRunLength = element.textRun.content.length;
      if (relativeIndex <= accumulatedLength + textRunLength) {
        return {
          textRun: element.textRun,
          runIndex: relativeIndex - accumulatedLength,
        };
      }
      accumulatedLength += textRunLength;
    }
    const lastElement = paragraph.elements[paragraph.elements.length - 1];
    return {
      textRun: lastElement.textRun,
      runIndex: lastElement.textRun.content.length,
    };
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
    const { textRun, runIndex } = this.getTextRunFromRelativeIndex(
      paragraph,
      relativeIndex
    );

    textRun.content =
      textRun.content.slice(0, runIndex) +
      char +
      textRun.content.slice(runIndex);

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
      const { textRun, runIndex } = this.getTextRunFromRelativeIndex(
        paragraph,
        relativeIndex
      );

      textRun.content =
        textRun.content.slice(0, runIndex - 1) +
        textRun.content.slice(runIndex);
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
      // Case where deletion stays within a single paragraph
      const paragraph = this.paragraphs[startParagraphIndex];
      const { textRun: startTextRun, runIndex: startRunIndex } =
        this.getTextRunFromRelativeIndex(paragraph, startRelativeIndex);
      const { textRun: endTextRun, runIndex: endRunIndex } =
        this.getTextRunFromRelativeIndex(paragraph, endRelativeIndex);

      startTextRun.content =
        startTextRun.content.slice(0, startRunIndex) +
        endTextRun.content.slice(endRunIndex);

      this.cursorPosition = start;
    } else {
      // Case where deletion spans multiple paragraphs
      const startParagraph = this.paragraphs[startParagraphIndex];
      const endParagraph = this.paragraphs[endParagraphIndex];

      // 1. Remove partial content from the first paragraph
      const { textRun: startTextRun, runIndex: startRunIndex } =
        this.getTextRunFromRelativeIndex(startParagraph, startRelativeIndex);
      startTextRun.content = startTextRun.content.slice(0, startRunIndex);

      // 2. Remove partial content from the last paragraph
      const { textRun: endTextRun, runIndex: endRunIndex } =
        this.getTextRunFromRelativeIndex(endParagraph, endRelativeIndex);
      endTextRun.content = endTextRun.content.slice(endRunIndex);

      // 3. Remove all paragraphs between the first and the last
      if (endParagraphIndex > startParagraphIndex + 1) {
        this.paragraphs.splice(
          startParagraphIndex + 1,
          endParagraphIndex - startParagraphIndex - 1
        );
      }

      // 4. Merge the remaining content of the last paragraph into the first
      startParagraph.elements.push(...endParagraph.elements);

      // 5. Remove the last paragraph if it is empty after the merge
      this.paragraphs.splice(endParagraphIndex, 1);

      // Update the cursor position
      this.cursorPosition = start;
    }

    // Remove empty text runs in the updated paragraph
    this.removeEmptyTextRuns();
  }

  mergeWithPreviousParagraph(paragraphIndex) {
    const currentParagraph = this.paragraphs[paragraphIndex];
    const previousParagraph = this.paragraphs[paragraphIndex - 1];

    previousParagraph.elements.push(...currentParagraph.elements);
    this.paragraphs.splice(paragraphIndex, 1);

    this.cursorPosition--;
  }

  splitParagraph() {
    const { paragraphIndex, relativeIndex: originalRelativeIndex } =
      this.getParagraphIndexFromGlobal(this.cursorPosition);
    const paragraph = this.paragraphs[paragraphIndex];

    const beforeCursorElements = [];
    const afterCursorElements = [];

    let remainingRelativeIndex = originalRelativeIndex;

    paragraph.elements.forEach((element) => {
      const elementLength = element.textRun.content.length;

      if (remainingRelativeIndex >= elementLength) {
        beforeCursorElements.push(element);
        remainingRelativeIndex -= elementLength;
      } else {
        if (remainingRelativeIndex > 0) {
          beforeCursorElements.push({
            textRun: {
              content: element.textRun.content.slice(0, remainingRelativeIndex),
              textStyle: element.textRun.textStyle,
            },
          });
        }
        if (remainingRelativeIndex < elementLength) {
          afterCursorElements.push({
            textRun: {
              content: element.textRun.content.slice(remainingRelativeIndex),
              textStyle: element.textRun.textStyle,
            },
          });
        }
        remainingRelativeIndex = 0;
      }
    });

    // Ensure there is a textRun in the new paragraph
    if (afterCursorElements.length === 0) {
      afterCursorElements.push({
        textRun: {
          content: "",
          textStyle: {},
        },
      });
    }

    // Update the original paragraph with the elements before the cursor
    this.paragraphs[paragraphIndex].elements = beforeCursorElements;

    // Create a new paragraph with the elements after the cursor
    this.paragraphs.splice(paragraphIndex + 1, 0, {
      elements: afterCursorElements,
      paragraphStyle: paragraph.paragraphStyle,
    });

    // Place the cursor at the beginning of the new paragraph
    this.cursorPosition += 1;
  }

  isParagraphEmpty(paragraphIndex) {
    return this.paragraphs[paragraphIndex].elements.every(
      (element) => element.textRun.content === ""
    );
  }

  getText() {
    return this.paragraphs
      .map((paragraph) =>
        paragraph.elements.map((element) => element.textRun.content).join("")
      )
      .join("\n");
  }

  toJSON() {
    let accumulatedLength = 0;

    const content = this.paragraphs.map((paragraph) => {
      const paragraphContent = paragraph.elements
        .map((element) => element.textRun.content)
        .join("");
      const startIndex = accumulatedLength;
      const endIndex = startIndex + paragraphContent.length;

      accumulatedLength = endIndex + 1;

      return {
        startIndex: startIndex,
        endIndex: endIndex,
        paragraph: paragraph,
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
