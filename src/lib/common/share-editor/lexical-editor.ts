import { $insertDataTransferForPlainText as insertDataTransferForPlainText, $getHtmlContent as getHtmlContent } from '@lexical/clipboard';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { $shouldOverrideDefaultCharacterSelection as shouldOverrideDefaultCharacterSelection, $moveCharacter as moveCharacter } from '@lexical/selection';
import { $insertNodeToNearestRoot as insertNodeToNearestRoot, IS_IOS, mergeRegister } from '@lexical/utils';
import { $createParagraphNode as createParagraphNode, $getRoot as getRoot, $getSelection as getSelection, $isRangeSelection as isRangeSelection, COMMAND_PRIORITY_EDITOR, CONTROLLED_TEXT_INSERTION_COMMAND, COPY_COMMAND, CUT_COMMAND, DELETE_CHARACTER_COMMAND, DELETE_LINE_COMMAND, DELETE_WORD_COMMAND, DRAGSTART_COMMAND, DROP_COMMAND, INSERT_LINE_BREAK_COMMAND, INSERT_PARAGRAPH_COMMAND, KEY_ARROW_LEFT_COMMAND, KEY_ARROW_RIGHT_COMMAND, KEY_BACKSPACE_COMMAND, KEY_DELETE_COMMAND, KEY_ENTER_COMMAND, PASTE_COMMAND, REMOVE_TEXT_COMMAND, createEditor, type EditorState, type LexicalEditor } from 'lexical';
import { $createYouTubeNode as createYouTubeNode, INSERT_YOUTUBE_COMMAND, YouTubeNode } from './sample-node';

export type InitialEditorStateType = null | string | EditorState | (() => void);

const config = {
  namespace: 'MyEditor',
  nodes: [HeadingNode, QuoteNode, YouTubeNode],
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
  
  registerPlainText(editor);
}

export function dispatchInsertYoutubeCommand() {
  editor.dispatchCommand(INSERT_YOUTUBE_COMMAND, "XUTj1nz94ik");
}

export function registerPlainText(
  editor: LexicalEditor,
  initialEditorState?: InitialEditorStateType,
): () => void {
  const removeListener = mergeRegister(
    editor.registerCommand(
      DELETE_CHARACTER_COMMAND,
      (isBackward: boolean) => {
        const selection = getSelection();
        if (!isRangeSelection(selection)) {
          return false;
        }
        selection.deleteCharacter(isBackward);
        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    ),
    editor.registerCommand(
      DELETE_WORD_COMMAND,
      (isBackward: boolean) => {
        const selection = getSelection();
        if (!isRangeSelection(selection)) {
          return false;
        }
        selection.deleteWord(isBackward);
        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    ),
    editor.registerCommand(
      DELETE_LINE_COMMAND,
      (isBackward: boolean) => {
        const selection = getSelection();
        if (!isRangeSelection(selection)) {
          return false;
        }
        selection.deleteLine(isBackward);
        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    ),
    editor.registerCommand(
      CONTROLLED_TEXT_INSERTION_COMMAND,
      (eventOrText: InputEvent | string) => {
        const selection = getSelection();
        if (!isRangeSelection(selection)) {
          return false;
        }
        if (typeof eventOrText === 'string') {
          selection.insertText(eventOrText);
        } else {
          const dataTransfer = eventOrText.dataTransfer;
          if (dataTransfer != null) {
            insertDataTransferForPlainText(dataTransfer, selection);
          } else {
            const data = eventOrText.data;
            if (data) {
              selection.insertText(data);
            }
          }
        }
        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    ),
    editor.registerCommand(
      REMOVE_TEXT_COMMAND,
      (payload) => {
        const selection = getSelection();
        if (!isRangeSelection(selection)) {
          return false;
        }
        selection.removeText();
        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    ),
    editor.registerCommand(
      INSERT_LINE_BREAK_COMMAND,
      (selectStart: boolean) => {
        const selection = getSelection();
        if (!isRangeSelection(selection)) {
          return false;
        }
        selection.insertLineBreak(selectStart);
        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    ),
    editor.registerCommand(
      INSERT_PARAGRAPH_COMMAND,
      (payload) => {
        const selection = getSelection();
        if (!isRangeSelection(selection)) {
          return false;
        }
        selection.insertLineBreak();
        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    ),
    editor.registerCommand(
      KEY_ARROW_LEFT_COMMAND,
      (payload) => {
        const selection = getSelection();
        if (!isRangeSelection(selection)) {
          return false;
        }
        const event: KeyboardEvent = payload;
        const isHoldingShift = event.shiftKey;
        if (shouldOverrideDefaultCharacterSelection(selection, true)) {
          event.preventDefault();
          moveCharacter(selection, isHoldingShift, true);
          return true;
        }
        return false;
      },
      COMMAND_PRIORITY_EDITOR,
    ),
    editor.registerCommand(
      KEY_ARROW_RIGHT_COMMAND,
      (payload) => {
        const selection = getSelection();
        if (!isRangeSelection(selection)) {
          return false;
        }
        const event: KeyboardEvent = payload;
        const isHoldingShift = event.shiftKey;
        if (shouldOverrideDefaultCharacterSelection(selection, false)) {
          event.preventDefault();
          moveCharacter(selection, isHoldingShift, false);
          return true;
        }
        return false;
      },
      COMMAND_PRIORITY_EDITOR,
    ),
    editor.registerCommand(
      KEY_BACKSPACE_COMMAND,
      (event: KeyboardEvent) => {
        const selection = getSelection();
        if (!isRangeSelection(selection)) {
          return false;
        }
        event.preventDefault();
        return editor.dispatchCommand(DELETE_CHARACTER_COMMAND, true);
      },
      COMMAND_PRIORITY_EDITOR,
    ),
    editor.registerCommand(
      KEY_DELETE_COMMAND,
      (event: KeyboardEvent) => {
        const selection = getSelection();
        if (!isRangeSelection(selection)) {
          return false;
        }
        event.preventDefault();
        return editor.dispatchCommand(DELETE_CHARACTER_COMMAND, false);
      },
      COMMAND_PRIORITY_EDITOR,
    ),
    editor.registerCommand(
      KEY_ENTER_COMMAND,
      (event: KeyboardEvent | null) => {
        const selection = getSelection();
        if (!isRangeSelection(selection)) {
          return false;
        }
        if (event !== null) {
          // If we have beforeinput, then we can avoid blocking
          // the default behavior. This ensures that the iOS can
          // intercept that we're actually inserting a paragraph,
          // and autocomplete, autocapitialize etc work as intended.
          if (IS_IOS) {
            return false;
          }
          event.preventDefault();
        }
        
        // とりあえず第2引数にfalse
        return editor.dispatchCommand(INSERT_LINE_BREAK_COMMAND, false);
      },
      COMMAND_PRIORITY_EDITOR,
    ),
    editor.registerCommand(
      COPY_COMMAND,
      (event: ClipboardEvent) => {
        const selection = getSelection();
        if (!isRangeSelection(selection)) {
          return false;
        }
        onCopyForPlainText(event, editor);
        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    ),
    editor.registerCommand(
      CUT_COMMAND,
      (event: ClipboardEvent) => {
        const selection = getSelection();
        if (!isRangeSelection(selection)) {
          return false;
        }
        onCutForPlainText(event, editor);
        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    ),
    editor.registerCommand(
      PASTE_COMMAND,
      (event: ClipboardEvent) => {
        const selection = getSelection();
        if (!isRangeSelection(selection)) {
          return false;
        }
        onPasteForPlainText(event, editor);
        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    ),
    editor.registerCommand(
      DROP_COMMAND,
      (event: DragEvent) => {
        const selection = getSelection();
        if (!isRangeSelection(selection)) {
          return false;
        }
        // TODO: Make drag and drop work at some point.
        event.preventDefault();
        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    ),
    editor.registerCommand(
      DRAGSTART_COMMAND,
      (event: DragEvent) => {
        const selection = getSelection();
        if (!isRangeSelection(selection)) {
          return false;
        }
        // TODO: Make drag and drop work at some point.
        event.preventDefault();
        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    ),
    editor.registerCommand(
      INSERT_YOUTUBE_COMMAND,
      (videoId: string) => {
        const youtubeNode = createYouTubeNode(videoId);
        console.log(youtubeNode);
        insertNodeToNearestRoot(youtubeNode);
        console.log("register youtube command");
        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    )
  );
  initializeEditor(editor, initialEditorState);
  return removeListener;
}

function onCopyForPlainText(
  event: ClipboardEvent,
  editor: LexicalEditor,
): void {
  event.preventDefault();
  editor.update(() => {
    const clipboardData = event.clipboardData;
    const selection = getSelection();
    if (selection !== null) {
      if (clipboardData != null) {
        const htmlString = getHtmlContent(editor);
        if (htmlString !== null) {
          clipboardData.setData('text/html', htmlString);
        }
        clipboardData.setData('text/plain', selection.getTextContent());
      }
    }
  });
}

function onPasteForPlainText(
  event: ClipboardEvent,
  editor: LexicalEditor,
): void {
  event.preventDefault();
  editor.update(() => {
    const selection = getSelection();
    const clipboardData = event.clipboardData;
    if (clipboardData != null && isRangeSelection(selection)) {
      insertDataTransferForPlainText(clipboardData, selection);
    }
  });
}

function onCutForPlainText(event: ClipboardEvent, editor: LexicalEditor): void {
  onCopyForPlainText(event, editor);
  editor.update(() => {
    const selection = getSelection();
    if (isRangeSelection(selection)) {
      selection.removeText();
    }
  });
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
