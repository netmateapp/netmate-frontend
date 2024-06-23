import type { Option } from "$lib/option";
import type { Vote } from "$lib/scripts/domain/vote";
import type { FullyQualifiedTag } from "$lib/scripts/domain/tag";

export class CandidateTag {
  public readonly tag: FullyQualifiedTag;

  constructor(tag: FullyQualifiedTag) {
    this.tag = tag;
  }
}

export class OtherSuggestedTag {
  public readonly tag: FullyQualifiedTag;
  public userVote = $state() as Option<Vote>;

  constructor(tag: FullyQualifiedTag, userVote: Option<Vote>) {
    this.tag = tag;
    this.userVote = userVote;
  }
}

export class UserSuggestedTag {
  public readonly tag: FullyQualifiedTag;

  constructor(tag: FullyQualifiedTag) {
    this.tag = tag;
  }
}

export class StabilizedTag {
  public readonly tag: FullyQualifiedTag;

  constructor(tag: FullyQualifiedTag) {
    this.tag = tag;
  }
}

export type Tag = CandidateTag | OtherSuggestedTag | UserSuggestedTag | StabilizedTag;
