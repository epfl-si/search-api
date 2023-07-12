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
