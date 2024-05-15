export type InteractEvent = MouseEvent | FocusEvent;

export function calculateMenuPosition(buttonRef: Element | null, menuRef: Element | null) {
  if (buttonRef == null || menuRef == null) return `top: 0px; left 0px;`;

  const buttonRect = buttonRef.getBoundingClientRect();
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