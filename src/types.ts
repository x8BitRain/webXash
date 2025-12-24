export type Enumify<T> = T[keyof T];

declare global {
  interface Window {
    scriptDir: string;
  }
}

export type ConsoleCallback = {
  id: string;
  match: string;
  callback: () => void;
};
