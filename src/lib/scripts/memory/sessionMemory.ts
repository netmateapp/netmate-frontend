import type { Option } from "$lib/option";
import type { Finalizer, LifeCycle } from "../extension/lifeCycle";
import type { Deserializer, Serializer } from "../extension/serialization";

export class SessionMemory<T> implements LifeCycle {
  constructor(
    private readonly sessionKey: string,
    private value: T,
    private serializer: Serializer<T, string>,
    private deserializer: Deserializer<T, string>,
  ) {}

  static of<T>(sessionKey: string, value: T, serializer: Serializer<T, string>, deserializer : Deserializer<T, string>): SessionMemory<T> {
    const memory = new SessionMemory<T>(sessionKey, value, serializer, deserializer);
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
      if (json) {
        const value: Option<T> = this.deserializer(json);
        if (value) this.value = value;
      }
    }
  }

  private saveBeforeReload() {
    const serial: Option<string> = this.serializer(this.value);
    if (serial) sessionStorage.setItem(this.sessionKey, serial);
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
