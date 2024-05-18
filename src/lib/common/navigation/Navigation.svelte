<script lang="ts">
  import LanguageButton from "./LanguageButton.svelte";
  import LocationButton from "./LocationButton.svelte";
  import SeeMoreButton from "./SeeMoreButton.svelte";
  import SigninButton from "./SigninButton.svelte";
  import Tooltip from "$lib/common/tooltip/Tooltip.svelte";
  import AnnouncementsButton from "./AnnouncementsButton.svelte";
  import HandlesButton from "./HandlesButton.svelte";

  function isSignedIn() {
    return true;
  }
</script>

<div class="navigation">
  {#if isSignedIn()}
    <HandlesButton/>
    <AnnouncementsButton />
    <SeeMoreButton />
  {:else}
    <LanguageButton />
    <LocationButton />
    <SeeMoreButton />
    <SigninButton />
  {/if}
  <Tooltip />
</div>

<style>
  .navigation {
    position: fixed;
    top: 0.5rem;
    right: 1rem;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    z-index: 1;
  }
</style>