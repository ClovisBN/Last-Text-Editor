class ToolBarTextStyle {
  constructor(textEditor) {
    this.textEditor = textEditor;
    this.createToolBar();
  }

  createToolBar() {
    const toolbar = document.createElement("div");
    toolbar.id = "textStyleToolbar";
    toolbar.style.position = "fixed";
    toolbar.style.top = "10px";
    toolbar.style.left = "10px";
    toolbar.style.backgroundColor = "#f0f0f0";
    toolbar.style.border = "1px solid #ccc";
    toolbar.style.padding = "5px";
    toolbar.style.borderRadius = "5px";

    // Bouton Gras
    const boldButton = document.createElement("button");
    boldButton.textContent = "Bold";
    boldButton.addEventListener("click", () => this.applyStyle("bold"));
    toolbar.appendChild(boldButton);

    // Bouton Italique
    const italicButton = document.createElement("button");
    italicButton.textContent = "Italic";
    italicButton.addEventListener("click", () => this.applyStyle("italic"));
    toolbar.appendChild(italicButton);

    // Bouton Souligné
    const underlineButton = document.createElement("button");
    underlineButton.textContent = "Underline";
    underlineButton.addEventListener("click", () =>
      this.applyStyle("underline")
    );
    toolbar.appendChild(underlineButton);

    document.body.appendChild(toolbar);
  }

  applyStyle(style) {
    const selectionRange = this.textEditor.selection.getSelectionRange();
    if (!selectionRange) return;

    const { start, end } = selectionRange;

    // Diviser les `textRun` dans la plage de sélection
    this.textEditor.textRunManager.splitTextRun(start, end);

    // Appliquer le style uniquement au texte sélectionné
    for (let i = start; i < end; i++) {
      const { paragraphIndex, relativeIndex } =
        this.textEditor.textBuffer.getParagraphIndexFromGlobal(i);
      const paragraph = this.textEditor.textBuffer.paragraphs[paragraphIndex];
      const { textRun } =
        this.textEditor.textBuffer.getTextRunFromRelativeIndex(
          paragraph,
          relativeIndex
        );

      switch (style) {
        case "bold":
          textRun.textStyle.fontWeight = "bold";
          break;
        case "italic":
          textRun.textStyle.fontStyle = "italic";
          break;
        case "underline":
          textRun.textStyle.textDecoration = "underline";
          break;
      }
    }

    this.textEditor.textRunManager.mergeAdjacentTextRuns();
    this.textEditor.render();
  }
}

export default ToolBarTextStyle;
