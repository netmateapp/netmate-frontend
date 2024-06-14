export type Reactive<T> = T;

export interface Reactivity<T> {
  reactiveValue(): Reactive<T>
}