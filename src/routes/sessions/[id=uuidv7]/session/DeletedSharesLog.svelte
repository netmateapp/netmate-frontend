<script lang="ts">
  import { _ } from "./session.svelte";

  type Props = {
    deletedSharesCount: number;
  };

  let { deletedSharesCount }: Props = $props();
</script>

<div class="log">
  <span class="label">{_("deleted_shares_log", { sharesCount: deletedSharesCount })}</span>
</div>

<style>
  .log {
    display: flex;
    width: 63.125rem;
    padding: 0.5rem 1rem;
    align-items: flex-start;
    gap: 1rem;
  }

  .label {
    color: var(--light-gray);
    font-family: var(--primary-font);
    font-size: 0.9375rem;
  }
</style>