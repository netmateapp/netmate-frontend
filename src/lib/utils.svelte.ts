export function registerInteractHandler(handler: (event: InteractEvent) => void, useCapture: boolean = false) {
  $effect(() => {
    document.addEventListener("click", handler, useCapture);
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
    }, useCapture);
  });
}

export function registerCloseHandler(handler: () => void) {
  $effect(() => {
    document.addEventListener("keydown", (event: KeyboardEvent) => {
      if (event.key === "Escape") handler();
    });
  });
}
