<script lang="ts">
  import Header from "$lib/components/common/header/Header.svelte";
  import SharesList from "$lib/components/database/shares-list/SharesList.svelte";
    import QueryDisplay from "./QueryDisplay.svelte";

  function searchQuery(): string {
    return "#早瀬ユウカ #イラスト";
  }
</script>

<Header />
<SharesList />

<div class="side-bar">
  <QueryDisplay query={searchQuery()} />
</div>

<style>
  .side-bar {
    position: fixed;
    top: 6rem;
    left: 0.75rem;
    height: calc(100% - 6rem);
    display: inline-flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
    z-index: 100;
  }
</style>