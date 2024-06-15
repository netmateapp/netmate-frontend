import { describe, expect, test } from "vitest";
import { HashSet } from "./hashSet";

describe("HashSetのテスト", () => {
  const hashFunction = (value: string) => {
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      hash = (hash << 5) - hash + value.charCodeAt(i);
      hash |= 0;
    }
    return hash;
  }

  test("値の非重複性", () => {
    const set = new HashSet<string>(hashFunction);
    set.add("Hello");
    set.add("Hello");
    set.add("World");
    expect(set.getSize()).toBe(2);
  });

  test("値の削除", () => {
    const set = new HashSet<string>(hashFunction);
    set.add("Hello");
    set.add("World");
    set.remove("Hello");
    expect(set.contains("Hello")).toBe(false);
  });
});