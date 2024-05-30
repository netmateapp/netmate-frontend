<script lang="ts">
  import Brand from "$lib/components/common/brand/Brand.svelte";
  import Navigation from "$lib/components/common/navigation/Navigation.svelte";
  import SearchBox from "$lib/components/common/search-box/SearchBox.svelte";
  import OpenShareEditorButton from "$lib/components/common/share-editor/OpenShareEditorButton.svelte";
  import ShareEditor from "$lib/components/common/share-editor/ShareEditor.svelte";
  import { registerInteractHandler } from "$lib/utils.svelte";

  let isShareEditorVisible = $state(true);
  let shareEditor: MaybeComponent = $state(null);
  function handleInteractEvent(event: InteractEvent) {
    if (isShareEditorVisible) {
      const target = event.target as Element;
      //if (!shareEditor?.getShareEditorRef()?.contains(target)) isShareEditorVisible = false;
    } else {
      isShareEditorVisible = true;
    }
  }
  registerInteractHandler(handleInteractEvent);
</script>

<title>タグスペース</title>

<Brand x={16} y={8} />
<SearchBox />
<Navigation />
<OpenShareEditorButton />
{#if isShareEditorVisible}
  <ShareEditor bind:this={shareEditor} />
{/if}