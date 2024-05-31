export function interactHandlersEffect(...handlers: ((event: InteractEvent) => void)[]): () => void {
  return () => {
    $effect(() => {
      const keydownHandlers: ((event: KeyboardEvent) => void)[] = [];
      for (var [index, handler] of handlers.entries()) {
        document.addEventListener("click", handler);

        const keydownHandler = (event: KeyboardEvent) => {
          switch (event.key) {
            case "Space":
              event.preventDefault();
            case "Enter":
              handler(event);
              break;
            default:
              break;
          }
        };
        keydownHandlers[index] = keydownHandler;

        document.addEventListener("keydown", keydownHandler);
      }

      return () => {
        for (var [index, handler] of handlers.entries()) {
          document.removeEventListener("click", handler);
          document.removeEventListener("keydown", keydownHandlers[index]);
        }
      };
    });
  };
}

/*export function registerCloseHandler(handler: () => void) {
  $effect(() => {
    document.addEventListener("keydown", (event: KeyboardEvent) => {
      if (event.key === "Escape") handler();
    });
  });
}*/
