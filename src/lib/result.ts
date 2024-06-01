export interface Result<Error, Value> {
  flatMap<MappedValue>(map: (value: Value) => Result<Error, MappedValue>): Result<Error, MappedValue>;
  map<MappedValue>(map: (value: Value) => MappedValue): Result<Error, MappedValue>;
  isOk(): this is Ok<Error, Value>;
  isErr(): this is Err<Error, Value>;
}

export abstract class AbstractResult<Error, Value> implements Result<Error, Value> {
  abstract flatMap<MappedValue>(map: (value: Value) => Result<Error, MappedValue>): Result<Error, MappedValue>;

  map<MappedValue>(map: (value: Value) => MappedValue): Result<Error, MappedValue> {
    return this.flatMap(value => ok(map(value)));
  }

  isOk(): this is Ok<Error, Value> {
    return this instanceof Ok;
  }

  isErr(): this is Err<Error, Value> {
    return this instanceof Err;
  }
}

export class Ok<Error, Value> extends AbstractResult<Error, Value> {
  constructor(public readonly value: Value) {
    super();
  }

  flatMap<Error, MappedValue>(map: (value: Value) => Result<Error, MappedValue>): Result<Error, MappedValue> {
    return map(this.value);
  }
}

export class Err<Error, Value> extends AbstractResult<Error, Value> {
  constructor(public readonly error: Error) {
    super();
  }

  flatMap<Error, MappedValue>(map: (value: Value) => Result<Error, MappedValue>): Result<Error, MappedValue> {
    return this as unknown as Err<Error, MappedValue>;
  }
}

export function ok<Error, Value>(value: Value): Ok<Error, Value> {
  return new Ok(value);
}

export function err<Error, Value>(error: Error): Err<Error, Value> {
  return new Err(error);
}
