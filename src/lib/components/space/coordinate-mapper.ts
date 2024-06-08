// HTML座標系はX軸が0-100vw、Y軸が下向きかつ0-100vhに制限された座標系である

export function centerHtmlX(innerWidth: number): number {
  return Math.floor(innerWidth / 2);
}

export function centerHtmlY(innerHeight: number): number {
  return Math.floor(innerHeight / 2);
}

export function diffX(positionX: number, centerHtmlX: number): number {
  return positionX - centerHtmlX;
}

export function diffY(positionY: number, centerHtmlY: number): number {
  return positionY - centerHtmlY;
}

export function toHtmlX(x: number, diffX: number): number {
  return x - diffX;
}

export function toHtmlY(y: number, diffY: number): number {
  return y - diffY;
}