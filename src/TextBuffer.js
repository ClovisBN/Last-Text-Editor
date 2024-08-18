class TextBuffer {
  constructor() {
    this.paragraphs = [""]; // Stocker chaque paragraphe séparément
    this.cursorPosition = 0; // Index global du curseur
  }

  // Méthode pour obtenir l'index relatif et le paragraphe à partir d'un index global
  getParagraphIndexFromGlobal(globalIndex) {
    let accumulatedLength = 0;
    for (let i = 0; i < this.paragraphs.length; i++) {
      const paragraphLength = this.paragraphs[i].length;
      if (globalIndex <= accumulatedLength + paragraphLength) {
        return {
          paragraphIndex: i,
          relativeIndex: globalIndex - accumulatedLength,
        };
      }
      accumulatedLength += paragraphLength + 1; // +1 pour compter le saut de ligne
    }
    return {
      paragraphIndex: this.paragraphs.length - 1,
      relativeIndex: this.paragraphs[this.paragraphs.length - 1].length,
    };
  }

  // Méthode pour déplacer le curseur à un index global
  setCursorPosition(globalIndex) {
    this.cursorPosition = globalIndex;
  }

  getCursorPosition() {
    return this.cursorPosition;
  }

  // Méthodes pour déplacer le curseur (toujours en termes d'index globaux)
  moveCursorLeft() {
    if (this.cursorPosition > 0) {
      this.cursorPosition--;
    }
  }

  moveCursorRight() {
    if (this.cursorPosition < this.getText().length) {
      this.cursorPosition++;
    }
  }

  moveCursorUp() {
    // Implémenter la logique pour déplacer le curseur vers le haut
    const { paragraphIndex, relativeIndex } = this.getParagraphIndexFromGlobal(
      this.cursorPosition
    );
    if (paragraphIndex > 0) {
      const previousParagraph = this.paragraphs[paragraphIndex - 1];
      const newRelativeIndex = Math.min(
        relativeIndex,
        previousParagraph.length
      );
      this.setCursorPosition(
        this.cursorPosition -
          relativeIndex -
          1 -
          previousParagraph.length +
          newRelativeIndex
      );
    }
  }

  moveCursorDown() {
    // Implémenter la logique pour déplacer le curseur vers le bas
    const { paragraphIndex, relativeIndex } = this.getParagraphIndexFromGlobal(
      this.cursorPosition
    );
    if (paragraphIndex < this.paragraphs.length - 1) {
      const nextParagraph = this.paragraphs[paragraphIndex + 1];
      const newRelativeIndex = Math.min(relativeIndex, nextParagraph.length);
      this.setCursorPosition(
        this.cursorPosition +
          this.paragraphs[paragraphIndex].length +
          1 +
          newRelativeIndex
      );
    }
  }

  insert(char) {
    const { paragraphIndex, relativeIndex } = this.getParagraphIndexFromGlobal(
      this.cursorPosition
    );
    let paragraph = this.paragraphs[paragraphIndex];
    paragraph =
      paragraph.slice(0, relativeIndex) + char + paragraph.slice(relativeIndex);
    this.paragraphs[paragraphIndex] = paragraph;
    this.cursorPosition++;
  }

  delete() {
    if (this.cursorPosition > 0) {
      const { paragraphIndex, relativeIndex } =
        this.getParagraphIndexFromGlobal(this.cursorPosition);
      let paragraph = this.paragraphs[paragraphIndex];
      paragraph =
        paragraph.slice(0, relativeIndex - 1) + paragraph.slice(relativeIndex);
      this.paragraphs[paragraphIndex] = paragraph;
      this.cursorPosition--;
    }
  }

  deleteRange(start, end) {
    let {
      paragraphIndex: startParagraphIndex,
      relativeIndex: startRelativeIndex,
    } = this.getParagraphIndexFromGlobal(start);
    let { paragraphIndex: endParagraphIndex, relativeIndex: endRelativeIndex } =
      this.getParagraphIndexFromGlobal(end);

    if (startParagraphIndex === endParagraphIndex) {
      let paragraph = this.paragraphs[startParagraphIndex];
      this.paragraphs[startParagraphIndex] =
        paragraph.slice(0, startRelativeIndex) +
        paragraph.slice(endRelativeIndex);
    } else {
      let startParagraph = this.paragraphs[startParagraphIndex];
      this.paragraphs[startParagraphIndex] = startParagraph.slice(
        0,
        startRelativeIndex
      );

      let endParagraph = this.paragraphs[endParagraphIndex];
      this.paragraphs[endParagraphIndex] = endParagraph.slice(endRelativeIndex);

      this.paragraphs.splice(
        startParagraphIndex + 1,
        endParagraphIndex - startParagraphIndex - 1
      );
      this.paragraphs[startParagraphIndex] +=
        this.paragraphs[startParagraphIndex + 1];
      this.paragraphs.splice(startParagraphIndex + 1, 1);
    }

    this.cursorPosition = start;
  }

  splitParagraph() {
    const { paragraphIndex, relativeIndex } = this.getParagraphIndexFromGlobal(
      this.cursorPosition
    );
    const paragraph = this.paragraphs[paragraphIndex];
    const beforeCursor = paragraph.slice(0, relativeIndex);
    const afterCursor = paragraph.slice(relativeIndex);

    this.paragraphs[paragraphIndex] = beforeCursor;
    this.paragraphs.splice(paragraphIndex + 1, 0, afterCursor);

    this.cursorPosition++; // Avance d'un caractère global (pour le saut de ligne)
  }

  getText() {
    return this.paragraphs.join("\n"); // Retourne tout le texte comme une seule chaîne avec des sauts de ligne
  }

  toJSON() {
    let accumulatedLength = 0;

    const content = this.paragraphs.map((paragraph, index) => {
      const startIndex = accumulatedLength;
      const endIndex = startIndex + paragraph.length;

      accumulatedLength = endIndex + 1; // +1 pour le saut de ligne entre les paragraphes

      return {
        startIndex: startIndex,
        endIndex: endIndex,
        paragraph: {
          elements: [
            {
              textRun: {
                content: paragraph,
                textStyle: {},
              },
            },
          ],
          paragraphStyle: {},
        },
      };
    });

    const documentStructure = {
      documentTitle: "My Document Title",
      documentId: "123456789",
      body: {
        content: content,
      },
    };
    return documentStructure;
  }
}

export default TextBuffer;
