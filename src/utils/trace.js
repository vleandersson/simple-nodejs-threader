const success = msg => console.info("\x1b[45m", msg, "\x1b[0m");
const start = msg => console.info("\x1b[45m", msg, "\x1b[0m");
const error = msg => console.error("\x1b[31m", msg, "\x1b[0m");
const info = msg => console.info("\x1b[32m", msg, "\x1b[0m");

module.exports = {
  success,
  start,
  error,
  info
};
