export function printLines(contentDiv: HTMLElement) {
  console.log("---");
  let content: string[] = [];
  for (var [index, element] of contentDiv.childNodes.entries()) {
    if (element instanceof HTMLImageElement) {
      content[index] = element.src;
    } else if (element instanceof HTMLElement) {
      content[index] = element.innerText;
    } else {
      content[index] = element.textContent ?? "";
    }
  }
  console.log(content);
}

export function onInput(event: InputEvent, contentDiv: HTMLElement) {

  const cursorPosition = saveCursorPosition(contentDiv);

  // IME判定を入れないと日本語が二重に入力される
  if (!event.isComposing) format(contentDiv);

  markupUrls(contentDiv, cursorPosition);

  restoreCursorPosition(contentDiv, cursorPosition);
}

type Content = HTMLElement;

// Contentがネストしない<div>の配列から成るようフォーマットする
export function format(content: Content) {
  for (var childNode of content.childNodes) {
    if (!(childNode instanceof HTMLDivElement)) {
      const div = document.createElement("div");
      div.innerHTML = childNode.textContent ?? "";
      content.replaceChild(div, childNode);
    }
  }
}

class SavedPosition {
  constructor(public nodePath: number[], public offset: number) { }
}

function saveCursorPosition(content: HTMLElement): SavedPosition {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return new SavedPosition([], 0);

  const range = selection.getRangeAt(0);
  const nodePath = [];
  let node: Node | null = range.startContainer;

  while (node && node !== content) {
    let index = 0;
    let sibling = node.previousSibling;
    while (sibling) {
      index++;
      sibling = sibling.previousSibling;
    }
    nodePath.unshift(index);
    node = node.parentNode;
  }

  return new SavedPosition(nodePath, range.startOffset);
}

function restoreCursorPosition(content: HTMLElement, savedPosition: SavedPosition) {
  let node: Node | null = content;

  for (let index of savedPosition.nodePath) {
    if (node && node.childNodes[index]) {
      node = node.childNodes[index];
    } else {
      return;
    }
  }

  if (!node) return;

  const range = document.createRange();
  range.setStart(node, savedPosition.offset);
  range.setEnd(node, savedPosition.offset);

  const selection = window.getSelection();
  if (selection) {
    selection.removeAllRanges();
    selection.addRange(range);
  }
}

function flattenDivsInDiv(content: HTMLElement) {
  let nodes: Node[] = Array.from(content.childNodes);
  for (var node of nodes) {
    let hasDiv = false;
    for (var childNode of node.childNodes) {
      if (childNode instanceof HTMLDivElement) {
        hasDiv = true;
        break;
      }
    }

    if (!hasDiv) continue;

    for (var childNode of node.childNodes) {
      content.insertBefore(childNode, node);
    }
    content.removeChild(node);
  }
}

const URL_PATTERN = /https?:\/\/[^\s/$.?#].[^\s]*/g;

function markupUrls(content: HTMLElement, savedPosition: SavedPosition) {
  for (var [index, line] of content.childNodes.entries()) {
    const nodePath = savedPosition.nodePath.slice();
    let adjustedOffset: number = 0;
    const isSavedPositionIndex = index === nodePath.shift();
    if (isSavedPositionIndex) {
      let inlineOffset = 0;
      let node = line;
      while (nodePath.length > 0) {
        let pos = nodePath.shift() ?? 0;
        for (var i = 0; i < pos; i++) {
          let childNode = node.childNodes[i];
          if (!childNode) continue;
          console.log("childnode: " + childNode);
          if (childNode.nodeType === Node.TEXT_NODE) {
            inlineOffset += childNode.textContent?.length ?? 0;
          } else if (childNode instanceof HTMLElement) {
            inlineOffset += childNode.innerText.length;
          }
        }
        node = node.childNodes[pos];
      }
      inlineOffset += savedPosition.offset;
      adjustedOffset = inlineOffset;
    }

    let isMarkedUp = false;
    let inlineNodes: Node[] = line.hasChildNodes() ? Array.from(line.childNodes) : [line];
    for (var node of inlineNodes) {
      const text = node.textContent;
      if (text) {
        let lastIndex = 0;
        let match: RegExpExecArray | null;
        const fragment = document.createDocumentFragment();

        while ((match = URL_PATTERN.exec(text)) !== null) {
          if (match.index > lastIndex) {
            fragment.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
          }

          const linkSpan = document.createElement("span");
          linkSpan.className = "link";
          linkSpan.textContent = match[0];
          fragment.appendChild(linkSpan);

          lastIndex = match.index + match[0].length;
        }

        if (lastIndex === 0) continue;

        if (lastIndex < text.length) {
          fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
        }

        if (fragment.childNodes.length > 0) {
          node.parentNode?.replaceChild(fragment, node);
          isMarkedUp = true;
        }
      }
    }

    if (isSavedPositionIndex && isMarkedUp) {
      let nodePath: number[] = [index];
      let offset = 0;

      let count = adjustedOffset;
      let node: Node[] = Array.from(line.childNodes);

      let childNodeIndex = 0;
      let childNode = node[childNodeIndex];
      function childNodeLength(): number {
        if (!childNode) return 0;

        if (childNode instanceof HTMLElement) return childNode.innerText.length;
        else if (childNode.nodeType === Node.TEXT_NODE) return childNode.textContent?.length ?? 0;

        return 0;
      }

      while (childNode) {
        if (count - childNodeLength() > 0) {
          count -= childNodeLength();
          childNodeIndex++;
          childNode = node[childNodeIndex];
        } else {
          nodePath.push(childNodeIndex);
          node = Array.from(childNode.childNodes);
          if (node.length > 0) {
            childNodeIndex = 0;
            childNode = node[childNodeIndex];
          } else {
            break;
          }
        }
      }

      if (count > 0) {
        offset = count;
      }

      savedPosition.nodePath = nodePath;
      savedPosition.offset = offset;
    }
  }
}

export function handlePaste(event: ClipboardEvent, contentDiv: HTMLElement) {
  // デフォルトの貼り付け動作を防ぎます
  event.preventDefault();

  // クリップボードからプレーンテキストデータを取得します
  const text = event.clipboardData?.getData("text/plain");
  if (!text) return;

  // 現在の選択範囲を取得します
  const selection = window.getSelection();
  if (!selection?.rangeCount) return;

  // 現在の選択範囲を削除します
  selection.deleteFromDocument();

  // 改行文字でテキストを分割して改行を保持します
  const lines = text.split("\n");

  const isMultipleLines = lines.length > 1;
  let isPastingInEmptyLine: boolean = false;
  let eventTarget = event.target;
  if (eventTarget === contentDiv) {
    isPastingInEmptyLine = true;
  } else if (eventTarget) {
    let target = eventTarget as Element;
    if (target.nodeType === Node.ELEMENT_NODE && target.tagName === "br") {
      isPastingInEmptyLine = true;
    }
  }

  type InserPos = "left" | "middle" | "right" | "none";
  let inPos: InserPos = "none";

  // 非空行に対する複数行貼り付けに関する処理
  if (isMultipleLines && !isPastingInEmptyLine) {
    let currentCursorPosition = saveCursorPosition(contentDiv).offset;
    let target = eventTarget as HTMLElement;
    console.log(target.textContent);
    console.log(`${currentCursorPosition} : ${target.textContent?.length}`);

    // I xxx (左)
    if (currentCursorPosition === 0) {
      inPos = "left";
    } else if (currentCursorPosition === (target.textContent?.length ?? 0)) { // xxx I (右)
      inPos = "right";
    } else { // xx I xx (間)
      inPos = "middle";
    }
  }

  // 新しいノードを保持するための DocumentFragment を作成します
  const fragment = document.createDocumentFragment();

  let lastFragment: Node | null = null;
  let lastFragmentLength = 0;
  let targetInnerTextLength = 0;

  if (isMultipleLines && !isPastingInEmptyLine) {
    const target = eventTarget as HTMLElement;
    if (inPos === "left") {
      const formattedLines = lines.map(line => line.replace(/^\s+/, (match) =>
        match
          .replace(/ /g, "\u00A0")
          .replace(/\t/g, "\u00A0\u00A0\u00A0\u00A0")
        )
      );

      for (var i = 0; i < lines.length - 1; i++) {
        // div要素を作成してテキストを設定
        const div = document.createElement("div");
        div.innerHTML = formattedLines[i];

        fragment.appendChild(div);
      }

      const div = document.createElement("div");
      div.innerHTML = formattedLines[formattedLines.length - 1] + target.innerHTML;

      lastFragment = div;
      lastFragmentLength = formattedLines[formattedLines.length - 1].length;
      targetInnerTextLength = target.innerText.length;

      fragment.appendChild(div);
    } else if (inPos === "right") {
      const formattedLines = lines.map(line => line.replace(/^\s+/, (match) =>
        match
          .replace(/ /g, "\u00A0")
          .replace(/\t/g, "\u00A0\u00A0\u00A0\u00A0")
        )
      );

      const div = document.createElement("div");
      div.innerHTML = target.innerHTML + formattedLines[0];

      fragment.appendChild(div);

      for (var i = 1; i < lines.length; i++) {
        // div要素を作成してテキストを設定
        const div = document.createElement("div");
        div.innerHTML = formattedLines[i];

        fragment.appendChild(div);
      }

      lastFragment = fragment.lastChild;
      lastFragmentLength = formattedLines[lines.length - 1].length;
      targetInnerTextLength = target.innerText.length;
    } else {
      
    }
  } else {
    // 各行をループ処理してフラグメントに追加します
    lines.forEach((line, index) => {
      // 行頭の空白とタブを &nbsp; エンティティに置き換えます
      const formattedLine = line.replace(/^\s+/, (match) =>
        match
          .replace(/ /g, "\u00A0")
          .replace(/\t/g, "\u00A0\u00A0\u00A0\u00A0"),
      );

      // div要素を作成してテキストを設定
      const div = document.createElement("div");
      div.innerHTML = formattedLine;

      // 最後の行でない場合にのみ改行を追加
      if (index < lines.length - 1) {
        fragment.appendChild(div);
      } else {
        // 最後の行の場合、直接テキストを追加
        fragment.appendChild(document.createTextNode(formattedLine));
      }
    });
  }

  // 選択範囲の最初の Range を取得します
  const range = selection.getRangeAt(0);

  // 挿入された最後のノードを取得します
  let lastNode = fragment.lastChild;
  while (lastNode && lastNode.lastChild) {
    lastNode = lastNode.lastChild;
  }

  // フラグメントを現在の Range に挿入します
  
  if(isMultipleLines && !isPastingInEmptyLine && eventTarget instanceof Node) {
    contentDiv.insertBefore(fragment, eventTarget);
  } else {
    range.insertNode(fragment);
  }

  /*
  // カーソルを最後のノードの後に移動します
  if (lastNode) {
    range.setStartAfter(lastNode);
    range.collapse(true);

    // 新しい Range を選択します
    selection.removeAllRanges();
    selection.addRange(range);
  }*/

  if (isMultipleLines && !isPastingInEmptyLine && eventTarget instanceof Node && lastFragment) {
    let rangee = document.createRange();

    if (inPos === "left") {
      const textNode = lastFragment.firstChild;
      if (!textNode || textNode.nodeType !== Node.TEXT_NODE) return;
      rangee.setStart(textNode, lastFragmentLength);
      rangee.setEnd(textNode, lastFragmentLength);
    } else if (inPos === "right") {
      const textNode = lastFragment.lastChild;
      if (!textNode || textNode.nodeType !== Node.TEXT_NODE) return;
      rangee.setStartAfter(textNode);
    } else {

    }

    console.log(rangee);

    rangee.collapse(true);
    // 新しい Range を選択します
    selection.removeAllRanges();
    selection.addRange(rangee);
    contentDiv.removeChild(eventTarget);
  } else if (lastNode) {
    range.setStartAfter(lastNode);
    range.collapse(true);
    // 新しい Range を選択します
    selection.removeAllRanges();
    selection.addRange(range);
  }

  //if(isMultipleLines && !isPastingInEmptyLine && eventTarget instanceof Node) contentDiv.removeChild(eventTarget);
}
