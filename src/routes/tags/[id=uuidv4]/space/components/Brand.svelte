<script lang="ts">
  import { createTranslator } from "$lib/i18n.svelte";

  const _ = createTranslator("common", "brand");

  function version(): string {
    return "v0.0.1";
  }

  let logoRef: HTMLElement;

  // フォントが読み込まれる前のflexboxが横に伸びる都合で、
  // 画像のガタつき防止のための遅延読み込み
  $effect(() => {
    document.fonts.onloadingdone = () => {
      if (logoRef) logoRef.style.visibility = "visible";
    };
  });
</script>

<a href="https://netmate.app" class="brand">
  <img bind:this={logoRef} class="logo" src="/src/lib/assets/logo-temp.png" alt={_("logo")} />
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
    visibility: hidden;
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
  }

  .logotype {
    color: var(--secondary-color);
    font-family: YuseiMagic;
    font-size: 3rem;
    line-height: 3.75rem;
  }

  .version {
    color: var(--secondary-color);
    font-family: YuseiMagic;
    font-size: 1.5rem;
    line-height: 1.25rem;
  }
</style>
