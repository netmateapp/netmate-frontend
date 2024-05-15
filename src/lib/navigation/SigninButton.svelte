<script lang="ts">
    import { createTranslator } from "../../i18n.svelte";

  const _ = createTranslator("common", "navigation");
</script>

<a href="https://netmate.app/signin" class="button">
  <span class="label">{_("signin-button-label")}</span>
</a>

<style>
  .button {
    border-radius: 2rem;
    border: 1px solid var(--light-gray);
    height: 2.4375rem;
    background: var(--dominant-color);
    display: inline-flex;
    padding: 0.625rem 1rem 0.5625rem 1rem;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
    color: var(--light-gray);
  }

  .label {
    font-family: var(--primary-font);
    font-size: 0.9375rem;
    font-weight: 400;
    line-height: 1.25rem;
    color: currentColor;
  }

  .button:hover {
    border-color: var(--accent-color);
    color: var(--accent-color);
  }
</style>