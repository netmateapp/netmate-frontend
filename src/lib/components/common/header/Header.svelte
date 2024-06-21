<script>
  import Brand from "../brand/Brand.svelte";
  import Navigation from "../navigation/Navigation.svelte";
  import SearchBox from "../search-box/SearchBox.svelte";
</script>

<Brand x={16} y={8} />
<div class="search-box-wrapper">
  <SearchBox />
</div>
<Navigation />

<style>
  .search-box-wrapper {
    position: fixed;
    top: 0.5rem;
    left: 50%;
    transform: translate(-50%, 0%);
    z-index: 100;
  }
</style>