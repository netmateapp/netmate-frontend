import { $insertNodeToNearestRoot } from '@lexical/utils';
import {
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
} from 'lexical';

export const INSERT_YOUTUBE_COMMAND: LexicalCommand<string> = createCommand("INSERT_YOUTUBE_COMMAND");

export type SerializedYouTubeNode = Spread<
  {
    videoID: string;
  },
  SerializedLexicalNode
>;

function $convertYoutubeElement(
  domNode: HTMLElement,
): null | DOMConversionOutput {
  const videoID = domNode.getAttribute('data-lexical-youtube');
  if (videoID) {
    const node = $createYouTubeNode(videoID);
    return {node};
  }
  return null;
}

export class YouTubeNode extends DecoratorNode<HTMLElement> {
  __id: string;

  static getType(): string {
    return 'youtube';
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
    const node = $createYouTubeNode(serializedNode.videoID);
    return node;
  }

  createElement(): HTMLElement {
    const container = document.createElement("div");
    container.classList.add("video-container");

    const element = document.createElement('iframe');
    element.setAttribute('data-lexical-youtube', this.__id);
    //element.setAttribute("width", "100%");
    //element.setAttribute("height", "100%");
    //element.setAttribute("max-height", "90vh");
    //element.setAttribute("aspect-ratio", "16 / 9");
    element.setAttribute(
      'src',
      `https://www.youtube-nocookie.com/embed/${this.__id}`,
    );
    element.setAttribute('frameborder', '0');
    element.setAttribute(
      'allow',
      'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
    );
    element.setAttribute('allowfullscreen', 'true');
    element.setAttribute('title', 'YouTube video');

    container.appendChild(element);

    return container;
  }

  exportDOM(): DOMExportOutput {
    return {element: this.createElement()};
  }

  static importDOM(): DOMConversionMap | null {
    return {
      iframe: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute('data-lexical-youtube')) {
          return null;
        }
        return {
          conversion: $convertYoutubeElement,
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
    /*const embedBlockTheme = config.theme.embedBlock || {};
    const className = {
      base: embedBlockTheme.base || '',
      focus: embedBlockTheme.focus || '',
    };*/

    return this.createElement();
  }
}

export function $createYouTubeNode(videoID: string): YouTubeNode {
  return new YouTubeNode(videoID);
}

export function $isYouTubeNode(
  node: YouTubeNode | LexicalNode | null | undefined,
): node is YouTubeNode {
  return node instanceof YouTubeNode;
}

export function registerYouTubePlugin(editor: LexicalEditor): () => void {
  return editor.registerCommand(
    INSERT_YOUTUBE_COMMAND,
    (videoId: string) => {
      const youtubeNode = $createYouTubeNode(videoId);
      $insertNodeToNearestRoot(youtubeNode);
      return true;
    },
    COMMAND_PRIORITY_EDITOR,
  );
}
