export function handleInput(event: InputEvent, content: HTMLElement) {
  console.log("logged");
  const firstChild: Node | null = (event.target as Element).firstChild;
  if (firstChild && firstChild.nodeType === Node.TEXT_NODE) document.execCommand("formatBlock", false, "<p>");
  else if (content.innerHTML === "<br>") content.innerHTML = "";
}