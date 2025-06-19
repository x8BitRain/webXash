export type Enumify<T> = T[keyof T];

declare global {
  interface Window {
    scriptDir: string;
  }
}
