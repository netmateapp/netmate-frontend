<script>
  import { browser } from "$app/environment";
  
  import "../app.css";
  import "../i18n.svelte";

  // a11y: タブ時のみフォーカスが表示されるようにする
  if (browser) {
    document.body.addEventListener("mousedown", () => {
      document.body.classList.add("using-mouse");
      console.log("layout.s using-mouse");
    });

    document.body.addEventListener("keydown", event => {
      console.log(event.key);
      if (event.key === "Tab") {
        document.body.classList.remove("using-mouse");
        console.log("layout.s using-tab: " + document.body.classList);
      }
    });
  }
</script>

<slot />