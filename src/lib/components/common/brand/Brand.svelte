<script lang="ts">
  import { createTranslator } from "$lib/i18n.svelte";

  export let x: number, y: number;

  const _ = createTranslator("common", "brand");
</script>

<a href="https://netmate.app" class="brand" style="top: {y}px; left: {x}px;">
  <img class="logo" src="/src/lib/assets/logo-temp.png" alt={_("logo")} />
  <span class="logotype">{_("logotype")}</span>
  <span class="version">v0.0.1</span>
</a>

<style>
  .brand {
    position: fixed;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    z-index: 100;
  }

  .logo {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 3.5rem;
  }

  @font-face {
    font-family: YuseiMagic;
    src: url("/src/lib/assets/YuseiMagic-Regular-Subset.woff2") format("woff2");
  }

  .logotype, .version {
    color: var(--secondary-color);
    font-family: YuseiMagic;
    font-size: 1rem;
    font-weight: 400;
  }
</style>
