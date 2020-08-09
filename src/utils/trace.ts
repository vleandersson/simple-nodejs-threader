export const success = (msg: string) =>
  console.info("\x1b[45m", msg, "\x1b[0m");
export const start = (msg: string) => console.info("\x1b[45m", msg, "\x1b[0m");
export const error = (msg: string) => console.error("\x1b[31m", msg, "\x1b[0m");
export const info = (msg: string) => console.info("\x1b[32m", msg, "\x1b[0m");
