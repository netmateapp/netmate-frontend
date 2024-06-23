import { createTranslator } from "$lib/i18n.svelte";
import type { Tag } from "$lib/scripts/domain/tagging.svelte";

export const _ = createTranslator("tag", "menu");

export enum TagHierarchy {
  Super = "super",
  Equivalent = "equivalent",
  Sub = "sub",
}

export class ReactiveTags {
  public readonly tags = $state() as Tag[];

  constructor(tags: Tag[]) {
    this.tags = tags;
  }
}
