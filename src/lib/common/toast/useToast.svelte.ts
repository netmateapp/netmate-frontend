export class ToastData {
  constructor(public text: string, public show: boolean) { }
}

let toastData = $state(new ToastData("", false));

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
  showToast(text);
  setTimeout(hideToast, 3000);
}
