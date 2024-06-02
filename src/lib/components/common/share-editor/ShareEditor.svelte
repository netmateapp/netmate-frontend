<script lang="ts" context="module">
  // メディア関連定数
  export const MAX_MEDIA_COUNT = 4;
  export const TITLE_COSTS_LIMIT = 48;

  // メディア関連リアクティブ変数
  export const MEDIA_COUNT = new ReactiveStore(0);
  export const CURSOR_AT_FIRST_LINE_START = new ReactiveStore(true);
  export const HAS_TITLE = new ReactiveStore(false);
</script>

<script src="lexical-editor.ts" lang="ts">
  import { charactersCosts } from "./characters-conter-plugin.svelte";
  import {
    dispatchInsertSlideCommand,
    init,
    insertHeadingNode,
  } from "./lexical-editor";
  import { canShowContentPlaceholder } from "./placeholder-plugin.svelte";
  import { ReactiveStore } from "$lib/stores.svelte";
  import YouTubeLinkDialog from "./YouTubeLinkDialog.svelte";
  import { _ } from "./editor.svelte";
  import { toast } from "../toast/useToast.svelte";
  import { interactHandlersEffect } from "$lib/utils.svelte";
  import { apparentCharactersCosts } from "$lib/cjk.svelte";
  import SoundCloudLinkDialog from "./SoundCloudLinkDialog.svelte";
  import { hideTooltip, tooltip } from "../tooltip/useTooltip.svelte";
  import HandlesMenu from "./HandlesMenu.svelte";
  import TagsInputField from "./share-edit/TagsInputField.svelte";
  import Overlay from "../confirm-dialog/Overlay.svelte";
  import ConfirmDialog from "../confirm-dialog/ConfirmDialog.svelte";
  import type { MaybeHTMLElement, InteractEvent, MaybeComponent } from "$lib/types";

  $effect(() => {
    init();
  });

  let { closeEditor }: { closeEditor: () => void } = $props();

  function closeShareEditor() {
    closeEditor();
    MEDIA_COUNT.reactiveValue = 0;
    CURSOR_AT_FIRST_LINE_START.reactiveValue = true;
    HAS_TITLE.reactiveValue = false;
  }

  let shareEditorRef: MaybeHTMLElement = $state(null);
  export function getShareEditorRef(): MaybeHTMLElement {
    return shareEditorRef;
  }

  // タイトル関連
  function canInsertTitle(): boolean {
    return CURSOR_AT_FIRST_LINE_START.reactiveValue && !HAS_TITLE.reactiveValue;
  }

  // 文字数カウンター関連
  const CHARACTERS_COSTS_LIMIT = 20000;

  function currentCharactersCosts(): number {
    return charactersCosts();
  }

  function isCharactersCostsLimitOver(): boolean {
    return currentCharactersCosts() > CHARACTERS_COSTS_LIMIT;
  }

  function apparentCharactersCount() {
    return apparentCharactersCosts(currentCharactersCosts());
  }

  function apparentCharactersLimit() {
    return apparentCharactersCosts(CHARACTERS_COSTS_LIMIT);
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

  // メディア関連
  function canAddMedia(): boolean {
    return MEDIA_COUNT.reactiveValue < MAX_MEDIA_COUNT;
  }

  // 画像関連
  let imageInputRef: MaybeHTMLElement = $state(null);
  function onClickAddImageButton() {
    imageInputRef?.click();
  }

  // スライドの新規作成時に追加される画像のカウントは、
  // プラグインのMutationListenerで管理する
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
      //MEDIA_COUNT.reactiveValue += count;
      dispatchInsertSlideCommand(imagesPaths);
    } else {
      toast(_("failed-to-add-media", { limit: MAX_MEDIA_COUNT }));
    }
  }

  // メディアリンクダイアログ関連
  class MediaLinkDialogData {
    buttonRef: MaybeHTMLElement = $state(null);
    dialog: MaybeComponent = $state(null);
    isVisible: boolean = $state(false);

    openDialog() {
      this.isVisible = true;
    }
  }

  const youtubeLinkDialogData = new MediaLinkDialogData();
  const soundcloudLinkDialogData = new MediaLinkDialogData();

  // 音楽関連
  function onClickAddSoundCloudButton(event: InteractEvent) {
    const element = event.target as Element;
    if (soundcloudLinkDialogData.isVisible) {
      if (!soundcloudLinkDialogData.dialog?.contains(element)) {
        soundcloudLinkDialogData.isVisible = false;
      }
    } else {
      if (soundcloudLinkDialogData.buttonRef?.contains(element)) {
        hideTooltip();
        soundcloudLinkDialogData.isVisible = true;
      }
    }
  }

  function closeSoundCloudLinkDialog() {
    soundcloudLinkDialogData.isVisible = false;
  }

  // 動画関連
  function onClickAddYouTubeButton(event: InteractEvent) {
    const element = event.target as Element;
    if (youtubeLinkDialogData.isVisible) {
      if (!youtubeLinkDialogData.dialog?.contains(element)) {
        youtubeLinkDialogData.isVisible = false;
      }
    } else {
      if (youtubeLinkDialogData.buttonRef?.contains(element)) {
        hideTooltip();
        youtubeLinkDialogData.isVisible = true;
      }
    }
  }

  function closeYouTubeLinkDialog() {
    youtubeLinkDialogData.isVisible = false;
  }

  // 名義選択ボタン関連
  let isHandleButtonToggled = $state(false);
  let handleButtonRef: MaybeHTMLElement = $state(null);
  let handlesMenu: MaybeComponent = $state(null);
  let selectedHandleId = $state(lastUsedHandle());
  function onClickHandleButton(event: InteractEvent) {
    const element = event.target as Element;
    if (isHandleButtonToggled) {
      if (!handlesMenu?.contains(element)) isHandleButtonToggled = false;
    } else {
      if (handleButtonRef?.contains(element)) {
        hideTooltip();
        isHandleButtonToggled = true;
      }
    }
  }

  function lastUsedHandle(): string {
    return "はらむらのどか";
  }

  function onSelectHandle(handleId: string) {
    selectedHandleId = handleId;
    isHandleButtonToggled = false;
  }

  export function contains(element: Element): boolean {
    return shareEditorRef?.contains(element)
      || youtubeLinkDialogData.dialog?.contains(element)
      || soundcloudLinkDialogData.dialog?.contains(element)
      || handlesMenu?.contains(element)
      || !isEditorEmpty(); // isEditorEmpty()はisConfirmDialogVisibleの代わり
  }

  function isEditorEmpty(): boolean {
    return currentCharactersCosts() === 0 && MEDIA_COUNT.reactiveValue === 0;
  }

  let isConfirmDialogVisible = $state(false);
  let confirmDialog: MaybeComponent = $state(null);
  function handleInteractEvent(event: InteractEvent) {
    const target = event.target as Element;
    if (isConfirmDialogVisible) {
      if (!confirmDialog?.dialogRef()?.contains(target)) {
        closeConfirmDialog();
      }
    } else {
      if (!(shareEditorRef?.contains(target)
      || youtubeLinkDialogData.dialog?.contains(target)
      || soundcloudLinkDialogData.dialog?.contains(target)
      || handlesMenu?.contains(target))) {
        if (!isEditorEmpty()) isConfirmDialogVisible = true;
      }
    }
  }

  interactHandlersEffect(
    onClickAddYouTubeButton,
    onClickAddSoundCloudButton,
    onClickHandleButton,
    handleInteractEvent
  )();
  
  function closeConfirmDialog() {
    isConfirmDialogVisible = false;
  }
</script>

<Overlay />

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
      <TagsInputField />
      <div class="separator"></div>
      <div class="content">
        <div class="editor" id="editor" contenteditable></div>
        {#if canShowContentPlaceholder()}
          <div class="placeholder">{_("to-share-something")}</div>
        {/if}
      </div>
      <div class="separator"></div>
      <div class="toolbar">
        <div class="left-aligned-tools">
          <button
            class="icon-button"
            disabled={!canInsertTitle()}
            onclick={() => insertHeadingNode()}
            use:tooltip={_("title")}
          >
            <svg class="icon">
              <use href="/src/lib/assets/common/title.svg#title"></use>
            </svg>
          </button>
          <button
            class="icon-button"
            disabled={!canAddMedia()}
            onclick={onClickAddImageButton}
            use:tooltip={_("image")}
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
          <button
            bind:this={soundcloudLinkDialogData.buttonRef}
            class="icon-button"
            class:icon-button-toggled={soundcloudLinkDialogData.isVisible}
            disabled={!canAddMedia()}
            use:tooltip={_("audio")}
          >
            <svg class="icon">
              <use href="/src/lib/assets/common/music_note.svg#music_note"
              ></use>
            </svg>
          </button>
          {#if soundcloudLinkDialogData.isVisible}
            <SoundCloudLinkDialog
              bind:this={soundcloudLinkDialogData.dialog}
              basePoint={soundcloudLinkDialogData.buttonRef.getBoundingClientRect()}
              closeDialog={closeSoundCloudLinkDialog}
            />
          {/if}
          <button
            bind:this={youtubeLinkDialogData.buttonRef}
            class="icon-button"
            class:icon-button-toggled={youtubeLinkDialogData.isVisible}
            disabled={!canAddMedia()}
            use:tooltip={_("video")}
          >
            <svg class="icon">
              <use href="/src/lib/assets/common/smart_display.svg#smart_display"
              ></use>
            </svg>
          </button>
          {#if youtubeLinkDialogData.isVisible}
            <YouTubeLinkDialog
              bind:this={youtubeLinkDialogData.dialog}
              basePoint={youtubeLinkDialogData.buttonRef.getBoundingClientRect()}
              closeDialog={closeYouTubeLinkDialog}
            />
          {/if}
        </div>
        <div class="right-aligned-tools">
          <div class="characters-counter">
            <span
              class="characters-count"
              class:limit-over={isCharactersCostsLimitOver()}
              >{apparentCharactersCount()}</span
            >
            <span class="characters-limit">/{apparentCharactersLimit()}</span>
          </div>
          <div
            bind:this={handleButtonRef}
            class="handle-button"
            class:handle-button-toggled={isHandleButtonToggled}
          >
            <svg class="handle-button-icon">
              {#if isHandleButtonToggled}
                <use href="/src/lib/assets/common/person_FILL.svg#person_FILL"
                ></use>
              {:else}
                <use href="/src/lib/assets/common/person.svg#person"></use>
              {/if}
            </svg>
            <div class="centered-selected-handle">
              <span class="selected-handle">{selectedHandleId}</span>
            </div>
          </div>
          <div class="share-button">
            <span class="share-button-label">{_("share")}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="padding"></div>
  </div>
</div>

{#if isHandleButtonToggled}
  <HandlesMenu
    bind:this={handlesMenu}
    basePoint={handleButtonRef.getBoundingClientRect()}
    {onSelectHandle}
  />
{/if}

{#if isConfirmDialogVisible}
  <ConfirmDialog bind:this={confirmDialog} title={_("discard-edit-dialog-title")} description={_("discard-edit-dialog-message")} actionName={_("discard")} action={closeShareEditor} close={closeConfirmDialog} />
{/if}

<style>
  :global(a) {
    color: var(--accent-color);
  }

  :global(h1, h2, h3, h4, h5, h6) {
    color: var(--accent-color);
    font-family: var(--primary-font);
    font-size: 1.25rem;
    line-height: 1.75rem;
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
    min-height: 1rem;
    max-height: 37vh;
  }

  .padding {
    height: 100%;
    width: 1px;
    flex: 1 0 0;
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

  .content {
    position: relative;
    width: 100%;
    min-height: 2.125rem;
    white-space: pre-wrap;
  }

  .editor {
    width: 100%;
    font-family: "ＭＳ Ｐゴシック", var(--primary-font);
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

  .icon-button:not(:disabled):hover,
  .icon-button-toggled {
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

  .handle-button {
    border-radius: 100vmax;
    display: flex;
    padding: 0.375rem 0.5rem 0.375rem 0.25rem;
    justify-content: center;
    align-items: center;
    cursor: pointer;
  }

  .handle-button:hover,
  .handle-button-toggled {
    background-color: var(--dominant-color-hover);
  }

  .handle-button-icon {
    width: 1.5rem;
    height: 1.5rem;
  }

  .centered-selected-handle {
    display: flex;
    padding-top: 0.0625rem;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
  }

  .selected-handle {
    color: var(--secondary-color);
    font-family: var(--primary-font);
    font-size: 0.9375rem;
    line-height: 1.25rem;
  }

  .share-button {
    height: 2.25rem;
    min-width: 4rem;
    padding: 0.5rem 0.5rem 0.4375rem 0.5rem;
    border-radius: 100vmax;
    background-color: var(--secondary-color);
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
  }

  .share-button:hover {
    background-color: var(--secondary-color-hover);
  }

  .share-button-label {
    color: var(--dominant-color);
    font-family: var(--primary-font);
    font-size: 0.9375rem;
    line-height: 1.25rem;
  }
</style>
