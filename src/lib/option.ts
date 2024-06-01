export interface Option<Value> {
  flatMap<MappedValue>(map: (value: Value) => Option<MappedValue>): Option<MappedValue>;
  map<MappedValue>(map: (value: Value) => MappedValue): Option<MappedValue>;
}

export abstract class AbstractOption<Value> implements Option<Value> {
  abstract flatMap<MappedValue>(map: (value: Value) => Option<MappedValue>): Option<MappedValue>;
  
  map<MappedValue>(map: (value: Value) => MappedValue): Option<MappedValue> {
    return this.flatMap(value => some(map(value)));
  }
}

export class Some<Value> extends AbstractOption<Value> {
  constructor(public readonly value: Value) {
    super();
  }

  flatMap<MappedValue>(map: (value: Value) => Option<MappedValue>): Option<MappedValue> {
    return map(this.value);
  }
}

export class None<Value> extends AbstractOption<Value> {
  constructor() {
    super();
  }

  flatMap<MappedValue>(map: (value: Value) => Option<MappedValue>): Option<MappedValue> {
    return this as unknown as Option<MappedValue>;
  }
}

export function some<Value>(value: Value): Some<Value> {
  return new Some(value);
}

export function none<Value>(): None<Value> {
  return new None();
}

export function isSome<Value>(option: Option<Value>): option is Some<Value> {
  return option instanceof Some;
}

export function isNone<Value>(option: Option<Value>): option is None<Value> {
  return option instanceof None;
}
