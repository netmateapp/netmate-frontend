import { type LexicalEditor, $getSelection as getSelection, $isRangeSelection as isRangeSelection, type RangeSelection, $getRoot as getRoot, KEY_ENTER_COMMAND, COMMAND_PRIORITY_NORMAL, $getNodeByKey as getNodeByKey, $createParagraphNode as createParagraphNode, $isTextNode as isTextNode, $createRangeSelection as createRangeSelection, $setSelection as setSelection } from "lexical";
import { CURSOR_AT_FIRST_LINE_START, HAS_TITLE } from "./ShareEditor.svelte";
import { $isHeadingNode as isHeadingNode, HeadingNode } from "@lexical/rich-text";
import { mergeRegister } from "@lexical/utils";
import { countCJKCharacters } from "$lib/cjk";

export function registerTitlePlugin(editor: LexicalEditor): () => void {
  return mergeRegister(
    registerLineBreakInHeadingNodeListener(editor),
    registerHeadingNodeMutationListener(editor),
    registerHeadingNodeEdit(editor),
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

let headingNodeCount = 0;

// タイトルを使用しているかどうかの把握
// + 割り込みによるタイトル複製(「xx I xx」→ 「xx \n media \n xx」)の防止
function registerHeadingNodeMutationListener(editor: LexicalEditor): () => void {
  return editor.registerMutationListener(HeadingNode, (mutatedNodes) => {
    for (let [nodeKey, mutation] of mutatedNodes) {
      // タイトルをコピーすると、HeadingNodeをコピーすることになる
      // 空のタイトルが存在する状態でHeadingNodeをペーストすると、
      // 空のタイトルが破壊(destroyed)され、ペーストされたHeadingNodeが(created)される
      if (mutation === "created") {
          editor.update(() => {
            const node = getNodeByKey(nodeKey) as HeadingNode;
            if (getRoot().getFirstChild() !== node) {
              const paragraphNode = createParagraphNode();
              paragraphNode.append(...node.getChildren());
              node.replace(paragraphNode); // destroyが呼ばれる
              headingNodeCount++;
              return;
            }
            headingNodeCount++;
            HAS_TITLE.reactiveValue = true;
        });
      }
      else if (mutation === "destroyed") {
        headingNodeCount--;
        if (headingNodeCount == 0) HAS_TITLE.reactiveValue = false;
      }
    }
  });
}

function registerHeadingNodeEdit(editor: LexicalEditor): () => void {
  return editor.registerUpdateListener(() => {
    editor.update(() => {
      limitHeadingNodeLength();
    });
  });
}

const TITLE_MAX_LENGTH = 48;

function limitHeadingNodeLength() {
  const selection = getSelection();
  if (isRangeSelection(selection)) {
    const anchorNode = selection.anchor.getNode();
    const headingNode = isHeadingNode(anchorNode) ? anchorNode : (isHeadingNode(anchorNode.getParent()) ? anchorNode.getParent() : null);
    if (!headingNode) return;

    let textCount = 0;
    for (var child of headingNode.getChildren()) {
      if (!isTextNode(child)) continue;

      const text = child.getTextContent();
      const count = text.length + countCJKCharacters(text);
      if (textCount + count > TITLE_MAX_LENGTH) {
        for (var i = text.length - 1; i > 0; i--) {
          const substr = text.slice(0, i);
          const subcount = substr.length + countCJKCharacters(substr);
          if (textCount + subcount <= TITLE_MAX_LENGTH) {
            child.setTextContent(substr);

            const selection = createRangeSelection();
            const offset = substr.length;
            selection.anchor.set(child.getKey(), offset, "text");
            selection.focus.set(child.getKey(), offset, "text");
            setSelection(selection);
            break;
          }
        }
      }
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
