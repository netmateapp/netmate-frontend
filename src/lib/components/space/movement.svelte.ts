import type { Scaler } from "./scale.svelte";

type InteractionEvent = MouseEvent | TouchEvent;

function isMouseEvent(event: InteractionEvent): event is MouseEvent {
  return event instanceof MouseEvent;
}

// 直交座標系の座標は修飾子無し、HTML座標系の座標は`HTML`修飾子を変数名等に付する

export class Position {
  private x: number = $state(0);
  private y: number = $state(0);

  private isDragging = false;
  private previousHtmlX: number = 0;
  private previousHtmlY: number = 0;
  private velocityX: number = 0;
  private velocityY: number = 0;
  private animationFrameId: number = 0;
  private isCoordinateUpdated = false;
  
  constructor(initialX: number, initialY: number) {
    this.x = initialX;
    this.y = initialY;
  }

  add(ax: number, ay: number) {
    this.x += ax;
    this.y += ay;
  }

  set(sx: number, sy: number) {
    this.x = sx;
    this.y = sy;
  }

  reactiveX(): number {
    return this.x;
  }

  reactiveY(): number {
    return this.y;
  }

  interactStart(event: InteractionEvent) {
    this.isDragging = true;

    if (isMouseEvent(event)) {
      this.previousHtmlX = event.clientX;
      this.previousHtmlY = event.clientY;
    } else {
      this.previousHtmlX = event.touches[0].clientX;
      this.previousHtmlY = event.touches[0].clientY;
    }

    cancelAnimationFrame(this.animationFrameId);
    this.resetVelocities();
  
    // ドラッグ移動時にサイドバーの要素などが選択されないように
    this.clearSelection();
    this.disableSelection();
  }

  private resetVelocities() {
    this.velocityX = 0;
    this.velocityY = 0;
  }

  private clearSelection() {
    document.getSelection()?.empty();
  }

  private disableSelection() {
    document.body.style.userSelect = 'none';
  }

  interactEnd(event: InteractionEvent) {
    this.isDragging = false;

    this.disableCoordinateUpdatedFlagOnTouchEvent(event);
  
    this.applyInertia();
  
    this.enableSelection();
  }

  private disableCoordinateUpdatedFlagOnTouchEvent(event: InteractionEvent) {
    // タッチのドラッグ操作終了時にClickイベントは呼び出されないため
    if (event instanceof TouchEvent && this.isCoordinateUpdated) this.isCoordinateUpdated = false;
  }

  private enableSelection() {
    document.body.style.userSelect = '';
  }

  applyInertia() {
    const friction = 0.95;
    const minVelocity = 0.5;
  
    const step = () =>  {
      if (Math.abs(this.velocityX) > minVelocity || Math.abs(this.velocityY) > minVelocity) {
        this.x += this.velocityX;
        this.y += this.velocityY;
  
        this.velocityX *= friction;
        this.velocityY *= friction;
  
        this.animationFrameId = requestAnimationFrame(step);
      }
    };
  
    step();
  }

  interactMove(event: InteractionEvent) {
    if (this.isDragging) {
      if (!this.isCoordinateUpdated) this.isCoordinateUpdated = true;
  
      let htmlX: number, htmlY: number, movementX: number, movementY: number;
  
      if (isMouseEvent(event)) {
        htmlX = event.clientX;
        htmlY = event.clientY;
      } else {
        htmlX = event.touches[0].clientX;
        htmlY = event.touches[0].clientY;
      }
  
      movementX = -(htmlX - this.previousHtmlX);
      const movementHtmlY = -(htmlY - this.previousHtmlY);
      movementY = -movementHtmlY;

      this.x += movementX;
      this.y += movementY;

      const maxVelocity = 60;

      this.velocityX = Math.max(-maxVelocity, Math.min(maxVelocity, movementX));
      this.velocityY = Math.max(-maxVelocity, Math.min(maxVelocity, movementY));
  
      this.previousHtmlX = htmlX;
      this.previousHtmlY = htmlY;
    }
  }
  
  disableDrag(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }
  
  // 共有やコアをドラッグした場合に飛ばないように
  cancelDefaultBehaviorWhenMoving(event: MouseEvent) {
    if (this.isCoordinateUpdated) {
      event.preventDefault();
      event.stopPropagation();
      this.isCoordinateUpdated = false;
    }
  }
  
  init(): () => void {
    const start = (event: InteractionEvent) => this.interactStart(event);
    const end = (event: InteractionEvent) => this.interactEnd(event);
    const move = (event: InteractionEvent) => this.interactMove(event);
    const click = (event: MouseEvent) => this.cancelDefaultBehaviorWhenMoving(event);
    const dragstart = (event: DragEvent) => this.disableDrag(event);

    document.addEventListener("touchstart", start);
    document.addEventListener("touchmove", move);
    document.addEventListener("touchend", end);

    document.addEventListener("mousedown", start);
    document.addEventListener("mousemove", move);
    document.addEventListener("mouseleave", end);
    document.addEventListener("mouseup", end);

    document.addEventListener("click", click);

    document.addEventListener("dragstart", dragstart);

    return () => {
      document.removeEventListener("touchstart", start);
      document.removeEventListener("touchmove", move);
      document.removeEventListener("touchend", end);
  
      document.removeEventListener("mousedown", start);
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseleave", end);
      document.removeEventListener("mouseup", end);
  
      document.removeEventListener("click", click);
  
      document.removeEventListener("dragstart", dragstart);
    };
  }
}
