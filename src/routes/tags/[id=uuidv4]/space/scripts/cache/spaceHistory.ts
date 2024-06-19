import type { Tag } from "$lib/scripts/domain/tag";
import type { VirtualLocation } from "../coordinateSystem/virtualCoordinateSystem.svelte";

export class SpaceHistoryEntry {
  public readonly tag: Tag;
  public readonly lastViewCenterLocation: VirtualLocation;

  constructor(tag: Tag, lastViewCenterLocation: VirtualLocation) {
    this.tag = tag;
    this.lastViewCenterLocation = lastViewCenterLocation;
  }
}

export class SpaceHistory {
  private entries: SpaceHistoryEntry[];
  private pointer: number;

  constructor(entries: SpaceHistoryEntry[] = [], pointer: number = 0) {
    this.entries = entries;
    this.pointer = pointer;
  }

  goToPrevious(from: Tag, lastViewCenterLocation: VirtualLocation) {
    if (this.pointer === 0) return;
    if (this.pointer === this.entries.length - 1) this.entries.push(new SpaceHistoryEntry(from, lastViewCenterLocation));
    else {
      this.entries[this.pointer] = new SpaceHistoryEntry(from, lastViewCenterLocation);
      this.back();
    }
  }

  goToNext(from: Tag, lastViewCenterLocation: VirtualLocation) {
    if (this.pointer !== this.entries.length - 1) this.entries = this.entries.splice(0, this.pointer + 1);
    this.entries.push(new SpaceHistoryEntry(from, lastViewCenterLocation));
    this.foward();
  }

  getPrevious(): SpaceHistoryEntry {
    if (!this.hasPrevious()) throw new Error("A space history has no previous.");
    else return this.entries[this.pointer - 1];
  }

  getNext(): SpaceHistoryEntry {
    if (!this.hasNext()) throw new Error("A space hisotry has no next.");
    else return this,this.entries[this.pointer + 1];
  }

  isPrevious(tag: Tag): boolean {
    if (this.hasPrevious()) return this.entries[this.pointer - 1].tag.equals(tag);
    else return false;
  }

  isNext(tag: Tag): boolean {
    if (this.hasNext()) return this.entries[this.pointer + 1].tag.equals(tag);
    else return false;
  }

  private back() {
    if (this.hasPrevious()) this.pointer--;
  }

  private foward() {
    if (this.hasNext()) this.pointer++;
  }

  private hasPrevious(): boolean {
    return this.pointer > 0;
  }

  private hasNext(): boolean {
    return this.pointer < this.entries.length - 1;
  }
}
