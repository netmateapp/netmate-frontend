import { createTranslator } from "$lib/i18n.svelte";
import type { MaybeHTMLElement } from "$lib/types";

export const _ = createTranslator("common", "navigation");

export function calculateMenuPosition(buttonRect: DOMRect, menuRef: MaybeHTMLElement): string {
  if (menuRef == null) return `top: 0px; left: 0px;`;

  const menuRect = menuRef.getBoundingClientRect();

  let top = buttonRect.top + buttonRect.height + 2;
  let left = buttonRect.left;

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  if (left + menuRect.width > viewportWidth) {
    left = viewportWidth - menuRect.width - 16; // 端から16px空ける
  }

  if (top + menuRect.height > viewportHeight) {
    top = buttonRect.top - menuRect.height - 16;
  }

  return `top: ${top}px; left: ${left}px;`;
}

export function elapsedTime(timestamp: number): { unit: string, t: number } {
  const now = Date.now();
  const elapsedMillis = now - timestamp;

  const minutes = Math.floor(elapsedMillis / (1000 * 60));
  const hours = Math.floor(elapsedMillis / (1000 * 60 * 60));
  const days = Math.floor(elapsedMillis / (1000 * 60 * 60 * 24));
  const weeks = Math.floor(elapsedMillis / (1000 * 60 * 60 * 24 * 7));

  if (weeks > 0) {
      return { unit: 'weeks', t: weeks };
  } else if (days > 0) {
      return { unit: 'days', t: days };
  } else if (hours > 0) {
      return { unit: 'hours', t: hours };
  } else {
      return { unit: 'minutes', t: minutes };
  }
}


