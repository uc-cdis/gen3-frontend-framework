export interface Logger {
  warn(message: string): void;

  error(message: string): void;
}

// Default console logger
export const defaultLogger: Logger = {
  warn: (message: string) => console.warn(message),
  error: (message: string) => console.error(message),
};
