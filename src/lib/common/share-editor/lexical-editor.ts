import { HeadingNode, QuoteNode, registerRichText } from '@lexical/rich-text';
import { mergeRegister } from '@lexical/utils';
import { $isNodeSelection as isNodeSelection, $createParagraphNode as createParagraphNode, $getRoot as getRoot, $getSelection as getSelection, COMMAND_PRIORITY_EDITOR, createEditor, type EditorState, type LexicalEditor, $isRangeSelection as isRangeSelection, KEY_ARROW_LEFT_COMMAND, TextNode, KEY_ARROW_RIGHT_COMMAND, $getNearestNodeFromDOMNode as getNearestNodeFromDOMNode, $isDecoratorNode as isDecoratorNode } from 'lexical';
import { INSERT_YOUTUBE_COMMAND, registerYouTubePlugin, YouTubeNode } from './youtube-plugin.svelte';
import { createEmptyHistoryState, registerHistory } from '@lexical/history';
import { AutoLinkNode } from '@lexical/link';
import { registerAutoLinkPlugin } from './auto-link-plugin';
import { registerPlaceholderPlugin } from './placeholder-plugin.svelte';
import { $shouldOverrideDefaultCharacterSelection as shouldOverrideDefaultCharacterSelection, $moveCharacter as moveCharacter } from '@lexical/selection';

export type InitialEditorStateType = null | string | EditorState | (() => void);

const config = {
  namespace: 'MyEditor',
  nodes: [HeadingNode, QuoteNode, YouTubeNode, AutoLinkNode],
  onError: console.error
};
const options = {tag: 'history-merge'};
const setEditorOptions: {
  tag?: string,
} = options;
const updateOptions: {
  onUpdate?: () => void,
  skipTransforms?: true,
  tag?: string,
} = options;

let editor: LexicalEditor 

export function init() {
  editor = createEditor(config);

  const contentEditableElement = document.getElementById("editor");
  if (contentEditableElement) editor.setRootElement(contentEditableElement);
  
  register(editor);
  registerHistory(editor, createEmptyHistoryState(), 0);

}

export function isEditorEmpty(): boolean {
  return editor?.getEditorState().isEmpty() ?? true;
}

export function dispatchInsertYoutubeCommand(videoId: string) {
  editor.dispatchCommand(INSERT_YOUTUBE_COMMAND, videoId);
}

export function register(
  editor: LexicalEditor,
  initialEditorState?: InitialEditorStateType,
): () => void {
  const removeListener = mergeRegister(
    registerRichText(editor),
    registerAutoLinkPlugin(editor),
    registerYouTubePlugin(editor),
    registerPlaceholderPlugin(editor),
    editor.registerCommand<KeyboardEvent>(
      KEY_ARROW_LEFT_COMMAND,
      (event) => {
        const selection = getSelection();
        let aaa = selection?.getStartEndPoints()?.[0].getNode();
        console.log("lselect: " + (aaa instanceof TextNode ? aaa?.getTextContent() : "isnt txt"));
        console.log("loffset: " + selection?.getStartEndPoints()?.[0].offset);
        console.log(selection?.isBackward());
        if (isNodeSelection(selection)) {
          // If selection is on a node, let's try and move selection
          // back to being a range selection.
          const nodes = selection.getNodes();
          console.log(nodes);
          if (nodes.length > 0) {
            event.preventDefault();
            nodes[0].selectPrevious();
            return true;
          }
        }
        if (!isRangeSelection(selection)) {
          return false;
        }
        if (shouldOverrideDefaultCharacterSelection(selection, true)) {
          const isHoldingShift = event.shiftKey;
          event.preventDefault();
          moveCharacter(selection, isHoldingShift, true);
          return true;
        }
        return false;
      },
      1,
    ),
    editor.registerCommand<KeyboardEvent>(
      KEY_ARROW_RIGHT_COMMAND,
      (event) => {
        const selection = getSelection();
        let aaa = selection?.getStartEndPoints()?.[0].getNode();
        console.log("rselect: " + (aaa instanceof TextNode ? aaa?.getTextContent() : "isnt txt"));
        console.log("roffset: " + selection?.getStartEndPoints()?.[0].offset);
        console.log(selection?.isBackward());
        if (
          isNodeSelection(selection) &&
          !isTargetWithinDecorator(event.target as HTMLElement)
        ) {
          // If selection is on a node, let's try and move selection
          // back to being a range selection.
          const nodes = selection.getNodes();
          if (nodes.length > 0) {
            event.preventDefault();
            nodes[0].selectNext(0, 0);
            return true;
          }
        }
        if (!isRangeSelection(selection)) {
          return false;
        }
        const isHoldingShift = event.shiftKey;
        if (shouldOverrideDefaultCharacterSelection(selection, false)) {
          event.preventDefault();
          moveCharacter(selection, isHoldingShift, false);
          return true;
        }
        return false;
      },
      COMMAND_PRIORITY_EDITOR,
    )
  );
  initializeEditor(editor, initialEditorState);
  return removeListener;
}

function isTargetWithinDecorator(target: HTMLElement): boolean {
  const node = getNearestNodeFromDOMNode(target);
  return isDecoratorNode(node);
}

function initializeEditor(
  editor: LexicalEditor,
  initialEditorState?: InitialEditorStateType,
): void {
  if (initialEditorState === null) {
    return;
  } else if (initialEditorState === undefined) {
    editor.update(() => {
      const root = getRoot();
      const firstChild = root.getFirstChild();
      if (firstChild === null) {
        const paragraph = createParagraphNode();
        root.append(paragraph);
        const activeElement = document.activeElement;
        if (
          getSelection() !== null ||
          (activeElement !== null && activeElement === editor.getRootElement())
        ) {
          paragraph.select();
        }
      }
    }, updateOptions);
  } else if (initialEditorState !== null) {
    switch (typeof initialEditorState) {
      case 'string': {
        const parsedEditorState = editor.parseEditorState(initialEditorState);
        editor.setEditorState(parsedEditorState, setEditorOptions);
        break;
      }
      case 'object': {
        editor.setEditorState(initialEditorState, setEditorOptions);
        break;
      }
      case 'function': {
        editor.update(initialEditorState, updateOptions);
        break;
      }
    }
  }
}
