<script lang="ts">
  import Brand from "$lib/components/common/brand/Brand.svelte";
  import Navigation from "$lib/components/common/navigation/Navigation.svelte";
  import SearchBox from "$lib/components/common/search-box/SearchBox.svelte";
  import OpenShareEditorButton from "$lib/components/common/share-editor/OpenShareEditorButton.svelte";
  import ShareEditor from "$lib/components/common/share-editor/ShareEditor.svelte";
  import Share from "$lib/components/database/share/Share.svelte";
  import TagMenu from "$lib/components/tag/TagMenu.svelte";
  import type { InteractEvent, MaybeComponent } from "$lib/types";
  import { interactHandlersEffect } from "$lib/utils.svelte";
  import { Uuid7 } from "$lib/uuid";

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

  function genTestUuid7(): Uuid7 {
    let maybeUuid = Uuid7.from("018fd2cc-7e27-7dfa-8424-87f58f98bfcc");
    let testUuid: Uuid7;
    if (maybeUuid.isOk()) {
      testUuid = maybeUuid.value;
    }
    return testUuid!;
  }
</script>

<title>タグスペース</title>

<Brand x={16} y={8} />
<SearchBox />
<Navigation />
<OpenShareEditorButton bind:this={openShareEditorButton} />
{#if isShareEditorVisible}
  <ShareEditor bind:this={shareEditor} closeEditor={closeShareEditor} />
{/if}
<Share
  id={genTestUuid7()}
  title={"おもしれー女"}
  text={"描いたﾖ\nかわわ"}
  firstImageUrl={"https://pbs.twimg.com/media/GO7IK9yagAEq4bw?format=jpg&name=4096x4096"}
  conversationsCount={212}
  timestamp={1717209513416} />
<TagMenu />