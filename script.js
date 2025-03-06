// Define the leave policy
const totalLeaveDays = 20;
const hoursPerDay = 8;
const totalLeaveHours = totalLeaveDays * hoursPerDay;

// Initialize an object to store leave hours by year
const leaveByYear = {};
const leisureDayByYear = {};
const carryOverByYear = {};
const possibleCarryOverYears = {};

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
        // Reset saved objects when changing the data
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
          availableLeaveByYear[year] = totalLeaveHours - leaveByYear[year];
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

          // nonCarryOverHours will be the excess hours that are not carried over
          const nonCarryOverHours = bookedHours - possibleCarryOverHours;

          // availableHours will be the total leave hours minus the non carry over hours
          const availableHours = totalLeaveHours - nonCarryOverHours;

          // get the available carry over hours by subtracting the possible carry over hours from the total carry over hours
          const availableCarryOverHours =
            carryOverHours - possibleCarryOverHours;

          console.log(`Year ${year}:`);
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

  return "Please change the item per page to 100 to see the better results";
})(window, window.fetch);
