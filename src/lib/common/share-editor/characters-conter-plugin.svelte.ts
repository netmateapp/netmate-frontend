import { LineBreakNode, TextNode, type LexicalEditor } from "lexical";

let charactersCount = $state(0);

export function getCharactersCount(): number {
  return charactersCount;
}

const URL_REGEX = /(https?:\/\/)?([a-zA-Z0-9@:%._\+~#=\u00A1-\uFFFF]{1,64}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=*\u00A1-\uFFFF]*))/g;

export function registerCharactersCounterPlugin(editor: LexicalEditor) {
  return editor.registerUpdateListener(({ editorState }) => {
    let count = 0;
    for (var node of editorState._nodeMap.values()) {
      if (node instanceof TextNode) {
        const text = node.__text;
        if (URL_REGEX.test(text)) {
          count += 16;
        } else {
          // CJKを2倍にカウント
          count += text.length + countCJKCharacters(text);
        }
      } else if (node instanceof LineBreakNode) {
        count += 1;
      }
    }
    charactersCount = count;
  });
}

const CJK_REGEX = /[\u3040-\u309F\u30A0-\u30FF\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF\uFF00-\uFFEF\u1100-\u11FF\uAC00-\uD7AF\u{20000}-\u{2A6DF}\u{2A700}-\u{2B73F}\u{2B740}-\u{2B81F}\u{2B820}-\u{2CEAF}\u{2CEB0}-\u{2EBEF}]/gu;

function countCJKCharacters(text: string): number {
  const matches = text.match(CJK_REGEX);
  return matches ? matches.length : 0;
}
