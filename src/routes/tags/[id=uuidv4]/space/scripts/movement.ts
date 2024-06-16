import type { Finalizer, LifeCycle } from "../../../../../lib/scripts/extension/lifeCycle";
import { type ReactiveVirtualLocation } from "./coordinateSystem/virtualCoordinateSystem.svelte";
import { VirtualCoordinate, VirtualLocation } from "./coordinateSystem/virtualCoordinateSystem.svelte";
import { RealLocation, RealCoordinate } from "./coordinateSystem/realCoordinateSystem";

type MoveEvent = MouseEvent | TouchEvent;

class VelocityCoordinate {
  public readonly coordinate: number;

  private constructor(coordinate: number) {
    this.coordinate = coordinate;
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
  private previousRealLocation = RealLocation.of(RealCoordinate.of(0), RealCoordinate.of(0));
  private static readonly MAX_VELOCITY: number = 60;
  private velocity = Velocity2d.of(VelocityCoordinate.of(0), VelocityCoordinate.of(0));
  private static readonly FRICTION: number = 0.95;
  private static readonly INERTIA_MIN_VELOCITY: number = 0.5;
  private inertiaAnimationFrameId: number = 0;

  constructor(viewCenterLocation: ReactiveVirtualLocation) {
    this.viewCenterLocation = viewCenterLocation;
  }

  onTouchStart(event: MoveEvent) {
    this.isUserTouching = true;

    if (event instanceof MouseEvent) {
      this.previousRealLocation = RealLocation.of(RealCoordinate.of(event.clientX), RealCoordinate.of(event.clientY));
    } else {
      const touch: Touch = event.touches[0];
      this.previousRealLocation = RealLocation.of(RealCoordinate.of(touch.clientX), RealCoordinate.of(touch.clientY));
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
  
    let htmlLocation: RealLocation;
    if (event instanceof MouseEvent) {
      htmlLocation = RealLocation.of(RealCoordinate.of(event.clientX), RealCoordinate.of(event.clientY));
    } else {
      const touch: Touch = event.touches[0];
      htmlLocation = RealLocation.of(RealCoordinate.of(touch.clientX), RealCoordinate.of(touch.clientY));
    }

    const movementX = VelocityCoordinate.of(this.previousRealLocation.x.coordinate - htmlLocation.x.coordinate);
    const movementHtmlY = RealCoordinate.of(this.previousRealLocation.y.coordinate - htmlLocation.y.coordinate);
    const movementY = VelocityCoordinate.of(-movementHtmlY.coordinate);

    const newLocation = this.viewCenterLocation.reactiveValue().createOffsetLocation(
      VirtualCoordinate.of(movementX.coordinate),
      VirtualCoordinate.of(movementY.coordinate)
    );
    this.viewCenterLocation.update(newLocation);

    const maxVelocity = ViewCenterVirtualLocationUpdater.MAX_VELOCITY;
    const newVelocityX = VelocityCoordinate.of(Math.max(-maxVelocity, Math.min(maxVelocity, movementX.coordinate)));
    const newVelocityY = VelocityCoordinate.of(Math.max(-maxVelocity, Math.min(maxVelocity, movementY.coordinate)));
    this.velocity = Velocity2d.of(newVelocityX, newVelocityY);

    this.previousRealLocation = htmlLocation;
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
      console.log("finalize");
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
        const newLocation: VirtualLocation = this.viewCenterLocation.reactiveValue().createOffsetLocation(
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
