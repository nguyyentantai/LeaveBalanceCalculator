// Define the leave policy
const totalLeaveDays = 20;
const hoursPerDay = 8;
const totalLeaveHours = totalLeaveDays * hoursPerDay;

// Initialize an object to store leave hours by year
const leaveByYear = {};
const leisureDayByYear = {};
const carryOverByYear = {};
const possibleCarryOverYears = {};

// Year of service
let dateOfService = 0;
let extraLeaveHours = 0;

// Calculate extra leave hours based on the year of service
// Each five years of service (from the date of service to the current year)
// - will add 8 hours to the total leave hours
function getExtraLeaveHours(dateOfService, currentYear) {
  // Check if the date of service is not empty
  // Or must be in format dd/mm/yyyy
  if (!dateOfService || !/\d{2}\/\d{2}\/\d{4}/.test(dateOfService)) {
    console.log("Invalid year of service, set to 0");
    return 0; // Return 0 for invalid input
  }

  const currentDate = new Date(); // Current date (e.g., 06/03/2025)
  const serviceDate = new Date(
    dateOfService.split("/").reverse().join("-") // Convert dd/mm/yyyy to yyyy-mm-dd
  );

  // Calculate the full years of service (from dateOfService to currentDate)
  const yearDiff = currentYear - serviceDate.getFullYear();

  // Calculate the precise years of service based on months and days
  const serviceMonth = serviceDate.getMonth() + 1; // Months are 0-indexed in JavaScript
  const serviceDay = serviceDate.getDate();

  // If the current month and day is before the service month and day,
  // we subtract 1 year from the year difference
  const diff =
    0 < serviceMonth || (0 === serviceMonth && 1 < serviceDay)
      ? yearDiff - 1
      : yearDiff;

  // Calculate the extra leave hours
  extraLeaveHours = diff >= 0 ? Math.floor(diff / 5) * 8 : 0;

  // Return the extra leave hours
  return extraLeaveHours;
}

// Function to check if the leave is possible to carry over
function isCarryOverPossible(dateString) {
  const checkDate = new Date(dateString);
  const currentDate = new Date();

  // Check if the date is before 31st March of the current year and the year is from 2025
  return (
    checkDate < new Date(checkDate.getFullYear(), 2, 31) &&
    checkDate.getFullYear() >= 2025
  );
}

// Function to format hours into days and hours
function formatDaysAndHours(hours) {
  const days = Math.floor(hours / hoursPerDay);
  const remainingHours = hours % hoursPerDay;
  return remainingHours > 0
    ? `${days} days ${remainingHours} hours`
    : `${days} days`;
}

function resetObjects() {
  // reset leaveByYear, leisureDayByYear, carryOverByYear, possibleCarryOverYears to empty objects
  for (const key in leaveByYear) {
    delete leaveByYear[key];
  }

  for (const key in leisureDayByYear) {
    delete leisureDayByYear[key];
  }

  for (const key in carryOverByYear) {
    delete carryOverByYear[key];
  }

  for (const key in possibleCarryOverYears) {
    delete possibleCarryOverYears[key];
  }
}

(function (ns, fetch) {
  if (typeof fetch !== "function") return;

  ns.fetch = function () {
    var out = fetch.apply(this, arguments);

    // side-effect
    out.then(async (response) => {
      const url = response.url;
      const regex =
        /\/api\/v3\/organisations\/\d+\/members\/\d+\/leave_requests/;

      if (url && regex.test(url)) {
        resetObjects();

        const clonedResponse = response.clone();
        const jsonResponse = await clonedResponse.json();

        // Calculate the total booked leave hours for each year
        jsonResponse.data.items.forEach((item) => {
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

            // Loop through the leave_hours to check if the leave is possible to carry over
            item.leave_hours.forEach((leaveHour) => {
              if (isCarryOverPossible(leaveHour.date)) {
                possibleCarryOverYears[year] += parseInt(leaveHour.hours, 10);
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

        // Calculate the available leave hours for each year
        const availableLeaveByYear = {};
        for (const year in leaveByYear) {
          const previousYear = parseInt(year) - 1;
          const carryOverHours =
            previousYear >= 2024 ? carryOverByYear[previousYear] : 0;
          const extraLeaveHours = getExtraLeaveHours(dateOfService, year);
          console.log(`Extra Leave Hours in ${year}: ${extraLeaveHours}`);
          availableLeaveByYear[year] =
            totalLeaveHours + extraLeaveHours - leaveByYear[year];
          carryOverByYear[year] =
            year >= 2024 && availableLeaveByYear[year] > 0
              ? availableLeaveByYear[year]
              : 0;
        }

        // Print the results
        for (const year in leaveByYear) {
          const bookedHours = leaveByYear[year];
          const leisureDayBooked = leisureDayByYear[year];
          const carryOverHours = carryOverByYear[year - 1] ?? 0;
          const possibleCarryOverHours = possibleCarryOverYears[year];

          // get the extra leave hours based on the year of service

          // nonCarryOverHours will be the excess hours that are not carried over
          const nonCarryOverHours = bookedHours - possibleCarryOverHours;

          // extraLeaveHours will be the extra leave hours based on the year of service
          const extraLeaveHours = getExtraLeaveHours(dateOfService, year);

          // availableHours will be the total leave hours minus the non carry over hours
          const availableHours =
            totalLeaveHours + extraLeaveHours - nonCarryOverHours;

          // get the available carry over hours by subtracting the possible carry over hours from the total carry over hours
          const availableCarryOverHours =
            carryOverHours - possibleCarryOverHours;

          console.log(`Year ${year}:`);
          console.log(`- Extra Leave Hours: ${extraLeaveHours} hour(s)`);
          console.log(`- Booked Leisure day: ${leisureDayBooked}`);
          console.log(
            `- Booked Annual leaves: ${formatDaysAndHours(bookedHours)}`
          );
          console.log(
            `- Available Annual leaves: ${formatDaysAndHours(availableHours)}`
          );

          if (year > 2024) {
            console.log(
              `- Available Carried Over Annual leaves: ${formatDaysAndHours(
                availableCarryOverHours
              )}`
            );
          }
        }
      }
    });

    return out;
  };

  // Get year of service from the user
  dateOfService = prompt("Enter the start date of service (dd/mm/yyyy):");

  // Log the year of service
  console.log(`Date of service: ${dateOfService}`);

  return "Please change the item per page to see the results, better to set it to 100.Thank you!";
})(window, window.fetch);
