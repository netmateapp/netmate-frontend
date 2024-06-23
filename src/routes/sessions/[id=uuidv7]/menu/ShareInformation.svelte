<script lang="ts">
  type Props = {
    share: ShareData;
  };

  let { share }: Props = $props();

  function leadSentence(): string {
    return share.text !== undefined ? share.text.slice(0, 64) : "";
  }
</script>

<div class="information">
  <div class="spacer"></div>
  {#if share.title !== undefined}
    <span class="title">{share.title}</span>
  {:else}
    <span class="lead-sentence">{leadSentence()}</span>
  {/if}
</div>

<style>
  .information {
    display: flex;
    width: 11.125rem;
    align-items: flex-start;
  }

  .spacer {
    max-width: 0.5rem;
    flex: 1 0 0;
    align-self: stretch;
  }

  .title {
    color: var(--secondary-color);
    font-family: var(--primary-font);
    font-size: 1.375rem;
    line-height: 1.875rem;
    max-width: 12.5rem;
  }

  .lead-sentence {
    overflow: hidden;
    color: var(--secondary-color);
    text-overflow: ellipsis;
    font-family: var(--primary-font);
    font-size: 0.9375rem;
    line-height: 1.25rem;
    display: -webkit-box;
    max-width: 12.5rem;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }
</style>
