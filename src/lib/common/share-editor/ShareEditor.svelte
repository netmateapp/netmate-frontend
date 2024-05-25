<script src="lexical-editor.ts" lang="ts">
  import { createTranslator } from "$lib/i18n.svelte";
  import { locale } from "svelte-i18n";
  import { getCharactersCount } from "./characters-conter-plugin.svelte";
  import {
    dispatchInsertSlideCommand,
    dispatchInsertYoutubeCommand,
    init,
    insertHeadingNode,
  } from "./lexical-editor";
  import { canShowPlaceholder } from "./placeholder-plugin.svelte";
  import { get } from "svelte/store";

  const _ = createTranslator("common", "navigation");

  $effect(() => {
    init();
  });

  let videoId = "XUTj1nz94ik";

  function currentCharactersCount(): number {
    return getCharactersCount();
  }

  const CHARACTERS_LIMIT = 20000;

  function isLimitOver(): boolean {
    return currentCharactersCount() > CHARACTERS_LIMIT;
  }

  let isCJKLanguageUsed = $derived(
    ["ja", "ko", "zh-TW"].includes(get(locale) as string),
  );

  function apparentCharactersCount() {
    return Math.trunc(currentCharactersCount() / (isCJKLanguageUsed ? 2 : 1));
  }

  function apparentCharactersLimit() {
    return CHARACTERS_LIMIT / (isCJKLanguageUsed ? 2 : 1);
  }
</script>

<div class="overlay"></div>

<div class="share-editor">
  <div class="tags">
    <div class="placeholder">タグをつける…</div>
  </div>
  <div class="separator"></div>
  <div class="content">
    <div class="editor" id="editor" contenteditable></div>
    <div class="placeholder" hidden={!canShowPlaceholder()}>
      何かを共有する…
    </div>
  </div>
  <div class="separator"></div>
  <div class="toolbar">
    <div class="left-aligned-tools">
      <button class="icon-button" onclick={() => insertHeadingNode()}>
        <svg class="icon">
          <use href="/src/lib/assets/common/title.svg#title"></use>
        </svg>
      </button>
      <button
        class="icon-button"
        onclick={() =>
          dispatchInsertSlideCommand([
            "https://pbs.twimg.com/media/F7kCxiPbYAAM0QU?format=jpg&name=4096x4096",
          ])}
      >
        <svg class="icon">
          <use href="/src/lib/assets/common/image.svg#image"></use>
        </svg>
      </button>
      <button class="icon-button">
        <svg class="icon">
          <use href="/src/lib/assets/common/music_note.svg#music_note"></use>
        </svg>
      </button>
      <button
        class="icon-button"
        onclick={() => dispatchInsertYoutubeCommand(videoId)}
      >
        <svg class="icon">
          <use href="/src/lib/assets/common/smart_display.svg#smart_display"
          ></use>
        </svg>
      </button>
    </div>
    <div class="right-aligned-tools">
      <div class="characters-counter">
        <span class="characters-count" class:limit-over={isLimitOver()}
          >{apparentCharactersCount()}</span
        >
        <span class="characters-limit">/{apparentCharactersLimit()}</span>
      </div>
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

  :global(.yt-container) {
    position: relative;
    width: 100%;
    height: 80vh;
    max-height: 400px;
    display: flex;
    align-items: center;
    flex-direction: column;
  }

  :global(.selected iframe) {
    outline: 2px solid var(--accent-color);
  }

  :global(.yt-container iframe) {
    height: 100%;
    aspect-ratio: 16 / 9;
    border: 0;
  }

  :global(a) {
    color: var(--accent-color);
  }

  :global(.slide-editor) {
    position: relative;
    width: 100%;
    max-height: 31.25rem;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
    align-self: stretch;
  }

  :global(.edit-slide-buttons) {
    position: absolute;
    right: 0rem;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  :global(.edit-slide-button) {
    display: flex;
    width: 3rem;
    height: 3rem;
    padding: 0.5rem;
    justify-content: center;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.4);
    border-radius: 50%;
  }

  :global(.edit-slide-button:hover) {
    background-color: rgba(0, 0, 0, 0.5);
  }

  :global(.edit-slide-button-icon) {
    width: 2rem;
    height: 2rem;
    fill: var(--dominant-color);
  }

  :global(.slide) {
    display: flex;
    max-height: 400px;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    align-self: stretch;
    background-color: red;
  }

  :global(.image) {
    max-width: 100%;
    max-height: 400px;
    object-fit: contain;
    background-color: blue;
  }

  :global(.centered-dots-indicator) {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
    align-self: stretch;
  }

  :global(.dots-indicator) {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
  }

  :global(.dot) {
    width: 0.5rem;
    height: 0.5rem;
    background-color: var(--light-gray);
    border-radius: 50%;
  }

  .share-editor {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 95%;
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

  .tags {
    position: relative;
    width: 100%;
    min-height: 1.25rem;
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .content {
    position: relative;
    width: 100%;
    white-space: pre-wrap;
    overflow: auto;
    scrollbar-width: thin;
    scrollbar-color: #888 #fff;
  }

  .editor {
    width: 100%;
    height: 100%;
  }

  .placeholder {
    position: absolute;
    top: 0px;
    color: var(--light-gray);
    font-family: var(--primary-font);
    font-size: 0.9375rem;
    pointer-events: none;
    white-space: nowrap;
  }

  /* WebKitベースのブラウザ用 */
  .content::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  .content::-webkit-scrollbar-track {
    background: #fff;
  }

  .content::-webkit-scrollbar-thumb {
    background-color: #888;
    border-radius: 10px;
    border: 2px solid #fff;
  }

  .content::-webkit-scrollbar-thumb:hover {
    background-color: #555;
  }

  :global(.tag, .handle, .share, .link) {
    color: var(--accent-color);
  }

  .separator {
    width: 90%;
    height: 0.04188rem;
    background-color: var(--lighter-gray);
  }

  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    align-self: stretch;
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

  .right-aligned-tools {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .characters-counter {
    display: flex;
    align-items: flex-start;
  }

  .characters-count {
    color: var(--light-gray);
    font-family: Roboto;
    font-size: 0.9375rem;
    line-height: 1.25rem;
  }

  .limit-over {
    color: var(--warning-color);
  }

  .characters-limit {
    color: var(--light-gray);
    font-family: Roboto;
    font-size: 0.9375rem;
    line-height: 1.25rem;
  }
</style>
