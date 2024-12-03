function doGet() {
  return ContentService.createTextOutput(JSON.stringify(getCommissionsData())).setMimeType(ContentService.MimeType.JSON);
}

function getCommissionsData() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Commisions"); // Ensure this matches your sheet name
  if (!sheet) {
    throw new Error("Sheet 'Commisions' not found.");
  }

  var monthName = sheet.getRange("G1").getValue(); // Fetch the month's name from cell G1
  var data = sheet.getDataRange().getValues(); // Get all data in the sheet
  var jsonData = []; // Initialize jsonData as an empty array

  // Add the month's name as a separate object
  jsonData.push({ month: monthName });

  for (var i = 1; i < data.length; i++) {
    // Start from 1 to skip header row
    jsonData.push({
      name: data[i][0], // Assuming Name is in the first column
      status: data[i][1], // Assuming Status is in the second column
      startDate: data[i][2], // Assuming Start Date is in the third column
      type: data[i][3], // Assuming Type is in the fourth column
      estimatedTime: data[i][4], // Assuming Estimated Time is in the fifth column
      progress: data[i][5], // Assuming Progress is in the sixth column
    });
  }
  return jsonData;
}
