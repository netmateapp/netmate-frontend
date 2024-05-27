<script lang="ts">
  import Brand from "$lib/common/brand/Brand.svelte";
  import Navigation from "$lib/common/navigation/Navigation.svelte";
  import SearchBox from "$lib/common/search-box/SearchBox.svelte";
  import ShareEditor from "$lib/common/share-editor/ShareEditor.svelte";
    import { registerInteractHandler } from "$lib/utils.svelte";

  let isShareEditorVisible = $state(true);
  let shareEditor: MaybeComponent = $state(null);
  function handleInteractEvent(event: InteractEvent) {
    if (isShareEditorVisible) {
      const target = event.target as Element;
      if (!shareEditor?.getShareEditorRef()?.contains(target)) isShareEditorVisible = false;
      console.log(isShareEditorVisible);
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
{#if isShareEditorVisible}
  <ShareEditor bind:this={shareEditor} />
{/if}