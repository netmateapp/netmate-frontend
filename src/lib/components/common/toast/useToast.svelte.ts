export class ToastData {
  constructor(public text: string, public show: boolean) { }
}

let toastData = $state(new ToastData("", false));
let cancel: (() => void) | null;

export function getToastData(): ToastData {
  return toastData;
}

function showToast(text: string) {
  toastData = new ToastData(text, true);
}

function hideToast() {
  toastData = new ToastData("", false);
}

export function toast(text: string) {
  if (cancel) {
    cancel();
    cancel = null;
  }

  showToast(text);
  
  const timeoutId = setTimeout(() => {
    cancel = null;
    hideToast();
  }, 3000);
  
  cancel = () => clearTimeout(timeoutId);
}
