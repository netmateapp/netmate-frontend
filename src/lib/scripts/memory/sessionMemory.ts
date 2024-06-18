import type { Finalizer, LifeCycle } from "../extension/lifeCycle";

export class SessionMemory<T> implements LifeCycle {
  private readonly sessionKey: string;
  private value: T;

  private constructor(sessionKey: string, initialValue: T) {
    this.sessionKey = sessionKey;
    this.value = initialValue;
  }

  static of<T>(sessionKey: string, value: T): SessionMemory<T> {
    const memory = new SessionMemory<T>(sessionKey, value);
    memory.loadAfterReload();
    return memory;
  }

  get(): T {
    return this.value;
  }

  set(newValue: T) {
    this.value = newValue;
  }

  initialize(): Finalizer {
    const beforeReload = () => this.saveBeforeReload();
    window.addEventListener("beforeunload", beforeReload);
    return () => window.removeEventListener("beforeunload", beforeReload);
  }

  private loadAfterReload() {
    if (SessionMemory.isReloaded()) {
      const json = sessionStorage.getItem(this.sessionKey);
      if (json) this.value = JSON.parse(json);
    }
  }

  private saveBeforeReload() {
    sessionStorage.setItem(this.sessionKey, JSON.stringify(this.value));
  }

  private static isReloaded(): boolean {
    // 下記のコードが何故かコンパイルエラーになるため、anyを使用する
    // return performance.getEntriesByType("navigation").find(entry => entry.type === "reload") !== undefined;

    const entries: any[] = performance.getEntriesByType("navigation");
    for (var entry of entries) {
      if (entry.type === "reload") return true;
    }
    return false;
  }
}
