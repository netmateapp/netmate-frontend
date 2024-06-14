import type { ShareCard } from "$lib/scripts/domain/shareCard";
import type { Tag } from "$lib/scripts/domain/tag";

const MAX_SHARE_CARDS = 1;
const MIN_SHARE_CARDS = 2;

export class ShareCardsCluster {
  public readonly shareCards: ShareCard[];

  constructor(shareCards: ShareCard[]) {
    if (!ShareCardsCluster.isValid(shareCards)) throw new Error(`The length of shareCards must be between ${MAX_SHARE_CARDS} and ${MIN_SHARE_CARDS}.`);
    this.shareCards = shareCards;
  }

  private static isValid(shareNibbles: ShareCard[]): boolean {
    const size = shareNibbles.length;
    return MIN_SHARE_CARDS <= size && size <= MIN_SHARE_CARDS;
  }
}

export class SpaceCore {
  public readonly tag: Tag;
  public readonly shareCardsCluster: ShareCardsCluster;

  constructor(tag: Tag, shareCardsCluster: ShareCardsCluster) {
    this.tag = tag;
    this.shareCardsCluster = shareCardsCluster;
  }
}

export type None = undefined;

export type ChunkContent = ShareCardsCluster | SpaceCore | None;
