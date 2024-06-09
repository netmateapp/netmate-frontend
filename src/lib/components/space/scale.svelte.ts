import { centerHtmlX, centerHtmlY, diffX, diffY, toHtmlX, toHtmlY } from "./coordinate-mapper";
import type { Position } from "./movement.svelte";

const MAX_SCALE = 1.0;
const MIN_SCALE = 0.5;

export class Scaler {
  __scale: number = $state(MAX_SCALE);
  
  constructor(private readonly position: Position) {}

  scale(): number {
    return this.__scale;
  }

  scaleUp() {
    if (this.__scale + 0.1 <= MAX_SCALE) {
      this.__scale += 0.1;

      const dx = diffX(512, centerHtmlX(innerWidth)) / 5;
      const dy = diffY(512, centerHtmlY(innerHeight)) / 5;

      this.position.add(-dx, -dy);
    }
  }

  scaleDown() {
    if (this.__scale - 0.1 >= MIN_SCALE) {
      this.__scale -= 0.1;

      const diffx = diffX(512, centerHtmlX(innerWidth)) / 5;

      const diffy = diffY(512, centerHtmlY(innerHeight)) / 5;

      this.position.add(diffx, diffy);
    }
  }

  initScaler() {
    document.addEventListener("wheel", (event) => {
      if (!event.ctrlKey) {
        if (event.deltaY > 0) this.scaleDown();
        else this.scaleUp();
      }
    });
  }
}
