import {
  $getNearestBlockElementAncestorOrThrow as getNearestBlockElementAncestorOrThrow,
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
  type ElementFormatType,
  $isRangeSelection as isRangeSelection,
  CLICK_COMMAND,
  COMMAND_PRIORITY_LOW,
  FORMAT_ELEMENT_COMMAND,
  KEY_BACKSPACE_COMMAND,
  KEY_DELETE_COMMAND,
} from "lexical";

export const INSERT_YOUTUBE_COMMAND: LexicalCommand<string> = createCommand(
  "INSERT_YOUTUBE_COMMAND",
);

type SerializedYouTubeNode = Spread<
  {
    videoID: string;
  },
  SerializedLexicalNode
>;

function convertYoutubeElement(
  domNode: HTMLElement,
): null | DOMConversionOutput {
  const videoID = domNode.getAttribute("data-lexical-youtube");
  if (videoID) {
    const node = createYouTubeNode(videoID);
    return { node };
  }
  return null;
}

export class YouTubeNode extends DecoratorNode<HTMLElement> {
  __id: string;

  static getType(): string {
    return "youtube";
  }

  static clone(node: YouTubeNode): YouTubeNode {
    return new YouTubeNode(node.__id, node.__key);
  }

  constructor(id: string, key?: NodeKey) {
    super(key);
    this.__id = id;
  }

  exportJSON(): SerializedYouTubeNode {
    return {
      ...super.exportJSON(),
      videoID: this.__id,
    };
  }

  static importJSON(serializedNode: SerializedYouTubeNode): YouTubeNode {
    const node = createYouTubeNode(serializedNode.videoID);
    return node;
  }

  createElement(): HTMLElement {
    const container = document.createElement("div");
    container.classList.add("yt-container");
    container.setAttribute("data-lexical-youtube-node-id", this.__key);

    const element = document.createElement("iframe");
    element.setAttribute("data-lexical-youtube", this.__id);
    element.setAttribute(
      "src",
      `https://www.youtube-nocookie.com/embed/${this.__id}`,
    );
    element.setAttribute("frameborder", "0");
    element.setAttribute(
      "allow",
      "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
    );
    element.setAttribute("allowfullscreen", "true");
    element.setAttribute("title", "YouTube video");

    container.appendChild(element);

    return container;
  }

  exportDOM(): DOMExportOutput {
    return { element: this.createElement() };
  }

  static importDOM(): DOMConversionMap | null {
    return {
      iframe: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute("data-lexical-youtube")) {
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

  getId(): string {
    return this.__id;
  }

  getTextContent(
    _includeInert?: boolean | undefined,
    _includeDirectionless?: false | undefined,
  ): string {
    return `https://www.youtube.com/watch?v=${this.__id}`;
  }

  createDOM(config: EditorConfig): HTMLElement {
    return this.createElement();
  }

  decorate(_editor: LexicalEditor, config: EditorConfig): HTMLElement {
    const [isSelected, setSelected, clearSelected] = useLexicalNodeSelection(
      _editor,
      this.__key,
    );

    const onDelete = (event: KeyboardEvent) => {
      if (isSelected && isNodeSelection(getSelection())) {
        console.log("delete");
        event.preventDefault();
        const node = getNodeByKey(this.__key);
        if (isDecoratorNode(node)) {
          node.remove();
          return true;
        }
      }

      return false;
    }; //[isSelected, nodeKey]

    $effect.root(() => {
      return mergeRegister(
        _editor.registerCommand<MouseEvent>(
          CLICK_COMMAND,
          (event) => {
            const element = event.target;
            if (element && element instanceof HTMLElement && element.getAttribute("data-lexical-youtube-node-id") === this.__key) {
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
        _editor.registerCommand(
          KEY_DELETE_COMMAND,
          onDelete,
          COMMAND_PRIORITY_LOW,
        ),
        _editor.registerCommand(
          KEY_BACKSPACE_COMMAND,
          onDelete,
          COMMAND_PRIORITY_LOW,
        ),
      );
    }); // [clearSelection, editor, isSelected, nodeKey, $onDelete, setSelected]
    const element = this.createElement();
    element.setAttribute("data-lexical-youtube-node-id", this.__key);
    return element;
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
        const ele = _editor.getElementByKey(key);
        if (ele) {
          if (isSelected) {
            ele.classList.add("selected");
          } else {
            ele.classList.remove("selected");
          }
        }
      }
    });

    return () => {
      isMounted = false;
      unregister();
    };
  }); // [_editor, key];

  const setSelected = (selected: boolean) => {
    _editor.update(() => {
      let selection = getSelection();

      if (!isNodeSelection(selection)) {
        selection = createNodeSelection();
        setSelection(selection);
      }

      if (isNodeSelection(selection)) {
        if (selected) {
          selection.add(key);
        } else {
          selection.delete(key);
        }
      }
    });
  }; // [_editor, key];

  const clearSelected = () => {
    _editor.update(() => {
      const selection = getSelection();

      if (isNodeSelection(selection)) {
        selection.clear();
      }
    });
  }; //[editor];

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