<script>
  import Brand from "$lib/components/common/brand/Brand.svelte";
  import Navigation from "$lib/components/common/navigation/Navigation.svelte";
  import SearchBox from "$lib/components/common/search-box/SearchBox.svelte";
  import SharesList from "$lib/components/database/shares-list/SharesList.svelte";
</script>

<Brand x={16} y={8} />
<SearchBox />
<Navigation />
<SharesList />