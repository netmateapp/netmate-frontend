<script lang="ts">
  import { createTranslator } from "../../../i18n.svelte";
  import { calculateMenuPosition } from "./menu";

  const _ = createTranslator("common", "menu");

  let menuRef: Element | null = $state(null);

  const LANGUAGES: string[] = ["japanese", "korean", "traditional-chinese", "us-english"];

  function setLanguage(language: string) {
    console.log("change my language: " + language);
  }
</script>

<div bind:this={menuRef} class="language-menu" style={calculateMenuPosition(seeMoreButtonRef, mainMenuLanguageMenuRef)}>
  {#each LANGUAGES as language}
    <button class="language-menu-item" onclick={() => setLanguage(language)}>
      <span class="language-menu-label">{_(language)}</span>
    </button>
  {/each}
</div>