
export class UnixTimeMillis {
  public readonly time: number;

  constructor(time: number) {
    if (!UnixTimeMillis.isValid(time)) throw new Error(`A time must be non-negative integer.`);
    this.time = time;
  }

  private static isValid(time: number) {
    return time >= 0 && Number.isInteger(time);
  }

  static now(): UnixTimeMillis {
    return new UnixTimeMillis(Date.now());
  }
}
