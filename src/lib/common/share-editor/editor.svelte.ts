import { createTranslator } from "$lib/i18n.svelte";

export const _ = createTranslator("common", "share-editor");

// エディタのスクロールの都合上、ビューポートでなくfloatingを参照する
export function calculateMenuPosition(buttonRect: DOMRect, menuRef: MaybeElement): string {
  if (menuRef == null) return `top: 0px; left: 0px;`;

  const menuRect = menuRef.getBoundingClientRect();

  let top = buttonRect.top + buttonRect.height + 2;
  let left = buttonRect.left;

  const viewportWidth = window.innerWidth;
  //const viewportHeight = window.innerHeight;

  const floating = document.getElementsByClassName("floating")[0];
  const floatingRect = floating.getBoundingClientRect();
  const scrollY = Math.abs(floatingRect.top);
  const floatingHeight = floatingRect.height + scrollY;

  if (left + menuRect.width > viewportWidth) {
    left = viewportWidth - menuRect.width - 16;
  }

  if (top + scrollY + menuRect.height > floatingHeight) {
    top = buttonRect.top + scrollY - menuRect.height - 16;
  }

  return `top: ${top}px; left: ${left}px;`;
}
