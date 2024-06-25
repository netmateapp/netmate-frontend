import { createTranslator } from "$lib/i18n.svelte";
import type { SessionShareData } from "$lib/scripts/domain/session";

export const _ = createTranslator("session", "session");

export class HiddenShares {
  public readonly shares: SessionShareData[];

  constructor(shares: SessionShareData[]) {
    this.shares = shares;
  }
}

export class DeletedSharesCount {
  public readonly count: number;

  constructor(count: number) {
    this.count = count;
  }
}

export type SessionLine = SessionShareData | HiddenShares | DeletedSharesCount;
