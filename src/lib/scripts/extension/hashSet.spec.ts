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

  test("add(): 要素の追加", () => {
    const set = new HashSet<string>(hashFunction);
    expect(set.add("Hello")).toBe(true);
    expect(set.add("World")).toBe(true);
    expect(set.add("Hello")).toBe(false);
  });

  test("remove(): 要素の削除", () => {
    const set = new HashSet<string>(hashFunction);
    set.add("Hello");
    expect(set.remove("Hello")).toBe(true);
    expect(set.remove("World")).toBe(false);
  });

  test("contains(): 要素の存在確認", () => {
    const set = new HashSet<string>(hashFunction);
    set.add("Hello");
    expect(set.contains("Hello")).toBe(true);
    expect(set.contains("World")).toBe(false);
  });

  test("空のセットに対する操作", () => {
    const set = new HashSet<string>(hashFunction);
    expect(set.contains("Hello")).toBe(false);
    expect(set.remove("Hello")).toBe(false);
    expect(set.getSize()).toBe(0);
  });

  test("大量の要素", () => {
    const set = new HashSet<string>(hashFunction);
    const count: number = 10000;
    for (let i = 0; i < count; i++) set.add(`${i}`);
    expect(set.getSize()).toBe(count);
    for (let i = 0; i < count; i++) set.contains(`${i}`);
  });

  test("iterate(): 要素の反復", () => {
    const set = new HashSet<string>(hashFunction);
    expect(set.add("Hello")).toBe(true);
    expect(set.add("World")).toBe(true);
    const elements: string[] = [];
    for (var element of set) elements.push(element);
    expect(elements.includes("Hello") && elements.includes("World")).toBe(true);
  });
});