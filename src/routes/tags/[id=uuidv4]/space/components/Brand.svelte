<script lang="ts">
  import { createTranslator } from "$lib/i18n.svelte";

  type Props = {
    x: number;
    y: number;
  };

  let { x, y }: Props = $props();

  const _ = createTranslator("common", "brand");

  function version(): string {
    return "v0.0.1";
  }
</script>

<a href="https://netmate.app" class="brand" style="top: {y}px; left: {x}px;">
  <img class="logo" src="/src/lib/assets/logo-temp.png" alt={_("logo")} />
  <div class="types">
    <span class="logotype">{_("logotype")}</span>
    <span class="version">{version()}</span>
  </div>
</a>

<style>
  .brand {
    display: flex;
    align-items: center;
  }

  .logo {
    width: 5.375rem;
    height: 5.375rem;
    border-radius: 2.5rem;
  }

  @font-face {
    font-family: YuseiMagic;
    src: url("/src/lib/assets/YuseiMagic-Regular-Subset.woff2") format("woff2");
  }

  .types {
    display: flex;
    padding: 0rem 0.5rem;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: -1rem;
  }

  .logotype {
    color: var(--secondary-color);
    font-family: YuseiMagic;
    font-size: 3rem;
  }

  .version {
    color: var(--secondary-color);
    font-family: YuseiMagic;
    font-size: 1.5rem;
  }
</style>
