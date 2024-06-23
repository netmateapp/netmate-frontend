<script lang="ts">
  import { Uuid4 } from "$lib/uuid";
  import type { SvelteComponent } from "svelte";
  import Tabs from "./Tabs.svelte";
  import { TagName, FullyQualifiedTag } from "$lib/scripts/domain/tag";
  import TagSearchBox from "./TagSearchBox.svelte";
  import TagList from "./TagList.svelte";
  import { Vote } from "$lib/scripts/domain/vote";
  import { OtherSuggestedRelationship, ReactiveRelationships, StabilizedRelationship, TagHierarchy, UserSuggestedRelationship, type Relationship } from "./tag.svelte";

  type Props = {
    isSpace: boolean;
  };

  let { isSpace }: Props = $props();

  let tabs = $state() as SvelteComponent;

  function generateTestTags(): Relationship[] {
    const tagsNames = ["早瀬ユウカ", "早瀬ユウカイラスト", "陸八魔アル", "一之瀬アスナ", "天雨アコ", "アロナ", "シッテムの箱","夏の特殊作戦！RABBIT小隊と消えたエビの謎", "古関ウイ", "羽川ハスミ", "空崎ヒナ"];
    
    const relationships: Relationship[] = [];
    for (var tagName of tagsNames) {
      const tag = new FullyQualifiedTag(
        Uuid4.of("5ca36600-53dc-402b-8bee-0c6f1680b6fd")!,
        new TagName(tagName),
        Math.floor(Math.random() * 10) > 0 ? undefined : new TagName("ブルーアーカイブ")
      );

      const isStabilized = Math.floor(Math.random() * 7) > 0;
      if (isStabilized) {
        relationships.push(new StabilizedRelationship(tag));
      } else {
        const isUserSuggested = Math.floor(Math.random() * 5) === 0;
        if (isUserSuggested) {
          relationships.push(new UserSuggestedRelationship(tag));
        } else {
          const userVote = [Vote.Agree, Vote.SomewhatAgree, Vote.Disagree, undefined][Math.floor(Math.random() * 4)];
          relationships.push(new OtherSuggestedRelationship(tag, userVote));
        }
      }
    }

    return relationships;
  }

  function getCurrentHierarchy(): TagHierarchy {
    return tabs?.getCurrentlySelectedHierarchy() ?? TagHierarchy.Sub;
  }

  /**
   * 検索関連
  let isSearchResultVisible = $state(false);
  let searchResult: ItemTagData[] = [];
  */
</script>

<div class="menu">
  <Tabs bind:this={tabs} />
  <TagSearchBox />
  <TagList {isSpace} hierarchy={getCurrentHierarchy()} relationships={new ReactiveRelationships(generateTestTags())} />
</div>

<style>
  .menu {
    display: inline-flex;
    flex-direction: column;
    align-items: flex-start;
    overflow: hidden;
    gap: 0.5rem;
  }
</style>
