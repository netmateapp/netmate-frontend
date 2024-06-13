import type { Finalizer, LifeCycle } from "./lifeCycle";
import { HtmlCoordinate, HtmlLocation, VirtualCoordinate, VirtualLocation, type ReactiveVirtualLocation } from "./coordinateSystem";

type MoveEvent = MouseEvent | TouchEvent;

class VelocityCoordinate {
  public readonly coordinate: number;

  private constructor(coordinate: number) {
    if (!VelocityCoordinate.isValid(coordinate)) throw new Error(`A coordinate must be an integer.`);
    this.coordinate = coordinate;
  }

  private static isValid(coordinate: number): boolean {
    return Number.isInteger(coordinate);
  }

  static of(coordinate: number): VelocityCoordinate {
    return new VelocityCoordinate(coordinate);
  }
}

class Velocity2d {
  public readonly x: VelocityCoordinate;
  public readonly y: VelocityCoordinate;

  private constructor(x: VelocityCoordinate, y: VelocityCoordinate) {
    this.x = x;
    this.y = y;
  }

  static of(x: VelocityCoordinate, y: VelocityCoordinate): Velocity2d {
    return new Velocity2d(x, y);
  }
}

type ClickEvent = MouseEvent;

export class ViewCenterVirtualLocationUpdater implements LifeCycle {
  private readonly viewCenterLocation: ReactiveVirtualLocation;
  private isUserTouching: boolean = false;
  private hasMovedDuringTouch: boolean = false;
  private previousHtmlLocation = HtmlLocation.of(HtmlCoordinate.of(0), HtmlCoordinate.of(0));
  private static MAX_VELOCITY: number = 60;
  private velocity = Velocity2d.of(VelocityCoordinate.of(0), VelocityCoordinate.of(0));
  private static FRICTION: number = 0.95;
  private static INERTIA_MIN_VELOCITY: number = 0.5;
  private inertiaAnimationFrameId: number = 0;

  constructor(viewCenterLocation: ReactiveVirtualLocation) {
    this.viewCenterLocation = viewCenterLocation;
  }

  onTouchStart(event: MoveEvent) {
    this.isUserTouching = true;

    if (event instanceof MouseEvent) {
      this.previousHtmlLocation = HtmlLocation.of(HtmlCoordinate.of(event.clientX), HtmlCoordinate.of(event.clientY));
    } else {
      const touch: Touch = event.touches[0];
      this.previousHtmlLocation = HtmlLocation.of(HtmlCoordinate.of(touch.clientX), HtmlCoordinate.of(touch.clientY));
    }

    this.velocity = Velocity2d.of(VelocityCoordinate.of(0), VelocityCoordinate.of(0));

    cancelAnimationFrame(this.inertiaAnimationFrameId);
  
    // ドラッグ移動時にサイドバーの要素などが選択されないように
    ViewCenterVirtualLocationUpdater.clearSelection();
    ViewCenterVirtualLocationUpdater.disableSelection();
  }

  onTouchMove(event: MoveEvent) {
    if (!this.isUserTouching) return;

    if (!this.hasMovedDuringTouch) this.hasMovedDuringTouch = true;
  
    let htmlLocation: HtmlLocation;
    if (event instanceof MouseEvent) {
      htmlLocation = HtmlLocation.of(HtmlCoordinate.of(event.clientX), HtmlCoordinate.of(event.clientY));
    } else {
      const touch: Touch = event.touches[0];
      htmlLocation = HtmlLocation.of(HtmlCoordinate.of(touch.clientX), HtmlCoordinate.of(touch.clientY));
    }

    const movementX = VelocityCoordinate.of(htmlLocation.x.coordinate - this.previousHtmlLocation.x.coordinate);
    const movementHtmlY = HtmlCoordinate.of(-(htmlLocation.y.coordinate - this.previousHtmlLocation.y.coordinate));
    const movementY = VelocityCoordinate.of(-movementHtmlY.coordinate);

    const newLocation = this.viewCenterLocation.reactiveLocation().createOffsetLocation(
      VirtualCoordinate.of(movementX.coordinate),
      VirtualCoordinate.of(movementY.coordinate)
    );
    this.viewCenterLocation.update(newLocation);

    const maxVelocity = ViewCenterVirtualLocationUpdater.MAX_VELOCITY;
    const newVelocityX = VelocityCoordinate.of(Math.max(-maxVelocity, Math.min(maxVelocity, movementX.coordinate)));
    const newVelocityY = VelocityCoordinate.of(Math.max(-maxVelocity, Math.min(maxVelocity, movementY.coordinate)));
    this.velocity = Velocity2d.of(newVelocityX, newVelocityY);

    this.previousHtmlLocation = htmlLocation;
  }

  onTouchEnd(event: MoveEvent) {
    this.isUserTouching = false;

    // タッチのドラッグ操作終了時にClickイベントは呼び出されないため
    if (event instanceof TouchEvent && this.hasMovedDuringTouch) this.hasMovedDuringTouch = false;
  
    this.applyInertia();
  
    ViewCenterVirtualLocationUpdater.enableSelection();
  }

  initialize(): Finalizer {
    const onTouchStart = (event: MoveEvent) => this.onTouchStart(event);
    const onTouchMove = (event: MoveEvent) => this.onTouchMove(event);
    const onTouchEnd = (event: MoveEvent) => this.onTouchEnd(event);
    const onDrag = ViewCenterVirtualLocationUpdater.disableDragging;
    const onClick = (event: MouseEvent) => this.cancelClickOnTouchMove(event);

    document.addEventListener("touchstart", onTouchStart);
    document.addEventListener("touchmove", onTouchMove);
    document.addEventListener("touchend", onTouchEnd);

    document.addEventListener("mousedown", onTouchStart);
    document.addEventListener("mousemove", onTouchMove);
    document.addEventListener("mouseleave", onTouchEnd);
    document.addEventListener("mouseup", onTouchEnd);

    document.addEventListener("click", onClick);

    document.addEventListener("dragstart", onDrag);

    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
  
      document.removeEventListener("mousedown", onTouchStart);
      document.removeEventListener("mousemove", onTouchMove);
      document.removeEventListener("mouseleave", onTouchEnd);
      document.removeEventListener("mouseup", onTouchEnd);
  
      document.removeEventListener("click", onClick);
  
      document.removeEventListener("dragstart", onDrag);
    };
  }

  applyInertia() {
    const friction = ViewCenterVirtualLocationUpdater.FRICTION;
    const minVelocity = ViewCenterVirtualLocationUpdater.INERTIA_MIN_VELOCITY;
  
    const step = () =>  {
      if (Math.abs(this.velocity.x.coordinate) > minVelocity || Math.abs(this.velocity.y.coordinate) > minVelocity) {
        const newLocation: VirtualLocation = this.viewCenterLocation.reactiveLocation().createOffsetLocation(
          VirtualCoordinate.of(this.velocity.x.coordinate),
          VirtualCoordinate.of(this.velocity.y.coordinate)
        );
        this.viewCenterLocation.update(newLocation);
        
        const newVelocity = Velocity2d.of(
          VelocityCoordinate.of(this.velocity.x.coordinate * friction),
          VelocityCoordinate.of(this.velocity.y.coordinate * friction)
        );
        this.velocity = newVelocity;

        this.inertiaAnimationFrameId = requestAnimationFrame(step);
      }
    };
  
    step();
  }

  private static clearSelection() {
    document.getSelection()?.empty();
  }

  private static enableSelection() {
    document.body.style.userSelect = '';
  }

  private static disableSelection() {
    document.body.style.userSelect = 'none';
  }

  private static disableDragging(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  // 共有やコアをドラッグした場合に飛ばないように
  private cancelClickOnTouchMove(event: ClickEvent) {
    if (!this.hasMovedDuringTouch) return;

    event.preventDefault();
    event.stopPropagation();
    this.hasMovedDuringTouch = false;
  }
}