const cse = {
  apiKey: process.env.SEARCH_API_CSE_API_KEY,
  cx: process.env.SEARCH_API_CSE_CX
};

if (!cse.apiKey) {
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
