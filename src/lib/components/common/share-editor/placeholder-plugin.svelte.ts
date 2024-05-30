import { $canShowPlaceholderCurry as canShowPlaceholderCurry } from "@lexical/text";
import { mergeRegister } from "@lexical/utils";
import type { LexicalEditor } from "lexical";

let _canShowPlaceholder = $state(true);

export function canShowContentPlaceholder(): boolean {
  return _canShowPlaceholder;
}

function canShowPlaceholderFromCurrentEditorState(editor: LexicalEditor): boolean {
  const currentCanShowPlaceholder = editor
    .getEditorState()
    .read(canShowPlaceholderCurry(editor.isComposing()));
  return currentCanShowPlaceholder;
}

function resetCanShowPlaceholder(editor: LexicalEditor) {
  const currentCanShowPlaceholder = canShowPlaceholderFromCurrentEditorState(editor);
  _canShowPlaceholder = currentCanShowPlaceholder;
}

export function registerPlaceholderPlugin(editor: LexicalEditor) {
  return mergeRegister(
    editor.registerUpdateListener(() => {
      resetCanShowPlaceholder(editor);
    }),
    editor.registerEditableListener(() => {
      resetCanShowPlaceholder(editor);
    }),
  );
}