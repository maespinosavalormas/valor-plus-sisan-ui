import '@angular/compiler';
import 'jest-preset-angular/setup-jest';

// Polyfill crypto.randomUUID para jsdom (Node 16 no lo expone globalmente)
if (!(globalThis as any).crypto) {
  (globalThis as any).crypto = {} as any;
}
if (typeof (globalThis as any).crypto.randomUUID !== 'function') {
  (globalThis as any).crypto.randomUUID = (): string =>
    'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
}
