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
import SoundCloudEmbed from "./SoundCloudEmbed.svelte";

export const INSERT_SOUNDCLOUD_COMMAND: LexicalCommand<string> = createCommand("INSERT_SOUNDCLOUD_COMMAND");

type DecoratorSoundCloudType = {
  componentClass: typeof SvelteComponent<any>;
  props: ComponentProps<SoundCloudEmbed>;
}

type SerializedSoundCloudNode = Spread<
  {
    trackID: string;
  },
  SerializedLexicalNode
>;

const NODE_ATTRIBUTE = "data-lexical-youtube";

// 要修正
function convertSoundCloudElement(domNode: HTMLElement): null | DOMConversionOutput {
  const trackId = domNode.getAttribute(NODE_ATTRIBUTE);
  if (trackId) {
    const node = createSoundCloudNode(trackId);
    return { node };
  }
  return null;
}

const IDENTITY_ATTRIBUTE = "data-lexical-soundcloud-key";

export class SoundCloudNode extends DecoratorNode<DecoratorSoundCloudType> {
  __trackId: string;

  static getType(): string {
    return "soundcloud";
  }

  static clone(node: SoundCloudNode): SoundCloudNode {
    return new SoundCloudNode(node.__trackId, node.__key);
  }

  constructor(trackId: string, key?: NodeKey) {
    super(key);
    this.__trackId = trackId;
  }

  exportJSON(): SerializedSoundCloudNode {
    return {
      ...super.exportJSON(),
      trackID: this.__trackId,
    };
  }

  static importJSON(serializedNode: SerializedSoundCloudNode): SoundCloudNode {
    const node = createSoundCloudNode(serializedNode.trackID);
    return node;
  }

  createElement(): HTMLElement {
    const soundcloudEmbed = document.createElement("soundcloud-embed");
    soundcloudEmbed.setAttribute("track-id", this.__trackId);
    soundcloudEmbed.setAttribute(NODE_ATTRIBUTE, this.__trackId);
    soundcloudEmbed.setAttribute(IDENTITY_ATTRIBUTE, this.__key);
    return soundcloudEmbed;
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
          conversion: convertSoundCloudElement,
          priority: 1,
        };
      },
    };
  }

  updateDOM(): false {
    return false;
  }

  getVideoId(): string {
    return this.__trackId;
  }

  getTextContent(
    _includeInert?: boolean | undefined,
    _includeDirectionless?: false | undefined,
  ): string {
    return `https://api.soundcloud.com/tracks/${this.__trackId}`;
  }

  // このノードをDOM化した場合、どうなるか？を書く
  createDOM(_config: EditorConfig): HTMLElement {
    return this.createElement();
  }

  decorate(editor: LexicalEditor, _config: EditorConfig): DecoratorSoundCloudType {
    const [isSelected, setSelected, clearSelected] = useLexicalNodeSelection(
      editor,
      this.__key,
    );

    const onDelete = (event: KeyboardEvent) => {
      const type = getSelection()?.getNodes()[0].__type;
      if ((isSelected || type === "soundcloud") && isNodeSelection(getSelection())) {
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
      componentClass: SoundCloudEmbed,
      props: {
        trackId: this.__trackId
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

export function createSoundCloudNode(trackID: string): SoundCloudNode {
  return new SoundCloudNode(trackID);
}

export function isSoundCloudNode(
  node: SoundCloudNode | LexicalNode | null | undefined,
): node is SoundCloudNode {
  return node instanceof SoundCloudNode;
}

export function registerSoundCloudPlugin(editor: LexicalEditor): () => void {
  return editor.registerCommand(
    INSERT_SOUNDCLOUD_COMMAND,
    (trackId: string) => {
      const soundcloudNode = createSoundCloudNode(trackId);
      insertNodeToNearestRoot(soundcloudNode);
      return true;
    },
    COMMAND_PRIORITY_EDITOR,
  );
}