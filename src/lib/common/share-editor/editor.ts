export function toLines(contentDiv: HTMLElement) {
  console.log("---");
  let content: string[] = [];
  for (var [index, element] of contentDiv.childNodes.entries()) {
    if (element instanceof HTMLImageElement) {
      content[index] = element.src;
    } else if (element instanceof HTMLElement) {
      content[index] = element.innerText;
    } else {
      content[index] = element.textContent ?? "";
    }
  }
  console.log(content);
}

export function cleanup(contentDiv: HTMLElement) {
  for (var [index, element] of contentDiv.childNodes.entries()) {
    if (element instanceof HTMLElement) {
      element.style.all = "";
    }
  }
}
