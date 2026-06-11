const fs = require("fs");
const trans = JSON.parse(fs.readFileSync("data/new-tool-translations.json", "utf-8"));

// Add 4 remaining German tools
trans.de["json-to-csv-converter"] = {
  name: "JSON-zu-CSV-Konverter",
  summary: "JSON-Arrays in CSV oder TSV konvertieren. Verschachtelte Objekte mit Punktnotation abflachen, Trennzeichen wahlen und Kopfzeilen einfugen.",
  whatIs: "Ein browserbasierter Konverter, der JSON-Arrays in CSV (kommaseparierte Werte) oder andere trennzeichenseparierte Formate umwandelt. Er erkennt automatisch alle Schlussel uber Array-Elemente hinweg, flacht verschachtelte Objekte in Punktnotationsspalten ab und erzeugt saubere CSV-Ausgabe, die fur den Tabellenkalkulationsimport oder Download bereit ist.",
  quickAnswer: "Fugen Sie ein JSON-Array ein, wahlen Sie Ihr Trennzeichen und erhalten Sie CSV-Ausgabe. Verschachtelte Objekte werden mit Punktnotation abgeflacht (z.B. address.city). Downloadbereit fur Excel oder Google Sheets.",
  howToUse: [
    "Fugen Sie ein JSON-Array in den Eingabebereich ein. Wenn Sie ein einzelnes Objekt haben, wird es automatisch in ein Array eingefugt.",
    "Wahlen Sie Ihr Trennzeichen: Komma fur CSV, Tabulator fur TSV, Semikolon fur europaisches Excel oder Pipe fur Lesbarkeit.",
    "Schalten Sie Optionen um: Kopfzeile ein/aus, verschachtelte Objekte abflachen, Werte immer in Anfuhrungszeichen setzen.",
    "Kopieren Sie den CSV-Text oder speichern Sie ihn als .csv-Datei fur den Import in Excel, Google Sheets oder Datenbank-Tools."
  ],
  useCases: [
    "Ein API-Antwort-JSON-Array fur die Analyse in Excel oder Google Sheets in das CSV-Format exportieren.",
    "Einen MongoDB- oder Firestore-JSON-Export in eine flache CSV-Datei konvertieren, die nicht-technische Teammitglieder offnen konnen.",
    "Ein tief verschachteltes JSON-Konfigurationsobjekt fur Dokumentation oder Vergleich in ein tabellarisches Format abflachen."
  ],
  examples: [
    { title: "API-Daten nach Excel exportieren", text: "Ein Marketinganalyst erhalt JSON-Daten von einer Analyse-API. Der JSON-zu-CSV-Konverter flacht verschachtelte Objekte wie user.geo.city in Spalten wie user.geo.city ab und gibt eine CSV-Datei aus, die fur Excel-Pivot-Tabellen bereit ist." },
    { title: "NoSQL-Export fur Berichte konvertieren", text: "Ein Entwickler exportiert eine Firestore-Sammlung als JSON. Jedes Dokument hat verschachtelte Adress- und Einstellungsobjekte. Der Konverter flacht address.street, address.city und preferences.theme in separate Spalten fur einen sauberen CSV-Bericht ab." }
  ],
  mistakes: [
    "Annehmen, dass alle JSON-Objekte in einem Array dieselben Schlussel haben - fehlende Schlussel erzeugen leere Zellen in dieser Zeile, was normalerweise in Ordnung ist, aber Verwirrung stiften kann, wenn das erste Objekt nicht reprasentativ ist.",
    "Komma als Trennzeichen verwenden, wenn die Daten Kommas enthalten - aktivieren Sie Werte immer in Anfuhrungszeichen, um alle Felder in doppelte Anfuhrungszeichen zu setzen und falsch ausgerichtete Spalten zu vermeiden.",
    "Vergessen, auf verschachtelte Arrays zu prufen - der Flattener behandelt verschachtelte Objekte, aber verschachtelte Arrays werden als JSON-Strings dargestellt und sind moglicherweise nicht als CSV-Spalten geeignet."
  ],
  faq: [
    { question: "Warum hat das CSV manchmal andere Spalten als erwartet?", answer: "Der Konverter sammelt alle eindeutigen Schlussel aus jedem Objekt im Array. Wenn spatere Objekte zusatzliche Schlussel haben, die im ersten Objekt nicht vorhanden sind, erscheinen diese Schlussel trotzdem als Spalten. Dadurch gehen keine Daten verloren, aber die Spaltenreihenfolge kann vom ersten Objekt abweichen." },
    { question: "Kann ich mit diesem Tool CSV zuruck in JSON konvertieren?", answer: "Nein, dieses Tool konvertiert nur JSON nach CSV. Fur die CSV-nach-JSON-Konvertierung benotigen Sie ein anderes Tool. Die umgekehrte Konvertierung ist komplexer, da CSV keine Typinformationen enthalt." },
    { question: "Was passiert mit verschachtelten Arrays im JSON?", answer: "Verschachtelte Arrays werden in ihre JSON-String-Reprasentation konvertiert, nicht abgeflacht. Zum Beispiel wird tags: [a,b] zum CSV-Wert [a,b]. Verschachtelte Objekte werden mit Punktnotation abgeflacht (address.city), aber Arrays bleiben als Zeichenketten erhalten." }
  ],
  limitations: [
    "Konvertiert nur JSON-Arrays in CSV - einzelne Objekte oder tief verschachtelte Strukturen ohne eindeutiges Array auf oberster Ebene konnen nicht direkt konvertiert werden.",
    "Verschachtelte Arrays werden als Strings dargestellt, nicht abgeflacht - CSV ist von Natur aus ein flaches Format, daher konnen tief verschachtelte JSON-Strukturen an Informationsgehalt verlieren.",
    "Sehr grosse JSON-Arrays (uber 100.000 Zeilen) konnen aufgrund von Speicherbeschrankungen im Browser langsam zu verarbeiten sein."
  ],
  verificationSteps: [
    "Fugen Sie ein JSON-Beispielarray mit 3 Objekten ein und uberprufen Sie, ob die CSV-Ausgabe 4 Zeilen (1 Kopfzeile + 3 Daten) und alle Spalten aus allen Objekten enthalt.",
    "Testen Sie mit einem verschachtelten Objekt wie address: city: NYC und bestatigen Sie, dass die Ausgabe eine Spalte namens address.city mit dem Wert NYC enthalt."
  ]
};
console.log("DE jtc added");
fs.writeFileSync("data/new-tool-translations.json", JSON.stringify(trans, null, 2));
