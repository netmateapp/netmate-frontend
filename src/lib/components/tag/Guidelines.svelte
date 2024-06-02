<script lang="ts">
  import { _ } from "./tag.svelte";
</script>

<div class="card">
  <span class="heading">{_("title")}</span>
  <span class="text">{_("summary")}</span>
  <div class="spacer"></div>
  <span class="text">{_("item")}</span>
  {#each [1, 2, 3] as index}
    <div class="spacer"></div>
    <span class="heading">{_(`heading${index}`)}</span>
    <span class="text">{_(`item${index}`)}</span>
    <span class="correct">{_(`correct${index}`)}</span>
    <span class="wrong">{_(`wrong${index}`)}</span>
  {/each}
</div>

<style>
  .card {
    position: fixed;
    top: 4rem;
    left: 14rem;

    border-radius: 0.75rem;
    background: var(--dominant-color);
    box-shadow: var(--soft-shadow);
    display: inline-flex;
    padding: 1rem;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    cursor: default;
  }

  .heading {
    color: var(--secondary-color);
    font-family: var(--primary-font);
    font-size: 0.875rem;
    font-weight: 700;
    line-height: 1.1875rem;
    white-space: pre-wrap;
  }

  .text {
    color: var(--secondary-color);
    font-family: var(--primary-font);
    font-size: 0.875rem;
    line-height: 1.1875rem;
    white-space: pre-wrap;
  }

  .spacer {
    width: 16rem;
    height: 1.1875rem;
  }

  .correct {
    color: var(--accent-color);
    font-family: var(--primary-font);
    font-size: 0.875rem;
    line-height: 1.1875rem;
    white-space: pre-wrap;
  }

  .wrong {
    color: var(--light-gray);
    font-family: var(--primary-font);
    font-size: 0.875rem;
    line-height: 1.1875rem;
    white-space: pre-wrap;
  }
</style>
