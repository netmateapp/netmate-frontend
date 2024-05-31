<script>
  import { browser } from "$app/environment";
    import Toast from "$lib/components/common/toast/Toast.svelte";
    import Tooltip from "$lib/components/common/tooltip/Tooltip.svelte";
  
  import "../app.css";
  import "../lib/i18n.svelte";

  // a11y: タブ時のみフォーカスが表示されるようにする
  if (browser) {
    document.body.addEventListener("mousedown", () => {
      document.body.classList.add("using-mouse");
    });

    document.body.addEventListener("keydown", event => {
      if (event.key === "Tab") {
        document.body.classList.remove("using-mouse");
      }
    });
  }
</script>

<Tooltip />
<Toast />

<slot />