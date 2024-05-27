import { type LexicalEditor, $getSelection as getSelection, $isRangeSelection as isRangeSelection, type RangeSelection, $getRoot as getRoot, KEY_ENTER_COMMAND, COMMAND_PRIORITY_NORMAL, $getNodeByKey as getNodeByKey, $createParagraphNode as createParagraphNode } from "lexical";
import { CURSOR_AT_FIRST_LINE_START, HAS_TITLE } from "./ShareEditor.svelte";
import { $isHeadingNode as isHeadingNode, HeadingNode } from "@lexical/rich-text";
import { mergeRegister } from "@lexical/utils";

export function registerTitlePlugin(editor: LexicalEditor): () => void {
  return mergeRegister(
    registerLineBreakInHeadingNodeListener(editor),
    registerHeadingNodeMutationListener(editor),
  );
}

function registerLineBreakInHeadingNodeListener(editor: LexicalEditor): () => void {
  return editor.registerCommand(
    KEY_ENTER_COMMAND,
    (event: KeyboardEvent) => {
      const selection = getSelection();
      if (isRangeSelection(selection)) {
        const anchorNode = selection.anchor.getNode();
        if (isHeadingNode(anchorNode) ||  isHeadingNode(anchorNode.getParent())) {
          event.preventDefault();
          return true;
        }
      }
      return false;
    },
    COMMAND_PRIORITY_NORMAL
  );
}

function registerHeadingNodeMutationListener(editor: LexicalEditor): () => void {
  return editor.registerMutationListener(HeadingNode, (mutatedNodes) => {
    for (let [nodeKey, mutation] of mutatedNodes) {
      if (mutation === "created") {
        if (HAS_TITLE.reactiveValue) {
          editor.update(() => {
            const node = getNodeByKey(nodeKey) as HeadingNode;
            const paragraphNode = createParagraphNode();
            paragraphNode.append(...node.getChildren());
            node.replace(paragraphNode);
          });
          continue;
        }
        HAS_TITLE.reactiveValue = true;
      }
      else if (mutation === "destroyed") HAS_TITLE.reactiveValue = false;
    }
  });
}

const TITLE_MAX_LENGTH = 48;

function checkHeadingNodeLimit(editor: LexicalEditor) {
  const selection = getSelection();
  if (isRangeSelection(selection)) {
    const anchorNode = selection.anchor.getNode();
    const headingNode = isHeadingNode(anchorNode) ? anchorNode : (isHeadingNode(anchorNode.getParent()) ? anchorNode.getParent() : null);
    if (!headingNode) return;


    for (var child of headingNode.getChildren()) {
      
    }

    /*headingNode.forEachDescendant((descendant) => {
      if ($isTextNode(descendant)) {
        textContent += (descendant as TextNode).getTextContent();
      }
    });

    if (textContent.length > HEADING_NODE_MAX_LENGTH) {
      // 文字数を上限まで制限する
      parentNode.getChildren().forEach((child) => {
        if ($isTextNode(child)) {
          const textNode = child as TextNode;
          const text = textNode.getTextContent();
          if (text.length > HEADING_NODE_MAX_LENGTH) {
            textNode.setTextContent(text.substring(0, HEADING_NODE_MAX_LENGTH));
          } else {
            textNode.setTextContent(text);
          }
        }
      });
    }
  }*/
  }
}

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
