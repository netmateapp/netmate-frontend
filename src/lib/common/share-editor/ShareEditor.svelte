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

<div class="virtual-viewport">
  <div class="floating">
    <div class="spacer"></div>
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
                "https://pbs.twimg.com/media/F7kCyCuaEAAMMg1?format=jpg&name=4096x4096",
                "https://pbs.twimg.com/media/F7kCyj3bAAAIJRW?format=jpg&name=4096x4096",
              ])}
          >
            <svg class="icon">
              <use href="/src/lib/assets/common/image.svg#image"></use>
            </svg>
          </button>
          <button class="icon-button">
            <svg class="icon">
              <use href="/src/lib/assets/common/music_note.svg#music_note"
              ></use>
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
  </div>
</div>

<div class="overlay"></div>

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

  :global(a) {
    color: var(--accent-color);
  }

  .virtual-viewport {
    position: fixed;
    overflow-y: scroll;
    width: 100vw;
    left: 50%;
    transform: translate(-50%, 0%);
    height: 100vh;
    z-index: 2;
  }

  .floating {
    display: flex;
    align-items: center;
    flex-direction: column;
    height: 100vh;
  }

  .spacer {
    width: 1px;
    flex: 1 0 0;
    max-height: 35vh;
  }

  .share-editor {
    width: 95%;
    max-width: 63.125rem;
    padding: 0.75rem 0.75rem 0.5rem 0.75rem;
    background-color: var(--dominant-color);
    border-radius: 1rem;
    box-shadow: var(--soft-shadow);
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
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

  ::-webkit-scrollbar {
    width: 0.375rem;
  }

  ::-webkit-scrollbar-thumb {
    background-color: var(--light-gray);
    border-radius: 2rem;
  }

  ::-webkit-scrollbar-thumb:hover {
    background-color: #bebebe;
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
