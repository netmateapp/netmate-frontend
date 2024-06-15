export type Hasher<T> = (value: T) => number;
export type EqualityComparer<T> = (a: T, b: T) => boolean;
export const STRICT_EQUALITY: EqualityComparer<unknown> = (a: unknown, b: unknown) => a === b;