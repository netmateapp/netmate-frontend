import { centerHtmlX, centerHtmlY, diffX, diffY, toHtmlX, toHtmlY } from "./coordinateMapper";
import type { Position } from "./movement.svelte";

const MAX_SCALE = 1.0;
const DEFAULT_SCALE = 1.0;
const MIN_SCALE = 0.5;

export class Scaler {
  __scale: number = $state(DEFAULT_SCALE);
  
  constructor(private readonly position: Position) {}

  scale(): number {
    return this.__scale;
  }

  reset() {
    this.__scale = MAX_SCALE;
  }

  scaleUp() {
    if (this.__scale + 0.1 <= MAX_SCALE) {
      this.__scale += 0.1;

      const unitx = diffX(512, centerHtmlX(innerWidth)) / 15;
      const xs = [unitx, unitx * 2, unitx * 3, unitx * 4, unitx * 5];
      const unity = diffY(512, centerHtmlY(innerHeight)) / 15;
      const ys = [unity, unity * 2, unity * 3, unity * 4, unity * 5];

      this.position.add(-xs[10 - Math.round(this.__scale * 10)], -ys[10 - Math.round(this.__scale * 10)]);
    }
  }

  scaleDown() {
    if (this.__scale - 0.1 >= MIN_SCALE) {
      this.__scale -= 0.1;

      const unitx = diffX(512, centerHtmlX(innerWidth)) / 15;
      const xs = [unitx, unitx * 2, unitx * 3, unitx * 4, unitx * 5];
      const unity = diffY(512, centerHtmlY(innerHeight)) / 15;
      const ys = [unity, unity * 2, unity * 3, unity * 4, unity * 5];

      this.position.add(xs[10 - Math.round(this.__scale * 10) - 1], ys[10 - Math.round(this.__scale * 10) - 1]);
    }
  }

  initScaler(): () => void {
    const handler = (event: WheelEvent) => {
      if (!event.ctrlKey) {
        if (event.deltaY > 0) this.scaleDown();
        else this.scaleUp();
      }
    };

    document.addEventListener("wheel", handler);

    return () => {
      document.removeEventListener("wheel", handler);
    };
  }
}
