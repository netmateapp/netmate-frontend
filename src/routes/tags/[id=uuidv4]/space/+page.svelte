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
  import { Tag, TagName } from "$lib/scripts/domain/tag";
  import InterSpace from "./components/space/Interspace.svelte";
  import { fade } from "svelte/transition";

  // 共有画面関連
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

  // スペース関連
  let { data }: { data: PageServerData } = $props();

  let mockTagNames = ["早瀬ユウカ", "陸八魔アル", "空崎ヒナ"];
  let mockTagNamesPointer = 0;

  let tag = $derived(
    new Tag(
      (Uuid4.from(data.tag.id) as Ok<{}, Uuid4>).value,
      new TagName(
        mockTagNamesPointer < mockTagNames.length
          ? mockTagNames[mockTagNamesPointer++]
          : mockTagNames[(mockTagNamesPointer = 0)],
      ),
    ),
  );

  // トップページの中央検索バー関連
  let isSearchBoxVisible: boolean = $state(!isTopPage());

  function isTopPage(): boolean {
    return true;
  }

  $effect(() => {
    if (isTopPage()) {
      const mutationObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.addedNodes.length > 0) {
            mutation.addedNodes.forEach((node) => {
              if (node.hasChildNodes()) {
                node.childNodes.forEach(child => {
                  if (child instanceof HTMLElement && child.id === "on-top") {
                    observeIntersection();
                    mutationObserver.disconnect();
                  }
                });
              }
            });
          }
        });
      });

      mutationObserver.observe(document, { childList: true, subtree: true });
    }
  });

  function observeIntersection() {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        // ページ読み込み時にも処理が走るため、これだけで制御可能
        isSearchBoxVisible = !entry.isIntersecting;
      });
    });

    const topSearchBox = document.querySelector("#on-top > div");
    if (topSearchBox instanceof HTMLElement) obs.observe(topSearchBox);
  }
</script>

<title>{tag.name.name}</title>

<Brand x={16} y={8} />
{#if isSearchBoxVisible}
  <div class="search-box-wrapper" transition:fade={{ duration: 250 }}>
    <SearchBox />
  </div>
{/if}
<Navigation />

<OpenShareEditorButton bind:this={openShareEditorButton} />
{#if isShareEditorVisible}
  <ShareEditor bind:this={shareEditor} closeEditor={closeShareEditor} />
{/if}

<InterSpace {tag} />

<div class="side-bar">
  <LocationDisplay locationName={tag.name.name} isSpace={true} />
  <TagMenu />
</div>

<style>
  :global(body) {
    overflow: hidden;
  }

  .search-box-wrapper {
    position: fixed;
    top: 0.5rem;
    left: 50%;
    transform: translate(-50%, 0%);
    z-index: 100;
  }

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
