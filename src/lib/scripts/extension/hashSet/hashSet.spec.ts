import { describe, expect, test } from "vitest";
import { HashSet } from "./hashSet";
import { STRICT_EQUALITY, type EqualityComparer, type Hasher } from "./objectIdentity";

class Wrap {
  constructor(public readonly value: number) {}
}

describe("HashSetのテスト", () => {
  const strHashFunction: Hasher<string> = (value: string) => {
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      hash = (hash << 5) - hash + value.charCodeAt(i);
      hash |= 0;
    }
    return hash;
  }

  test("add(): 要素の追加", () => {
    const set = new HashSet<string>(strHashFunction, STRICT_EQUALITY);
    expect(set.add("Hello")).toBe(true);
    expect(set.add("World")).toBe(true);
    expect(set.add("Hello")).toBe(false);
  });

  test("add(): 数値の追加", () => {
    const wrapHashFunction: Hasher<Wrap> = (value: Wrap) => value.value;
    const wrapEqualsFunction: EqualityComparer<Wrap> = (a: Wrap, b: Wrap) => a.value === b.value;
    const set = new HashSet<Wrap>(wrapHashFunction, wrapEqualsFunction);
    expect(set.add(new Wrap(0))).toBe(true);
    expect(set.add(new Wrap(1))).toBe(true);
    expect(set.add(new Wrap(0))).toBe(false);
  });

  test("remove(): 要素の削除", () => {
    const set = new HashSet<string>(strHashFunction, STRICT_EQUALITY);
    set.add("Hello");
    expect(set.remove("Hello")).toBe(true);
    expect(set.remove("World")).toBe(false);
  });

  test("contains(): 要素の存在確認", () => {
    const set = new HashSet<string>(strHashFunction, STRICT_EQUALITY);
    set.add("Hello");
    expect(set.contains("Hello")).toBe(true);
    expect(set.contains("World")).toBe(false);
  });

  test("空のセットに対する操作", () => {
    const set = new HashSet<string>(strHashFunction, STRICT_EQUALITY);
    expect(set.contains("Hello")).toBe(false);
    expect(set.remove("Hello")).toBe(false);
    expect(set.getSize()).toBe(0);
  });

  test("大量の要素", () => {
    const numberHashFunction = (value: number) => value;
    const set = new HashSet<number>(numberHashFunction, STRICT_EQUALITY);
    const count: number = 10000;
    for (let i = 0; i < count; i++) set.add(i);
    expect(set.getSize()).toBe(count);
    for (let i = 0; i < count; i++) set.contains(i);
  });

  test("iterate(): 要素の反復", () => {
    const set = new HashSet<string>(strHashFunction, STRICT_EQUALITY);
    expect(set.add("Hello")).toBe(true);
    expect(set.add("World")).toBe(true);
    const elements: string[] = [];
    for (var element of set) elements.push(element);
    expect(elements.includes("Hello") && elements.includes("World")).toBe(true);
  });
});