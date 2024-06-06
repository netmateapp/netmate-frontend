import type { InteractEvent } from "$lib/types";

let currentX = $state(0);
let currentY = $state(0);
let isMoved = false;

export function getCurrentX(): number {
  return currentX;
}

export function getCurrentY(): number {
  return currentY;
}

let isDragging = false;
let previousX: number = 0;
let previousY: number = 0;

type MoveEvent = MouseEvent | TouchEvent;

function touchStart(event: MoveEvent) {
  isDragging = true;
  if (event instanceof TouchEvent) {
    previousX = event.touches[0].clientX;
    previousY = event.touches[0].clientY;
  }
}

function touchEnd(event: MoveEvent) {
  isDragging = false;

  // タッチのドラッグ操作終了時にClickイベントは呼び出されないため
  if (event instanceof TouchEvent && isMoved) isMoved = false;
}

function touchMove(event: MoveEvent) {
  if (isDragging) {
    if (!isMoved) isMoved = true;

    if (event instanceof MouseEvent) {
      currentX += event.movementX;
      currentY += event.movementY;
    } else {
      let clientX = event.touches[0].clientX;
      let clientY = event.touches[0].clientY;
      let movementX = clientX - previousX;
      let movementY = clientY - previousY;
      currentX += movementX;
      currentY += movementY;
      previousX = clientX;
      previousY = clientY;
    }
  }
}

function cancelDrag(event: DragEvent) {
  event.preventDefault();
  event.stopPropagation();
}

// 共有やコアをドラッグした場合に飛ばないように
function cancelInteract(event: InteractEvent) {
  if (isMoved) {
    event.preventDefault();
    event.stopPropagation();
    isMoved = false;
  }
}

export function initializeSpace() {
  $effect(() => {
    document.addEventListener("click", cancelInteract);
    document.addEventListener("touchstart", touchStart);
    document.addEventListener("touchmove", touchMove);
    document.addEventListener("touchend", touchEnd);
    document.addEventListener("mousedown", touchStart);
    document.addEventListener("mousemove", touchMove);
    document.addEventListener("mouseleave", touchEnd);
    document.addEventListener("mouseup", touchEnd);
    document.addEventListener("dragstart", cancelDrag);
  });
}