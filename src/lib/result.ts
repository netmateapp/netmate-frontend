export class Ok<Value> {
  constructor(public value: Value) {}

  flatMap<MappedValue>(map: (value: Value) => Ok<MappedValue>): Ok<MappedValue> {
    return map(this.value);
  }
}

export class Err<Error> {
  constructor(public error: Error) {}
}

export type Result<Error, Value> = Err<Error> | Ok<Value>;

export function ok<Value>(value: Value): Ok<Value> {
  return new Ok(value);
}

export function err<Error>(error: Error): Err<Error> {
  return new Err(error);
}

export function isOk<Error, Value>(result: Result<Error, Value>): result is Ok<Value> {
  return result instanceof Ok;
}

export function isErr<Error, Value>(result: Result<Error, Value>): result is Err<Error> {
  return result instanceof Err;
}
