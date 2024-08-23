class TextRunManager {
  constructor(textBuffer) {
    this.textBuffer = textBuffer;
  }

  splitTextRun(start, end) {
    const {
      paragraphIndex: startParagraphIndex,
      relativeIndex: startRelativeIndex,
    } = this.textBuffer.getParagraphIndexFromGlobal(start);
    const {
      paragraphIndex: endParagraphIndex,
      relativeIndex: endRelativeIndex,
    } = this.textBuffer.getParagraphIndexFromGlobal(end);

    for (let i = startParagraphIndex; i <= endParagraphIndex; i++) {
      const paragraph = this.textBuffer.paragraphs[i];
      const newElements = [];
      let currentRelativeIndex = 0;

      paragraph.elements.forEach((element) => {
        const { content, textStyle } = element.textRun;
        const elementStartIndex = currentRelativeIndex;
        const elementEndIndex = currentRelativeIndex + content.length;

        if (
          elementEndIndex <= startRelativeIndex ||
          elementStartIndex >= endRelativeIndex
        ) {
          // L'élément est en dehors de la sélection
          newElements.push(element);
        } else {
          if (elementStartIndex < startRelativeIndex) {
            // Partie avant la sélection
            newElements.push({
              textRun: {
                content: content.slice(
                  0,
                  startRelativeIndex - elementStartIndex
                ),
                textStyle: { ...textStyle },
              },
            });
          }

          if (
            elementEndIndex > startRelativeIndex &&
            elementStartIndex < endRelativeIndex
          ) {
            // Partie sélectionnée
            newElements.push({
              textRun: {
                content: content.slice(
                  Math.max(0, startRelativeIndex - elementStartIndex),
                  Math.min(content.length, endRelativeIndex - elementStartIndex)
                ),
                textStyle: { ...textStyle }, // Le style sera ajusté après
              },
            });
          }

          if (elementEndIndex > endRelativeIndex) {
            // Partie après la sélection
            newElements.push({
              textRun: {
                content: content.slice(endRelativeIndex - elementStartIndex),
                textStyle: { ...textStyle },
              },
            });
          }
        }

        currentRelativeIndex += content.length;
      });

      this.textBuffer.paragraphs[i].elements = newElements;
    }
  }

  mergeAdjacentTextRuns() {
    this.textBuffer.paragraphs.forEach((paragraph) => {
      const mergedElements = [];
      let lastElement = null;

      paragraph.elements.forEach((element) => {
        if (
          lastElement &&
          JSON.stringify(lastElement.textRun.textStyle) ===
            JSON.stringify(element.textRun.textStyle)
        ) {
          lastElement.textRun.content += element.textRun.content;
        } else {
          if (lastElement) {
            mergedElements.push(lastElement);
          }
          lastElement = element;
        }
      });

      if (lastElement) {
        mergedElements.push(lastElement);
      }

      paragraph.elements = mergedElements;
    });
  }
}

export default TextRunManager;
