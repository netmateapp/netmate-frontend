import { type LexicalEditor, $getSelection as getSelection, $isRangeSelection as isRangeSelection, type RangeSelection, TextNode, $getRoot as getRoot, ParagraphNode } from "lexical";
import { CURSOR_AT_FIRST_LINE_START } from "./ShareEditor.svelte";

export class CursorPositionObserver {
  private editor: LexicalEditor;
  private isCursorInFirstLine: boolean;
  private listener: (isFirstLine: boolean) => void;

  constructor(editor: LexicalEditor) {
    this.editor = editor;
    this.isCursorInFirstLine = true;
    this.listener = (flag) => {
      CURSOR_AT_FIRST_LINE_START.reactiveValue = flag;
    };
    this.initialize();
  }

  private initialize() {
    this.editor.registerUpdateListener(() => {
      this.checkCursorPosition();
    });
  }

  private checkCursorPosition() {
    this.editor.getEditorState().read(() => {
      const selection = getSelection();
      if (isRangeSelection(selection)) {
        const rangeSelection = selection as RangeSelection;
        const anchorNode = rangeSelection.anchor.getNode();
        const anchorOffset = rangeSelection.anchor.offset;
        const firstLineNode = getRoot().getFirstChild();
        const isInFirstLineStart = (
          firstLineNode &&
          (firstLineNode === anchorNode || firstLineNode.isParentOf(anchorNode)) &&
          anchorOffset === 0 
        ) ?? false;
        if (this.isCursorInFirstLine !== isInFirstLineStart) {
          this.isCursorInFirstLine = isInFirstLineStart;
          this.notifyListeners(isInFirstLineStart);
        }
      }
    });
  }

  private notifyListeners(isFirstLine: boolean) {
    this.listener(isFirstLine);
  }
}

//const cursorObserver = new CursorPositionObserver(editor);

/*cursorObserver.onCursorPositionChange((isFirstLine) => {
  console.log('Cursor is in first line:', isFirstLine);
});*/
