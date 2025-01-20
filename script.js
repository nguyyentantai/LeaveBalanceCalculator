// ========================================================================

// LEAVE CATEGORIES

// Annual: 20
const ANNUAL_LEAVE_DAYS = 20;

// Parents or children: 3
// Grandparents or natural siblings: 2
// Relatives, cousins, aunts or uncles: 1
const BEREAVEMENT_LEAVE_DAYS = 6;

// Leisure day: 1
const LEISURE_RULE_DAYS = 1;

// Employee: 3
// Children: 1
const MARRIGAGE_LEAVE_DAYS = 3;

// Leave before and after childbirth: 6*30
// Twins or more: [6 + (n - 1)]*30
// Works before the expiry: at least 4*30
const MATERNITY_LEAVE_DAYS = 6 * 30;

// Natural birth: 5
// Surgical birth: 7
// Natural twin: 10
// Natural 3 or more: 10 + (n-2)*3 ≤ 14
// Surgical twins or more: 14
const PATERNITY_LEAVE_DAYS = 14;

// Sick Leave is covered by the Social Insurance Fund
// n < 15 yrs: 30
// 15 ≤ n < 30 yrs: 40
// n ≥ 30: 60
const SICK_LEAVE_DAYS = 30;

// Exams, assignments or attend classes: 2
const STUDY_LEAVE_DAYS = 2;

// Time in lieu
const TIME_IN_LIEU_DAYS = 365;

// Unpaid leave
const UNPAID_LEAVE_DAYS = 365;

// ========================================================================

// MAPPING
const STATIC_MAP = {
  ANNUAL_LEAVE_DAYS: "Annual Leave",
  BEREAVEMENT_LEAVE_DAYS: "Bereavement Leave",
  LEISURE_RULE_DAYS: "Leisure Rules Day",
  MARRIGAGE_LEAVE_DAYS: "Marriage Leave",
  MATERNITY_LEAVE_DAYS: "Paid Maternity",
  PATERNITY_LEAVE_DAYS: "Paid Paternity",
  SICK_LEAVE_DAYS: "Sick Leave",
  STUDY_LEAVE_DAYS: "Study Leave",
  TIME_IN_LIEU_DAYS: "Time In Lieu",
  UNPAID_LEAVE_DAYS: "Unpaid Leave",
};

// ========================================================================

const maxLeaveHoursPerDay = ANNUAL_LEAVE_DAYS * 8;

const totalLeaves = {};

// Count additional based on years of service:
const getExtraYearsOfService = (years) =>
  !isNaN(years) ? Math.floor(years / 5) : 0;

// Get key by title
const getKeyByTitle = (title) => {
  return (
    Object.entries(STATIC_MAP).find(([key, value]) => {
      const normalizedTitle = title.toString().toLowerCase();
      const normalizedValue = value.toString().toLowerCase();
      return normalizedTitle.includes(normalizedValue);
    })[0] ?? null
  );
};

// ========================================================================

const durations = document.querySelectorAll("td:nth-child(5)");

durations.forEach((duration, idx) => {
  if (duration.innerText.includes("hours")) {
    const title = document.querySelectorAll("td:nth-child(4)")[idx].innerText;

    const startDate =
      document.querySelectorAll("td:nth-child(2)")[idx].innerText;

    const year = startDate.split("/")[2];

    const key = getKeyByTitle(title);

    console.log(title, startDate);

    if (!totalLeaves[year]) {
      const newYear = {
        [year]: { [key]: Number(duration.innerText.split(" ")[0]) },
      };

      Object.assign(totalLeaves, newYear);

      return;
    }

    if (!totalLeaves[year][key]) {
      totalLeaves[year][key] = Number(duration.innerText.split(" ")[0]);
    } else {
      totalLeaves[year][key] += Number(duration.innerText.split(" ")[0]);
    }
  }
});

// ========================================================================

Object.keys(totalLeaves).forEach((year) => {
  const leaveDays = Math.floor(totalLeaves[year]["ANNUAL_LEAVE_DAYS"] / 8);
  const leaveHours = totalLeaves[year]["ANNUAL_LEAVE_DAYS"] % 8;

  const availableDays = ANNUAL_LEAVE_DAYS - leaveDays;

  const availableHours =
    (maxLeaveHoursPerDay - totalLeaves[year]["ANNUAL_LEAVE_DAYS"]) % 8;

  // availableLeisureDays: check if there are any leisure days booked
  const availableLeisureDays = totalLeaves[year]["LEISURE_RULE_DAYS"] ? 0 : 1;

  console.log(
    `Year: ${year}\n
    - Booked Annual Leave: ${leaveDays} days, ${leaveHours} hours\n
    - Available Annual Leave: ${availableDays} days, ${availableHours} hours\n
    - Available Leisure days: ${availableLeisureDays}`
  );
});
// ========================================================================
