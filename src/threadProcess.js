const spawn = require("cross-spawn");
const util = require("util");
const BufferList = require("bl");
const exec = require("child_process").exec;

const promiseExec = util.promisify(exec);
const { error, start, success, info } = require("./utils/trace");

/**
 * Wraps spawned processes in a promise, so that the stream can be managed
 * with js async functionality
 * @param  {...any} args
 */
function promiseSpawn(...args) {
  const child = spawn(...args);
  const stderr = child.stderr ? new BufferList() : "";

  if (child.stderr) {
    child.stderr.on("data", data => {
      stderr.append(data);
    });
  }

  const promise = new Promise((resolve, reject) => {
    child.on("error", reject);

    child.on("exit", (code, signal) => {
      if (code === 0 || Boolean(signal)) {
        resolve();
      } else {
        const err = new Error(`child exited with code ${code}`);
        err.code = code;
        err.stderr = stderr;
        reject(err);
      }
    });
  });

  promise.child = child;

  return promise;
}

module.exports = {
  promiseSpawn,
  promiseExec
};
