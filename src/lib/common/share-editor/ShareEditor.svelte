<script lang="ts" context="module">
  // メディア関連
  export const MAX_MEDIA_COUNT = 4;
  export const MEDIA_COUNT = new ReactiveStore(0);
</script>

<script src="lexical-editor.ts" lang="ts">
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
  import { ReactiveStore } from "$lib/stores.svelte";
    import YouTubeLinkDialog from "./YouTubeLinkDialog.svelte";

  $effect(() => {
    init();
  });

  let videoId = "XUTj1nz94ik";

  let shareEditorRef: MaybeHTMLElement = $state(null);
  export function getShareEditorRef(): MaybeHTMLElement {
    return shareEditorRef;
  }

  // 文字数カウンター関連
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

  // ドラッグによるスクロール
  let isDragging = false;
  let startX: number;
  let startY: number;
  let scrollLeft: number;
  let scrollTop: number;
  let scrollableElement: MaybeHTMLElement = $state(null);

  function onMouseDown(event: MouseEvent): void {
    if (!scrollableElement) return;
    
    const tagName: string = (event.target as Element).tagName;
    if (tagName == "P" || tagName == "SPAN") return;

    isDragging = true;
    startX = event.pageX - scrollableElement.offsetLeft;
    startY = event.pageY - scrollableElement.offsetTop;
    scrollLeft = scrollableElement.scrollLeft;
    scrollTop = scrollableElement.scrollTop;
    event.preventDefault();
  }

  function onMouseMove(event: MouseEvent): void {
    if (!isDragging || !scrollableElement) return;
    const x = event.pageX - scrollableElement.offsetLeft;
    const y = event.pageY - scrollableElement.offsetTop;
    const walkX = x - startX;
    const walkY = y - startY;
    scrollableElement.scrollLeft = scrollLeft - walkX;
    scrollableElement.scrollTop = scrollTop - walkY;
    event.preventDefault();
  }

  function onMouseUp(): void {
    isDragging = false;
  }

  function onMouseLeave(): void {
    isDragging = false;
  }

  // 画像関連
  function canAddImage(): boolean {
    return MEDIA_COUNT.reactiveValue < MAX_MEDIA_COUNT;
  }

  let imageInputRef: MaybeHTMLElement = $state(null);
  function onClickAddImageButton() {
    imageInputRef?.click();
  }

  function onInputImageFiles(event: Event) {
    const files = (event.target as HTMLInputElement)?.files;
    if (!files) return;

    const count = files.length;
    if (count == 0) return;

    if (count <= MAX_MEDIA_COUNT - MEDIA_COUNT.reactiveValue) {
      const imagesPaths: string[] = [];
      for (var file of files) {
        const filePath = URL.createObjectURL(file);
        imagesPaths.push(filePath);
      }
      MEDIA_COUNT.reactiveValue += count;
      dispatchInsertSlideCommand(imagesPaths);
    } else {
      // トーストを表示
    }
  }

  // メディアリンクダイアログ関連
  class MediaLinkDialogData {
    buttonRef: MaybeElement = $state(null);
    dialog: MaybeComponent = $state(null);
    isVisible: boolean = $state(false);

    openDialog() {
      this.isVisible = true;
    }
  }

  const youtubeLinkDialogData = new MediaLinkDialogData();
  const soundcloudLinkDialogData = new MediaLinkDialogData();

  function handleInteractToDialog(event: InteractEvent) {
    [youtubeLinkDialogData, soundcloudLinkDialogData].forEach(data => {
      const target = event.target;
      if (target) {
        if (data.isVisible) {
          
        } else {

        }
      }
    });
  }

  // 動画関連
  let isVideoButtonToggled = $state(false);

</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  bind:this={scrollableElement}
  class="virtual-viewport"
  onmousedown={onMouseDown}
  onmousemove={onMouseMove}
  onmouseup={onMouseUp}
  onmouseleave={onMouseLeave}
>
  <div class="floating">
    <div class="spacer"></div>
    <div bind:this={shareEditorRef} class="share-editor">
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
            disabled={!canAddImage()}
            onclick={onClickAddImageButton}
          >
            <input
              bind:this={imageInputRef}
              type="file"
              accept=".jpg, .jpeg, .png, .webp"
              style="display: none;"
              multiple
              onchange={onInputImageFiles}
            />
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
            onclick={() => dispatchInsertYoutubeCommand(videoId)}>
            <svg class="icon">
              <use href="/src/lib/assets/common/smart_display.svg#smart_display"
              ></use>
            </svg>
          </button>
          {#if youtubeLinkDialogData.isVisible}
            <YouTubeLinkDialog />
          {/if}
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
    background-color: var(--dark-gray);
    border-radius: 2rem;
  }

  ::-webkit-scrollbar-thumb:hover {
    background-color: #5c5c5c;
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
    cursor: default;
  }

  .icon-button:not(:disabled):hover {
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
