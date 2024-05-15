<script lang="ts">
  import LanguageButton from "./LanguageButton.svelte";
  import LocationButton from "./LocationButton.svelte";
  import SeeMoreButton from "./SeeMoreButton.svelte";
  import SigninButton from "./SigninButton.svelte";

  function isSignedIn() {
    return false;
  }
</script>

<div class="navigation">
  {#if isSignedIn()}
    <SeeMoreButton />
  {:else}
    <LanguageButton />
    <LocationButton />
    <SeeMoreButton />
    <SigninButton />
  {/if}
</div>

<style>
  .navigation {
    position: fixed;
    top: 0.5rem;
    right: 1rem;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
  }
</style>