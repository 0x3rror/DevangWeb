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
const RECIPIENT_EMAIL = 'devang@devanghrconsultancy.in'; // replace with the email that should receive CVs

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
    // If headers are not present, create a friendly schema
    if(!headers || headers.length===0){
      const keys = ['name','email','company','phone','message','cv_filename','timestamp'];
      sheet.appendRow(keys);
    }

    // Prepare values for append
    const name = payload.name || '';
    const email = payload.email || '';
    const company = payload.company || '';
    const phone = payload.phone || '';
    const message = payload.message || '';
    const cvFilename = (payload.cv && payload.cv.name) ? payload.cv.name : '';
    const ts = new Date();

    sheet.appendRow([name,email,company,phone,message,cvFilename,ts]);

    // If a CV was sent, decode and email it as attachment
    if(payload.cv && payload.cv.content){
      try{
        var dataUrl = payload.cv.content;
        // strip data:...;base64, prefix if present
        if(dataUrl.indexOf(',') !== -1){
          dataUrl = dataUrl.split(',')[1];
        }
        const blob = Utilities.newBlob(Utilities.base64Decode(dataUrl), payload.cv.type || 'application/octet-stream', payload.cv.name || 'cv');
        const subject = 'CV submission from ' + (name || email || 'website');
        const body = 'New CV uploaded via the website.\n\nName: ' + name + '\nEmail: ' + email + '\nCompany: ' + company + '\nPhone: ' + phone + '\nMessage: ' + message + '\nTimestamp: ' + ts;
        GmailApp.sendEmail(RECIPIENT_EMAIL, subject, body, {attachments:[blob]});
      }catch(err){
        // continue but report the error in the response
        return ContentService.createTextOutput(JSON.stringify({result:'error',message:'Failed to process attachment: '+err.message})).setMimeType(ContentService.MimeType.JSON);
      }
    }

    return ContentService.createTextOutput(JSON.stringify({result:'ok'})).setMimeType(ContentService.MimeType.JSON);
  } catch(err){
    return ContentService.createTextOutput(JSON.stringify({result:'error',message:err.message})).setMimeType(ContentService.MimeType.JSON);
  }
}
