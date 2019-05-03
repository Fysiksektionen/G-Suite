# G-Suite

För att kunna hantera accesser och ägandeskap av filer så valde Fysiksektionen under våren 2019 att gå över till G-Suite. Då behöver vi kunna hantera våra medlemmar på ett vettigt sätt, så att det funkar bra. Målet var att ha ett system som
- Centralt administrerar vilka konton som finns
- Använder kth-id som identifikator
- Låter varje nämnd själva administrera sina medlemmar och dess accesser
- Effektivt kunna byta ut många poster samtidigt, och låta alla accesser vara knutna till poster, inte personer
- Fysiksektionen ska äga alla filer

Detta uppnås genom ett system som består av
- Denna kod, som synkas ~2 gånger om dagen
- Ett Google kalkylark som administrerar medlemmar och centrala accesser (styret)
- Ett kalkylark per nämnd där alla poster och nändmedlemmar kan sättas, alla dessa samlade i en Team Drive
- Team Drives där alla våra filer ligger, ordnade efter accessbehov
- Ett SSO-system för inloggning (work in progress)

Första uppsättningen kod är skriven av Teo Elmfeldt, FUL 2019. Inpirerad av  https://github.com/scouternasetjanster/Google-Scoutnet-synk


## Manuell körning
Använd webbgränsnittet för att köra runAll() eller använd clasp (efter setup https://github.com/google/clasp/blob/master/docs/run.md)
clasp push
git commit -am "commit message"

clasp run 'runAll'


## Setup
Koden exekveras genom Google Script, där funktionen runAll() i filen toRun.gs körs några gånger (2) om dagen. Detta av kontot admin.styret@fysiksektionen.se. Allt annat ska skapas av användarspecifika konton, men vi gör ett undantag för saker som ska kunna köras utan att någon lägger sig i.


Workflow:
git clone från repot
Använd clasp (https://github.com/google/clasp) eller webbgränssnittet för att synka filerna

### Clasp setup
När du tröttnat på webbgränssnittet så kan du gå över till terminalverktyget clasp. Men du behöver inte!
Följ instruktionerna https://github.com/google/clasp.
Se till att inte råka committa creds.json eller andra hemliga filer.

## TODO
- KTH SSO
- Nämndkalendrar
- Funktionärsmailen flyttar in
- Samkör medlemsregistret med THS:s?
