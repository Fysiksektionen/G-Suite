// Mycket kod plankad från https://github.com/scouternasetjanster/Google-Scoutnet-synk
// Skriven av Teo Elmfeldt, FUL 2019.

// Undersöker vilka som är med i organisationen, men inte borde vara det,
// Och vilka som finns i listan över medlemmar men inte har ett konto än
// memberObject är en dict där varje object är en ordnad lista med användardata
// TODO Fixa så att nya medlemmar får ett mail med inloggningsinfo
// TODO Radera användare som inte loggat in på väldigt lång tid?
// TODO kth-mail som återställningsadress

function synkarKonton() {
  var accounts = getGoogleAccounts();
  var memberObject = getListedInSheet();
  var memberList = [];

  var saknas = []; // De som är i bladet, men inte har konto. listan skapas av debug-skäl

  var skaBort = [] // De som har konto, men inte är i bladet

  for (var i = 0; i < memberObject.email.length; i++) {

    //Logger.log('Nu undersöks ' + memberObject.email[i]);
    if (!memberObject.phone[i]) {memberObject.phone[i] = ''};
    var member = {
      first_name: memberObject.first_name[i],
      last_name: memberObject.last_name[i],
      id: memberObject.id[i],
      email: memberObject.email[i],
      phone: memberObject.phone[i]
      };
      //Logger.log(member)

    if(!containsMember(accounts, memberObject.email[i])) { // Om användaren inte finns än, men ska skapas

      saknas.push(memberObject.email[i]);
      //Logger.log(member)
      createAccount(member)
      //Logger.log('Bör lägga till ' + memberObject.email[i]);
    }

    else {
      updateUser(member);
    }

  }
  //Logger.log('Har testat alla som finns i sheets');

  for (var i = 0; i < accounts.length; i++) {
    if(!containsMember(memberObject.email, accounts[i])) {
      // Alla som finns i organisationen men inte i bladet skall suspenderas.
      skaBort.push(accounts[i]);
      suspendUser(accounts[i])
    }
  }
  Logger.log('Ska läggas till: ' + saknas)
  Logger.log('Ska plockas bort: ' + skaBort)
}

// Tar in en lista och ett object. Returnerar sant om objektet finns i listan.
function containsMember(list, memberemail) {
  //Logger.log('Har fått in ' + memberemail);
  for (var j = 0; j < list.length; j++) {
    //Logger.log(list[j] + 'Jämförs med');

    if (list[j] === memberemail) {
      //Logger.log('Finns i båda: ' + memberemail);
      return true
    }
  }
  return false
}

// Tar rätt på de google-konton som finns kopplade till domänen
function getGoogleAccounts() {
  var defaultOrgUnitPath = "/Fysiker";
  var users;
  var pageToken, page;
  do {
    page = AdminDirectory.Users.list({
      domain: 'fysiksektionen.se',
      query: "orgUnitPath='/Teknologer'",
      orderBy: 'givenName',
      maxResults: 500,
      pageToken: pageToken
    });
    users = page.users;
    if (users) {
      var emails = [];
      for (var i = 0; i < users.length; i++) {
        var user = users[i];
        emails.push(user.primaryEmail);
        //Logger.log('%s (%s)', user.name.fullName, user.primaryEmail);
      }
      //Logger.log(emails);
      return emails
    } else {
      Logger.log('Ingen användare hittades.');
      var empty = [];
      return empty;
    }
    pageToken = page.nextPageToken;
  } while (pageToken);

  return users;
}

// Returnerar en lista med användare specade i sheet
// Tyvärr returnerar den en dict med listor, istället för en lista med dict.
// Detta eftersom den inte klarade av att returnera en lista med dict. Gör saker krångliga i compareLists()
function getListedInSheet() {
  var spreadsheetId = '1EsPbU7hCHUxtziBXrYAoih1lcfYZK9AT4JUpVyMCAJU';
  var rangeid = 'Medlemmar!A2:D';
  var values = Sheets.Spreadsheets.Values.get(spreadsheetId, rangeid).values;
  var listOfMembers = []
  var memberObject = {
      first_name: [],
      last_name: [],
      id: [],
      email: [],
      phone: []
    };
  if (!values) {
    Logger.log('No data found.');
  } else {
    //Logger.log('Post, id1:, id2:, id3:');
    for (var row = 0; row < values.length; row++) {
      // Listar alla medlemmar.
      memberObject.first_name.push(values[row][1]);
      memberObject.last_name.push(values[row][2]);
      memberObject.email.push(values[row][0] + '@fysiksektionen.se');
      memberObject.id.push(values[row][0]);
      memberObject.phone.push(values[row][3]);
      var member = {
      first_name: values[row][1],
      last_name: values[row][2],
      id: values[row][0],
      email: values[row][0] + '@fysiksektionen.se'
      };
      listOfMembers.push(member);
      //Logger.log('Finns här ' + memberObject.email)
      //Logger.log(' - %s %s, %s, %s', member.first_name, member.last_name, member.id, member.email);
    }
  }
    //Logger.log(emails)
    //Logger.log('Slutlista ' + memberObject.first_name);
    return memberObject
}



// TODO: maila alla som fått ett konto så de kan skapa lösenord
function createAccount(member) {

  user = createUserPrompt(member);
  user.password = Math.random().toString(36)
  try {
    user = AdminDirectory.Users.insert(user);
    Logger.log('Användare %s skapad.', user.primaryEmail);
  }
  catch (e) {
    Logger.log("Kunde inte lägga till användare: " + member.id);
  }

}

function suspendUser(email) {
  var update = {
    suspended: true,
  }
  Logger.log('Vi suspendar ' + email)
  AdminDirectory.Users.update(update, email);
}

// Avsuspendenderar för tillfället enbart TODO uppdatera användarens uppgifter om nåt ändrats
function updateUser(member) {
  // user = createUserPrompt(member)
  // var user = {
  //   primaryEmail: member.email
  // }
  var update = {
    suspended: false,
  }

  //Logger.log('Uppdaterar ' + member.email)
  AdminDirectory.Users.update(update, member.email);
}

function createUserPrompt(member) {
  var first_name = member.first_name;

  var last_name = member.last_name;

  var user = {
    primaryEmail: member.email,
    name: {
      givenName: first_name,
      familyName: last_name
    },
    "externalIds": [
      {
        "value": member.id,
        "type": "organization"
      }
    ],
    "orgUnitPath": '/Teknologer',
    recoveryEmail: member.id + '@kth.se',
    emails: [{
        address: member.id + '@fysiksektionen.se',
        primary: true
      },
      {
        address: member.id + '@kth.se',
      }
    ]
  };
  if(member.phone) {
    user.phones = [
      {
        value: member.phone,
        primary: true,
        type: 'main'
      }
    ]
  }
  return user
}
