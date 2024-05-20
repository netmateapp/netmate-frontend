<script lang="ts">
  import { createTranslator } from "$lib/i18n.svelte";
  import { cleanup, toLines } from "./editor";

  const _ = createTranslator("common", "navigation");

  type MaybeTagId = UUIDv7 | null;

  class Tag {
    id: MaybeTagId;
    name: string;
    constructor(id: MaybeTagId, name: string) {
      this.id = id;
      this.name = name;
    }
  }

  let tags: Tag[] = [];

  let tagsDiv: HTMLElement | null = $state(null);

  function updatePlaceholder(element: HTMLElement | null) {
    if (element == null) return;

    console.log(`innerText: "${element.innerText}"`);

    if (element.innerText == "" || element.innerText == "\n") {
      element.innerText = "";
      element.classList.add("is-empty");
      console.log("trim");
    } else {
      element.classList.remove("is-empty");
    }
  }

  /*function handleKeyup(event: KeyboardEvent) {
    if (contentDiv) {
      const inner = contentDiv.innerText;
      if (inner == "" || inner == "\n") setCursorToStart(contentDiv);
    }
  }*/

  function setCursorToStart(element: HTMLElement) {
    const range = document.createRange();
    const sel = window.getSelection();
    if (!sel) return;
    range.setStart(element, 0);
    range.setEnd(element, 0);
    sel.removeAllRanges();
    sel.addRange(range);
  }

  function check(element: HTMLElement | null) {
    if (element == null) return;

    updatePlaceholder(element);
    toLines(element);
  }

  function handlePaste(event: ClipboardEvent) {
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

    // 新しいノードを保持するための DocumentFragment を作成します
    const fragment = document.createDocumentFragment();

    // 各行をループ処理してフラグメントに追加します
    lines.forEach((line, index) => {
      // 行頭の空白とタブを &nbsp; エンティティに置き換えます
      const formattedLine = line.replace(/^\s+/, (match) =>
        match
          .replace(/ /g, "\u00A0")
          .replace(/\t/g, "\u00A0\u00A0\u00A0\u00A0"),
      );
      // テキストと <br> を一緒に追加します
      const div = document.createElement("div");
      div.innerHTML = formattedLine + (index < lines.length - 1 ? "" : "");
      fragment.appendChild(div);
    });

    console.log(fragment.childNodes);
    console.log(fragment.lastChild);

    // 選択範囲の最初の Range を取得します
    const range = selection.getRangeAt(0);

    // フラグメントを現在の Range に挿入します
    range.insertNode(fragment);

    // contenteditable 要素の最後にカーソルを移動します
    const editable = document.getElementsByClassName("content")[0];
    range.setStart(editable, editable.childNodes.length);
    range.collapse(true);

    // 新しい Range を選択します
    selection.removeAllRanges();
    selection.addRange(range);

    if (contentDiv) updatePlaceholder(contentDiv);
  }

  function insertImage() {
    let img = document.createElement("img");
    img.src =
      "https://pbs.twimg.com/media/GOA-20paIAAqkeU?format=jpg&name=900x900";
    contentDiv?.appendChild(img);
  }

  let contentDiv: HTMLElement | null = $state(null);
</script>

<div class="share-editor">
  <div class="tags is-empty" data-placeholder="タグをつける…"></div>
  <div class="separator"></div>
  <div
    bind:this={contentDiv}
    class="content is-empty"
    contenteditable
    data-placeholder="なにかを共有する…"
    onpaste={handlePaste}
    oninput={() => check(contentDiv)}
  ></div>
  <div class="separator"></div>
  <div class="toolbar">
    <div class="left-aligned-tools">
      <button class="icon-button">
        <svg class="icon">
          <use href="/src/lib/assets/common/title.svg#title"></use>
        </svg>
      </button>
      <button class="icon-button" onclick={insertImage}>
        <svg class="icon">
          <use href="/src/lib/assets/common/image.svg#image"></use>
        </svg>
      </button>
      <button class="icon-button">
        <svg class="icon">
          <use href="/src/lib/assets/common/music_note.svg#music_note"></use>
        </svg>
      </button>
      <button class="icon-button">
        <svg class="icon">
          <use href="/src/lib/assets/common/smart_display.svg#smart_display"
          ></use>
        </svg>
      </button>
    </div>
  </div>
</div>

<style>
  .share-editor {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 90%;
    max-width: 63.125rem;
    max-height: 80%;
    padding: 0.75rem 0.75rem 0.5rem 0.75rem;
    border-radius: 1rem;
    background-color: var(--dominant-color);
    box-shadow: var(--soft-shadow);
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
    z-index: 1;
  }

  .content {
    width: 100%;
    white-space: pre-wrap;
    background-color: pink;
  }

  .separator {
    width: 90%;
    height: 0.04188rem;
    background-color: var(--lighter-gray);
  }

  .tags::before,
  .content::before {
    content: attr(data-placeholder);
    color: var(--light-gray);
    font-family: var(--primary-font);
    font-size: 0.9375rem;
    pointer-events: none;
  }

  .tags:not(.is-empty:not(:focus))::before,
  .content:not(.is-empty:not(:focus))::before {
    content: none;
  }

  .left-aligned-tools {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .icon-button {
    width: 2.125rem;
    height: 2.125rem;
    border-radius: 50%;
    fill: var(--secondary-color);
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
  }

  .icon-button:disabled {
    background-color: var(--dominant-color-hover);
    fill: var(--dark-gray);
  }

  .icon-button:hover:not(:disabled) {
    background-color: var(--dominant-color-hover);
  }

  .icon {
    width: 1.5rem;
    height: 1.5rem;
  }
</style>
