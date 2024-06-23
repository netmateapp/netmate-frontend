<script lang="ts">
  import type { ReactiveShareData } from "$lib/scripts/domain/share";
  import RatingButtons from "./RatingButtons.svelte";
  import ShareInformation from "./ShareInformation.svelte";
    import TagList from "./TagList.svelte";
    import { ReactiveShareTags } from "./menu.svelte";

  type Props = {
    share: ReactiveShareData;
  };

  let { share }: Props = $props();

</script>

<div class="menu">
  <div class="current-share">
    <ShareInformation {share} />
    <RatingButtons {share} />
  </div>
  <TagList tags={new ReactiveShareTags([])} />
</div>