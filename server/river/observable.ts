export class Observable<T> {
  value: T;
  private listeners: Set<(val: T) => void>;

  constructor(initialValue: T) {
    this.value = initialValue;
    this.listeners = new Set();
  }

  get() {
    return this.value;
  }

  set(tx: (preValue: T) => T) {
    const newValue = tx(this.value);
    this.value = newValue;
    this.listeners.forEach((listener) => listener(newValue));
  }

  observe(listener: (val: T) => void) {
    this.listeners.add(listener);
    listener(this.get());
    return () => this.listeners.delete(listener);
  }
}
