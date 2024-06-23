import { createTranslator } from "$lib/i18n.svelte";
import type { Option } from "$lib/option";
import type { Tag } from "$lib/scripts/domain/tag";
import type { Vote } from "$lib/scripts/domain/vote";

export const _ = createTranslator("session", "menu");

export class CandidateTag {
  public readonly tag: Tag;

  constructor(tag: Tag) {
    this.tag = tag;
  }
}

export class OtherSuggestedTag {
  public readonly tag: Tag;
  public userVote = $state() as Option<Vote>;

  constructor(tag: Tag, userVote: Option<Vote>) {
    this.tag = tag;
    this.userVote = userVote;
  }
}

export class UserSuggestedTag {
  public readonly tag: Tag;

  constructor(tag: Tag) {
    this.tag = tag;
  }
}

export class StabilizedTag {
  public readonly tag: Tag;

  constructor(tag: Tag) {
    this.tag = tag;
  }
}

export type ShareTag = CandidateTag | OtherSuggestedTag | UserSuggestedTag | StabilizedTag | string;


export class ReactiveShareTags {
  public readonly relationships = $state() as ShareTag[];

  constructor(relationships: ShareTag[]) {
    this.relationships = relationships;
  }
}
