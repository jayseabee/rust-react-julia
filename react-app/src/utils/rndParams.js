// Generate random numbers in specific ranges to get interesting
// Julia sets: note this webpage:
// https://www.karlsims.com/julia.html

function rndParams() {
  return {
    cx: Math.random() * (0.9 - 0.3) - 0.9,
    cy: Math.random() * (0.9 + 0.6) - 0.9,
  };
}

export default rndParams;
