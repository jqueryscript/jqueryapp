const fs = require("fs");
const trans = JSON.parse(fs.readFileSync("J:/网站/jqueryapp/data/new-tool-translations.json","utf-8"));

function clone(o) { return JSON.parse(JSON.stringify(o)); }

// ======= GERMAN TOOL 2: json-to-csv-converter =======
trans.de["json-to-csv-converter"] = {
  name: "JSON-zu-CSV-Konverter",
  summary: "JSON-Arrays in CSV oder TSV konvertieren. Verschachtelte Objekte mit Punktnotation abflachen, Trennzeichen waehlen und Kopfzeilen einfuegen.",
  whatIs: "Ein browserbasierter Konverter, der JSON-Arrays in CSV (kommaseparierte Werte) oder andere trennzeichenseparierte Formate umwandelt. Er erkennt automatisch alle Schluessel ueber Array-Elemente hinweg, flacht verschachtelte Objekte in Punktnotationsspalten ab und erzeugt saubere CSV-Ausgabe, die fuer den Tabellenkalkulationsimport oder Download bereit ist.",
  quickAnswer: "Fuegen Sie ein JSON-Array ein, waehlen Sie Ihr Trennzeichen und erhalten Sie CSV-Ausgabe. Verschachtelte Objekte werden mit Punktnotation abgeflacht (z.B. address.city). Downloadbereit fuer Excel oder Google Sheets.",
  howToUse: [
    "Fuegen Sie ein JSON-Array in den Eingabebereich ein. Wenn Sie ein einzelnes Objekt haben, wird es automatisch in ein Array eingefuegt.",
    "Waehlen Sie Ihr Trennzeichen: Komma fuer CSV, Tabulator fuer TSV, Semikolon fuer europaeisches Excel oder Pipe fuer Lesbarkeit.",
    "Schalten Sie Optionen um: Kopfzeile ein/aus, verschachtelte Objekte abflachen, Werte immer in Anfuehrungszeichen setzen.",
    "Kopieren Sie den CSV-Text oder speichern Sie ihn als .csv-Datei fuer den Import in Excel, Google Sheets oder Datenbank-Tools."
  ],
  useCases: [
    "Ein API-Antwort-JSON-Array fuer die Analyse in Excel oder Google Sheets in das CSV-Format exportieren.",
    "Einen MongoDB- oder Firestore-JSON-Export in eine flache CSV-Datei konvertieren, die nicht-technische Teammitglieder oeffnen koennen.",
    "Ein tief verschachteltes JSON-Konfigurationsobjekt fuer Dokumentation oder Vergleich in ein tabellarisches Format abflachen."
  ],
  examples: [
    { title: "API-Daten nach Excel exportieren", text: "Ein Marketinganalyst erhaelt JSON-Daten von einer Analyse-API. Der JSON-zu-CSV-Konverter flacht verschachtelte Objekte wie user.geo.city in Spalten wie user.geo.city ab und gibt eine CSV-Datei aus, die fuer Excel-Pivot-Tabellen bereit ist." },
    { title: "NoSQL-Export fuer Berichte konvertieren", text: "Ein Entwickler exportiert eine Firestore-Sammlung als JSON. Jedes Dokument hat verschachtelte Adress- und Einstellungsobjekte. Der Konverter flacht address.street, address.city und preferences.theme in separate Spalten fuer einen sauberen CSV-Bericht ab." }
  ],
  mistakes: [
    "Annehmen, dass alle JSON-Objekte in einem Array dieselben Schluessel haben - fehlende Schluessel erzeugen leere Zellen in dieser Zeile, was normalerweise in Ordnung ist, aber Verwirrung stiften kann, wenn das erste Objekt nicht repraesentativ ist.",
    "Komma als Trennzeichen verwenden, wenn die Daten Kommas enthalten - aktivieren Sie Werte immer in Anfuerungszeichen, um alle Felder in doppelte Anfuehrungszeichen zu setzen und falsch ausgerichtete Spalten zu vermeiden.",
    "Vergessen, auf verschachtelte Arrays zu prüfen - der Flattener behandelt verschachtelte Objekte, aber verschachtelte Arrays werden als JSON-Strings dargestellt und sind moeglicherweise nicht als CSV-Spalten geeignet."
  ],
  faq: [
    { question: "Warum hat das CSV manchmal andere Spalten als erwartet?", answer: "Der Konverter sammelt alle eindeutigen Schluessel aus jedem Objekt im Array. Wenn spaetere Objekte zusaetzliche Schluessel haben, die im ersten Objekt nicht vorhanden sind, erscheinen diese Schluessel trotzdem als Spalten. Dadurch gehen keine Daten verloren, aber die Spaltenreihenfolge kann vom ersten Objekt abweichen." },
    { question: "Kann ich mit diesem Tool CSV zurueck in JSON konvertieren?", answer: "Nein, dieses Tool konvertiert nur JSON nach CSV. Fuer die CSV-nach-JSON-Konvertierung benoetigen Sie ein anderes Tool. Die umgekehrte Konvertierung ist komplexer, da CSV keine Typinformationen enthaelt." },
    { question: "Was passiert mit verschachtelten Arrays im JSON?", answer: "Verschachtelte Arrays werden in ihre JSON-String-Repraesentation konvertiert, nicht abgeflacht. Zum Beispiel wird tags: [a,b] zum CSV-Wert [a,b]. Verschachtelte Objekte werden mit Punktnotation abgeflacht (address.city), aber Arrays bleiben als Zeichenketten erhalten." }
  ],
  limitations: [
    "Konvertiert nur JSON-Arrays in CSV - einzelne Objekte oder tief verschachtelte Strukturen ohne eindeutiges Array auf oberster Ebene koennen nicht direkt konvertiert werden.",
    "Verschachtelte Arrays werden als Strings dargestellt, nicht abgeflacht - CSV ist von Natur aus ein flaches Format, daher koennen tief verschachtelte JSON-Strukturen an Informationsgehalt verlieren.",
    "Sehr grosse JSON-Arrays (ueber 100.000 Zeilen) koennen aufgrund von Speicherbeschraenkungen im Browser langsam zu verarbeiten sein."
  ],
  verificationSteps: [
    "Fuegen Sie ein JSON-Beispielarray mit 3 Objekten ein und ueberpruefen Sie, ob die CSV-Ausgabe 4 Zeilen (1 Kopfzeile + 3 Daten) und alle Spalten aus allen Objekten enthaelt.",
    "Testen Sie mit einem verschachtelten Objekt wie address: city: NYC und bestaetigen Sie, dass die Ausgabe eine Spalte namens address.city mit dem Wert NYC enthaelt."
  ]
};
console.log("DE jtc done");

// ======= GERMAN TOOL 3: yaml-json-converter =======
trans.de["yaml-json-converter"] = {
  name: "YAML-JSON-Konverter",
  summary: "Bidirektional zwischen YAML und JSON konvertieren. Behandelt verschachtelte Strukturen, Arrays und Skalarwerte. Ideal fuer Konfigurationsdateien.",
  whatIs: "Ein bidirektionaler YAML-JSON-Konverter, der in Ihrem Browser laeuft. Konvertieren Sie YAML-Konfigurationsdateien (GitHub Actions-Workflows, Docker-Compose-Dateien, Front Matter) in JSON oder JSON in sauberes YAML mit konfigurierbarer Einrueckung. Der Konverter behandelt verschachtelte Objekte, Arrays, Zeichenketten, Zahlen, Booleans und Nullwerte mit korrekter Typerkennung.",
  quickAnswer: "YAML einfuegen, um es in JSON zu konvertieren, oder JSON einfuegen, um es in YAML zu konvertieren. Unterstuetzt verschachtelte Strukturen, Arrays und korrekte Typerkennung. Es werden keine Daten hochgeladen - die Konvertierung erfolgt lokal.",
  howToUse: [
    "Waehlen Sie die Konvertierungsrichtung: YAML nach JSON oder JSON nach YAML.",
    "Fuegen Sie Ihre Eingabe in den Textbereich ein.",
    "Passen Sie die Einrueckungsbreite bei Bedarf an.",
    "Kopieren Sie die konvertierte Ausgabe fuer die Verwendung in Ihrem Projekt."
  ],
  useCases: [
    "Einen GitHub Actions-Workflow von YAML nach JSON fuer die programmatische Bearbeitung oder Validierung konvertieren.",
    "Sauberes YAML aus einer JSON-API-Antwort fuer die Verwendung in einer Docker-Compose- oder Kubernetes-Konfiguration generieren.",
    "Die Struktur einer YAML-Datei schnell ueberpruefen, indem Sie sie zum einfacheren Lesen in eingeruecktes JSON konvertieren."
  ],
  examples: [
    { title: "GitHub Actions-Workflow in JSON konvertieren", text: "Ein Entwickler moechte einen GitHub Actions-Workflow programmatisch validieren. Er fuegt den YAML-Workflow in den Konverter ein und erhaelt saubere JSON-Ausgabe, die mit einem JSON-Schema validiert oder mit einem Skript verarbeitet werden kann." },
    { title: "YAML-Konfiguration aus API-Daten generieren", text: "Ein DevOps-Ingenieur ruft Konfigurationsdaten von einer API als JSON ab. Er konvertiert sie in YAML fuer die Verwendung in einer Kubernetes-Bereitstellungsdatei und behaelt so das menschenlesbare Format bei, das das Team fuer Konfigurationsdateien bevorzugt." }
  ],
  mistakes: [
    "Vergessen, dass YAML auf Leerzeichen achtet - inkonsistente Einrueckung in der Eingabe erzeugt unerwartete Ausgabe oder Konvertierungsfehler.",
    "Annehmen, dass YAML-Kommentare erhalten bleiben - Kommentare in YAML (Zeilen, die mit # beginnen) werden bei der Konvertierung entfernt, da JSON keine Kommentarsyntax hat.",
    "Tabulatorzeichen fuer die Einrueckung in YAML verwenden - YAML erfordert Leerzeichen, keine Tabulatoren, und die Verwendung von Tabulatoren fuehrt zu Konvertierungsfehlern."
  ],
  faq: [
    { question: "Werden YAML-Anker und -Aliase unterstuetzt?", answer: "Nein, dieser einfache Konverter unterstuetzt keine YAML-Anker (&) oder -Aliase (*). Diese fortgeschrittenen YAML-Funktionen erfordern einen vollstaendigen YAML-Parser, der die Dateigroesse erheblich vergroessern wuerde. Der Konverter behandelt die gaengigsten YAML-Strukturen, die in Konfigurationsdateien verwendet werden." },
    { question: "Was passiert mit YAML-Mehrzeilen-Strings?", answer: "YAML-gefaltete (>) und woertliche (|) Block-Skalare werden in einzeilige JSON-Strings konvertiert. Der Konverter bewahrt den Textinhalt, aber die mehrzeilige Formatierung geht verloren. Fuer eine originalgetreue Round-Trip-Konvertierung sollten Sie ein dediziertes YAML-Tool verwenden." },
    { question: "Bewahrt dieses Tool die Reihenfolge der YAML-Schluessel?", answer: "Ja, der Konverter bewahrt die Schluesselreihenfolge, wie sie in der YAML-Eingabe erscheint. Beim Konvertieren von JSON in YAML behalten die Schluessel ihre JSON-Reihenfolge bei." }
  ],
  limitations: [
    "Unterstuetzt keine YAML-Anker (&), Aliase (*) oder Tags - diese fortgeschrittenen Funktionen erfordern einen vollstaendigen YAML-Parser und werden nicht behandelt.",
    "YAML-Mehrzeilen-Block-Skalare werden in der JSON-Ausgabe auf einzeilige Strings verkuerzt, wodurch die urspruengliche Formatierung verloren geht.",
    "Sehr grosse YAML-Dateien (ueber 5 MB) koennen aufgrund des browserbasierten Konvertierungsansatzes langsam zu parsen sein."
  ],
  verificationSteps: [
    "Fuegen Sie eine einfache YAML-Datei mit verschachtelten Objekten und Arrays ein, konvertieren Sie sie in JSON und dann zurueck in YAML, um die Round-Trip-Treue zu ueberpruefen.",
    "Testen Sie mit speziellen YAML-Werten: true, false, null, 123 und 12.5, um die korrekte Typerkennung in der JSON-Ausgabe zu bestaetigen."
  ]
};
console.log("DE yjc done");

// ======= GERMAN TOOL 4: jsonpath-tester =======
trans.de["jsonpath-tester"] = {
  name: "JSONPath-Tester",
  summary: "JSONPath-Ausdruecke gegen JSON-Daten testen. Unterstuetzt Punktnotation, Platzhalter, Filter und Array-Indizes. Zeigt uebereinstimmende Ergebnisse an.",
  whatIs: "Ein browserbasierter JSONPath-Ausdrucks-Tester. Schreiben Sie JSONPath-Abfragen, um bestimmte Werte aus JSON-Daten zu extrahieren - wie XPath fuer JSON. Unterstuetzt Punktnotation, Klammernotation, Platzhalter, Array-Slicing und Filterausdruecke. Ergebnisse werden mit optionalen vollstaendigen Pfaden angezeigt, was das Debuggen von API-Antworten, das Testen von JSON-Transformationen oder das Erlernen der JSONPath-Syntax erleichtert.",
  quickAnswer: "Geben Sie einen JSONPath-Ausdruck wie $.store.books[*].title ein, um bestimmte Werte aus Ihrem JSON zu extrahieren. Unterstuetzt Platzhalter ($..price), Filter (?(@.price > 15)) und Array-Indizes. Ergebnisse werden mit Pfaden angezeigt.",
  howToUse: [
    "Fuegen Sie Ihre JSON-Daten in den Eingabebereich ein.",
    "Geben Sie einen JSONPath-Ausdruck ein, der mit $ beginnt, um die Daten abzufragen.",
    "Verwenden Sie die Beispielausdruecke als Referenz fuer gaengige Muster.",
    "Ueberpruefen Sie die uebereinstimmenden Ergebnisse und kopieren Sie sie fuer Ihre Anwendung."
  ],
  useCases: [
    "Alle Buchtitel aus einem verschachtelten Store-JSON mit $.store.books[*].title extrahieren.",
    "Alle Preise im gesamten Dokument mit dem rekursiven Abstiegsoperator $..price finden.",
    "Array-Elemente mit Bedingungen wie $.store.books[?(@.price > 15)] filtern, um teure Buecher zu finden."
  ],
  examples: [
    { title: "Werte aus einer API-Antwort extrahieren", text: "Ein Entwickler erhaelt eine grosse JSON-Antwort von einer REST-API. Anstatt JavaScript zu schreiben, um das Objekt zu durchlaufen, verwendet er den JSONPath-Tester mit $.data.users[*].email, um sofort alle E-Mail-Adressen zu extrahieren." },
    { title: "Daten nach Bedingung filtern", text: "Ein QA-Ingenieur muss alle Produkte mit Preisen ueber einem Schwellenwert finden. Er verwendet $.products[?(@.price > 100)] mit dem JSONPath-Tester, um das Array zu filtern und die Ergebnisse zu ueberpruefen, bevor er automatisierte Tests schreibt." }
  ],
  mistakes: [
    "Vergessen, dass JSONPath-Ausdruecke mit $ beginnen muessen - alle Pfade beginnen von der Wurzel des JSON-Dokuments.",
    "Einfache Anfuehrungszeichen anstelle von doppelten Anfuehrungszeichen in Filterausdruecken verwenden - JSONPath erfordert doppelte Anfuehrungszeichen fuer Zeichenkettenwerte in Filtern.",
    "Erwarten, dass der rekursive Abstiegsoperator .. genau wie XPath // funktioniert - JSONPath .. durchlaeuft Objekte und Arrays, kann aber in tief verschachtelten Strukturen mehr Werte finden als erwartet."
  ],
  faq: [
    { question: "Welche JSONPath-Features unterstuetzt dieser Tester?", answer: "Der Tester unterstuetzt Punktnotation ($.key), Klammernotation ($[key]), Platzhalter ($.*), Array-Platzhalter ($[*]), Array-Indizes ($[0]), Eigenschaftsfilter (?(@.key > value)) und den rekursiven Abstiegsoperator (..). Fortgeschrittene Features wie Skriptausdruecke und Array-Slicing ($[0:5]) werden moeglicherweise nur eingeschraenkt unterstuetzt." },
    { question: "Wie unterscheidet sich JSONPath von der JavaScript-Objekt-Punktnotation?", answer: "JSONPath ist eine Abfragesprache, die ein Array von Uebereinstimmungen zurueckgibt, auch fuer einzelne Werte. Die JavaScript-Punktnotation greift direkt auf eine Eigenschaft zu. JSONPath kann mit .. ueber mehrere Ebenen suchen und Arrays mit ?() filtern - Dinge, die in JavaScript Schleifen erfordern." },
    { question: "Kann ich JSONPath in meinem eigenen Code verwenden?", answer: "Ja. Es gibt JSONPath-Bibliotheken fuer JavaScript (jsonpath-plus), Python (jsonpath-ng), Java und viele andere Sprachen. Dieser Tester hilft Ihnen, Ausdruecke zu erstellen und zu ueberpruefen, bevor Sie sie im Code verwenden." }
  ],
  limitations: [
    "Der rekursive Abstiegsoperator (..) kann in tief verschachtelten Strukturen mehr Werte finden als erwartet - seien Sie bei Pfaden, bei denen es auf Praezision ankommt, moeglichst spezifisch.",
    "Skriptausdruecke und erweiterte Filterfunktionen werden nicht unterstuetzt - nur Eigenschaftsvergleichsfilter (?(@.prop > value)) sind verfuegbar.",
    "Sehr grosse JSON-Dateien (ueber 10 MB) koennen zu langsamer Auswertung fuehren, da jeder Pfadausdruck gegen die gesamte Struktur ausgewertet wird."
  ],
  verificationSteps: [
    "Geben Sie das Standard-JSON und den Ausdruck $.store.books[*].title ein und bestaetigen Sie, dass das Ergebnis zwei Buchtitel anzeigt.",
    "Testen Sie den rekursiven Abstieg mit $..price und ueberpruefen Sie, ob alle Preiswerte im Dokument unabhaengig von der Verschachtelungstiefe zurueckgegeben werden."
  ]
};
console.log("DE jpt done");

// ======= GERMAN TOOL 5: json-schema-generator-validator =======
trans.de["json-schema-generator-validator"] = {
  name: "JSON-Schema-Generator und -Validator",
  summary: "JSON-Schema aus Beispieldaten generieren oder JSON gegen ein Schema validieren. Unterstuetzt mehrere Drafts und leitet Typen automatisch ab.",
  whatIs: "Ein zweckgerichtetes Browser-Tool fuer JSON-Schema-Workflows. Im Generierungsmodus fuegen Sie Beispiel-JSON ein und erhalten ein vollstaendiges JSON-Schema mit abgeleiteten Typen, erforderlichen Feldern und Beispielen. Im Validierungsmodus fuegen Sie JSON und ein Schema ein, um die Uebereinstimmung mit Draft 04, 07 oder 2020-12 zu pruefen. Der Schema-Generator erzeugt saubere, lesbare Schemas, die Sie weiter verfeinern koennen.",
  quickAnswer: "Ein JSON-Schema aus Beispieldaten generieren (Typen ableiten, erforderliche Felder markieren) oder JSON gegen ein vorhandenes Schema validieren. Unterstuetzt Draft 04/07/2020-12. Alle Verarbeitung erfolgt lokal.",
  howToUse: [
    "Waehlen Sie den Generierungsmodus, um ein Schema aus Beispiel-JSON zu erstellen, oder den Validierungsmodus, um Daten gegen ein Schema zu pruefen.",
    "Fuegen Sie Ihre JSON-Daten (und das Schema bei Validierung) ein.",
    "Waehlen Sie die benoetigte JSON-Schema-Draft-Version aus.",
    "Kopieren Sie das generierte Schema oder ueberpruefen Sie Validierungsfehler, um Ihre Daten zu korrigieren."
  ],
  useCases: [
    "Ein JSON-Schema aus einer API-Antwort generieren, um das erwartete Format fuer Ihr Team zu dokumentieren.",
    "Eine Konfigurationsdatei vor der Bereitstellung gegen ihr Schema validieren, um fehlende erforderliche Felder oder falsche Typen zu erkennen.",
    "Schnell ein Schema aus Beispieldaten erstellen und als Ausgangspunkt fuer die API-Dokumentation verfeinern."
  ],
  examples: [
    { title: "API-Antwortformat dokumentieren", text: "Ein Backend-Entwickler moechte das Antwortformat eines neuen Endpunkts dokumentieren. Er fuegt eine Beispiel-JSON-Antwort in den Schema-Generator ein und erhaelt ein vollstaendiges Draft-07-Schema mit allen Eigenschaften, Typen und Beispielen. Das Schema wird als API-Dokumentation an das Frontend-Team weitergegeben." },
    { title: "Konfiguration vor der Bereitstellung validieren", text: "Eine CI-Pipeline prueft Konfigurationsdateien gegen ein JSON-Schema. Vor dem Commit fuegt ein Entwickler das Konfigurations-JSON und das Schema in den Validator ein und stellt fest, dass ein erforderliches Feld region fehlt. Er behebt es, bevor die CI-Prüfung es erfasst." }
  ],
  mistakes: [
    "Annehmen, dass das generierte Schema ein vollstaendiger API-Vertrag ist - der Generator leitet Typen aus einem einzelnen Beispiel ab, daher koennen optionale Felder fehlen oder Typen fuer reale Daten zu eng gefasst sein.",
    "Vergessen, die richtige JSON-Schema-Draft-Version auszuwaehlen - verschiedene Tools und Plattformen unterstuetzen unterschiedliche Drafts, und die Verwendung des falschen Drafts kann zu Validierungsabweichungen fuehren.",
    "Erwarten, dass der Validator alle semantischen Fehler erkennt - JSON-Schema validiert Struktur und Typen, aber keine Geschaeftslogik (z.B. kann er pruefen, ob ein Feld eine Zahl ist, aber nicht, ob die Zahl innerhalb eines gueltigen Bereichs liegt, es sei denn, Sie fuegen minimum/maximum hinzu)."
  ],
  faq: [
    { question: "Welche JSON-Schema-Draft-Version sollte ich verwenden?", answer: "Draft 07 wird von den meisten Tools und Sprachen unterstuetzt. Draft 2020-12 ist die neueste, hat aber eine geringere universelle Tool-Unterstuetzung. Draft 04 ist aelter und wird von einigen Legacy-Systemen verwendet. Fuer neue Projekte ist Draft 07 ein sicherer Standard. Verwenden Sie Draft 2020-12, wenn Ihre Tools es unterstuetzen." },
    { question: "Warum markiert das generierte Schema alle Felder als erforderlich?", answer: "Der optionale Schalter steuert dieses Verhalten. Wenn aktiviert, werden alle Eigenschaften in den Beispieldaten als erforderlich im Schema markiert. Dies ist nuetzlich, wenn Ihr Beispiel einen vollstaendigen Datensatz darstellt. Deaktivieren Sie es, wenn einige Felder optional sind und Ihr Beispiel sie zufaellig enthaelt." },
    { question: "Kann der Validator verschachtelte Objekte und Arrays pruefen?", answer: "Ja. Der Validator prueft rekursiv verschachtelte Objekte gegen verschachtelte Schema-Eigenschaften und validiert Array-Elemente gegen die items-Definition des Schemas. Er meldet Fehler mit vollstaendigen JSON-Pfaden wie $.address.city, damit Sie genau finden, wo das Problem liegt." }
  ],
  limitations: [
    "Der Schema-Generator leitet Typen aus einem einzigen Beispiel ab - er kann keine optionalen Felder, Union-Typen oder Enum-Einschraenkungen erkennen. Ueberpruefen und verfeinern Sie das generierte Schema manuell.",
    "Validierungsfehlermeldungen sind einfach - sie zeigen den Pfad und den erwarteten Typ, schlagen aber keine Korrekturen vor oder bieten keinen detaillierten Kontext.",
    "Der Validator unterstuetzt nicht alle JSON-Schema-Schluesselwoerter - fortgeschrittene Funktionen wie $ref, allOf/anyOf/oneOf und benutzerdefinierte Formate sind nicht vollstaendig implementiert."
  ],
  verificationSteps: [
    "Fuegen Sie ein einfaches JSON-Objekt mit String-, Zahlen- und Boolean-Feldern ein. Generieren Sie ein Schema und ueberpruefen Sie, ob alle Typen in der Ausgabe korrekt abgeleitet wurden.",
    "Validieren Sie ein bekanntermassen gueltiges JSON gegen sein Schema und bestaetigen Sie, dass das Tool keine Fehler meldet. Fuehren Sie dann einen Typenkonflikt ein und ueberpruefen Sie, ob er erkannt wird."
  ]
};
console.log("DE jsg done");

fs.writeFileSync("J:/网站/jqueryapp/data/new-tool-translations.json", JSON.stringify(trans, null, 2));
console.log("All 5 German tools written to file");