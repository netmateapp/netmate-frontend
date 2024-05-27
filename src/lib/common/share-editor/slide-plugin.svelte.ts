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

export interface ImagePayload {
  imagesPaths: string[];
}

export type InsertImagePayload = Readonly<ImagePayload>;

export const INSERT_IMAGE_SLIDER_COMMAND: LexicalCommand<InsertImagePayload> = createCommand("INSERT_IMAGE_SLIDER_COMMAND");

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

const NODE_ATTRIBUTE = "data-lexical-image-slider";

// 修正必要?
function convertImageSlideElement(
  domNode: HTMLElement,
): null | DOMConversionOutput {
  const stringSlide = domNode.getAttribute("images-paths");
  if (stringSlide) {
    const node = createSlideNode(ImageSliderData.fromString(stringSlide));
    return { node };
  }
  return null;
}

const IDENTITY_ATTRIBUTE = "data-lexical-image-slider-key";

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
    return "image-slider";
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
      ...super.exportJSON(),
      slide: this.__data,
    };
  }

  static importJSON(serializedNode: SerializedImageSliderNode): ImageSliderNode {
    const node = createSlideNode(serializedNode.slide);
    return node;
  }

  createElement(): HTMLElement {
    const imageSlide = document.createElement("image-slider");
    imageSlide.setAttribute("images-paths", JSON.stringify(this.__data.imagesPaths));
    //imageSlide.setAttribute(NODE_ATTRIBUTE, this.__data.toString());
    imageSlide.setAttribute(IDENTITY_ATTRIBUTE, this.__key);
    return imageSlide;
  }

  exportDOM(): DOMExportOutput {
    return { element: this.createElement() };
  }

  // 修正必要
  static importDOM(): DOMConversionMap | null {
    return {
      iframe: (domNode: HTMLElement) => {
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

  getSlide(): ImageSliderData {
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
      if ((isSelected || type === "image-slider") && isNodeSelection(getSelection())) {
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
      componentClass: ImageSlide,
      props: {
        imagesPaths: this.__data.imagesPaths
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