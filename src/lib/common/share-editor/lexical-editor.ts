import { $createHeadingNode as createHeadingNode, HeadingNode, registerRichText } from '@lexical/rich-text';
import { CAN_USE_BEFORE_INPUT, IS_APPLE_WEBKIT, IS_IOS, IS_SAFARI, mergeRegister } from '@lexical/utils';
import { $createParagraphNode as createParagraphNode, $getRoot as getRoot, $getSelection as getSelection, createEditor, type EditorState, type LexicalEditor, $isRangeSelection as isRangeSelection, INSERT_LINE_BREAK_COMMAND, KEY_ENTER_COMMAND, COMMAND_PRIORITY_LOW, $createTextNode as createTextNode } from 'lexical';
import { INSERT_YOUTUBE_COMMAND, registerYouTubePlugin, YouTubeNode } from './youtube-plugin.svelte';
import { createEmptyHistoryState, registerHistory } from '@lexical/history';
import { AutoLinkNode } from '@lexical/link';
import { registerAutoLinkPlugin } from './auto-link-plugin';
import { registerPlaceholderPlugin } from './placeholder-plugin.svelte';
import { registerCharactersCounterPlugin } from './characters-conter-plugin.svelte';
import { INSERT_IMAGE_SLIDER_COMMAND, registerSlidePlugin, ImageSliderNode } from './slide-plugin.svelte';

export type InitialEditorStateType = null | string | EditorState | (() => void);

const config = {
  namespace: 'MyEditor',
  nodes: [HeadingNode, YouTubeNode, AutoLinkNode, ImageSliderNode],
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

export function dispatchInsertYoutubeCommand(videoId: string) {
  editor.dispatchCommand(INSERT_YOUTUBE_COMMAND, videoId);
}

export function dispatchInsertSlideCommand(imagePaths: string[]) {
  editor.dispatchCommand(INSERT_IMAGE_SLIDER_COMMAND, imagePaths.toString());
}

export function insertHeadingNode() {
  const root = getRoot();

  const heading = createHeadingNode("h1");
  heading.append(createTextNode(""));
  root.append(heading);
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
    registerCharactersCounterPlugin(editor),
    registerEnterListener(editor),
    registerSlidePlugin(editor),
  );
  initializeEditor(editor, initialEditorState);
  return removeListener;
}

// 改行と改段落の統一
function registerEnterListener(editor: LexicalEditor) {
  return editor.registerCommand<KeyboardEvent | null>(
    KEY_ENTER_COMMAND,
    (event) => {
      const selection = getSelection();
      if (!isRangeSelection(selection)) {
        return false;
      }
      if (event !== null) {
        // beforeinputイベントが利用できる場合、デフォルトの動作をブロックせずに済みます。
        // これにより、iOSが段落を挿入していることを正しく認識し、
        // オートコンプリートやオートキャピタライズなどが意図した通りに動作することが保証されます。
        // しかし、これによりSafariで奇妙なパフォーマンスの問題が発生する可能性もあります。
        // 具体的には、Enterキーの押下を防ぐことによる明らかな遅延が生じることがあります。
        if (
          (IS_IOS || IS_SAFARI || IS_APPLE_WEBKIT) &&
          CAN_USE_BEFORE_INPUT
        ) {
          return false;
        }
        event.preventDefault();
        /*if (event.shiftKey) {
          return editor.dispatchCommand(INSERT_LINE_BREAK_COMMAND, false);
        }*/
      }
      return editor.dispatchCommand(INSERT_LINE_BREAK_COMMAND, false);
    },
    COMMAND_PRIORITY_LOW,
  );
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
