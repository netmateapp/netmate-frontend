import type { InteractEvent } from "./types";

type InteractEventHandler = (event: InteractEvent) => void;

export function interactHandlersEffect(...handlers: InteractEventHandler[]): () => void {
  return () => {
    $effect(() => {
      const keydownHandlers: ((event: KeyboardEvent) => void)[] = [];
      for (var [index, handler] of handlers.entries()) {
        document.addEventListener("click", handler);

        const keydownHandler = makeKeydownHandler(handler);
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

export function makeKeydownHandler(handler: InteractEventHandler): (event: KeyboardEvent) => void {
  return (event: KeyboardEvent) => {
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
}

/*export function registerCloseHandler(handler: () => void) {
  $effect(() => {
    document.addEventListener("keydown", (event: KeyboardEvent) => {
      if (event.key === "Escape") handler();
    });
  });
}*/
