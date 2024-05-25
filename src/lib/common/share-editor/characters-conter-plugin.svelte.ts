import { LineBreakNode, TextNode, type LexicalEditor } from "lexical";

let charactersCount = $state(0);

export function getCharactersCount(): number {
  return charactersCount;
}

export function registerCharactersCounterPlugin(editor: LexicalEditor) {
  return editor.registerUpdateListener(({ editorState }) => {
    let count = 0;
    for (var node of editorState._nodeMap.values()) {
      if (node instanceof TextNode) {
        count += node.__text.length;
      } else if (node instanceof LineBreakNode) {
        count += 1;
      }
    }
    charactersCount = count;
  });
}