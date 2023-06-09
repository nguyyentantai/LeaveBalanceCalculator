// ========================================================================
const MAX_LEAVE_DAYS = 20;
const maxLeaveHours = MAX_LEAVE_DAYS * 8;

const totalLeaves = {};

const durations = document.querySelectorAll('td:nth-child(5)');
durations.forEach((duration, idx) => {
  if (duration.innerText.includes('hours')) {
    const startDate =
      document.querySelectorAll('td:nth-child(2)')[idx].innerText;
    const year = startDate.split('/')[2];
    if (!totalLeaves[year]) {
      Object.assign(totalLeaves, {
        [year]: Number(duration.innerText.split(' ')[0]),
      });
    } else {
      Object.assign(totalLeaves, {
        [year]: totalLeaves[year] + Number(duration.innerText.split(' ')[0]),
      });
    }
  }
});

Object.keys(totalLeaves).forEach(year => {
  const leaveDays = Math.floor(totalLeaves[year] / 8);
  const availableDays = MAX_LEAVE_DAYS - leaveDays;
  const availableHours = (maxLeaveHours - totalLeaves[year]) % 8;
  console.log(
    `Year: ${year}\n - Leave: ${leaveDays}\n - Available: ${availableDays} days, ${availableHours} hours`
  );
});
// ========================================================================