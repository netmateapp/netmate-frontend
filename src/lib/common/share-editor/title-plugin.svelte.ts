import { type LexicalEditor, $getSelection as getSelection, $isRangeSelection as isRangeSelection, type RangeSelection, $getRoot as getRoot, KEY_ENTER_COMMAND, COMMAND_PRIORITY_NORMAL, $getNodeByKey as getNodeByKey, $createParagraphNode as createParagraphNode, $isTextNode as isTextNode, $createRangeSelection as createRangeSelection, $setSelection as setSelection, TextNode, type LexicalNode, $createTextNode as createTextNode } from "lexical";
import { CURSOR_AT_FIRST_LINE_START, HAS_TITLE, TITLE_COSTS_LIMIT } from "./ShareEditor.svelte";
import { $isHeadingNode as isHeadingNode, HeadingNode } from "@lexical/rich-text";
import { mergeRegister } from "@lexical/utils";
import { apparentCharactersCosts, calculateCharactersCosts, countCJKCharacters } from "$lib/cjk.svelte";
import { toast } from "../toast/useToast.svelte";
import { _ } from "./editor.svelte";

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
        if (isHeadingNode(anchorNode)) {
          event.preventDefault();
          return true;
        } else if (isHeadingNode(anchorNode.getParent())) {
          const textNode = anchorNode as TextNode;
          event.preventDefault();
          if (textNode.__text.length > selection.anchor.offset) return true;

          const paragraphNode = createParagraphNode();
          paragraphNode.select();
          anchorNode.getParent()?.insertAfter(paragraphNode);
          return true;
        }
      }
      return false;
    },
    COMMAND_PRIORITY_NORMAL
  );
}

function registerHeadingPasteListener(editor: LexicalEditor): () => void {
  //return editor.registerCommand(
  return () => {};
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

            // 貼り付けや改行などで先頭行以外に生成された場合
            if (getRoot().getFirstChild() !== node) {
              const paragraphNode = createParagraphNode();
              paragraphNode.append(...node.getChildren());
              node.replace(paragraphNode); // destroyが呼ばれる
              headingNodeCount++;
              return;
            } else {
              // 文字数上限を超える貼り付けは削除
              let textCount = 0;
              const selection = getSelection();
              for (var child of node.getChildren()) {
                if (!isTextNode(child)) continue;
          
                const text = child.getTextContent();
                const count = text.length + countCJKCharacters(text);
                if (textCount + count > TITLE_COSTS_LIMIT) {
                  for (var i = text.length - 1; i > 0; i--) {
                    const substr = text.slice(0, i);
                    const subcount = substr.length + countCJKCharacters(substr);
                    if (textCount + subcount <= TITLE_COSTS_LIMIT) {
                      child.setTextContent(substr);
                      setSelection(selection);
                      toast(_("failed-to-paste-title", { limit: apparentCharactersCosts(TITLE_COSTS_LIMIT) }));
                      break;
                    }
                  }
                }
              }
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
      const maybeHeadingNode = getRoot().getFirstChild();
      if (!isHeadingNode(maybeHeadingNode)) return;

      keepNodeOne(maybeHeadingNode);

      const maybeTextNode = maybeHeadingNode.getFirstChild();
      if (!isTextNode(maybeTextNode)) return;
      
      limitTitle(maybeTextNode);

      //limitHeadingNodeLength();
    });
  });
}

// 貼り付け想定：子ノードをテキストノード1つに保つ
function keepNodeOne(node: HeadingNode) {
  const children = node.getChildren();
  if (children.length <= 1) return;

  for (var i = 1; i < children.length; i++) children[i].remove();
  toast(_("failed-to-paste-title", { limit: apparentCharactersCosts(TITLE_COSTS_LIMIT) }));
}

function limitTitle(node: TextNode) {
  let text = node.getTextContent();
  const cost = calculateCharactersCosts(text);
  if (cost <= TITLE_COSTS_LIMIT) return;

  // タイトルは半角のみで記述されても最大48文字
  if (text.length > TITLE_COSTS_LIMIT) {
    text = text.slice(0, 48);
  }

  for (var i = text.length; i > 0; i--) {
    const subtext = text.slice(0, i);
    const subcost = calculateCharactersCosts(subtext);
    if (subcost <= TITLE_COSTS_LIMIT) {
      node.setTextContent(subtext);
      const selection = createRangeSelection();
      const offset = subtext.length;
      selection.anchor.set(node.getKey(), offset, "text");
      selection.focus.set(node.getKey(), offset, "text");
      setSelection(selection);

      toast(_("failed-to-spell-title", { limit: apparentCharactersCosts(TITLE_COSTS_LIMIT) }));
      break;
    }
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
