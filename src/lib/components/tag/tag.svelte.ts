import { createTranslator } from "$lib/i18n.svelte";

export const _ = createTranslator("tag", "menu");

export enum TagHierarchy {
  Super,
  Equivalent,
  Sub,
}

export function hierarchyAsText(hierarchy: TagHierarchy): string {
  switch(hierarchy) {
    case TagHierarchy.Super:
      return "super";
    case TagHierarchy.Equivalent:
      return "equivalent";
    case TagHierarchy.Sub:
      return "sub";
  }
}
