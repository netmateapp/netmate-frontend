import { Err, Ok, type Result } from "./result";

export const enum UuidError {
  INVALID_FORMAT
}

const UUID_V4_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;

export class Uuid4 {
  constructor(private hexadecimalRepresentation: string) {}

  static of(hexadecimalRepresentation: string): Result<UuidError, Uuid4> {
    return UUID_V4_REGEX.test(hexadecimalRepresentation) ? new Ok(new Uuid4(hexadecimalRepresentation)) : new Err(UuidError.INVALID_FORMAT);
  }

  asHexadecimalRepresentation(): string {
    return this.hexadecimalRepresentation;
  }
}

const UUID_V7_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-7[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;

export class Uuid7 {
  constructor(private hexadecimalRepresentation: string) {}

  static of(hexadecimalRepresentation: string): Result<UuidError, Uuid7> {
    return UUID_V7_REGEX.test(hexadecimalRepresentation) ? new Ok(new Uuid7(hexadecimalRepresentation)) : new Err(UuidError.INVALID_FORMAT);
  }

  asHexadecimalRepresentation(): string {
    return this.hexadecimalRepresentation;
  }
}