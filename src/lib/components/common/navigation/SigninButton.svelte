<script lang="ts">
  import { _ } from "./nav.svelte";
</script>

<a href="https://netmate.app/signin" class="button">
  <span class="label">{_("signin-button-label")}</span>
</a>

<style>
  .button {
    border-radius: 100vmax;
    height: 2.4375rem;
    border: 1px solid var(--light-gray);
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
    background-color: rgba(255, 255, 255, 0.1);
    border-color: var(--accent-color);
    color: var(--accent-color);
    backdrop-filter: blur(1px);
    transition: background-color 0.15s linear, border-color 0.15s linear, color 0.15s linear, backdrop-filter 0.15s linear;
  }
</style>