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

export const INSERT_SLIDE_COMMAND: LexicalCommand<string> = createCommand("INSERT_SLIDE_COMMAND");

type SerializedSlideNode = Spread<
  {
    slide: ImageSlide;
  },
  SerializedLexicalNode
>;

// 修正必要?
function convertSlideElement(
  domNode: HTMLElement,
): null | DOMConversionOutput {
  const stringSlide = domNode.getAttribute("data-lexical-slide");
  if (stringSlide) {
    const node = createSlideNode(ImageSlide.fromString(stringSlide));
    return { node };
  }
  return null;
}

const CONTAINER_CUSTOM_DATA_ATTRIBUTE_NAME = "data-lexical-slide-node-id";

export class ImageSlide {
  imagesPaths: string[] = [];

  constructor(imagePaths: string[]) {
    this.imagesPaths = imagePaths;
  }

  toString(): string {
    return this.imagesPaths.join(",");
  }

  static fromString(stringSlide: string): ImageSlide {
    const imagePaths = stringSlide.split(",");
    return new ImageSlide(imagePaths);
  }
}

export class SlideNode extends DecoratorNode<HTMLElement> {
  __slide: ImageSlide;

  static getType(): string {
    return "slide";
  }

  static clone(node: SlideNode): SlideNode {
    return new SlideNode(node.__slide, node.__key);
  }

  constructor(slide: ImageSlide, key?: NodeKey) {
    super(key);
    this.__slide = slide;
  }

  exportJSON(): SerializedSlideNode {
    return {
      ...super.exportJSON(),
      slide: this.__slide,
    };
  }

  static importJSON(serializedNode: SerializedSlideNode): SlideNode {
    const node = createSlideNode(serializedNode.slide);
    return node;
  }

  createElement(): HTMLElement {
    const container = document.createElement("div");
    container.classList.add("slide-editor");

    const editSlideButtons = document.createElement("div");
    editSlideButtons.classList.add("edit-slide-buttons");

    const addImageButton = document.createElement("div");
    addImageButton.classList.add("edit-slide-button");
    const addSvg = document.createElement("svg");
    addSvg.classList.add("edit-slide-button-icon");
    const addIcon = document.createElement("use");
    addIcon.setAttribute(
      "href",
      "/src/lib/assets/common/add.svg#add",
    );
    addSvg.appendChild(addIcon);
    addImageButton.appendChild(addSvg);
    editSlideButtons.appendChild(addImageButton);
    container.appendChild(editSlideButtons);

    const slide = document.createElement("div");
    slide.classList.add("slide");
    container.appendChild(slide);

    // 修正必要
    const image = document.createElement("img");
    image.classList.add("image");
    image.setAttribute(
      "src",
      "https://pbs.twimg.com/media/F7kCxiPbYAAM0QU?format=jpg&name=4096x4096",
    );
    slide.appendChild(image);

    const centeredDotsIndicator = document.createElement("div");
    centeredDotsIndicator.classList.add("centered-dots-indicator");
    const dotsIndicator = document.createElement("div");
    dotsIndicator.classList.add("dots-indicator");
    for (var i = 0; i < 3; i++) {
      const dot = document.createElement("div");
      dot.classList.add("dot");
      dotsIndicator.appendChild(dot);
    }
    centeredDotsIndicator.appendChild(dotsIndicator);
    container.appendChild(centeredDotsIndicator);
    //container.setAttribute(CONTAINER_CUSTOM_DATA_ATTRIBUTE_NAME, this.__key);

    //element.setAttribute("data-lexical-slide", this.__slide.toString());
    return container;
  }

  exportDOM(): DOMExportOutput {
    return { element: this.createElement() };
  }

  // 修正必要
  static importDOM(): DOMConversionMap | null {
    console.log("run importDOM");
    return {
      iframe: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute("data-lexical-slide")) {
          return null;
        }
        return {
          conversion: convertSlideElement,
          priority: 1,
        };
      },
    };
  }

  updateDOM(): false {
    return false;
  }

  getSlide(): ImageSlide {
    return this.__slide;
  }

  getTextContent(
    _includeInert?: boolean | undefined,
    _includeDirectionless?: false | undefined,
  ): string {
    return `slide-node\n`;
  }

  createDOM(_config: EditorConfig): HTMLElement {
    return this.createElement();
  }

  decorate(editor: LexicalEditor, _config: EditorConfig): HTMLElement {
    const [isSelected, setSelected, clearSelected] = useLexicalNodeSelection(
      editor,
      this.__key,
    );

    const onDelete = (event: KeyboardEvent) => {
      const type = getSelection()?.getNodes()[0].__type;
      if ((isSelected || type === "slide") && isNodeSelection(getSelection())) {
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
            if (element && element instanceof HTMLElement && element.getAttribute(CONTAINER_CUSTOM_DATA_ATTRIBUTE_NAME) === this.__key) {
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
    return this.createElement();
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

export function createSlideNode(slide: ImageSlide): SlideNode {
  return new SlideNode(slide);
}

export function isSlideNode(
  node: SlideNode | LexicalNode | null | undefined,
): node is SlideNode {
  return node instanceof SlideNode;
}

export function registerSlidePlugin(editor: LexicalEditor): () => void {
  return editor.registerCommand(
    INSERT_SLIDE_COMMAND,
    (imagePaths: string) => {
      const slideNode = createSlideNode(ImageSlide.fromString(imagePaths));
      insertNodeToNearestRoot(slideNode);
      return true;
    },
    COMMAND_PRIORITY_EDITOR,
  );
}