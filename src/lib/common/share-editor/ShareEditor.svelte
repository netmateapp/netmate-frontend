<script src="lexical-editor.ts" lang="ts">
  import { createTranslator } from "$lib/i18n.svelte";
  import { dispatchInsertYoutubeCommand, init } from "./lexical-editor";
  import { canShowPlaceholder } from "./placeholder-plugin.svelte";

  const _ = createTranslator("common", "navigation");

  $effect(() => {
    init();
  });

  let videoId = "XUTj1nz94ik";
</script>

<div class="overlay"></div>

<div class="share-editor">
  <div class="tags">
    <div class="placeholder">タグをつける…</div>
  </div>
  <div class="separator"></div>
  <div class="content">
    <div class="editor" id="editor" contenteditable></div>
    <div class="placeholder" hidden={!canShowPlaceholder()}>何かを共有する…</div>
  </div>
  <div class="separator"></div>
  <div class="toolbar">
    <div class="left-aligned-tools">
      <button class="icon-button">
        <svg class="icon">
          <use href="/src/lib/assets/common/title.svg#title"></use>
        </svg>
      </button>
      <button class="icon-button">
        <svg class="icon">
          <use href="/src/lib/assets/common/image.svg#image"></use>
        </svg>
      </button>
      <button class="icon-button">
        <svg class="icon">
          <use href="/src/lib/assets/common/music_note.svg#music_note"></use>
        </svg>
      </button>
      <button class="icon-button" onclick={() => dispatchInsertYoutubeCommand(videoId)}>
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

  :global(.video-container) {
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

  :global(.video-container iframe) {
    height: 100%;
    aspect-ratio: 16 / 9;
    border: 0;
  }

  :global(a) {
    color: var(--accent-color);
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
