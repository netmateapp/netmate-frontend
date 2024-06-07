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
let velocityX: number = 0;
let velocityY: number = 0;
let animationFrameId: number;
const maxVelocity = 50;

type MoveEvent = MouseEvent | TouchEvent;

function touchStart(event: MoveEvent) {
  isDragging = true;
  if (event instanceof TouchEvent) {
    previousX = event.touches[0].clientX;
    previousY = event.touches[0].clientY;
  } else if (event instanceof MouseEvent) {
    previousX = event.clientX;
    previousY = event.clientY;
  }
  cancelAnimationFrame(animationFrameId);
  velocityX = 0;
  velocityY = 0;

  // ドラッグ移動時にサイドバーの要素などが選択されないように
  document.getSelection()?.empty();
  document.body.style.userSelect = 'none';
}

function touchEnd(event: MoveEvent) {
  isDragging = false;

  // タッチのドラッグ操作終了時にClickイベントは呼び出されないため
  if (event instanceof TouchEvent && isMoved) isMoved = false;

  applyInertia();

  document.body.style.userSelect = '';
}

function touchMove(event: MoveEvent) {
  if (isDragging) {
    if (!isMoved) isMoved = true;

    let clientX, clientY, movementX, movementY;

    if (event instanceof MouseEvent) {
      clientX = event.clientX;
      clientY = event.clientY;
    } else {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    }

    movementX = clientX - previousX;
    movementY = clientY - previousY;

    currentX += movementX;
    currentY += movementY;

    velocityX = Math.max(-maxVelocity, Math.min(maxVelocity, movementX));
    velocityY = Math.max(-maxVelocity, Math.min(maxVelocity, movementY));

    previousX = clientX;
    previousY = clientY;
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

function applyInertia() {
  const friction = 0.95;
  const minVelocity = 0.5;

  function step() {
    if (Math.abs(velocityX) > minVelocity || Math.abs(velocityY) > minVelocity) {
      currentX += velocityX;
      currentY += velocityY;

      velocityX *= friction;
      velocityY *= friction;

      animationFrameId = requestAnimationFrame(step);
    }
  }

  step();
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