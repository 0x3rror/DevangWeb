/**
 * Google Apps Script sample: receive JSON POST from site quick form and append to a Google Sheet.
 * Steps to use:
 * 1. Create a Google Sheet and note its ID (from URL).
 * 2. In Extensions -> Apps Script, paste this file and set SHEET_ID.
 * 3. Deploy -> New deployment -> Select "Web app". Set "Execute as" = Me, "Who has access" = Anyone (or Anyone within domain).
 * 4. Copy the web app URL and place it in `js/script.js` as APPS_SCRIPT_URL.
 */

const SHEET_ID = 'YOUR_GOOGLE_SHEET_ID'; // replace
const SHEET_NAME = 'Sheet1';

function doGet(e){
  return ContentService.createTextOutput(JSON.stringify({result:'ok'})).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e){
  try{
    const payload = e.postData && e.postData.contents ? JSON.parse(e.postData.contents) : {}; 
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];
    const headers = sheet.getRange(1,1,1,sheet.getLastColumn()).getValues()[0];
    const row = [];
    // ensure order of headers, fall back to keys
    if(!headers || headers.length===0){
      const keys = Object.keys(payload);
      sheet.appendRow(keys);
      keys.forEach(k=>row.push(payload[k] || ''));
    } else {
      headers.forEach(h=>row.push(payload[h] || payload[h.toLowerCase()] || ''));
    }
    sheet.appendRow(row);
    return ContentService.createTextOutput(JSON.stringify({result:'ok'})).setMimeType(ContentService.MimeType.JSON);
  } catch(err){
    return ContentService.createTextOutput(JSON.stringify({result:'error',message:err.message})).setMimeType(ContentService.MimeType.JSON);
  }
}
