const env = process.env;

const cse = {
  key: env.SEARCH_API_CSE_API_KEY,
  cx: env.SEARCH_API_CSE_CX
};

if (!cse.key) {
  console.error(
    '[error] The "SEARCH_API_CSE_API_KEY" environment variable is required'
  );
  process.exit(1);
}

if (!cse.cx) {
  console.error(
    '[error] The "SEARCH_API_CSE_CX" environment variable is required'
  );
  process.exit(1);
}

module.exports = cse;
