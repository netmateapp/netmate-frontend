import { createTranslator } from "$lib/i18n.svelte";
import type { Option } from "$lib/option";
import type { Vote } from "$lib/scripts/domain/vote";
import type { FullyQualifiedTag } from "$lib/scripts/domain/tag";

export const _ = createTranslator("tag", "menu");

export enum TagHierarchy {
  Super = "super",
  Equivalent = "equivalent",
  Sub = "sub",
}

export class RelationshipCandidate {
  public readonly tag: FullyQualifiedTag;

  constructor(tag: FullyQualifiedTag) {
    this.tag = tag;
  }
}

export class OtherSuggestedRelationship {
  public readonly tag: FullyQualifiedTag;
  public userVote = $state() as Option<Vote>;

  constructor(tag: FullyQualifiedTag, userVote: Option<Vote>) {
    this.tag = tag;
    this.userVote = userVote;
  }
}

export class UserSuggestedRelationship {
  public readonly tag: FullyQualifiedTag;

  constructor(tag: FullyQualifiedTag) {
    this.tag = tag;
  }
}

export class StabilizedRelationship {
  public readonly tag: FullyQualifiedTag;

  constructor(tag: FullyQualifiedTag) {
    this.tag = tag;
  }
}

export type Relationship = RelationshipCandidate | OtherSuggestedRelationship | UserSuggestedRelationship | StabilizedRelationship;

export class ReactiveRelationships {
  public readonly relationships = $state() as Relationship[];

  constructor(relationships: Relationship[]) {
    this.relationships = relationships;
  }
}
