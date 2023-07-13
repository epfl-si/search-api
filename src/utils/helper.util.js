/**
 * Utilities.
 *
 * @module utils/helper
 */

/**
 * Validate environment variables.
 *
 * @example
 * const helper = require('../utils/helper.util');
 * helper.validateEnv('SEARCH_API_LDAP_URL');  // => 'ldaps://ldap.epfl.ch'
 *
 * @param {string} key A key of an environment variable.
 * @returns {string} Return the value or exit(1) if the key doesn't exists.
 */
function validateEnv (key) {
  if (!process.env[key]) {
    console.error(
      `[error] The "${key}" environment variable is required`
    );
    process.exit(1);
  }
  return process.env[key];
}

function permutations (arr) {
  if (arr.length <= 2) {
    return arr.length === 2 ? [arr, [arr[1], arr[0]]] : [arr];
  }
  return arr.reduce(
    (acc, item, i) =>
      acc.concat(
        permutations([...arr.slice(0, i), ...arr.slice(i + 1)]).map(
          val => [item, ...val]
        )
      ),
    []
  );
};

module.exports = {
  permutations,
  validateEnv
};
