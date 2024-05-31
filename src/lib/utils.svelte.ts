export function registerInteractHandler(handler: (event: InteractEvent) => void) {
  $effect(() => {
    document.addEventListener("click", handler);
    document.addEventListener("keydown", (event: KeyboardEvent) => {
      switch (event.key) {
        case "Space":
          event.preventDefault();
        case "Enter":
          handler(event);
          break;
        default:
          break;
      }
    });
  });
}

export function registerCloseHandler(handler: () => void) {
  $effect(() => {
    document.addEventListener("keydown", (event: KeyboardEvent) => {
      if (event.key === "Escape") handler();
    });
  });
}
