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
    const { paragraphIndex, relativeIndex } = this.getParagraphIndexFromGlobal(
      this.cursorPosition
    );

    // Vérifie si le paragraphe est vide et le supprime
    if (this.paragraphs[paragraphIndex] === "") {
      this.deleteEmptyParagraph();
      return;
    }

    // Vérifie si le curseur est au début d'un paragraphe non vide
    if (relativeIndex === 0 && paragraphIndex > 0) {
      this.mergeWithPreviousParagraph(paragraphIndex);
      return;
    }

    // Supprime le caractère avant le curseur s'il n'est pas au début du paragraphe
    if (this.cursorPosition > 0) {
      let paragraph = this.paragraphs[paragraphIndex];
      paragraph =
        paragraph.slice(0, relativeIndex - 1) + paragraph.slice(relativeIndex);
      this.paragraphs[paragraphIndex] = paragraph;
      this.cursorPosition--;
    }
  }

  deleteEmptyParagraph() {
    const { paragraphIndex } = this.getParagraphIndexFromGlobal(
      this.cursorPosition
    );
    const globalIndex = this.cursorPosition;
    console.log(paragraphIndex);
    // Vérifiez si le paragraphe est vide
    if (this.paragraphs[paragraphIndex] === "") {
      if (paragraphIndex > 0) {
        this.paragraphs.splice(paragraphIndex, 1);
        this.cursorPosition = globalIndex - 1; // Se déplacer à la fin du paragraphe précédent
      } else {
        // Si c'était le premier paragraphe, placer le curseur au début du texte
        this.cursorPosition = 0;
      }
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

  mergeWithPreviousParagraph(paragraphIndex) {
    const currentParagraph = this.paragraphs[paragraphIndex];
    const previousParagraph = this.paragraphs[paragraphIndex - 1];

    // Déplace le texte du paragraphe actuel à la fin du paragraphe précédent
    this.paragraphs[paragraphIndex - 1] = previousParagraph + currentParagraph;

    // Supprime le paragraphe actuel
    this.paragraphs.splice(paragraphIndex, 1);

    // Met à jour la position du curseur à la fin du texte déplacé
    this.cursorPosition--;
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
