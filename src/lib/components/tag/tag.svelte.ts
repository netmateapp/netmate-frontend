import { createTranslator } from "$lib/i18n.svelte";

export const _ = createTranslator("tag", "menu");

export enum TagHierarchy {
  Super = "super",
  Equivalent = "equivalent",
  Sub = "sub",
}
