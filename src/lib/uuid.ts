import { err, Ok, ok, type Result } from "./result";

const UUID_V4_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;

export class Uuid4 {
  private constructor(private hexadecimalRepresentation: string) {}

  static from(hexadecimalRepresentation: string): Result<{}, Uuid4> {
    return UUID_V4_REGEX.test(hexadecimalRepresentation) ? ok(new Uuid4(hexadecimalRepresentation)) : err({});
  }

  asHexadecimalRepresentation(): string {
    return this.hexadecimalRepresentation;
  }
}

export function genTestUuid4(): Uuid4 {
  let uuid = '';
  for (let i = 0; i < 32; i++) {
      const random = Math.random() * 16 | 0;
      if (i == 8 || i == 12 || i == 16 || i == 20) {
          uuid += '-';
      }
      if (i == 12) {
          uuid += '4';
      } else if (i == 16) {
          uuid += (random & 0x3 | 0x8).toString(16);
      } else {
          uuid += random.toString(16);
      }
  }
  return (Uuid4.from(uuid) as Ok<{}, Uuid4>).value;
}

const UUID_V7_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-7[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;

export class Uuid7 {
  private constructor(private hexadecimalRepresentation: string) {}

  static from(hexadecimalRepresentation: string): Result<{}, Uuid7> {
    return UUID_V7_REGEX.test(hexadecimalRepresentation) ? ok(new Uuid7(hexadecimalRepresentation)) : err({});
  }

  asHexadecimalRepresentation(): string {
    return this.hexadecimalRepresentation;
  }
}

export function genTestUuid7(): Uuid7 {
  let uuid4: string[] = genTestUuid4().asHexadecimalRepresentation().split("");
  uuid4[14] = "7";
  let uuid7: string = uuid4.reduce((acc, c) => acc + c);
  return (Uuid7.from(uuid7) as Ok<{}, Uuid7>).value;
}
