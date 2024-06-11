import { calculateCharactersCosts } from "$lib/cjk.svelte";
import type { Uuid4 } from "$lib/uuid";

export type HandleId = Uuid4;

const MAX_HANDLE_NAME_CHARACTERS_COST = 100;

export class HandleName {
  public readonly name: string;

  constructor(name: string) {
    if (!HandleName.isValid(name)) throw new Error(`The characters cost of name must be less than or equal to ${MAX_HANDLE_NAME_CHARACTERS_COST}.`);
    this.name = name;
  }

  private static isValid(name: string): boolean {
    return calculateCharactersCosts(name) <= MAX_HANDLE_NAME_CHARACTERS_COST;
  }
}

export class Handle {
  public readonly id: HandleId;
  public readonly name: HandleName;

  constructor(id: HandleId, name: HandleName) {
    this.id = id;
    this.name = name;
  }
}