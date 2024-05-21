<script lang="ts">
  import { createTranslator } from "$lib/i18n.svelte";
  import { onInput, handlePaste, printLines } from "./editor";

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

    if (element.innerText == "" || element.innerText == "\n") {
      element.innerText = "";
      element.classList.add("is-empty");
    } else {
      element.classList.remove("is-empty");
    }
  }

  function check(event: InputEvent) {
    if (contentDiv == null) return;

    updatePlaceholder(contentDiv);
    printLines(contentDiv);
    onInput(event, contentDiv);
  }

  function handlePasteWrapper(event: ClipboardEvent) {
    if (contentDiv) {
      handlePaste(event, contentDiv);
      updatePlaceholder(contentDiv);
    }
  }

  function insertImage() {
    let img = document.createElement("img");
    img.src =
      "https://pbs.twimg.com/media/GOA-20paIAAqkeU?format=jpg&name=900x900";
    contentDiv?.appendChild(img);
  }

  let contentDiv: HTMLElement | null = $state(null);
</script>

<div class="overlay"></div>

<div class="share-editor">
  <div class="tags is-empty" data-placeholder="タグをつける…"></div>
  <div class="separator"></div>
  <div
    bind:this={contentDiv}
    class="content is-empty"
    contenteditable
    data-placeholder="なにかを共有する…"
    onpaste={handlePasteWrapper}
    oninput={check}
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
  .overlay {
    position: fixed;
    top: 0px;
    left: 0px;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.1);
    z-index: 1;
  }

  .share-editor {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 90%;
    max-width: 63.125rem;
    max-height: 90%;
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
    overflow: auto;
  }

  :global(.tag, .handle, .share, .link) {
    color: var(--accent-color);
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
