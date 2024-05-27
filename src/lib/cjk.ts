const CJK_REGEX = /[\u3040-\u309F\u30A0-\u30FF\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF\uFF00-\uFFEF\u1100-\u11FF\uAC00-\uD7AF\u{20000}-\u{2A6DF}\u{2A700}-\u{2B73F}\u{2B740}-\u{2B81F}\u{2B820}-\u{2CEAF}\u{2CEB0}-\u{2EBEF}]/gu;

export function countCJKCharacters(text: string): number {
  const matches = text.match(CJK_REGEX);
  return matches ? matches.length : 0;
}