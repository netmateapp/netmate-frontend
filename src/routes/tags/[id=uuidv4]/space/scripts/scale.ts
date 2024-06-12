const MAX_SCALE = 1.0;
const MIN_SCALE = 0.5;

export class Scaler {
  private scale: number = $state(MAX_SCALE);

  currentScale(): number {
    return this.scale;
  }
}