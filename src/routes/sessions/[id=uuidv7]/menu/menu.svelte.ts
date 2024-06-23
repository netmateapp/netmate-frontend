import { createTranslator } from "$lib/i18n.svelte";
import type { Option } from "$lib/option";
import type { Tag } from "$lib/scripts/domain/tag";
import type { Vote } from "$lib/scripts/domain/vote";
import type { Reactive, Reactivity } from "$lib/scripts/extension/reactivity";

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

export class ReactiveShareTags implements Reactivity<ShareTag[]> {
  private tags = $state() as ShareTag[];

  constructor(tags: ShareTag[]) {
    this.tags = tags;
  }

  reactiveValue(): Reactive<ShareTag[]> {
    return this.tags;
  }

  update(newTags: ShareTag[]) {
    this.tags = newTags;
  }
}
