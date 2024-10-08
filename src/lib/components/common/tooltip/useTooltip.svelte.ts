export class TooltipData {
  text: string;
  x: number;
  y: number;
  targetElementHeight: number;
  show: boolean;
  timeoutId: any;

  constructor(text: string, x: number, y: number, targetElementHeight: number, show: boolean) {
    this.text = text;
    this.x = x;
    this.y = y;
    this.targetElementHeight = targetElementHeight;
    this.show = show;
  }
}

let tooltipData = $state(new TooltipData("", 0, 0, 0, false));

export function getTooltipData(): TooltipData {
  return tooltipData;
}

function showTooltip(text: string, x: number, y: number, targetElementHeight: number) {
  tooltipData = new TooltipData(text, x, y, targetElementHeight, true);
}

export function hideTooltip() {
  cancelTimeout();
  tooltipData = new TooltipData("", 0, 0, 0, false);
}

function cancelTimeout() {
  if (tooltipData.timeoutId !== undefined) {
    clearTimeout(tooltipData.timeoutId);
    tooltipData.timeoutId = undefined;
  }
}

export function delayTooltip(targetNode: Element, props: { tooltipText: string, delay: number }) {
  const show = (event: Event) => {
    const rect = (event.target as Element).getBoundingClientRect();

    cancelTimeout();
    
    tooltipData.timeoutId = setTimeout(() => {
      showTooltip(
        props.tooltipText,
        rect.left + window.scrollX + rect.width / 2,
        rect.top + window.scrollY,
        rect.height
      );
    }, props.delay);
  };

  const hide = () => hideTooltip();

  targetNode.addEventListener('mouseenter', show);
  targetNode.addEventListener('mouseleave', hide);
  targetNode.addEventListener('focus', show);
  targetNode.addEventListener('blur', hide);

  return {
    destroy() {
      targetNode.removeEventListener('mouseenter', show);
      targetNode.removeEventListener('mouseleave', hide);
      targetNode.removeEventListener('focus', show);
      targetNode.removeEventListener('blur', hide);
    }
  }
}

export function tooltip(targetNode: Element, tooltipText: string) {
  const show = (event: Event) => {
    const rect = (event.target as Element).getBoundingClientRect();
    showTooltip(
      tooltipText,
      rect.left + window.scrollX + rect.width / 2,
      rect.top + window.scrollY,
      rect.height
    );
  };

  const hide = () => hideTooltip();

  targetNode.addEventListener('mouseenter', show);
  targetNode.addEventListener('mouseleave', hide);
  targetNode.addEventListener('focus', show);
  targetNode.addEventListener('blur', hide);

  return {
    destroy() {
      targetNode.removeEventListener('mouseenter', show);
      targetNode.removeEventListener('mouseleave', hide);
      targetNode.removeEventListener('focus', show);
      targetNode.removeEventListener('blur', hide);
    }
  }
}
