<script lang="ts">
  import { _, calculateMenuPosition } from "./editor.svelte";
  import { dispatchInsertSoundCloudCommand } from "./lexical-editor";

  let { basePoint, closeDialog }: { basePoint: DOMRect, closeDialog: () => void } = $props();

  let dialogRef: MaybeHTMLElement = $state(null);
  export function contains(element: Element): boolean {
    return dialogRef?.contains(element) ?? false;
  }

  let trackId = $state("");

  function handleKeyPress(event: KeyboardEvent) {
    if (event.key === "Enter") {
      closeDialog();
      dispatchInsertSoundCloudCommand(trackId);
    }
  }

  const TRACK_ID_REGEX = /api\.soundcloud\.com\/tracks\/(\d+)/;

  function handlePaste(event: ClipboardEvent) {
    const text = event.clipboardData?.getData("text/plain");
    const match = text?.match(TRACK_ID_REGEX);
    if (match) {
      trackId = match[1];
      console.log(match[0]);
      console.log(match[1]);
    }
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
    <label class="label">https://api.soundcloud.com/tracks/</label>
    <input
      class="input"
      bind:value={trackId}
      onkeypress={handleKeyPress}
      onpaste={handlePaste}
    />
  </div>
  <span class="annotation">{_("add-soundcloud-audio-annotation")}</span>
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