const assert = require("assert");
const sample = require("../sample.json");
const {
  calculateLeaveSummary,
  getBaseLeaveHours,
  getExtraLeaveHours,
} = require("../script.js");

function hours(days, extraHours = 0) {
  return days * 8 + extraHours;
}

function summarizeByYear(summary) {
  return summary.reduce((acc, entry) => {
    acc[entry.year] = entry;
    return acc;
  }, {});
}

(function runSampleSummaryTest() {
  const summary = calculateLeaveSummary(sample.data.items, "01/01/2018");
  const byYear = summarizeByYear(summary);

  assert(byYear[2025], "Missing summary for 2025");
  assert.strictEqual(byYear[2025].availableHours, hours(11));
  assert.strictEqual(byYear[2025].carryOverFromPrevious, hours(9));
  assert.strictEqual(byYear[2025].carryOverUsedBeforeExpiry, hours(7, 4));
  assert.strictEqual(byYear[2025].carryOverExpired, hours(1, 4));
  assert.strictEqual(byYear[2025].carryOverToNext, hours(11));
})();

(function runProrationTests() {
  assert.strictEqual(getBaseLeaveHours("14/06/2025", 2025), 93.33);
  assert.strictEqual(getBaseLeaveHours("20/06/2025", 2025), 80);
})();

(function runExtraLeaveTests() {
  assert.strictEqual(getExtraLeaveHours("01/01/2015", 2025), 16);
  assert.strictEqual(getExtraLeaveHours("01/01/2015", 2030), 24);
})();

console.log("All tests passed.");
