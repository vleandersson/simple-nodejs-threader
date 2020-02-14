/**
 * @typedef Args
 * @type {object}
 */

/**
 *
 * @param {Args} args
 * @param {string[]} processFlags
 */
function addFlags(args, processFlags) {
  const _processFlags = processFlags;

  Object.keys(args).forEach(key => {
    if (args[key]) {
      _processFlags.push(`--${key}`);
    }
  });

  return _processFlags;
}

module.exports = { addFlags };
