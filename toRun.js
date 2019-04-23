// Mycket kod plankad från https://github.com/scouternasetjanster/Google-Scoutnet-synk
// Skriven av Teo Elmfeldt, FUL 2019.

function runAll() {
  var rootSheet = '1EsPbU7hCHUxtziBXrYAoih1lcfYZK9AT4JUpVyMCAJU';
  var rangeId = 'Synkningar!A2:D';
  var namndlistor = Sheets.Spreadsheets.Values.get(rootSheet, rangeId).values;
  Logger.log(namndlistor)
  for (var i = 0; i < namndlistor.length; i++) {
    Logger.log(namndlistor[i][1]);
    var revisionTime = Drive.Revisions.list(namndlistor[i][1], {pageSize: 2}).items[0].modifiedDate;
    Logger.log(revisionTime + ' mot ' + namndlistor[i][3])
    
    if (revisionTime = namndlistor[i][3]) {
      Logger.log('senaste ändringen ')
    }
    else {
      synkarKonton();
      synkarGrupper();
      //writeTimeToSheet(revisionTime, namndlistor[i][1])
    }
    //writeTimeToSheet(revisionTime, namndlistor[i][1])
  }
  //synkarKonton();
  //synkarGrupper();
}

function writeTimeToSheet(element, sheetId, range) {
  var values = [
    [
      element
    ]
  ];
  var valueRange = Sheets.newRowData();
  valueRange.values = values;

  var appendRequest = Sheets.newAppendCellsRequest();
  appendRequest.sheetId = '1g0-sYcS_QTmQ_FIuo8r02Gu_YiKQv7SB0sZzwJR2y00';
  appendRequest.rows = [valueRange];

  var result = Sheets.Spreadsheets.Values.append(valueRange, sheetId, range, {
    valueInputOption: 'RAW',
    insertDataOption: 'OVERWRITE'
  });
}