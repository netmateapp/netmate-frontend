import { countCJKCharacters } from "$lib/cjk";
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
