/**
 * Utilities.
 *
 * @module utils/helper
 */

/**
 * Generates all permutations of an array's elements.
 *
 * @example
 * const util = require('../utils/helper.util');
 * util.permutations([ 'Bo', 'Katan', 'Kryze' ])
 * // => [[ 'Bo', 'Katan', 'Kryze' ], [ 'Bo', 'Kryze', 'Katan' ],
 *        [ 'Katan', 'Bo', 'Kryze' ], [ 'Katan', 'Kryze', 'Bo' ],
 *        [ 'Kryze', 'Bo', 'Katan' ], [ 'Kryze', 'Katan', 'Bo' ]]
 *
 * @param {array} arr An array of terms.
 * @returns {array<array>} Return the array of array with all permutations.
 */
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

/**
 * Transliterate a string to close ASCII equivalents.
 *
 * @example
 * const helper = require('../utils/helper.util');
 * helper.toAscii('jérôme');  // => 'jerome'
 *
 * @param {string} s A string
 * @returns {string} Return the transliterated ASCII string.
 */
function toAscii (s) {
  return s.normalize('NFD').replace(/\p{Diacritic}/gu, '')
    .replace(/ø/g, 'o').replace(/Ø/g, 'O')
    .replace(/ł/g, 'l').replace(/Ł/g, 'L')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D')
    .replace(/ð/g, 'd').replace(/Ð/g, 'D')
    .replace(/ħ/g, 'h').replace(/Ħ/g, 'H')
    .replace(/ŋ/g, 'n').replace(/Ŋ/g, 'N')
    .replace(/þ/g, 'th').replace(/Þ/g, 'Th')
    .replace(/æ/g, 'ae').replace(/Æ/g, 'Ae')
    .replace(/œ/g, 'oe').replace(/Œ/g, 'Oe')
    .replace(/ß/g, 'ss');
}

/**
 * Convert an environment variable from string to boolean.
 *
 * @example
 * const helper = require('../utils/helper.util');
 * helper.setBool('SEARCH_API_ENABLE_CSE');  // => true
 *
 * @param {string} key A key of an environment variable.
 * @returns {boolean} Return true if the env. variable is "true" or false.
 */
function setBool (key) {
  return validateEnv(key).toLowerCase() === 'true';
}

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

module.exports = {
  permutations,
  toAscii,
  setBool,
  validateEnv
};
