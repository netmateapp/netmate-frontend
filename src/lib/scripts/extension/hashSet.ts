export class HashSet<T> implements Iterable<T> {
  private table: Array<LinkedList<Entry<T>>>;
  private size: number;
  private thereshold: number;
  private hashFunction: (t: T) => number;
  private static readonly DEFAULT_CAPACITY = 16;
  private static readonly LOAD_FACTOR = 0.75;

  constructor(hashFunction: (t: T) => number) {
    this.table = new Array(HashSet.DEFAULT_CAPACITY);
    this.size = 0;
    this.thereshold = Math.floor(HashSet.DEFAULT_CAPACITY * HashSet.LOAD_FACTOR);
    this.hashFunction = hashFunction;
  }

  private indexFor(hash: number): number {
    return hash % this.table.length;
  }

  add(value: T): boolean {
    const hash = this.hashFunction(value);
    const index = this.indexFor(hash);

    if (!this.table[index]) {
      this.table[index] = new LinkedList<Entry<T>>();
    }

    for (const entry of this.table[index].getItems()) {
      if (entry.hash === hash && entry.equals(value)) {
        return false;
      }
    }

    this.table[index].add(new Entry<T>(value, hash));
    this.size++;

    if (this.size >= this.thereshold) {
      this.resize(this.table.length * 2);
    }

    return true;
  }

  private resize(newCapacity: number) {
    const newTable = new Array<LinkedList<Entry<T>>>(newCapacity);
    this.thereshold = Math.floor(newCapacity * HashSet.LOAD_FACTOR);

    for (const bucket of this.table) {
      if (bucket) {
        for (const entry of bucket.getItems()) {
          const index = entry.hash % newCapacity;
          if (!newTable[index]) {
            newTable[index] = new LinkedList<Entry<T>>();
          }
          newTable[index].add(entry);
        }
      }
    }
    this.table = newTable;
  }

  contains(value: T): boolean {
    const hash = this.hashFunction(value);
    const index = this.indexFor(hash);

    if (!this.table[index]) return false;

    for (const entry of this.table[index].getItems()) {
      if (entry.hash === hash && entry.equals(value)) {
        return true;
      }
    }

    return false;
  }

  remove(value: T): boolean {
    const hash = this.hashFunction(value);
    const index = this.indexFor(hash);

    if (!this.table[index]) return false;

    for (const entry of this.table[index].getItems()) {
      if (entry.hash === hash && entry.equals(value)) {
        this.table[index].remove(entry);
        this.size--;
        return true;
      }
    }

    return false;
  }

  getSize(): number {
    return this.size;
  }

  values(): T[] {
    const values: T[] = [];
    for (const bucket of this.table) {
      if (bucket) {
        for (const entry of bucket.getItems()) {
          values.push(entry.value);
        }
      }
    }
    return values;
  }

  [Symbol.iterator](): Iterator<T> {
    return this.iterate();
  }

  private *iterate(): Iterator<T> {
    for (const bucket of this.table) {
      if (bucket) {
        for (const entry of bucket.getItems()) {
          yield entry.value;
        }
      }
    }
  }
}
  
class Entry<T> {
  public readonly value: T;
  public readonly hash: number;

  constructor(value: T, hash: number) {
    this.value = value;
    this.hash = hash;
  }

  equals(value: T): boolean {
    return this.value === value;
  }
}

class LinkedList<T> {
  private items: T[] = [];

  add(item: T) {
    this.items.push(item);
  }

  remove(item: T): boolean {
    const index = this.items.indexOf(item);
    if (index >= 0) {
      this.items.splice(index, 1);
      return true;
    }
    return false;
  }

  contains(item: T): boolean {
    return this.items.includes(item);
  }

  getItems(): T[] {
    return this.items;
  }
}
