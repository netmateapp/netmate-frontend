<script lang="ts">
  import Header from "$lib/components/common/header/Header.svelte";
  import LocationDisplay from "$lib/components/common/location-display/LocationDisplay.svelte";
  import SharesList from "$lib/components/database/shares-list/SharesList.svelte";

  function handleName(): string {
    return "はらむらのどか";
  }
</script>

<title>{handleName()}</title>

<Header />
<SharesList />

<div class="side-bar">
  <LocationDisplay locationName={handleName()} isSpace={false} />
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