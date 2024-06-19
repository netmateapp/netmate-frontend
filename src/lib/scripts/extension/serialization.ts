import type { Option } from "$lib/option";

export type Serializer<Value, Format> = (value: Value) => Option<Format>;
export type Deserializer<Value, Format> = (format: Format) => Option<Value>;
