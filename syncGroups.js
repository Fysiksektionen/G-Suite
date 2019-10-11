// Mycket kod plankad från https://github.com/scouternasetjanster/Google-Scoutnet-synk
// Skriven av Teo Elmfeldt, FUL 2019.

//TODO: Ta fram en lista på de som inte listas någonstans att de ska finnas
//      med, men ändå är med, och ta bort dem
//TODO: ta bort grupper som är tomma?
//TODO: Skriv på ett kalkylark en överblick över alla medlemsskap
//FIXME: Tomma rader, ta bort undefined
function synkarGrupper() {
  var rootSheet = '1EsPbU7hCHUxtziBXrYAoih1lcfYZK9AT4JUpVyMCAJU'
  var defaultRange = 'A2:D'
  Sheets.Spreadsheets.Values.clear({}, rootSheet, 'Alla!A2:C')
  // Lägg till respektive nämnd, och sheet-id till dess medlemslista

  var styretId = rootSheet;
  var StyretRange = 'Centralt!A2:D';
  getListFromNamnd(styretId, 'styret', StyretRange);

  var PermanentTitlesId = rootSheet;
  var PermanentTitlesRange = 'Grupper!A2:D';
  getListFromNamnd(PermanentTitlesId, '', PermanentTitlesRange);

  var fsnId = '1I9_ngSMWz-wBTXmaavlTGIVsugFjzMiF0TqRDidyUfY';
  getListFromNamnd(fsnId, 'fsn', 'B2:E');

  var fcomId = '1042kWvX-JBkBDKjo0LPWVWmleoW_IjBRrMZS6MIHsDE';
  getListFromNamnd(fcomId, 'fcom', defaultRange);

  var frumId = '1Rrdmob6-96OECcy3YSJtl9cd-jx8eCfcKqVf0oPWc4w';
  getListFromNamnd(frumId, 'frum', defaultRange);

  var mottagningenId = '13-81WGYZ1GmfZjqLsf6aLSjEhr3joFseqZjL7c9bgWU';
  getListFromNamnd(mottagningenId, 'mottagningen', defaultRange);

  var fnId = '194ctESEJRfE5uYAcS_fVelr3oUdzSdOT9NDvsfkmF-E';
  getListFromNamnd(fnId, 'fn', defaultRange);

  var fkmId = '11NsStSYkgj4Xb8joQNRbDWaOa6uS-Lng4KwpyoaUs_g';
  getListFromNamnd(fkmId, 'fkm', defaultRange);

  var fysikalenId = '1Sxd25EJXUZTZg6jBvLdrzYioO4YICUub0kojjNdszpg';
  getListFromNamnd(fysikalenId, 'fysikalen', defaultRange)

  var aktivitetId = '1_7yTr0KUZxrZBPAcM7JyehEAXWukkqyHlSB00OFN9w0';
  getListFromNamnd(aktivitetId, 'aktivitet', defaultRange)

  var jamnId = '19yB9udiTwU9gAZhRSnD4DXpHovvovubH6L4mIDiMIXw';
  getListFromNamnd(jamnId, 'jamlikhet', defaultRange)

  // Nu är alla medlemmar lagda på samma ställe, då är det fritt fram att hämta och synka
  var listOfUsers = Sheets.Spreadsheets.Values.get(rootSheet, 'Alla!A2:B').values
  addAndRemoveUsers(listOfUsers)
}

function getListFromNamnd(sheetId, namnd, rangeid) {
  var members = Sheets.Spreadsheets.Values.get(sheetId, rangeid).values;
  if (!members) {
    Logger.log('No data found.');
  }
  else {

    var listOfTitles = []; // vad grupperna kallas
    var listOfIds = [] // vad grupperna har unikt id
    for (var row = 0; row < members.length; row++) {
      //Logger.log(members[row][3])


      // Vi tar bort rader där innehållet är tomt
      if (members[row][1] && members[row][3]) {
        // Om gruppens existens inte är noterad än
        if (!contains(listOfIds, members[row][3])) {

          listOfIds.push(members[row][3]);

          listOfTitles.push(members[row][2]);

          // skapar alla grupper som saknas, uppdaterar övriga
          CreateOrUpdateGroup(members[row][2], members[row][3], namnd)
        }
      }
    }

    var toWriteList = []
    // Lägg till de som ska in i grupper till totala listan

    for (var i = 0; i < listOfIds.length; i ++) {
      //Logger.log(listOfIds[i])
      // undersöker respektive grupp, kollar mot vilka som ska med
      if (listOfIds[i]) {
        var listOfEmails = memberEmails(getEmail(listOfIds[i], namnd, true));

        for (var j = 0; j < members.length; j++) {
          if (listOfIds[i] == members[j][3]) {

            toWriteList.push([getEmail(members[j][1], namnd, true), getEmail(listOfIds[i], namnd, true)])
          }
        }
      }
      // else Logger.log(listOfIds[i])
    }
  }
  writeAllToSheet(toWriteList)
}


function addAndRemoveUsers(listOfUsers) {
  if (!listOfUsers) {
    Logger.log('no members found')
  }
  else {
    var listOfGroupIds = []
    // leta rätt på alla grupper som finns
    for (var row = 0; row < listOfUsers.length; row++) {
      //Logger.log(members[row][3])
      if (!contains(listOfGroupIds, listOfUsers[row][1])) { // Om gruppens existens inte är noterad än
        listOfGroupIds.push(listOfUsers[row][1]);

      }
    }

    //Logger.log(listOfGroupIds)
    for (var i = 0; i < listOfGroupIds.length; i ++) {

      // ta rätt på alla som redan är med i gruppen
      var listOfEmails = memberEmails(listOfGroupIds[i]);
      //Logger.log(listOfGroupIds + ' : ' + listOfEmails)

      var listOfWantedMembers = []
      //var listToRemove = []
      for (var j = 0; j < listOfUsers.length; j++) {

        //lägger till alla som enligt listorna ska vara med i gruppen
        if (listOfGroupIds[i] == listOfUsers[j][1]) {

          addToGroup(listOfGroupIds[i], listOfUsers[j][0]);
          listOfWantedMembers.push(listOfUsers[j][0]);

        }
      }
      //Logger.log(listOfEmails + ' jämförs med ' + listOfWantedMembers)
      if (listOfEmails) {
        //Logger.log(listOfGroupIds[i])

        var toRemovePerId = []
        // gå igenom alla som är med i gruppen. Ska de fortfarande vara det?

        for (var j = 0; j < listOfEmails.length; j++) {

          // grupper kan ha flera olika namn, så vi tar rätt på alla alias
          var oneMember = []
          try {
            // om det är en grupp så går det att få fram alias
            info = AdminDirectory.Groups.get(listOfEmails[j]);
            oneMember.push(info.email);
            for (var num = 0; num < info.aliases.length; num++) {
              oneMember.push(info.aliases[num]);
            }
          }
          catch (e) {
            //Logger.log(e)
            oneMember.push(listOfEmails[j]);
          }
          //Logger.log('alla namn ' + oneMember)
          var isMember = false
          for (var alias = 0; alias < oneMember.length; alias++) {
            // gå igenom alla alias, om något av dem är en träff så får gruppen/användaren vara kvar
            //Logger.log('vi checkar ' + oneMember[alias] + ' mot ' + listOfWantedMembers)
            if (contains(listOfWantedMembers, oneMember[alias])) {
              //Logger.log(listOfEmails[j] + ' borde bort från ' + listOfIds[i])

              isMember = true;
            }
          }
          if (!isMember) {
            removeFromGroup(listOfEmails[j], listOfGroupIds[i]);
          }
          //else {Logger.log(listOfEmails[j] + ' finns i ' + listOfIds[i])}
        }
      }
    }
  }
}

// lägg in en gruppemailadress, så får du ut alla medlemmar i gruppen
function memberEmails(groupemail) {
  //Logger.log(groupemail);
  var members = AdminDirectory.Members.list(groupemail).members;
  if (!members) {
    //Logger.log(groupemail + ' är tom')
  }
  else {
    var listOfEmails = [];
    for (var i = 0; i < members.length; i ++) {
      listOfEmails.push(members[i].email)
    }
  }
  return listOfEmails
}


// Skapar en grupp om den inte finns, annars uppdaterar vi den ifall något ändrats (namn eller nåt)
// lägger också till alias enligt regel:
// alla nämnder har sina egna listor på format grupp.namnd@
// om möjligt skapas även grupp@
function CreateOrUpdateGroup(name, id, namnd) {
  //Logger.log('skapar eller uppdaterar ' + getEmail(id, namnd, false));
  var group = {
    "email": getEmail(id, namnd, false),
    "name": name,
    //"description": namnd
  };
  var alias = {
    "alias": id + '@fysiksektionen.se'
  };
  //Logger.log(name + id + namnd)
  try {
    AdminDirectory.Groups.insert(group);
    Logger.log('skapade ' + group.email)
  }
  catch (e) {
    //Logger.log(e)
    //Logger.log('uppdaterade ' + group.email + group.name)
    AdminDirectory.Groups.update(group, group.email);
  }
  try {
    AdminDirectory.Groups.Aliases.insert(alias, group.email)
    Logger.log('skapade alias ' + alias.alias)
  }
  catch (e) {
    //Logger.log(e + alias.alias + ' existerar redan')
  }
  //return group.email
}


//FIXME: Det måste ju finnas nåt smidigare sätt...
// exists är true om vi förväntar oss att en grupp som heter så redan finns.
// då betyder avsaknad av id:t att det är en användare som inte existerar än
function getEmail(id, namnd, exists) {
  // Logger.log('id: ' + id + ', nämnd: ' + namnd)

  if(id) {
    if (id.indexOf("@") > -1) {
      return id;
    }
   id = id.replace(/([\s])+/g, '.'); // Ta bort tomma mellanrum vid start och slut och konvertera till gemener
   id = id.replace(/[.][\-]/g, '-').replace(/[\-][.]/g, '-'); // Ersätt alla tomma mellanrum med en punkt (.)
   id = id.replace(/[^0-9a-z.\-_]/gi, ''); // Ta bort om det inte är engelsk bokstav eller nummer
   try {
     // Kolla om det är en användare
     AdminDirectory.Users.get(id + '@fysiksektionen.se')
     return id + '@fysiksektionen.se';
   }
   catch (e) {
     // om de inte är existerande användare kollar vi om gruppen existerar
     if (exists) {
       // om vi nu inte är intresserade av att hitta på nya grupper
       try {
         AdminDirectory.Groups.get(id + '@fysiksektionen.se')
       }
       catch (e) {
         // gruppen finns inte, då måste det vara en saknad användare
         missingUser(id + '@fysiksektionen.se');
         return id + '@fysiksektionen.se';
       }
     }
     // antingen så förväntar vi oss inte att gruppen ska finnas
     // eller så finns den redan
     if (id && namnd) {
         return id + '.' + namnd + '@fysiksektionen.se'
     }
     //Om det inte finns någon nämndbeteckning så hanterar vi styret
     else if (namnd == '') {
       return id + '@fysiksektionen.se'
     }
     //Om det är tomt kan vi anta att det bara är en nämndadress
     else {
       return namnd + '@fysiksektionen.se'
     }
   }
  }
}



// TODO: Hur ska vi använda roller?
//FIXME: nästlade try-catch...
// lägger till gruppen eller användaren memberemail i gruppen groupEmail
function addToGroup(groupEmail, memberemail) {
  //var memberemail = memberId + '@fysiksektionen.se';
  var member = {
      delivery_settings: 'ALL_MAIL',
      email: memberemail,
      role: 'MEMBER'
      };
  //Logger.log('Checkar ' + groupEmail + memberemail);
  try {
    // Om användare saknas aktiveras catch. Om användare ej i grupp läggs den till
    if (!AdminDirectory.Members.hasMember(groupEmail, memberemail).isMember) {
      Logger.log('Lägger till ' + memberId + ' i ' + group);
      AdminDirectory.Members.insert(member, groupEmail);
      Logger.log(memberId + ' tillagd i ' + groupEmail)
    }
    else {
      //Logger.log(memberemail + ' redan med i ' + groupEmail)
    }
  }
  catch (e) {
    // om användare saknas, eller det är en grupp
    try {
      // om det är en grupp försöker vi lägga till den i gruppen
      AdminDirectory.Members.insert(member, groupEmail);

    }
    catch (e) {

      try {
        // om det är en grupp som redan finns med i gruppen kommer detta lyckas
        AdminDirectory.Members.get(groupEmail, memberemail);
      }
      catch (e) {
        // slutligen måste det vara en medlem som inte är skapad än
        Logger.log(e + ' ' + memberemail + groupEmail);
        missingUser(memberemail);
      }
    }
  }
}

// ta bort memberEmail från groupEmail
function removeFromGroup(memberEmail, groupEmail) {
  Logger.log('Bort med ' + memberEmail + ' från ' + groupEmail);
  AdminDirectory.Members.remove(groupEmail, memberEmail)
}

//TODO: se till så att användaren skapas. Automatiskt eller manuellt?
function missingUser(memberId) {
  Logger.log('Användaren ' + memberId + ' saknas')
  /*
  var email = Session.getActiveUser().getEmail();
  MailApp.sendEmail(email, "Användare saknas",
                   "Vi saknar användaren " + memberId);
                   */

}

// om list innehåller element
function contains(list, element) {
  for (var i = 0; i < list.length; i++) {
    //Logger.log(list[i] + ' mot ' + element)
    if (list[i] == element) {
      return true
    }
  }
  return false
}

// skriver in från alla nämnder, till ett samlat ställe
// tar in en lista med en lista med medlemsid och gruppid på emailformat
function writeAllToSheet(listToWrite) {

  var valueRange = Sheets.newRowData();
  valueRange.values = listToWrite;

  var appendRequest = Sheets.newAppendCellsRequest();
  appendRequest.sheetId = '1g0-sYcS_QTmQ_FIuo8r02Gu_YiKQv7SB0sZzwJR2y00';
  appendRequest.rows = [valueRange];

  var result = Sheets.Spreadsheets.Values.append(valueRange, '1EsPbU7hCHUxtziBXrYAoih1lcfYZK9AT4JUpVyMCAJU', 'Alla!A2:C', {
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS'
  });
}
