import { calculateCharactersCosts } from "$lib/cjk.svelte";
import type { Option } from "$lib/option";
import type { Uuid4 } from "$lib/uuid";

export type TagId = Uuid4;

const MAX_TAG_NAME_CHARACTERS_COST = 100;

export class TagName {
  public readonly name: string;

  constructor(name: string) {
    if (!TagName.isValid(name)) throw new Error(`The characters cost of name must be less than or equal to ${MAX_TAG_NAME_CHARACTERS_COST}.`);
    this.name = name;
  }

  private static isValid(name: string): boolean {
    return calculateCharactersCosts(name) <= MAX_TAG_NAME_CHARACTERS_COST;
  }
}

export class Tag {
  public readonly id: TagId;
  public readonly name: TagName;

  constructor(id: TagId, name: TagName) {
    this.id = id;
    this.name = name;
  }

  equals(other: Tag): boolean {
    return this.id.asHexadecimalRepresentation() === other.id.asHexadecimalRepresentation();
  }
}

export class FullyQualifiedTag {
  public readonly id: TagId;
  public readonly name: TagName;
  public readonly disambiguation: Option<TagName>;

  constructor(id: TagId, name: TagName, disambiguation: Option<TagName> = undefined) {
    this.id = id;
    this.name = name;
    this.disambiguation = disambiguation;
  }
}
