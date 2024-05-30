import { err, ok, type Result } from "./result";

type InvalidFormatError = {};

const UUID_V4_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;

export class Uuid4 {
  constructor(private hexadecimalRepresentation: string) {}

  static of(hexadecimalRepresentation: string): Result<InvalidFormatError, Uuid4> {
    return UUID_V4_REGEX.test(hexadecimalRepresentation) ? ok(new Uuid4(hexadecimalRepresentation)) : err({});
  }

  asHexadecimalRepresentation(): string {
    return this.hexadecimalRepresentation;
  }
}

const UUID_V7_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-7[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;

export class Uuid7 {
  constructor(private hexadecimalRepresentation: string) {}

  static of(hexadecimalRepresentation: string): Result<InvalidFormatError, Uuid7> {
    return UUID_V7_REGEX.test(hexadecimalRepresentation) ? ok(new Uuid7(hexadecimalRepresentation)) : err({});
  }

  asHexadecimalRepresentation(): string {
    return this.hexadecimalRepresentation;
  }
}