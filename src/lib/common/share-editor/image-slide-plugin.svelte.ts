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
import type { ComponentProps, SvelteComponent } from "svelte";
import ImageSlide from "./ImageSlider.svelte";
import { MAX_MEDIA_COUNT, MEDIA_COUNT } from "./ShareEditor.svelte";
import { toast } from "../toast/useToast.svelte";
import { _ } from "./editor.svelte";

export interface ImagePayload {
  imagesPaths: string[];
}

export type InsertImagePayload = Readonly<ImagePayload>;

export const INSERT_IMAGE_SLIDER_COMMAND: LexicalCommand<InsertImagePayload> = createCommand("INSERT_IMAGE_SLIDER_COMMAND");
export const DELETE_IMAGE_SLIDER_COMMAND: LexicalCommand<string> = createCommand("DELETE_IMAGE_SLIDER_COMMAND");

type DecoratorImageSliderType = {
  componentClass: typeof SvelteComponent<any>;
  props: ComponentProps<ImageSlide>;
}

type SerializedImageSliderNode = Spread<
  {
    slide: ImageSliderData;
  },
  SerializedLexicalNode
>;

const TYPE = "image-slider";
const NODE_ATTRIBUTE = "images-paths";

function convertImageSlideElement(
  domNode: HTMLElement,
): null | DOMConversionOutput {
  const stringSlide = domNode.getAttribute(NODE_ATTRIBUTE);
  if (stringSlide) {
    const node = createSlideNode(JSON.parse(stringSlide));
    return { node };
  }
  return null;
}

export const IDENTITY_ATTRIBUTE = "data-lexical-image-slider-key";

export class ImageSliderData {
  imagesPaths: string[] = [];

  constructor(imagePaths: string[]) {
    this.imagesPaths = imagePaths;
  }

  toString(): string {
    return this.imagesPaths.toString();
  }

  static fromString(imagesPathsStr: string): ImageSliderData {
    const imagePaths: string[] = imagesPathsStr.split(",");
    return new ImageSliderData(imagePaths);
  }
}

export class ImageSliderNode extends DecoratorNode<DecoratorImageSliderType> {
  __data: ImageSliderData;

  static getType(): string {
    return TYPE;
  }

  static clone(node: ImageSliderNode): ImageSliderNode {
    return new ImageSliderNode(node.__data, node.__key);
  }

  constructor(data: ImageSliderData, key?: NodeKey) {
    super(key);
    this.__data = data;
  }

  exportJSON(): SerializedImageSliderNode {
    return {
      type: TYPE,
      version: 1,
      slide: this.__data,
    };
  }

  static importJSON(serializedNode: SerializedImageSliderNode): ImageSliderNode {
    const node = createSlideNode(serializedNode.slide);
    return node;
  }

  createElement(): HTMLElement {
    const imageSlide = document.createElement("image-slider");
    imageSlide.setAttribute(NODE_ATTRIBUTE, JSON.stringify(this.__data.imagesPaths));
    imageSlide.setAttribute("node-key", this.__key);
    imageSlide.setAttribute(IDENTITY_ATTRIBUTE, this.__key);
    return imageSlide;
  }

  exportDOM(): DOMExportOutput {
    return { element: this.createElement() };
  }

  static importDOM(): DOMConversionMap | null {
    return {
      image_slider: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute(NODE_ATTRIBUTE)) {
          return null;
        }
        return {
          conversion: convertImageSlideElement,
          priority: 1,
        };
      },
    };
  }

  updateDOM(): false {
    return false;
  }

  getImageSliderData(): ImageSliderData {
    return this.__data;
  }

  getTextContent(
    _includeInert?: boolean | undefined,
    _includeDirectionless?: false | undefined,
  ): string {
    return this.__data.toString();
  }

  createDOM(_config: EditorConfig): HTMLElement {
    return this.createElement();
  }

  decorate(editor: LexicalEditor, _config: EditorConfig): DecoratorImageSliderType {
    const [isSelected, setSelected, clearSelected] = useLexicalNodeSelection(
      editor,
      this.__key,
    );

    const onDelete = (event: KeyboardEvent) => {
      const type = getSelection()?.getNodes()[0].__type;
      if ((isSelected || type === TYPE) && isNodeSelection(getSelection())) {
        event.preventDefault();
        const node = getNodeByKey(this.__key);
        if (isDecoratorNode(node)) {
          node.remove();
          return true;
        }
      }

      return false;
    };

    const onSelfDelete = (key: string) => {
      if (key !== this.__key) return false;

      const node = getNodeByKey(this.__key);
      if (isDecoratorNode(node)) {
        node.remove();
        return true;
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
        editor.registerCommand(
          DELETE_IMAGE_SLIDER_COMMAND,
          onSelfDelete,
          COMMAND_PRIORITY_EDITOR,
        )
      );
    });

    return {
      componentClass: ImageSlide,
      props: {
        imagesPaths: this.__data.imagesPaths,
        nodeKey: this.__key,
      }
    }
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
        const element = _editor.getElementByKey(key);
        if (element) {
          if (isSelected) {
            element.classList.add("selected");
          } else {
            element.classList.remove("selected");
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

export function createSlideNode(slide: ImageSliderData): ImageSliderNode {
  return new ImageSliderNode(slide);
}

export function isSlideNode(
  node: ImageSliderNode | LexicalNode | null | undefined,
): node is ImageSliderNode {
  return node instanceof ImageSliderNode;
}

export function registerSlidePlugin(editor: LexicalEditor): () => void {
  return mergeRegister(
    registerInsertImageSliderCommand(editor),
    registerImageSliderMutationListener(editor)
  )
}

function registerInsertImageSliderCommand(editor: LexicalEditor): () => void {
  return editor.registerCommand(
    INSERT_IMAGE_SLIDER_COMMAND,
    (payload: InsertImagePayload) => {
      const slideNode = createSlideNode(new ImageSliderData(payload.imagesPaths));
      insertNodeToNearestRoot(slideNode);
      return true;
    },
    COMMAND_PRIORITY_EDITOR,
  );
}

export const IMAGE_SLIDERS_KEYS_TO_IMAGE_SLIDER_DATA = new Map<string, ImageSliderData>();

function registerImageSliderMutationListener(editor: LexicalEditor): () => void {
  return editor.registerMutationListener(ImageSliderNode, (mutatedNodes) => {
    for (var [nodeKey, mutation] of mutatedNodes) {
      if (mutation === "created") {
        editor.update(() => {
          let node = getNodeByKey(nodeKey) as ImageSliderNode;
          let imagesCount = node.getImageSliderData().imagesPaths.length;
          IMAGE_SLIDERS_KEYS_TO_IMAGE_SLIDER_DATA.set(nodeKey, node.getImageSliderData());
          if (MEDIA_COUNT.reactiveValue + imagesCount <= MAX_MEDIA_COUNT) {
            MEDIA_COUNT.reactiveValue += imagesCount;
          } else {
            MEDIA_COUNT.reactiveValue += imagesCount;
            node.remove();
            toast(_("failed-to-paste-image-slider", { limit: MAX_MEDIA_COUNT }));
          }
        });
      } else if (mutation === "destroyed") {
        editor.getEditorState().read(() => {
          let imagesCount = IMAGE_SLIDERS_KEYS_TO_IMAGE_SLIDER_DATA.get(nodeKey)?.imagesPaths.length ?? 0;
          IMAGE_SLIDERS_KEYS_TO_IMAGE_SLIDER_DATA.delete(nodeKey);
          MEDIA_COUNT.reactiveValue -= imagesCount;
        });
      }
    }
  });
}
