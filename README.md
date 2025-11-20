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

### Quick Copy (One-click)
The repository ships with a minified build so teammates can copy everything from a single block on GitHub. Click [dist/leave-balance-calculator.min.js](dist/leave-balance-calculator.min.js) to open the raw file (GitHub includes a copy button), or copy the snippet below produced by `npm run build`:

```javascript
const totalLeaveDays=20,hoursPerDay=8,totalLeaveHours=160,monthlyLeaveHours=13.333333333333334,membershipPath=["api_calls","CURRENT_MEMBERSHIP","data"];let dateOfService=0,extraLeaveHours=0;const parseServiceDate=e=>!e||!/\d{2}\/\d{2}\/\d{4}/.test(e)?null:new Date(e.split("/").reverse().join("-")),getExtraLeaveHours=(e,o)=>{if(!e||!/\d{2}\/\d{2}\/\d{4}/.test(e))return console.log("Invalid year of service, set to 0"),0;const r=parseServiceDate(e);if(!r)return console.log("Invalid year of service, set to 0"),0;const s=o-r.getFullYear(),n=s>=0?s:0;return extraLeaveHours=n>=0?Math.floor(n/5)*8:0,extraLeaveHours},getBaseLeaveHours=(e,o)=>{const r=parseServiceDate(e);if(!r)return 160;const s=r.getFullYear();if(o<s)return 0;if(o>s)return 160;let n=12-r.getMonth();return r.getDate()>15&&(n-=1),n=Math.max(Math.min(n,12),0),Math.round(monthlyLeaveHours*n*100)/100},isCarryOverPossible=e=>{const o=new Date(e);if(Number.isNaN(o.getTime()))return!1;const r=o.getUTCFullYear(),s=o.getUTCMonth(),n=o.getUTCDate();return r>=2024&&(s<2||s===2&&n<=31)},formatDaysAndHours=e=>{if(!Number.isFinite(e))return"0 days";const o=Math.round(e*100)/100,r=o<0,s=Math.abs(o),n=Math.floor(s/8),l=Math.round(s%8*100)/100,i=l>0?`${n} days ${l} hours`:`${n} days`;return r?`-${i}`:i},calculateLeaveSummary=(e,o)=>{const r={},s={},n={},l={},i={},g={},v={},p={};e.forEach(t=>{const c=new Date(t.start_date.split("/").reverse().join("-")).getFullYear();if(r[c]||(r[c]=0,s[c]=!1,n[c]=0,l[c]=0),t.leave_category_name==="Annual Leave (VN)"||t.leave_category_name==="Annual Leave"){r[c]+=t.total_units,t.leave_hours.forEach(u=>{if(isCarryOverPossible(u.date)){const d=parseFloat(u.hours);l[c]+=Number.isFinite(d)?d:0}});return}(t.leave_category_name==="Leisure Rules Day"||t.leave_category_name==="Leisure Rules Day (VN)")&&(s[c]=!0)});const a={},L=Object.keys(r).map(t=>parseInt(t,10)).sort((t,c)=>t-c);return L.forEach(t=>{const c=t-1,u=c>=2024&&n[c]||0,d=getBaseLeaveHours(o,t);i[t]=d;const y=getExtraLeaveHours(o,t);g[t]=y;const h=l[t]||0,f=Math.min(u,h);v[t]=f;const b=Math.max(u-f,0);p[t]=b;const H=r[t]-f,D=d+y-H;a[t]=D,n[t]=t>=2024&&D>0?D:0}),L.map(t=>{const c=r[t],u=s[t],d=t-1>=2024&&n[t-1]||0,y=v[t]||0,h=p[t]||0,f=g[t]||0,b=i[t]||0,O=a[t],H=t>=2024?Math.max(n[t]||0,0):0;return{year:t,baseLeaveHours:b,extraLeaveHours:f,leisureDayBooked:u,bookedHours:c,availableHours:O,carryOverFromPrevious:d,carryOverUsedBeforeExpiry:y,carryOverExpired:h,carryOverToNext:H}})},findStoreInFiber=e=>{var o;return e?(o=e.memoizedProps)!=null&&o.store?e.memoizedProps.store:findStoreInFiber(e.child)||findStoreInFiber(e.sibling):null},getReduxStoreFromHook=()=>{var r;if(typeof window=="undefined")return null;const e=window.__REACT_DEVTOOLS_GLOBAL_HOOK__;if(!e)return null;const o=e.renderers||e._renderers;if(!o)return null;for(const[s]of o.entries()){const n=typeof e.getFiberRoots=="function"&&e.getFiberRoots(s)||((r=e._fiberRoots)==null?void 0:r.get(s));if(n)for(const l of n){const i=findStoreInFiber(l==null?void 0:l.current);if(i)return i}}return null},formatIsoToServiceDate=e=>{if(!e)return null;const o=new Date(e);if(Number.isNaN(o.getTime()))return null;const r=String(o.getDate()).padStart(2,"0"),s=String(o.getMonth()+1).padStart(2,"0"),n=o.getFullYear();return`${r}/${s}/${n}`},detectDateOfServiceFromStore=()=>{const e=getReduxStoreFromHook();if(!e||typeof e.getState!="function")return null;let o=e.getState();for(const r of membershipPath)if(o&&Object.prototype.hasOwnProperty.call(o,r))o=o[r];else{o=null;break}return o!=null&&o.created_at?formatIsoToServiceDate(o.created_at):null},ensureDateOfService=()=>{if(dateOfService)return dateOfService;const e=detectDateOfServiceFromStore();return e?(dateOfService=e,console.log(`Detected start date of service from CURRENT_MEMBERSHIP: ${dateOfService}`),dateOfService):(typeof prompt=="function"?(dateOfService=prompt("Enter the start date of service (dd/mm/yyyy):"),console.log(`Date of service: ${dateOfService}`)):(console.warn("Unable to detect service date automatically and prompt is unavailable."),dateOfService=""),dateOfService)},initLeaveBalanceCalculator=e=>{if(!e||typeof e.fetch!="function")return;const o=e.fetch;return e.fetch=(...r)=>{const s=o.apply(e,r);return s.then(async n=>{const l=n.url;if(l&&/\/api\/v3\/organisations\/\d+\/members\/\d+\/leave_requests/.test(l)){const v=await n.clone().json();calculateLeaveSummary(v.data.items,dateOfService).forEach(a=>{console.log(`Year ${a.year}:`),console.log(`- Annual Leave Entitlement: ${formatDaysAndHours(a.baseLeaveHours)}`),console.log(`- Extra Leave Hours: ${a.extraLeaveHours} hour(s)`),console.log(`- Booked Leisure day: ${a.leisureDayBooked}`),console.log(`- Booked Annual leaves: ${formatDaysAndHours(a.bookedHours)}`),console.log(`- Available Annual leaves: ${formatDaysAndHours(a.availableHours)}`),a.carryOverFromPrevious>0&&(console.log(`- Carry Over from ${a.year-1} (expires 31/03/${a.year}): ${formatDaysAndHours(a.carryOverFromPrevious)}`),console.log(`- Carry Over Used before 31/03/${a.year}: ${formatDaysAndHours(a.carryOverUsedBeforeExpiry)}`),console.log(`- Carry Over Expiring on 31/03/${a.year}: ${formatDaysAndHours(a.carryOverExpired)}`)),a.year>=2024&&console.log(`- Carry Over to ${Number(a.year)+1}: ${formatDaysAndHours(a.carryOverToNext)}`)})}}),s},ensureDateOfService(),"Please change the item per page to see the results, better to set it to 100.Thank you!"};typeof window!="undefined"&&initLeaveBalanceCalculator(window),typeof module!="undefined"&&module.exports&&(module.exports={parseServiceDate,getExtraLeaveHours,getBaseLeaveHours,isCarryOverPossible,formatDaysAndHours,calculateLeaveSummary,initLeaveBalanceCalculator});
```

### Bookmarklet Option
Prefer a bookmark you can click on the leave page? Open [dist/leave-balance-calculator.bookmarklet.txt](dist/leave-balance-calculator.bookmarklet.txt) and use GitHub's copy button, or copy the text below and create a new bookmark with it as the URL:

```
javascript:(()=>{const totalLeaveDays=20,hoursPerDay=8,totalLeaveHours=160,monthlyLeaveHours=13.333333333333334,membershipPath=["api_calls","CURRENT_MEMBERSHIP","data"];let dateOfService=0,extraLeaveHours=0;const parseServiceDate=e=>!e||!/\d{2}\/\d{2}\/\d{4}/.test(e)?null:new Date(e.split("/").reverse().join("-")),getExtraLeaveHours=(e,o)=>{if(!e||!/\d{2}\/\d{2}\/\d{4}/.test(e))return console.log("Invalid year of service, set to 0"),0;const t=parseServiceDate(e);if(!t)return console.log("Invalid year of service, set to 0"),0;const s=o-t.getFullYear(),n=s>=0?s:0;return extraLeaveHours=n>=0?Math.floor(n/5)*8:0,extraLeaveHours},getBaseLeaveHours=(e,o)=>{const t=parseServiceDate(e);if(!t)return 160;const s=t.getFullYear();if(o<s)return 0;if(o>s)return 160;let n=12-t.getMonth();return t.getDate()>15&&(n-=1),n=Math.max(Math.min(n,12),0),Math.round(monthlyLeaveHours*n*100)/100},isCarryOverPossible=e=>{const o=new Date(e);return o<new Date(o.getFullYear(),2,31)&&o.getFullYear()>=2024},formatDaysAndHours=e=>{if(!Number.isFinite(e))return"0 days";const o=Math.round(e*100)/100,t=o<0,s=Math.abs(o),n=Math.floor(s/8),l=Math.round(s%8*100)/100,i=l>0?`${n} days ${l} hours`:`${n} days`;return t?`-${i}`:i},calculateLeaveSummary=(e,o)=>{const t={},s={},n={},l={},i={},p={},f={},g={};e.forEach(r=>{const c=new Date(r.start_date.split("/").reverse().join("-")).getFullYear();if(t[c]||(t[c]=0,s[c]=!1,n[c]=0,l[c]=0),r.leave_category_name==="Annual Leave (VN)"||r.leave_category_name==="Annual Leave"){t[c]+=r.total_units,r.leave_hours.forEach(u=>{if(isCarryOverPossible(u.date)){const d=parseFloat(u.hours);l[c]+=Number.isFinite(d)?d:0}});return}(r.leave_category_name==="Leisure Rules Day"||r.leave_category_name==="Leisure Rules Day (VN)")&&(s[c]=!0)});const a={},L=Object.keys(t).map(r=>parseInt(r,10)).sort((r,c)=>r-c);return L.forEach(r=>{const c=r-1,u=c>=2024&&n[c]||0,d=getBaseLeaveHours(o,r);i[r]=d;const y=getExtraLeaveHours(o,r);p[r]=y;const h=l[r]||0,v=Math.min(u,h);f[r]=v;const H=Math.max(u-v,0);g[r]=H;const b=t[r]-v,D=d+y-b;a[r]=D,n[r]=r>=2024&&D>0?D:0}),L.map(r=>{const c=t[r],u=s[r],d=r-1>=2024&&n[r-1]||0,y=f[r]||0,h=g[r]||0,v=p[r]||0,H=i[r]||0,O=a[r],b=r>=2024?Math.max(n[r]||0,0):0;return{year:r,baseLeaveHours:H,extraLeaveHours:v,leisureDayBooked:u,bookedHours:c,availableHours:O,carryOverFromPrevious:d,carryOverUsedBeforeExpiry:y,carryOverExpired:h,carryOverToNext:b}})},findStoreInFiber=e=>{var o;return e?(o=e.memoizedProps)!=null&&o.store?e.memoizedProps.store:findStoreInFiber(e.child)||findStoreInFiber(e.sibling):null},getReduxStoreFromHook=()=>{var t;if(typeof window=="undefined")return null;const e=window.__REACT_DEVTOOLS_GLOBAL_HOOK__;if(!e)return null;const o=e.renderers||e._renderers;if(!o)return null;for(const[s]of o.entries()){const n=typeof e.getFiberRoots=="function"&&e.getFiberRoots(s)||((t=e._fiberRoots)==null?void 0:t.get(s));if(n)for(const l of n){const i=findStoreInFiber(l==null?void 0:l.current);if(i)return i}}return null},formatIsoToServiceDate=e=>{if(!e)return null;const o=new Date(e);if(Number.isNaN(o.getTime()))return null;const t=String(o.getDate()).padStart(2,"0"),s=String(o.getMonth()+1).padStart(2,"0"),n=o.getFullYear();return`${t}/${s}/${n}`},detectDateOfServiceFromStore=()=>{const e=getReduxStoreFromHook();if(!e||typeof e.getState!="function")return null;let o=e.getState();for(const t of membershipPath)if(o&&Object.prototype.hasOwnProperty.call(o,t))o=o[t];else{o=null;break}return o!=null&&o.created_at?formatIsoToServiceDate(o.created_at):null},ensureDateOfService=()=>{if(dateOfService)return dateOfService;const e=detectDateOfServiceFromStore();return e?(dateOfService=e,console.log(`Detected start date of service from CURRENT_MEMBERSHIP: ${dateOfService}`),dateOfService):(typeof prompt=="function"?(dateOfService=prompt("Enter the start date of service (dd/mm/yyyy):"),console.log(`Date of service: ${dateOfService}`)):(console.warn("Unable to detect service date automatically and prompt is unavailable."),dateOfService=""),dateOfService)},initLeaveBalanceCalculator=e=>{if(!e||typeof e.fetch!="function")return;const o=e.fetch;return e.fetch=((...t)=>{const s=o.apply(e,t);return s.then(async n=>{const l=n.url;if(l&&/\/api\/v3\/organisations\/\d+\/members\/\d+\/leave_requests/.test(l)){const f=await n.clone().json();calculateLeaveSummary(f.data.items,dateOfService).forEach(a=>{console.log(`Year ${a.year}:`),console.log(`- Annual Leave Entitlement: ${formatDaysAndHours(a.baseLeaveHours)}`),console.log(`- Extra Leave Hours: ${a.extraLeaveHours} hour(s)`),console.log(`- Booked Leisure day: ${a.leisureDayBooked}`),console.log(`- Booked Annual leaves: ${formatDaysAndHours(a.bookedHours)}`),console.log(`- Available Annual leaves: ${formatDaysAndHours(a.availableHours)}`),a.carryOverFromPrevious>0&&(console.log(`- Carry Over from ${a.year-1} (expires 31/03/${a.year}): ${formatDaysAndHours(a.carryOverFromPrevious)}`),console.log(`- Carry Over Used before 31/03/${a.year}: ${formatDaysAndHours(a.carryOverUsedBeforeExpiry)}`),console.log(`- Carry Over Expiring on 31/03/${a.year}: ${formatDaysAndHours(a.carryOverExpired)}`)),a.year>=2024&&console.log(`- Carry Over to ${Number(a.year)+1}: ${formatDaysAndHours(a.carryOverToNext)}`)})}}),s}),ensureDateOfService(),"Please change the item per page to see the results, better to set it to 100.Thank you!"});typeof window!="undefined"&&initLeaveBalanceCalculator(window),typeof module!="undefined"&&module.exports&&(module.exports={parseServiceDate,getExtraLeaveHours,getBaseLeaveHours,isCarryOverPossible,formatDaysAndHours,calculateLeaveSummary,initLeaveBalanceCalculator});})();
```

## Usage
1. After installing the script, it automatically tries to read your service start date from `CURRENT_MEMBERSHIP.data.created_at`. If it cannot, you'll be prompted to enter the date manually in the format `dd/mm/yyyy`.
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
- Service start date detection uses the `CURRENT_MEMBERSHIP` data exposed in the app's Redux store via the React DevTools hook. If the data cannot be read (e.g., React DevTools not installed), the script falls back to asking for manual input.

## Troubleshooting
If you don't see any results:
1. Make sure you've entered your service date correctly
2. Increase the "items per page" setting to load all leave requests
3. Check that you're on the correct page in your leave management system
4. Verify that the console doesn't show any JavaScript errors

## Development
- `npm install` — installs the esbuild dependency used for bundling
- `npm test` — runs the Node-based regression test against `sample.json`
- `npm run build` — regenerates the minified script and bookmarklet under `dist/`. Update the README blocks after running this command so teammates always copy the latest build.

---

*This tool is designed for personal use and does not modify any data in your organization's leave management system.*
