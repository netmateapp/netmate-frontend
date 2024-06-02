<script lang="ts">
  import type { MaybeHTMLElement } from "$lib/types";
  import { _, calculateMenuPosition } from "./editor.svelte";
  import { dispatchInsertYoutubeCommand } from "./lexical-editor";

  let { basePoint, closeDialog }: { basePoint: DOMRect, closeDialog: () => void } = $props();

  let dialogRef: MaybeHTMLElement = $state(null);
  export function contains(element: Element): boolean {
    return dialogRef?.contains(element) ?? false;
  }

  let videoId = $state("");

  const TEST_URLS = [
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "https://youtu.be/dQw4w9WgXcQ",
    "https://www.youtube.com/embed/dQw4w9WgXcQ",
    "https://m.youtube.com/watch?v=dQw4w9WgXcQ",
    "https://www.youtube.com/v/dQw4w9WgXcQ",
    "https://www.youtube.com/shorts/dQw4w9WgXcQ",
    "www.youtube.com/watch?v=dQw4w9WgXcQ",
    "youtu.be/dQw4w9WgXcQ",
    "www.youtube.com/embed/dQw4w9WgXcQ",
    "m.youtube.com/watch?v=dQw4w9WgXcQ",
    "www.youtube.com/watch?v=dQw4w9WgXcQ",
    "youtube.com/embed/dQw4w9WgXcQ",
    "youtube.com/watch?v=dQw4w9WgXcQ",
    "youtube.com/v/dQw4w9WgXcQ",
    "www.youtube.com/shorts/dQw4w9WgXcQ",
  ];

  function handleKeyPress(event: KeyboardEvent) {
    if (event.key === "Enter") {
      closeDialog();
      dispatchInsertYoutubeCommand(videoId);
    }
  }

  const YOUTUBE_URL_REGEX =
    /(?:https?:\/\/)?(?:(?:www\.)|(?:m\.))?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/|user\/[^\#&\?\/]*[^\#&\?\/]*\/)|youtu\.be\/)?([a-zA-Z0-9_-]{11})/;

  function handlePaste(event: ClipboardEvent) {
    const text = event.clipboardData?.getData("text/plain");
    const match = text?.match(YOUTUBE_URL_REGEX);
    if (match) videoId = match[1];
    event.preventDefault();
  }
</script>

<div
  bind:this={dialogRef}
  class="dialog"
  style={calculateMenuPosition(basePoint, dialogRef)}
>
  <span class="title">{_("add-youtube-video")}</span>
  <div class="text-field">
    <label class="label">https://www.youtube.com/watch?v=</label>
    <input
      class="input"
      bind:value={videoId}
      onkeypress={handleKeyPress}
      onpaste={handlePaste}
    />
  </div>
</div>

<style>
  .dialog {
    position: fixed;
    border-radius: 1rem;
    padding: 0.5rem;
    background: var(--dominant-color);
    box-shadow: var(--soft-shadow);
    display: inline-flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .text-field {
    display: flex;
    align-items: flex-start;
  }

  .label {
    color: var(--light-gray);
    font-family: Roboto;
    font-size: 0.9375rem;
    line-height: 1.25rem;
  }

  .label:focus {
    color: var(--secondary-color);
  }

  .title {
    color: var(--secondary-color);
    font-family: var(--primary-font);
    font-size: 0.875rem;
    line-height: 1.3125rem;
  }

  .input {
    color: var(--secondary-font);
    font-family: Roboto;
    font-size: 0.9375rem;
    line-height: 1.25rem;
    width: 6.5rem;
  }
</style>
