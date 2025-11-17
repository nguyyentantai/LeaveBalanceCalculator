// Define the leave policy
const totalLeaveDays = 20;
const hoursPerDay = 8;
const totalLeaveHours = totalLeaveDays * hoursPerDay;
const monthlyLeaveHours = totalLeaveHours / 12;

// Year of service
let dateOfService = 0;
let extraLeaveHours = 0;

const parseServiceDate = (dateOfService) => {
  if (!dateOfService || !/\d{2}\/\d{2}\/\d{4}/.test(dateOfService)) {
    return null;
  }

  return new Date(dateOfService.split("/").reverse().join("-"));
};

// Calculate extra leave hours based on the year of service
// Each five years of service (from the date of service to the current year)
// - will add 8 hours to the total leave hours
const getExtraLeaveHours = (dateOfService, currentYear) => {
  // Check if the date of service is not empty
  // Or must be in format dd/mm/yyyy
  if (!dateOfService || !/\d{2}\/\d{2}\/\d{4}/.test(dateOfService)) {
    console.log("Invalid year of service, set to 0");
    return 0; // Return 0 for invalid input
  }

  const serviceDate = parseServiceDate(dateOfService);
  if (!serviceDate) {
    console.log("Invalid year of service, set to 0");
    return 0;
  }

  const yearDiff = currentYear - serviceDate.getFullYear();
  const diff = yearDiff >= 0 ? yearDiff : 0;

  // Calculate the extra leave hours
  extraLeaveHours = diff >= 0 ? Math.floor(diff / 5) * 8 : 0;

  // Return the extra leave hours
  return extraLeaveHours;
};

const getBaseLeaveHours = (dateOfService, currentYear) => {
  const serviceDate = parseServiceDate(dateOfService);

  if (!serviceDate) {
    return totalLeaveHours;
  }

  const serviceYear = serviceDate.getFullYear();
  if (currentYear < serviceYear) {
    return 0;
  }

  if (currentYear > serviceYear) {
    return totalLeaveHours;
  }

  let monthsEligible = 12 - serviceDate.getMonth();
  if (serviceDate.getDate() > 15) {
    monthsEligible -= 1;
  }

  monthsEligible = Math.max(Math.min(monthsEligible, 12), 0);
  const proratedHours =
    Math.round(monthlyLeaveHours * monthsEligible * 100) / 100;

  return proratedHours;
};

// Function to check if the leave is possible to carry over
const isCarryOverPossible = (dateString) => {
  const checkDate = new Date(dateString);
  // Check if the date is before 31st March of the current year and the year is from 2024
  return (
    checkDate < new Date(checkDate.getFullYear(), 2, 31) &&
    checkDate.getFullYear() >= 2024
  );
};

// Function to format hours into days and hours
const formatDaysAndHours = (hours) => {
  if (!Number.isFinite(hours)) {
    return "0 days";
  }

  const normalizedHours = Math.round(hours * 100) / 100;
  const isNegative = normalizedHours < 0;
  const absoluteHours = Math.abs(normalizedHours);
  const days = Math.floor(absoluteHours / hoursPerDay);
  const remainingHours =
    Math.round((absoluteHours % hoursPerDay) * 100) / 100;

  const formatted =
    remainingHours > 0
      ? `${days} days ${remainingHours} hours`
      : `${days} days`;

  return isNegative ? `-${formatted}` : formatted;
};

const calculateLeaveSummary = (items, serviceDateInput) => {
  const leaveByYear = {};
  const leisureDayByYear = {};
  const carryOverByYear = {};
  const possibleCarryOverYears = {};
  const baseLeaveAllocationByYear = {};
  const extraLeaveAllocationByYear = {};
  const carryOverUsageByYear = {};
  const carryOverExpiryByYear = {};

  items.forEach((item) => {
    const year = new Date(
      item.start_date.split("/").reverse().join("-")
    ).getFullYear();

    if (!leaveByYear[year]) {
      leaveByYear[year] = 0;
      leisureDayByYear[year] = false;
      carryOverByYear[year] = 0;
      possibleCarryOverYears[year] = 0;
    }

    if (
      item.leave_category_name === "Annual Leave (VN)" ||
      item.leave_category_name === "Annual Leave"
    ) {
      leaveByYear[year] += item.total_units;

      item.leave_hours.forEach((leaveHour) => {
        if (isCarryOverPossible(leaveHour.date)) {
          const hours = parseFloat(leaveHour.hours);
          possibleCarryOverYears[year] += Number.isFinite(hours) ? hours : 0;
        }
      });
      return;
    }

    if (
      item.leave_category_name === "Leisure Rules Day" ||
      item.leave_category_name === "Leisure Rules Day (VN)"
    ) {
      leisureDayByYear[year] = true;
    }
  });

  const availableLeaveByYear = {};
  const yearKeys = Object.keys(leaveByYear)
    .map((year) => parseInt(year, 10))
    .sort((a, b) => a - b);

  yearKeys.forEach((year) => {
    const previousYear = year - 1;
    const carryOverHours =
      previousYear >= 2024 ? carryOverByYear[previousYear] || 0 : 0;
    const baseLeaveHours = getBaseLeaveHours(serviceDateInput, year);
    baseLeaveAllocationByYear[year] = baseLeaveHours;
    const extraHours = getExtraLeaveHours(serviceDateInput, year);
    extraLeaveAllocationByYear[year] = extraHours;
    const earlyYearBookings = possibleCarryOverYears[year] || 0;
    const carryOverApplied = Math.min(carryOverHours, earlyYearBookings);
    carryOverUsageByYear[year] = carryOverApplied;
    const carryOverExpired = Math.max(carryOverHours - carryOverApplied, 0);
    carryOverExpiryByYear[year] = carryOverExpired;
    const bookedHours = leaveByYear[year];
    const currentYearUsage = bookedHours - carryOverApplied;
    const availableHours = baseLeaveHours + extraHours - currentYearUsage;
    availableLeaveByYear[year] = availableHours;
    carryOverByYear[year] =
      year >= 2024 && availableHours > 0 ? availableHours : 0;
  });

  return yearKeys.map((year) => {
    const bookedHours = leaveByYear[year];
    const leisureDayBooked = leisureDayByYear[year];
    const carryOverHours =
      year - 1 >= 2024 ? carryOverByYear[year - 1] || 0 : 0;
    const carryOverApplied = carryOverUsageByYear[year] || 0;
    const carryOverExpired = carryOverExpiryByYear[year] || 0;
    const extraHours = extraLeaveAllocationByYear[year] || 0;
    const baseLeaveHours = baseLeaveAllocationByYear[year] || 0;
    const availableHours = availableLeaveByYear[year];
    const carryOverToNext =
      year >= 2024 ? Math.max(carryOverByYear[year] || 0, 0) : 0;

    return {
      year,
      baseLeaveHours,
      extraLeaveHours: extraHours,
      leisureDayBooked,
      bookedHours,
      availableHours,
      carryOverFromPrevious: carryOverHours,
      carryOverUsedBeforeExpiry: carryOverApplied,
      carryOverExpired,
      carryOverToNext,
    };
  });
};

const initLeaveBalanceCalculator = (ns) => {
  if (!ns || typeof ns.fetch !== "function") return;

  const originalFetch = ns.fetch;

  ns.fetch = (...fetchArgs) => {
    const out = originalFetch.apply(ns, fetchArgs);

    out.then(async (response) => {
      const url = response.url;
      const regex =
        /\/api\/v3\/organisations\/\d+\/members\/\d+\/leave_requests/;

      if (url && regex.test(url)) {
        const clonedResponse = response.clone();
        const jsonResponse = await clonedResponse.json();
        const summaries = calculateLeaveSummary(
          jsonResponse.data.items,
          dateOfService
        );

        summaries.forEach((summary) => {
          console.log(`Year ${summary.year}:`);
          console.log(
            `- Annual Leave Entitlement: ${formatDaysAndHours(
              summary.baseLeaveHours
            )}`
          );
          console.log(`- Extra Leave Hours: ${summary.extraLeaveHours} hour(s)`);
          console.log(`- Booked Leisure day: ${summary.leisureDayBooked}`);
          console.log(
            `- Booked Annual leaves: ${formatDaysAndHours(
              summary.bookedHours
            )}`
          );
          console.log(
            `- Available Annual leaves: ${formatDaysAndHours(
              summary.availableHours
            )}`
          );

          if (summary.carryOverFromPrevious > 0) {
            console.log(
              `- Carry Over from ${summary.year - 1} (expires 31/03/${
                summary.year
              }): ${formatDaysAndHours(summary.carryOverFromPrevious)}`
            );
            console.log(
              `- Carry Over Used before 31/03/${summary.year}: ${formatDaysAndHours(
                summary.carryOverUsedBeforeExpiry
              )}`
            );
            console.log(
              `- Carry Over Expiring on 31/03/${summary.year}: ${formatDaysAndHours(
                summary.carryOverExpired
              )}`
            );
          }

          if (summary.year >= 2024) {
            console.log(
              `- Carry Over to ${Number(summary.year) + 1}: ${formatDaysAndHours(
                summary.carryOverToNext
              )}`
            );
          }
        });
      }
    });

    return out;
  };

  if (typeof prompt === "function") {
    dateOfService = prompt("Enter the start date of service (dd/mm/yyyy):");
    console.log(`Date of service: ${dateOfService}`);
  } else {
    dateOfService = "";
  }

  return "Please change the item per page to see the results, better to set it to 100.Thank you!";
};

if (typeof window !== "undefined") {
  initLeaveBalanceCalculator(window);
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    parseServiceDate,
    getExtraLeaveHours,
    getBaseLeaveHours,
    isCarryOverPossible,
    formatDaysAndHours,
    calculateLeaveSummary,
    initLeaveBalanceCalculator,
  };
}
