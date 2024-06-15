<script lang="ts">
  import Brand from "$lib/components/common/brand/Brand.svelte";
  import LocationDisplay from "$lib/components/common/location-display/LocationDisplay.svelte";
  import Navigation from "$lib/components/common/navigation/Navigation.svelte";
  import SearchBox from "$lib/components/common/search-box/SearchBox.svelte";
  import OpenShareEditorButton from "$lib/components/common/share-editor/OpenShareEditorButton.svelte";
  import ShareEditor from "$lib/components/common/share-editor/ShareEditor.svelte";
  import TagMenu from "$lib/components/tag/TagMenu.svelte";
  import type { InteractEvent, MaybeComponent } from "$lib/types";
  import { interactHandlersEffect } from "$lib/utils.svelte";
  import { Uuid4 } from "$lib/uuid";
  import type { Ok } from "$lib/result";
  import type { PageServerData } from "./$types";
  import Space from "./components/Space.svelte";
  import { Tag, TagName } from "$lib/scripts/domain/tag";

  let { data }: { data: PageServerData } = $props();

  let tag = new Tag(
    (Uuid4.from(data.tag.id) as Ok<{}, Uuid4>).value,
    new TagName(data.tag.name)
  );

  let isShareEditorVisible = $state(false);
  let shareEditor: MaybeComponent = $state(null);
  let openShareEditorButton: MaybeComponent = $state(null);
  function handleInteractEvent(event: InteractEvent) {
    const target = event.target as Element;
    if (isShareEditorVisible) {
      if (!shareEditor?.contains(target)) isShareEditorVisible = false;
    } else {
      if (openShareEditorButton?.contains(target)) {
        isShareEditorVisible = true;
        event.preventDefault();
        event.stopPropagation();
      }
    }
  }
  interactHandlersEffect(handleInteractEvent)();

  function closeShareEditor() {
    isShareEditorVisible = false;
  }

  
</script>

<title>{tag.name.name}</title>

<Brand x={16} y={8} />
<SearchBox />
<Navigation />
<OpenShareEditorButton bind:this={openShareEditorButton} />
{#if isShareEditorVisible}
  <ShareEditor bind:this={shareEditor} closeEditor={closeShareEditor} />
{/if}

<Space {tag} />

<div class="side-bar">
  <LocationDisplay locationName={tag.name.name} isSpace={true} />
  <TagMenu />
</div>

<style>
  .side-bar {
    position: fixed;
    top: 6rem;
    left: 0.75rem;
    display: inline-flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
    z-index: 100;
  }
</style>