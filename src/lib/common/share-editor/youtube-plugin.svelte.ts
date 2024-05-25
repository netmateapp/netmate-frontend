import {
  $insertNodeToNearestRoot as insertNodeToNearestRoot,
  mergeRegister,
} from "@lexical/utils";
import {
  $isNodeSelection as isNodeSelection,
  COMMAND_PRIORITY_EDITOR,
  DecoratorNode,
  createCommand,
  type DOMConversionMap,
  type DOMConversionOutput,
  type DOMExportOutput,
  type EditorConfig,
  type LexicalCommand,
  type LexicalEditor,
  type LexicalNode,
  type NodeKey,
  type SerializedLexicalNode,
  type Spread,
  $getNodeByKey as getNodeByKey,
  $getSelection as getSelection,
  $createNodeSelection as createNodeSelection,
  $setSelection as setSelection,
  $isDecoratorNode as isDecoratorNode,
  CLICK_COMMAND,
  COMMAND_PRIORITY_LOW,
  KEY_BACKSPACE_COMMAND,
  KEY_DELETE_COMMAND,
} from "lexical";
import type { SvelteComponent, ComponentProps } from 'svelte';
import YouTubeEmbed from "./YouTubeEmbed.svelte";

export const INSERT_YOUTUBE_COMMAND: LexicalCommand<string> = createCommand("INSERT_YOUTUBE_COMMAND");

type DecoratorYouTubeType = {
  componentClass: typeof SvelteComponent<any>;
  props: ComponentProps<YouTubeEmbed>;
}

type SerializedYouTubeNode = Spread<
  {
    videoID: string;
  },
  SerializedLexicalNode
>;

const NODE_ATTRIBUTE = "data-lexical-youtube";

// 要修正
function convertYoutubeElement(domNode: HTMLElement): null | DOMConversionOutput {
  const videoId = domNode.getAttribute(NODE_ATTRIBUTE);
  if (videoId) {
    const node = createYouTubeNode(videoId);
    return { node };
  }
  return null;
}

const IDENTITY_ATTRIBUTE = "data-lexical-youtube-key";

export class YouTubeNode extends DecoratorNode<DecoratorYouTubeType> {
  __videoId: string;

  static getType(): string {
    return "youtube";
  }

  static clone(node: YouTubeNode): YouTubeNode {
    return new YouTubeNode(node.__videoId, node.__key);
  }

  constructor(videoId: string, key?: NodeKey) {
    super(key);
    this.__videoId = videoId;
  }

  exportJSON(): SerializedYouTubeNode {
    return {
      ...super.exportJSON(),
      videoID: this.__videoId,
    };
  }

  static importJSON(serializedNode: SerializedYouTubeNode): YouTubeNode {
    const node = createYouTubeNode(serializedNode.videoID);
    return node;
  }

  createElement(): HTMLElement {
    const youtubeEmbed = document.createElement("youtube-embed");
    youtubeEmbed.setAttribute("video-id", this.__videoId);
    youtubeEmbed.setAttribute(NODE_ATTRIBUTE, this.__videoId);
    youtubeEmbed.setAttribute(IDENTITY_ATTRIBUTE, this.__key);
    return youtubeEmbed;
  }

  // このノード固有のDOMを定義(上位クラスがあればsuper呼び出し？)
  exportDOM(): DOMExportOutput {
    return { element: this.createElement() };
  }

  // 要修正
  // このノード固有のDOMを構築
  static importDOM(): DOMConversionMap | null {
    return {
      iframe: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute(NODE_ATTRIBUTE)) {
          return null;
        }
        return {
          conversion: convertYoutubeElement,
          priority: 1,
        };
      },
    };
  }

  updateDOM(): false {
    return false;
  }

  getVideoId(): string {
    return this.__videoId;
  }

  getTextContent(
    _includeInert?: boolean | undefined,
    _includeDirectionless?: false | undefined,
  ): string {
    return `https://www.youtube.com/watch?v=${this.__videoId}`;
  }

  // このノードをDOM化した場合、どうなるか？を書く
  createDOM(_config: EditorConfig): HTMLElement {
    return this.createElement();
  }

  decorate(editor: LexicalEditor, _config: EditorConfig): DecoratorYouTubeType {
    const [isSelected, setSelected, clearSelected] = useLexicalNodeSelection(
      editor,
      this.__key,
    );

    const onDelete = (event: KeyboardEvent) => {
      const type = getSelection()?.getNodes()[0].__type;
      if ((isSelected || type === "youtube") && isNodeSelection(getSelection())) {
        event.preventDefault();
        const node = getNodeByKey(this.__key);
        if (isDecoratorNode(node)) {
          node.remove();
          return true;
        }
      }

      return false;
    };

    $effect.root(() => {
      return mergeRegister(
        editor.registerCommand<MouseEvent>(
          CLICK_COMMAND,
          (event) => {
            const element = event.target;
            if (!element || !(element instanceof HTMLElement)) return false;

            const parent = element.parentNode;
            if (!parent || !(parent instanceof HTMLElement)) return false;

            if (parent.getAttribute(IDENTITY_ATTRIBUTE) === this.__key) {
              event.preventDefault();
              if (!event.shiftKey) {
                clearSelected();
              }

              setSelected(!isSelected);
              return true;
            }

            return false;
          },
          COMMAND_PRIORITY_LOW,
        ),
        editor.registerCommand(
          KEY_DELETE_COMMAND,
          onDelete,
          COMMAND_PRIORITY_LOW,
        ),
        editor.registerCommand(
          KEY_BACKSPACE_COMMAND,
          onDelete,
          COMMAND_PRIORITY_LOW,
        ),
      );
    });

    return {
      componentClass: YouTubeEmbed,
      props: {
        videoId: this.__videoId
      },
    };
  }
}

function isNodeSelected(editor: LexicalEditor, key: NodeKey): boolean {
  return editor.getEditorState().read(() => {
    const node = getNodeByKey(key);

    if (node === null) {
      return false;
    }

    return node.isSelected();
  });
}

const SELECTED_CLASS = "selected";

export function useLexicalNodeSelection(
  _editor: LexicalEditor,
  key: NodeKey,
): [boolean, (_: boolean) => void, () => void] {
  let isSelected = $state(isNodeSelected(_editor, key));

  $effect.root(() => {
    let isMounted = true;
    const unregister = _editor.registerUpdateListener(() => {
      if (isMounted) {
        isSelected = isNodeSelected(_editor, key);
        const element = _editor.getElementByKey(key);
        if (element) {
          if (isSelected) {
            element.classList.add(SELECTED_CLASS);
          } else {
            element.classList.remove(SELECTED_CLASS);
          }
        }
      }
    });

    return () => {
      isMounted = false;
      unregister();
    };
  });

  const setSelected = (selected: boolean) => {
    _editor.update(() => {
      let selection = getSelection();

      if (!isNodeSelection(selection)) {
        selection = createNodeSelection();
        setSelection(selection);
      }

      if (isNodeSelection(selection)) {
        isSelected = selected;
        if (selected) {
          selection.add(key);
        } else {
          selection.delete(key);
        }
      }
    });
  };

  const clearSelected = () => {
    _editor.update(() => {
      const selection = getSelection();

      if (isNodeSelection(selection)) {
        selection.clear();
      }
    });
  };

  return [isSelected, setSelected, clearSelected];
}

export function createYouTubeNode(videoID: string): YouTubeNode {
  return new YouTubeNode(videoID);
}

export function isYouTubeNode(
  node: YouTubeNode | LexicalNode | null | undefined,
): node is YouTubeNode {
  return node instanceof YouTubeNode;
}

export function registerYouTubePlugin(editor: LexicalEditor): () => void {
  return editor.registerCommand(
    INSERT_YOUTUBE_COMMAND,
    (videoId: string) => {
      const youtubeNode = createYouTubeNode(videoId);
      insertNodeToNearestRoot(youtubeNode);
      return true;
    },
    COMMAND_PRIORITY_EDITOR,
  );
}