export class SessionMemory<T> {
  private readonly sessionKey: string;
  private __value: T;

  private constructor(sessionKey: string, value: T) {
    this.sessionKey = sessionKey;
    this.__value = value;
  }

  static of<T>(sessionKey: string, value: T): SessionMemory<T> {
    const memory = new SessionMemory<T>(sessionKey, value);
    memory.initialize();
    return memory;
  }

  value(): T {
    return this.__value;
  }

  private initialize() {
    window.addEventListener("load", () => this.loadAfterReload());
    window.addEventListener("beforeunload", () => this.saveBeforeReload());
  }

  private loadAfterReload() {
    if (SessionMemory.isReloaded()) {
      const json = sessionStorage.getItem(this.sessionKey);
      if (json) this.__value = JSON.parse(json);
    }
  }

  private saveBeforeReload() {
    sessionStorage.setItem(this.sessionKey, JSON.stringify(this.value));
  }

  private static isReloaded(): boolean {
    return performance.getEntriesByType("navigation").find(entry => entry.entryType === "reload") !== undefined;
  }
}
