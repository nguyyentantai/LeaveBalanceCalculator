# LeaveBalanceCalculator

## Overview
LeaveBalanceCalculator is a JavaScript tool designed to help users track and calculate their leave balances based on a predefined leave policy. The tool monitors annual leave usage, handles carry-over of unused leave hours, accounts for additional leave based on years of service, and differentiates between regular leave and leisure days.

## Features
- **Annual Leave Tracking**: Monitors leave usage by year
- **Leave Balance Calculation**: Calculates available leave hours based on a standard policy (20 days/160 hours per year)
- **Carry-Over Management**: Tracks and calculates carry-over of unused leave hours from previous years
- **Service-Based Extra Leave**: Automatically adds extra leave hours based on years of service (8 hours for every 5 years)
- **Leave Categorization**: Distinguishes between regular annual leave and leisure days
- **Detailed Reporting**: Provides comprehensive console output showing leave balances and usage for each year

## How It Works
The calculator works by intercepting API calls to your organization's leave request system. When leave data is retrieved, the tool:

1. Resets previous calculations
2. Processes all leave requests and categorizes them by year and type
3. Calculates leave balances for each year, accounting for:
   - Standard annual leave allocation
   - Extra leave hours based on years of service
   - Carry-over hours from previous years
4. Displays detailed leave information in the browser console

## Installation

### Prerequisites
- Access to your organization's leave management system
- Basic understanding of browser developer tools

### Setup
1. Open your browser's developer console (F12 or Ctrl+Shift+I in most browsers)
2. Copy the entire content of `script.js`
3. Paste it into the console while on your leave management system's page
4. Press Enter to execute the script

## Usage
1. After installing the script, you'll be prompted to enter your service start date in the format `dd/mm/yyyy`
2. Navigate to your leave requests page in the leave management system
3. Adjust the "items per page" setting to a higher value (100 is recommended) to ensure all leave data is loaded
4. The script automatically intercepts the leave data and displays calculated balances in the console
5. Check the console output for:
   - Extra leave hours based on years of service
   - Booked leisure days
   - Booked annual leaves (in days and hours)
   - Available annual leaves (in days and hours)
   - Available carried-over annual leaves (for years after 2024)

## Understanding the Results
The console output provides a year-by-year breakdown of your leave balance:

```
Year 2023:
- Extra Leave Hours: 8 hour(s)
- Booked Leisure day: true
- Booked Annual leaves: 15 days 4 hours
- Available Annual leaves: 5 days 4 hours

Year 2024:
- Extra Leave Hours: 8 hour(s)
- Booked Leisure day: false
- Booked Annual leaves: 10 days
- Available Annual leaves: 10 days 
- Available Carried Over Annual leaves: 5 days 4 hours
```

## Leave Policy Details
- Standard annual leave: 20 days (160 hours) per year
- Extra leave: 1 day (8 hours) added for every 5 years of service
- Carry-over: Unused leave hours can be carried over to the next year (for years 2024 onward)
- Leave is tracked in both days and hours (8 hours = 1 day)

## Notes
- The calculator only works when accessing your organization's leave management system
- Results are displayed in the browser console and are not stored between sessions
- For accurate results, ensure all leave requests are properly loaded in the system
- The tool is particularly useful for tracking carry-over hours which apply from 2024 onward

## Troubleshooting
If you don't see any results:
1. Make sure you've entered your service date correctly
2. Increase the "items per page" setting to load all leave requests
3. Check that you're on the correct page in your leave management system
4. Verify that the console doesn't show any JavaScript errors

---

*This tool is designed for personal use and does not modify any data in your organization's leave management system.*

