export type Option<T> = T | undefined;

export interface Optional<Value> {
  flatMap<MappedValue>(map: (value: Value) => Optional<MappedValue>): Optional<MappedValue>;
  map<MappedValue>(map: (value: Value) => MappedValue): Optional<MappedValue>;
  isSome(): this is Some<Value>;
  isNone(): this is None<Value>;
}

export abstract class AbstractOption<Value> implements Optional<Value> {
  abstract flatMap<MappedValue>(map: (value: Value) => Optional<MappedValue>): Optional<MappedValue>;
  
  map<MappedValue>(map: (value: Value) => MappedValue): Optional<MappedValue> {
    return this.flatMap(value => some(map(value)));
  }

  isSome(): this is Some<Value> {
    return this instanceof Some;
  }

  isNone(): this is None<Value> {
    return this instanceof None;
  }
}

export class Some<Value> extends AbstractOption<Value> {
  constructor(public readonly value: Value) {
    super();
  }

  flatMap<MappedValue>(map: (value: Value) => Optional<MappedValue>): Optional<MappedValue> {
    return map(this.value);
  }
}

export class None<Value> extends AbstractOption<Value> {
  constructor() {
    super();
  }

  flatMap<MappedValue>(map: (value: Value) => Optional<MappedValue>): Optional<MappedValue> {
    return this as unknown as Optional<MappedValue>;
  }
}

export function some<Value>(value: Value): Some<Value> {
  return new Some(value);
}

export function none<Value>(): None<Value> {
  return new None();
}
