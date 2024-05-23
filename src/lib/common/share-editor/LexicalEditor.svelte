<script src="./lexical-editor.ts">
  import { dispatchInsertYoutubeCommand, init } from "./lexical-editor";

  $effect(() => {
    init();
  });
</script>

<div class="base">
  <div id="editor" contenteditable></div>
  <button onclick={() => dispatchInsertYoutubeCommand()}>埋め込み</button>
</div>


<style>
  .base {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 90%;
    height: 80%;
    border-radius: 2rem;
    box-shadow: var(--soft-shadow);
    overflow: auto;
  }

  #editor {
    width: 95%;
    height: 95%;
  }

  button {
    height: 40px;
    border-radius: 100vmax;
    background-color: red;
  }
</style>