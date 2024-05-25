import { HeadingNode, QuoteNode, registerRichText } from '@lexical/rich-text';
import { mergeRegister } from '@lexical/utils';
import { $createParagraphNode as createParagraphNode, $getRoot as getRoot, $getSelection as getSelection, createEditor, type EditorState, type LexicalEditor, $getNearestNodeFromDOMNode as getNearestNodeFromDOMNode, $isDecoratorNode as isDecoratorNode } from 'lexical';
import { INSERT_YOUTUBE_COMMAND, registerYouTubePlugin, YouTubeNode } from './youtube-plugin.svelte';
import { createEmptyHistoryState, registerHistory } from '@lexical/history';
import { AutoLinkNode } from '@lexical/link';
import { registerAutoLinkPlugin } from './auto-link-plugin';
import { registerPlaceholderPlugin } from './placeholder-plugin.svelte';

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
