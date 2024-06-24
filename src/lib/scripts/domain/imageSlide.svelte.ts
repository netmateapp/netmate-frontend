import type { NetmateImageId } from "./share";

type InteractionEvent = TouchEvent | MouseEvent;

export class ImageSliderController {
  imagePaths: NetmateImageId[] = $state([]);
  currentIndex: number = $state(0);
  private isDragging: boolean = false;
  private startPos: number = 0;
  private currentTranslate: number = 0;
  private prevTranslate: number = 0;
  private animationID: number = 0;
  private static readonly MAX_SLIDER_WIDTH = 986;

  sliderRef: HTMLElement | null = null;
  sliderEditorRef: HTMLElement | null = null;

  touchStart(event: InteractionEvent, index: number) {
    this.currentIndex = index;
    this.startPos = this.getPositionX(event);
    this.isDragging = true;
    this.animationID = requestAnimationFrame(() => this.animation());
  }

  touchEnd() {
    this.isDragging = false;
    cancelAnimationFrame(this.animationID);

    const movedBy = this.currentTranslate - this.prevTranslate;

    if (movedBy < -100 && this.currentIndex < this.imagePaths.length - 1) {
      this.currentIndex += 1;
    }

    if (movedBy > 100 && this.currentIndex > 0) {
      this.currentIndex -= 1;
    }

    this.setPositionByIndex();
  }

  touchMove(event: InteractionEvent) {
    if (this.isDragging) {
      const currentPosition = this.getPositionX(event);
      this.currentTranslate = this.prevTranslate + currentPosition - this.startPos;
    }
  }

  getPositionX(event: InteractionEvent): number {
    return event.type.includes("mouse") ? (event as MouseEvent).pageX : (event as TouchEvent).touches[0].clientX;
  }

  setSliderPosition() {
    if (this.sliderRef) this.sliderRef.style.transform = `translateX(${this.currentTranslate}px)`;
  }

  animation() {
    this.setSliderPosition();
    if (this.isDragging) requestAnimationFrame(() => this.animation());
  }

  setPositionByIndex() {
    this.currentTranslate = this.currentIndex * -this.sliderEditorWidth();
    this.prevTranslate = this.currentTranslate;
    this.setSliderPosition();
  }

  sliderEditorWidth(): number {
    return this.sliderEditorRef ? this.sliderEditorRef.getBoundingClientRect().width : ImageSliderController.MAX_SLIDER_WIDTH;
  }

  isCurrentPageNumber(pageNumber: number): boolean {
    return pageNumber === this.currentIndex;
  }

  shouldDisplayDotsIndicator(): boolean {
    return this.imagePaths.length >= 2;
  }
}
