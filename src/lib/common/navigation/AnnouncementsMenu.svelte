<script lang="ts">
    import { _, calculateMenuPosition, elapsedTime } from "./nav.svelte";

  class Announcement {
    id: number;
    title: string;
    isRead: boolean;

    constructor(id: number, title: string, isRead: boolean) {
      this.id = id;
      this.title = title;
      this.isRead = isRead;
    }
  }

  function announcements(): Announcement[] {
    return [
      new Announcement(3423425, "5/24 04:00 よりメンテナンスを行います", false),
      new Announcement(3423424, "5/24 04:00 よりメンテナンスを行います", true),
      new Announcement(3423423, "5/24 04:00 よりメンテナンスを行います", true),
    ];
  }

  function hasUnreadAnnouncements(): boolean {
    for (var announcement of announcements()) {
      if (!announcement.isRead) return true;
    }
    return false;
  }

  let { basePoint }: { basePoint: DOMRect } = $props();

  let menuRef: MaybeElement = $state(null);

  export function contains(element: Element): boolean {
    return menuRef?.contains(element) ?? false;
  }
</script>

<div bind:this={menuRef} class="menu" style={calculateMenuPosition(basePoint, menuRef)}>
  {#each announcements() as announcement}
    <a href="https://netmate.app/announcements/{announcement.id}" class="item">
      <span class="timestamp">{_("elapsed-time-since-announcement", elapsedTime(1715949166785))}</span>
      <span
        class="title"
        class:unread={!announcement.isRead}>
        {announcement.title}</span>
    </a>
  {/each}
</div>

<style>
  .menu {
    position: fixed;
    background-color: var(--dominant-color);
    border-radius: 1rem;
    box-shadow: var(--soft-shadow);
    display: inline-flex;
    padding: 0.5rem 0rem;
    flex-direction: column;
    align-items: flex-start;
    z-index: 1;
  }

  .item {
    display: flex;
    padding: 0.25rem 0.75rem;
    flex-direction: column;
    align-items: flex-start;
  }

  .timestamp {
    color: var(--light-gray);
    font-family: var(--primary-font);
    font-size: 0.75rem;
    white-space: nowrap;
  }

  .title {
    max-width: 17.5rem;
    color: var(--accent-color);
    font-family: var(--primary-font);
    font-size: 0.875rem;
    line-height: 1.25rem;
    white-space: nowrap;
  }
</style>