import { calculateCharactersCosts } from "$lib/cjk.svelte";
import { LineBreakNode, TextNode, type LexicalEditor } from "lexical";

let _charactersCosts = $state(0);

export function charactersCosts(): number {
  return _charactersCosts;
}

const URL_REGEX = /(https?:\/\/)?([a-zA-Z0-9@:%._\+~#=\u00A1-\uFFFF]{1,64}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=*\u00A1-\uFFFF]*))/g;

export function registerCharactersCounterPlugin(editor: LexicalEditor) {
  return editor.registerUpdateListener(({ editorState }) => {
    let charactersCosts = 0;
    for (var node of editorState._nodeMap.values()) {
      if (node instanceof TextNode) {
        const text = node.__text;
        if (URL_REGEX.test(text)) {
          charactersCosts += 16;
        } else {
          charactersCosts += calculateCharactersCosts(text);
        }
      } else if (node instanceof LineBreakNode) {
        charactersCosts += 1;
      }
    }
    _charactersCosts = charactersCosts;
  });
}
