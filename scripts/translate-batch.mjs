import fs from 'fs';

const locales = JSON.parse(fs.readFileSync('data/locales.json','utf8'));
const batch = JSON.parse(fs.readFileSync('data/batch-en.json','utf8'));

// Map tool IDs to English source
const src = {};
batch.forEach(t => { src[t.id] = t; });

// ─── GERMAN ───────────────────────────────────────────

const de = {};

de['markdown-preview-editor'] = {
  name: 'Markdown Vorschau-Editor',
  summary: 'Geteilter Bildschirm-Markdown-Editor mit Live-GitHub-Flavored-Markdown-Vorschau. Unterstuetzt Ueberschriften, fett/kursiv, Links, Codebloecke, Tabellen und Aufgabenlisten.',
  whatIs: 'Der Markdown Vorschau-Editor ist eine geteilte Schreibumgebung, bei der der linke Bereich ein Texteditor und der rechte Bereich das Markdown in Echtzeit als HTML rendert. Er unterstuetzt GitHub-Flavored Markdown (GFM), den Standard, der auf GitHub, GitLab und den meisten Entwicklerplattformen verwendet wird.',
  quickAnswer: 'Schreiben Sie Markdown im linken Bereich und sehen Sie das gerenderte HTML sofort im rechten Bereich aktualisiert. Unterstuetzung fuer GFM-Ueberschriften, fett, kursiv, Codebloecke mit Syntaxhervorhebung, Tabellen, Aufgabenlisten, Zitate und Links.',
  howToUse: [
    'Geben Sie Markdown in den Editorbereich auf der linken Seite ein oder fuegen Sie es dort ein. Der Vorschaubereich auf der rechten Seite aktualisiert sich automatisch.',
    'Verwenden Sie die standardmaessige Markdown-Syntax: # fuer Ueberschriften, **fett**, *kursiv*, `code` fuer Inline-Code und dreifache Backticks fuer Codebloecke.',
    'Erstellen Sie Tabellen mit Strichen und senkrechten Strichen (| Spalte1 | Spalte2 |) sowie Aufgabenlisten mit der Syntax - [ ] und - [x].',
    'Kopieren Sie das gerenderte HTML aus dem Vorschaubereich oder kopieren Sie den Markdown-Quelltext zur Verwendung in anderen Werkzeugen.'
  ],
  useCases: [
    'Schreiben und Vorschauen einer GitHub-README.md-Datei vor dem Commit zur Ueberpruefung der korrekten GFM-Darstellung.',
    'Dokumentation in Markdown verfassen und sofort sehen, wie Ueberschriften, Codebloecke und Tabellen nach Veroeffentlichung aussehen.',
    'Formatierte E-Mail-Inhalte oder CMS-Eintraege erstellen, indem Sie in Markdown schreiben und das gerenderte HTML kopieren.'
  ],
  examples: [
    { title: 'README.md-Erstellungs-Workflow', text: 'Ein Entwickler schreibt eine README fuer ein neues Open-Source-Projekt. Er gibt das Markdown ein und beobachtet die Echtzeit-Darstellung von Ueberschriften, Codebloecken und Badge-Bildern.' },
    { title: 'Zusammenarbeit im Dokumentationsteam', text: 'Ein technischer Redakteur erstellt API-Dokumentationen. Die Live-Vorschau bestaetigt korrekte Listen, Syntaxhervorhebung und Tabellenausrichtung.' }
  ],
  mistakes: [
    'Nicht unterstuetztes HTML innerhalb von Markdown-Bloecken verwenden. Die Mischung von HTML mit Markdown-Syntax kann zu unerwarteten Darstellungen fuehren.',
    'Leerzeilen vor Ueberschriften und Listen vergessen. Markdown erfordert in vielen Faellen Leerzeilen vor Blockelementen.',
    'Tabulatoren anstelle von Leerzeichen fuer Codeblock-Einzuege verwenden. Eingerueckte Codebloecke erfordern vier Leerzeichen.'
  ],
  faq: [
    { question: 'Unterstuetzt dieser Editor Tabellen mit Ausrichtung?', answer: 'Ja. GFM-Tabellen unterstuetzen linksbuendige (:---), rechtsbuendige (---:) und zentrierte (:---:) Spalten.' },
    { question: 'Kann ich das gerenderte HTML direkt kopieren?', answer: 'Ja. Der Vorschaubereich zeigt das vollstaendig gerenderte HTML zur Auswahl und zum Kopieren.' },
    { question: 'Unterstuetzt es Syntaxhervorhebung in Codebloecken?', answer: 'Ja. Codebloecke mit Sprachkennzeichen werden mit Syntaxhervorhebung dargestellt.' }
  ],
  limitations: [
    'Dieses Tool stimmt moeglicherweise nicht perfekt mit jeder Markdown-Engine ueberein.',
    'Sehr grosse Dokumente (ueber 100.000 Zeichen) koennen zu Leistungseinbussen fuehren.',
    'Eingebettete Bilder erfordern oeffentlich zugaengliche URLs.'
  ],
  verificationSteps: [
    'Geben Sie # Ueberschrift 1, **fett**, *kursiv* und `code` ein. Ueberpruefen Sie die korrekte Darstellung.',
    'Erstellen Sie eine Tabelle mit Ausrichtung und einen Codeblock mit Syntaxhervorhebung.'
  ]
};

de['qr-code-generator'] = {
  name: 'QR-Code-Generator',
  summary: 'Generieren Sie QR-Codes als SVG fuer URLs, Text, E-Mail, Telefon und WLAN. Anpassbare Farben und Groesse mit SVG-Code-Ausgabe.',
  whatIs: 'Der QR-Code-Generator erstellt QR-Codes als skalierbare Vektorgrafiken (SVG) vollstaendig im Browser. Er produziert sauberen SVG-Code, der unendlich skaliert und direkt in HTML-Seiten eingebettet werden kann.',
  quickAnswer: 'Generieren Sie QR-Codes als SVG fuer URLs, Text, E-Mail, Telefonnummern und WLAN-Zugangsdaten. Passen Sie Farben und Groesse an. Die gesamte Verarbeitung erfolgt lokal und ist kostenlos.',
  howToUse: [
    'Waehlen Sie den Inhaltstyp (URL, Text, E-Mail, Telefon oder WLAN) aus dem Dropdown-Menue.',
    'Fuellen Sie die Felder fuer den ausgewaehlten Typ aus. Bei WLAN geben Sie SSID, Passwort und Verschluesselungstyp an.',
    'Passen Sie die QR-Code-Farben (Vordergrund und Hintergrund) und die Groesse nach Bedarf an.',
    'Kopieren Sie den QR-Code als SVG oder den rohen SVG-Code fuer HTML-Seiten.'
  ],
  useCases: [
    'Generieren Sie QR-Codes fuer Geschaefts-URLs zur Verwendung in Druckmaterialien oder E-Mail-Signaturen.',
    'Erstellen Sie WLAN-QR-Codes, die Gaeste scannen koennen, um sich ohne Passworteingabe zu verbinden.',
    'Betten Sie E-Mail-QR-Codes in Flyer ein, damit Besucher durch Scannen Nachrichten senden koennen.'
  ],
  examples: [
    { title: 'Restaurant-Speisekarten-QR-Code', text: 'Ein Restaurant platziert QR-Codes auf Tischen, die auf eine digitale Speisekarte verweisen.' },
    { title: 'Konferenz-WLAN-Ausweis', text: 'Ein Veranstalter druckt WLAN-QR-Codes auf Konferenzausweise fuer sofortige Netzwerkverbindung.' }
  ],
  mistakes: [
    'Den QR-Code zu klein fuer zuverlaessiges Scannen machen. Mindestens 200x200 Pixel werden empfohlen.',
    'Farbkombinationen mit geringem Kontrast verwenden, die QR-Codes unleserlich machen.',
    'Vergessen, den QR-Code vor dem Druck mit mehreren Geraeten zu testen.'
  ],
  faq: [
    { question: 'Ist die QR-Code-Generierung wirklich kostenlos und serverlos?', answer: 'Ja. Die gesamte Generierung erfolgt lokal im Browser. Es werden keine Daten an einen Server gesendet.' },
    { question: 'Kann ich die Farben des QR-Codes anpassen?', answer: 'Ja. Sie koennen Vordergrund- und Hintergrundfarbe mit Farbwaehlern oder Hex-Werten einstellen.' },
    { question: 'Warum SVG und nicht PNG?', answer: 'SVG ist ein Vektorformat, das unendlich skaliert ohne Qualitaetsverlust, ideal fuer Druck und Web.' },
    { question: 'Funktioniert der WLAN-QR-Code mit allen Telefonen?', answer: 'Die meisten modernen Smartphones mit iOS (11+) und Android (10+) scannen WLAN-QR-Codes nativ.' }
  ],
  limitations: [
    'Das Tool generiert QR-Codes bis Version 7 (45x45 Module), etwa 150 alphanumerische Zeichen maximal.',
    'Nur SVG-Ausgabe wird unterstuetzt. Andere Formate erfordern externe Konvertierung.',
    'Dichte QR-Codes koennen bei kleinen Groessen schwerer zu scannen sein.'
  ],
  verificationSteps: [
    'Generieren Sie einen QR-Code fuer eine kurze URL und scannen Sie ihn mit einem Smartphone.',
    'Generieren Sie einen WLAN-QR-Code mit Test-Zugangsdaten und ueberpruefen Sie die Funktion.'
  ]
};

de['image-compressor-converter'] = {
  name: 'Bildkompressor und -konverter',
  summary: 'Komprimieren und konvertieren Sie Bilder lokal mit der Canvas-API. Groessenanpassung, JPEG/PNG/WebP-Ausgabe und Qualitaetsregelung. Kein Upload.',
  whatIs: 'Bildkompressor und -konverter ist ein browserbasiertes Tool, das die Canvas-API zur Bildkomprimierung, -skalierung und -konvertierung nutzt. Es unterstuetzt drei Ausgabeformate (JPEG, PNG, WebP).',
  quickAnswer: 'Komprimieren, skalieren und konvertieren Sie Bilder lokal mit der Canvas-API. Waehlen Sie JPEG-, PNG- oder WebP-Ausgabe und passen Sie die Qualitaet an. Kein Datei-Upload erforderlich.',
  howToUse: [
    'Waehlen Sie eine Bilddatei von Ihrem Geraet aus. Das Tool zeigt das Original und seine Groesse an.',
    'Waehlen Sie das Ausgabeformat: JPEG fuer Fotos, PNG fuer Transparenz, WebP fuer moderne Webnutzung.',
    'Passen Sie die Qualitaet (1-100) und optional die Zielabmessungen an.',
    'Laden Sie das verarbeitete Bild herunter. Ein Groessenvergleich wird angezeigt.'
  ],
  useCases: [
    'Fotogroessen fuer das Web durch Konvertierung in WebP oder JPEG bei 80% Qualitaet reduzieren.',
    'PNG-Screenshots in JPEG fuer Systeme konvertieren, die PNG nicht akzeptieren.',
    'Produktbilder vor dem Hochladen auf eine einheitliche Breite skalieren.'
  ],
  examples: [
    { title: 'Website-Leistungsoptimierung', text: 'Ein Webentwickler konvertiert grosse JPEG-Fotos (2MB) in WebP bei 80% Qualitaet und reduziert sie drastisch.' },
    { title: 'E-Mail-Anhangsgroessenreduzierung', text: 'Ein Benutzer konvertiert einen 15MB PNG-Screenshot in JPEG bei 60% Qualitaet fuer den E-Mail-Versand.' }
  ],
  mistakes: [
    'JPEG fuer Bilder mit Text oder scharfen Kanten verwenden. JPEG-Artefakte sind dort sichtbar.',
    'Die Qualitaet beim ersten Versuch zu niedrig einstellen. Bei 80% beginnen.',
    'Bilder vergroessern. Das Tool kann nur verkleinern. Vergroesserung verursacht Pixelbildung.'
  ],
  faq: [
    { question: 'Werden meine Bilder auf einen Server hochgeladen?', answer: 'Nein. Die gesamte Verarbeitung erfolgt im Browser mit der Canvas-API. Ihre Bilder verlassen nie Ihren Computer.' },
    { question: 'Welche maximale Dateigroesse kann ich verarbeiten?', answer: 'Kein explizites Limit. Sehr grosse Bilder (ueber 5000 Pixel) koennen Leistungsprobleme verursachen.' },
    { question: 'Welches Format fuer das Web?', answer: 'WebP bietet das beste Komprimierungs-Verhaeltnis, oft 25-35% kleiner als JPEG.' },
    { question: 'Bewahrt dieses Tool EXIF-Daten?', answer: 'Nein. Die Canvas-API entfernt EXIF-Metadaten whrend der Verarbeitung.' }
  ],
  limitations: [
    'Die Canvas-API unterstuetzt keine animierten Bilder (GIF, APNG). Nur der erste Frame wird verarbeitet.',
    'CMYK-Farbprofile werden von Canvas nicht unterstuetzt.',
    'Dateigroessenschaetzungen sind approximativ und variieren je nach Bildkomplexitaet.'
  ],
  verificationSteps: [
    'Konvertieren Sie ein JPEG-Foto in WebP bei 80% Qualitaet und ueberpruefen Sie die Groessenreduktion.',
    'Verarbeiten Sie ein PNG mit Transparenz und stellen Sie sicher, dass die Transparenz erhalten bleibt.'
  ]
};

de['svg-optimizer'] = {
  name: 'SVG-Optimierer',
  summary: 'Optimieren Sie SVG-Dateien durch Entfernen von Kommentaren, Metadaten und Leerraum. Zeigt Groessenvergleich vorher/nachher. Lokale Verarbeitung.',
  whatIs: 'Der SVG-Optimierer reduziert SVG-Dateigroessen durch Entfernen von Elementen, die die visuelle Ausgabe nicht beeinflussen. SVGs aus Designtools enthalten oft Metadaten und redundante Formatierung.',
  quickAnswer: 'Entfernen Sie Kommentare, Metadaten, Editor-Daten und ueberfluessigen Leerraum aus SVG-Dateien. Groessenvergleich vorher/nachher. Alles lokal.',
  howToUse: [
    'Fuegen Sie SVG-Markup ein oder laden Sie eine SVG-Datei hoch.',
    'Das Tool verarbeitet das SVG automatisch und zeigt die optimierte Ausgabe an.',
    'Ueberpruefen Sie den Groessenvergleich und passen Sie Optimierungen an.',
    'Kopieren Sie den optimierten Code oder laden Sie die .svg-Datei herunter.'
  ],
  useCases: [
    'SVG-Dateigroessen vor dem Einbetten in Webseiten reduzieren.',
    'SVGs aus Designtools vor dem Commit in ein Repository bereinigen.',
    'SVGs fuer CSS-Daten-URIs vorbereiten, wo kleinere Groessen das Stylesheet-Gewicht reduzieren.'
  ],
  examples: [
    { title: 'Figma-Export-Bereinigung', text: 'Ein Designer exportiert Icons aus Figma. Die Optimierung reduziert die Groesse von 4KB auf durchschnittlich 1,2KB.' },
    { title: 'Inline-SVG-Leistungssteigerung', text: 'Ein Hero-SVG wird von 28KB auf 9KB optimiert durch Entfernung von Illustrator-Metadaten.' }
  ],
  mistakes: [
    'Annehmen, dass kleinere SVGs immer identisch aussehen. Vor dem Deployment immer Vorschau anzeigen.',
    'Das viewBox-Attribut entfernen. Es ist kritisch fuer die SVG-Skalierung.',
    'Wiederverwendbare Symboldefinitionen uebersehen. Der Optimierer erhaelt sie, aber ID-Entfernung kann Referenzen brechen.'
  ],
  faq: [
    { question: 'Was entfernt der Optimierer?', answer: 'XML-Kommentare, Doctype-Deklarationen, Editorspezifische Metadaten, leere Gruppen und ueberfluessigen Leerraum.' },
    { question: 'Minimiert er Pfaddaten?', answer: 'Nein, dieses Tool konzentriert sich auf strukturelle Bereinigung.' },
    { question: 'Beschaedigt er inline CSS?', answer: 'Nein. Inline-CSS, <style>-Blogs und Klassenstyling bleiben erhalten.' }
  ],
  limitations: [
    'Nur strukturelle Bereinigung, keine Pfadoptimierung.',
    'SVGs mit eingebetteten Rasterbildern zeigen keine signifikante Groessenreduktion.',
    'Einige SVG-Dateien verwenden nicht standardmaessige Namespace-Praefixe.'
  ],
  verificationSteps: [
    'Laden Sie ein SVG aus einem Designtool hoch und ueberpruefen Sie, ob Metadaten entfernt wurden.',
    'Oeffnen Sie Original und Optimiertes in einem Browser und vergleichen Sie die Darstellung.'
  ]
};

de['svg-to-css-data-uri-converter'] = {
  name: 'SVG-zu-CSS-Daten-URI-Konverter',
  summary: 'Konvertieren Sie SVG-Markup in CSS-Daten-URIs. URL-kodierte und Base64-Optionen mit Live-Vorschau.',
  whatIs: 'Der Konverter wandelt rohes SVG-Markup in Daten-URIs fuer CSS und HTML um. URL-Kodierung produziert kompaktere Ausgabe, Base64 ist fuer problematische Zeichen geeignet.',
  quickAnswer: 'SVG-Markup in CSS-kompatible Daten-URIs umwandeln. URL-kodiert oder Base64. background-image, mask, img src oder rohe Daten-URI.',
  howToUse: [
    'Fuegen Sie SVG-Markup in den Eingabebereich ein.',
    'Waehlen Sie URL-Kodierung (empfohlen) oder Base64.',
    'Waehlen Sie das Ausgabeformat: CSS background-image, mask, img src oder rohe Daten-URI.',
    'Kopieren Sie den generierten Code in Ihr Stylesheet oder HTML.'
  ],
  useCases: [
    'SVG-Icons direkt in CSS background-image einbetten, um HTTP-Anfragen zu reduzieren.',
    'SVG-Daten-URIs in CSS mask-image fuer benutzerdefinierte Masken verwenden.',
    'Kleine SVGs in HTML img-Tags fuer eigenstaendige E-Mail-Vorlagen einbetten.'
  ],
  examples: [
    { title: 'CSS-Sprite-freie Icons', text: 'Ein Entwickler bettet 10 SVG-Icons als Daten-URIs direkt in das Stylesheet ein und spart HTTP-Anfragen.' },
    { title: 'Eigenstaendige E-Mail-Signatur', text: 'Ein Designer konvertiert ein Logo-SVG in eine Base64-Daten-URI fuer eine vollstaendig eigenstaendige Signatur.' }
  ],
  mistakes: [
    'Base64 unnoetig verwenden. URL-Kodierung ist meist kompakter.',
    'Leerraum vor der Kodierung nicht entfernen. Das vergroessert die URI.',
    'Daten-URIs fuer grosse SVGs verwenden. Ueber 2-4KB die CSS-Datei unnietig aufblaehen.'
  ],
  faq: [
    { question: 'Welche Kodierung ist besser?', answer: 'URL-Kodierung. Sie ist etwa 10-20% kompakter und lesbar.' },
    { question: 'Funktioniert das in allen Browsern?', answer: 'Ja, in allen modernen Browsern (Chrome, Firefox, Safari, Edge).' },
    { question: 'Daten-URIs in inline-Style-Attributen?', answer: 'Ja, aber auf Anfuerungszeichen achten.' },
    { question: 'Maximale Groesse?', answer: 'Aus Leistungsgruenden unter 2KB halten.' }
  ],
  limitations: [
    'Daten-URIs ueber 4KB aus Leistungsgruenden vermeiden.',
    'Keine SVG-Syntaxvalidierung. Ungueltiges SVG produziert ungueltige Daten-URIs.',
    'Browserunterschiede bei mask-image und clip-path mit Daten-URIs.'
  ],
  verificationSteps: [
    'Einen SVG-Kreis konvertieren und die Darstellung ueberpruefen.',
    'Base64- und URL-Kodierung vergleichen. Die Darstellung sollte identisch sein.'
  ]
};

// ─── FRENCH ────────────────────────────────────────────

const fr = {};

fr['markdown-preview-editor'] = {
  name: 'Editeur de Previsualisation Markdown',
  summary: 'Editeur Markdown a ecran partage avec apercu en direct du Markdown GitHub-Flavored. Prend en charge les titres, gras/italique, liens, blocs de code, tableaux et listes de taches.',
  whatIs: "L'Editeur de Previsualisation Markdown est un environnement d'ecriture a ecran partage ou le panneau de gauche est un editeur de texte et le panneau de droite rend le Markdown en HTML en temps reel. Il prend en charge le GitHub-Flavored Markdown (GFM).",
  quickAnswer: "Ecrivez du Markdown dans le panneau de gauche et voyez le HTML rendu se mettre a jour instantanement dans le panneau de droite. Prend en charge les titres GFM, le gras, l'italique, les blocs de code, les tableaux, les listes de taches, les citations et les liens.",
  howToUse: [
    'Saisissez ou collez du Markdown dans le panneau de l editeur a gauche. Le panneau d apercu a droite se met a jour automatiquement.',
    'Utilisez la syntaxe Markdown standard : # pour les titres, **gras**, *italique*, `code` pour le code en ligne.',
    'Creez des tableaux avec des barres verticales et des tirets (| col1 | col2 |) et des listes de taches avec - [ ] et - [x].',
    "Copiez le HTML rendu depuis le panneau d apercu ou copiez le source Markdown."
  ],
  useCases: [
    "Rediger et previsualiser un fichier README.md GitHub avant de le commit.",
    'Rediger de la documentation en Markdown et voir immediatement le rendu final.',
    "Creer du contenu email formate en ecrivant en Markdown et en copiant le HTML rendu."
  ],
  examples: [
    { title: 'Workflow de redaction README.md', text: "Un developpeur ecrit un README pour un nouveau projet et regarde les titres et codes s'afficher en temps reel." },
    { title: 'Collaboration equipe de documentation', text: "Un redacteur technique redige une documentation API et verifie la mise en forme en direct." }
  ],
  mistakes: [
    "Utiliser du HTML non pris en charge a l interieur de blocs Markdown.",
    "Oublier les lignes vides avant les titres et les listes.",
    "Utiliser des tabulations au lieu d espaces pour l indentation des blocs de code."
  ],
  faq: [
    { question: 'Est-ce que cet editeur prend en charge les tableaux avec alignement?', answer: 'Oui. Les tableaux GFM prennent en charge les colonnes alignees a gauche, a droite et au centre.' },
    { question: 'Puis-je copier le HTML rendu directement?', answer: "Oui. Le panneau d apercu affiche le HTML rendu pret a etre copie." },
    { question: 'Prend-il en charge la coloration syntaxique?', answer: "Oui. Les blocs de code avec identifiant de langue s'affichent avec coloration syntaxique." }
  ],
  limitations: [
    "Le rendu peut ne pas correspondre parfaitement a tous les moteurs Markdown.",
    "Les tres grands documents peuvent provoquer des ralentissements.",
    "Les images necessitent des URL publiquement accessibles."
  ],
  verificationSteps: [
    "Tapez un titre, du gras, de l'italique et du code. Verifiez le rendu.",
    "Creez un tableau aligne et un bloc de code avec coloration."
  ]
};

fr['qr-code-generator'] = {
  name: 'Generateur de Code QR',
  summary: 'Generez des codes QR en SVG pour URL, texte, email, telephone et WiFi. Couleurs et taille personnalisables.',
  whatIs: 'Le Generateur de Code QR cree des codes QR en SVG entierement dans le navigateur. Produit un code SVG propre et echelonnable.',
  quickAnswer: 'Generez des codes QR en SVG pour URL, texte, email, telephone et WiFi. Personnalisez couleurs et taille. Gratuit et local.',
  howToUse: [
    'Selectionnez le type de contenu (URL, texte, email, telephone ou WiFi).',
    'Remplissez les champs. Pour le WiFi, fournissez SSID, mot de passe et type de chiffrement.',
    'Ajustez les couleurs et la taille.',
    'Copiez le code QR rendu en SVG ou le code SVG brut.'
  ],
  useCases: [
    'Generer un code QR pour une URL professionnelle.',
    'Creer un code QR WiFi pour les invites.',
    'Integrer un code QR email dans un depliant imprime.'
  ],
  examples: [
    { title: 'Code QR de menu de restaurant', text: 'Un restaurant place des codes QR sur les tables renvoyant a un menu numerique.' },
    { title: 'Badge WiFi de conference', text: "Un organisateur imprime des codes QR WiFi sur les badges d evenement." }
  ],
  mistakes: [
    'Code QR trop petit. Minimum 200x200 pixels recommande.',
    'Couleurs a faible contraste rendant le code illisible.',
    'Ne pas tester avant impression.'
  ],
  faq: [
    { question: 'Est-ce vraiment gratuit et sans serveur?', answer: 'Oui. Tout se fait localement dans votre navigateur.' },
    { question: 'Puis-je personnaliser les couleurs?', answer: 'Oui, avec des selecteurs de couleurs ou des valeurs hexa.' },
    { question: 'Pourquoi SVG?', answer: 'Le SVG est un format vectoriel qui echelonne sans perte.' },
    { question: 'Fonctionne avec tous les telephones?', answer: 'Oui, la plupart des smartphones modernes scannent les QR codes nativement.' }
  ],
  limitations: [
    "Limite a la version 7 (45x45 modules), environ 150 caracteres.",
    'Seulement sortie SVG.',
    'Codes denses plus difficiles a scanner en petite taille.'
  ],
  verificationSteps: [
    'Generez un code QR pour une URL et scannez-le.',
    'Generez un code WiFi et testez-le avec un telephone.'
  ]
};

fr['image-compressor-converter'] = {
  name: "Compresseur et Convertisseur d'Image",
  summary: 'Compressez et convertissez des images localement via Canvas API. JPEG/PNG/WebP. Aucun upload serveur.',
  whatIs: "Outil de traitement d'image base navigateur utilisant Canvas API pour compresser, redimensionner et convertir les images.",
  quickAnswer: "Compressez, redimensionnez et convertissez des images localement. JPEG, PNG, WebP. Qualite reglable. Aucun upload.",
  howToUse: [
    "Selectionnez un fichier image.",
    'Choisissez le format de sortie: JPEG, PNG ou WebP.',
    'Ajustez la qualite (1-100) et les dimensions.',
    "Telechargez l'image traitee."
  ],
  useCases: [
    'Reduire les photos pour le Web avec WebP a 80%.',
    "Convertir des captures d'ecran PNG en JPEG.",
    'Redimensionner des images produits.'
  ],
  examples: [
    { title: "Optimisation Web", text: "Conversion de photos JPEG 2MB en WebP avec reduction drastique." },
    { title: "Reduction d'email", text: "Conversion d'un PNG 15MB en JPEG pour l'envoi par email." }
  ],
  mistakes: [
    'JPEG pour textes et logos. Des artefacts apparaissent.',
    'Qualite trop basse. Commencez a 80%.',
    'Agrandir les images. Cela cause de la pixelisation.'
  ],
  faq: [
    { question: 'Mes images sont-elles envoyees a un serveur?', answer: "Non. Tout se fait dans votre navigateur." },
    { question: 'Taille maximale?', answer: 'Pas de limite explicite. Au-dela de 5000 pixels, possibles ralentissements.' },
    { question: 'Quel format choisir?', answer: 'WebP offre le meilleur rapport compression/qualite.' },
    { question: 'EXIF preserve?', answer: 'Non. Les metadonnees sont supprimees.' }
  ],
  limitations: [
    "Pas d'images animees. Seule la premiere image est traitee.",
    'Profils CMYK non supportes.',
    'Estimations approximatives.'
  ],
  verificationSteps: [
    'Convertissez un JPEG en WebP a 80% et verifiez la taille.',
    'Verifiez la preservation de transparence pour les PNG.'
  ]
};

fr['svg-optimizer'] = {
  name: 'Optimiseur SVG',
  summary: 'Optimisez les SVG en supprimant commentaires, metadonnees et espaces. Comparaison avant/apres. Traitement local.',
  whatIs: "Outil base navigateur reduisant la taille des SVG en supprimant les elements n'affectant pas le rendu visuel.",
  quickAnswer: "Supprimez commentaires, metadonnees et espaces superflus des SVG. Comparez les tailles avant/apres. Local et gratuit.",
  howToUse: [
    'Collez du SVG ou telechargez un fichier.',
    "L'outil traite et affiche le resultat optimise.",
    'Consultez la comparaison de taille.',
    'Copiez ou telechargez le SVG optimise.'
  ],
  useCases: [
    'Reduire les SVG avant integration Web.',
    'Nettoyer les SVG avant commit.',
    'Preparer des SVG pour des URI de donnees CSS.'
  ],
  examples: [
    { title: 'Nettoyage Figma', text: 'Des icones SVG de 4KB reduites a 1,2KB en moyenne.' },
    { title: 'Performance SVG inline', text: "Hero SVG de 28KB reduit a 9KB par nettoyage des metadonnees." }
  ],
  mistakes: [
    'Presumer qu un SVG plus petit est visuellement identique.',
    'Supprimer le viewBox.',
    'Oublier les definitions de symboles reutilisables.'
  ],
  faq: [
    { question: 'Que supprime l optimiseur?', answer: 'Commentaires XML, metadonnees, groupes vides, espaces superflus.' },
    { question: 'Minimise-t-il les chemins?', answer: 'Non, il se concentre sur le nettoyage structurel.' },
    { question: 'Casse-t-il le CSS?', answer: 'Non, le CSS inline et les styles sont conserves.' }
  ],
  limitations: [
    'Nettoyage structurel uniquement.',
    'SVG avec images raster integrees peu de gain.',
    'Prefixes namespace non standard non reconnus.'
  ],
  verificationSteps: [
    'Optimisez un SVG et verifiez la suppression des metadonnees.',
    'Comparez le rendu avant et apres dans un navigateur.'
  ]
};

fr['svg-to-css-data-uri-converter'] = {
  name: 'Convertisseur SVG en URI de Donnees CSS',
  summary: 'Convertissez du SVG en URI de donnees CSS. Options URL-encodé et Base64 avec apercu en direct.',
  whatIs: "Transforme le SVG brut en URI de donnees pour CSS et HTML. Deux methodes: encodage URL et Base64.",
  quickAnswer: "Obtenez des URI de donnees CSS compatibles depuis du SVG. URL-encode ou Base64. background-image, mask, img src.",
  howToUse: [
    'Collez votre SVG.',
    "Choisissez l'encodage: URL (recommande) ou Base64.",
    'Selectionnez le format de sortie.',
    'Copiez le code genere dans votre CSS ou HTML.'
  ],
  useCases: [
    'Integrer des icones SVG dans CSS pour reduire les requetes HTTP.',
    'Utiliser des URI en CSS mask-image.',
    'Integrer des SVG dans des emails.'
  ],
  examples: [
    { title: 'Icones sans sprites CSS', text: "10 icones SVG converties en URI de donnees et integrees dans la feuille de style." },
    { title: 'Signature email autonome', text: "Logo SVG converti en URI Base64 pour signature email." }
  ],
  mistakes: [
    'Base64 inutile. L encodage URL est plus compact.',
    'Espaces superflus avant encodage.',
    'URI de donnees pour grands SVG (plus de 2-4KB).'
  ],
  faq: [
    { question: 'Quel encodage choisir?', answer: 'URL-encodé, environ 10-20% plus petit.' },
    { question: 'Compatibilite navigateurs?', answer: 'Tous les navigateurs modernes.' },
    { question: 'Dans les attributs style?', answer: 'Oui, attention aux guillemets.' },
    { question: 'Taille maximale?', answer: 'Sous 2KB pour les performances.' }
  ],
  limitations: [
    'URI de plus de 4KB deconseillees.',
    'Pas de validation SVG.',
    'Comportement variable selon navigateurs pour mask-image.'
  ],
  verificationSteps: [
    'Convertissez un cercle SVG avec URL-encodage et verifiez le rendu.',
    'Comparez avec le rendu Base64.'
  ]
};

console.log('DE + FR ready');

// ─── SPANISH ───────────────────────────────────────────

const es = {};

es['markdown-preview-editor'] = {
  name: 'Editor de Vista Previa Markdown',
  summary: 'Editor Markdown de pantalla dividida con vista previa en vivo de GitHub-Flavored Markdown. Compatible con encabezados, negrita/cursiva, enlaces, bloques de codigo, tablas y listas de tareas.',
  whatIs: 'El Editor de Vista Previa Markdown es un entorno de escritura de pantalla dividida donde el panel izquierdo es un editor de texto y el panel derecho renderiza el Markdown como HTML en tiempo real. Es compatible con GitHub-Flavored Markdown (GFM).',
  quickAnswer: 'Escriba Markdown en el panel izquierdo y vea el HTML renderizado actualizarse al instante en el panel derecho. Compatible con encabezados GFM, negrita, cursiva, bloques de codigo, tablas, listas de tareas, citas y enlaces.',
  howToUse: [
    'Escriba o pegue Markdown en el panel del editor a la izquierda. La vista previa se actualiza automaticamente.',
    'Use la sintaxis estandar de Markdown: # para encabezados, **negrita**, *cursiva*, `codigo`.',
    'Cree tablas con (| col1 | col2 |) y listas de tareas con - [ ] y - [x].',
    'Copie el HTML renderizado o el codigo fuente Markdown.'
  ],
  useCases: [
    'Escribir y previsualizar un README.md antes de confirmarlo.',
    'Redactar documentacion y ver el resultado final inmediatamente.',
    'Crear contenido email formateado escribiendo en Markdown.'
  ],
  examples: [
    { title: 'Flujo de trabajo README.md', text: 'Un desarrollador escribe un README y observa el renderizado en tiempo real.' },
    { title: 'Colaboracion de documentacion', text: 'Un redactor tecnico redacta documentacion API y verifica el formato en vivo.' }
  ],
  mistakes: [
    'Usar HTML no compatible dentro de bloques Markdown.',
    'Olvidar las lineas en blanco antes de encabezados y listas.',
    'Usar tabuladores en lugar de espacios para la sangria.'
  ],
  faq: [
    { question: 'Este editor admite tablas con alineacion?', answer: 'Si. Las tablas GFM admiten alineacion izquierda, derecha y centrada.' },
    { question: 'Puedo copiar el HTML directamente?', answer: 'Si. El panel de vista previa muestra el HTML listo para copiar.' },
    { question: 'Tiene resaltado de sintaxis?', answer: 'Si. Los bloques de codigo con identificador de lenguaje se renderizan con resaltado.' }
  ],
  limitations: [
    'Puede no coincidir perfectamente con todos los motores Markdown.',
    'Documentos muy grandes pueden causar lentitud.',
    'Las imagenes requieren URL accesibles publicamente.'
  ],
  verificationSteps: [
    'Escriba un encabezado, negrita, cursiva y codigo. Verifique el renderizado.',
    'Cree una tabla alineada y un bloque de codigo con resaltado.'
  ]
};

es['qr-code-generator'] = {
  name: 'Generador de Codigos QR',
  summary: 'Genere codigos QR como SVG para URL, texto, correo electronico, telefono y WiFi. Colores y tamano personalizables.',
  whatIs: 'El Generador de Codigos QR crea codigos QR en SVG completamente en el navegador. Produce codigo SVG limpio y escalable.',
  quickAnswer: 'Genere codigos QR como SVG para URL, texto, correo, telefono y WiFi. Personalice colores y tamano. Procesamiento local y gratuito.',
  howToUse: [
    'Seleccione el tipo de contenido (URL, texto, correo, telefono o WiFi).',
    'Complete los campos. Para WiFi, proporcione SSID y contrasena.',
    'Ajuste los colores y el tamano.',
    'Copie el codigo QR renderizado como SVG o el codigo bruto.'
  ],
  useCases: [
    'Generar un codigo QR para una URL de negocio.',
    'Crear un codigo QR WiFi para invitados.',
    'Incrustar un codigo QR de correo en un volante.'
  ],
  examples: [
    { title: 'Codigo QR de menu', text: 'Un restaurante coloca codigos QR en las mesas para el menu digital.' },
    { title: 'Codigo QR WiFi de conferencia', text: 'Un organizador imprime codigos WiFi en las credenciales.' }
  ],
  mistakes: [
    'Codigo QR demasiado pequeno. Minimo 200x200 pixeles.',
    'Colores de bajo contraste.',
    'No probar antes de imprimir.'
  ],
  faq: [
    { question: 'Es realmente gratuito y sin servidor?', answer: 'Si. Todo ocurre localmente en su navegador.' },
    { question: 'Puedo personalizar los colores?', answer: 'Si, con selectores de color o valores hexadecimales.' },
    { question: 'Por que SVG?', answer: 'SVG es un formato vectorial que escala sin perdida.' },
    { question: 'Funciona con todos los telefonos?', answer: 'La mayoria de smartphones modernos escanean QR nativamente.' }
  ],
  limitations: [
    'Limitado a version 7 (45x45 modulos), unos 150 caracteres.',
    'Solo salida SVG.',
    'Codigos densos mas dificiles de escanear en tamano pequeno.'
  ],
  verificationSteps: [
    'Genere un QR para una URL y escaneelo.',
    'Genere un QR WiFi y pruebelo con un telefono.'
  ]
};

es['image-compressor-converter'] = {
  name: 'Compresor y Conversor de Imagenes',
  summary: 'Comprima y convierta imagenes localmente usando Canvas API. JPEG/PNG/WebP. Sin carga al servidor.',
  whatIs: 'Herramienta de procesamiento de imagenes basada en navegador que usa Canvas API para comprimir, cambiar tamano y convertir imagenes.',
  quickAnswer: 'Comprima, cambie el tamano y convierta imagenes localmente. JPEG, PNG, WebP. Calidad ajustable. Sin upload.',
  howToUse: [
    'Seleccione un archivo de imagen.',
    'Elija el formato de salida: JPEG, PNG o WebP.',
    'Ajuste la calidad (1-100) y las dimensiones.',
    'Descargue la imagen procesada.'
  ],
  useCases: [
    'Reducir fotos para Web con WebP al 80%.',
    'Convertir capturas PNG a JPEG.',
    'Redimensionar imagenes de productos.'
  ],
  examples: [
    { title: 'Optimizacion Web', text: 'Fotos JPEG de 2MB convertidas a WebP con reduccion drastica.' },
    { title: 'Reduccion de email', text: 'PNG de 15MB convertido a JPEG para envio por correo.' }
  ],
  mistakes: [
    'JPEG para textos y logos. Aparecen artefactos.',
    'Calidad demasiado baja. Comience al 80%.',
    'Ampliar imagenes. Causa pixelacion.'
  ],
  faq: [
    { question: 'Mis imagenes se cargan a un servidor?', answer: 'No. Todo se hace en su navegador.' },
    { question: 'Tamano maximo?', answer: 'Sin limite explicito. Mas de 5000 pixeles puede causar lentitud.' },
    { question: 'Que formato elegir?', answer: 'WebP ofrece el mejor ratio compresion/calidad.' },
    { question: 'Preserva EXIF?', answer: 'No. Los metadatos se eliminan.' }
  ],
  limitations: [
    'No soporta imagenes animadas. Solo el primer fotograma.',
    'Perfiles CMYK no soportados.',
    'Estimaciones aproximadas.'
  ],
  verificationSteps: [
    'Convierta un JPEG a WebP al 80% y verifique el tamano.',
    'Verifique la preservacion de transparencia en PNG.'
  ]
};

es['svg-optimizer'] = {
  name: 'Optimizador SVG',
  summary: 'Optimice archivos SVG eliminando comentarios, metadatos y espacios. Comparacion antes/despues. Procesamiento local.',
  whatIs: 'Herramienta que reduce el tamano de SVG eliminando elementos que no afectan el renderizado visual.',
  quickAnswer: 'Elimine comentarios, metadatos y espacios sobrantes de SVG. Vea la comparacion de tamano. Local y gratuito.',
  howToUse: [
    'Pegue SVG o cargue un archivo.',
    'La herramienta procesa y muestra el resultado optimizado.',
    'Revise la comparacion de tamano.',
    'Copie o descargue el SVG optimizado.'
  ],
  useCases: [
    'Reducir SVG antes de integrarlos en paginas web.',
    'Limpiar SVG antes de enviarlos a un repositorio.',
    'Preparar SVG para URI de datos CSS.'
  ],
  examples: [
    { title: 'Limpieza Figma', text: 'Iconos SVG de 4KB reducidos a 1.2KB en promedio.' },
    { title: 'Rendimiento SVG inline', text: 'Hero SVG de 28KB reducido a 9KB.' }
  ],
  mistakes: [
    'Asumir que un SVG mas pequeno es visualmente identico.',
    'Eliminar el viewBox.',
    'Omitir definiciones de simbolos reutilizables.'
  ],
  faq: [
    { question: 'Que elimina el optimizador?', answer: 'Comentarios XML, metadatos, grupos vacios, espacios sobrantes.' },
    { question: 'Minimiza rutas?', answer: 'No, se centra en limpieza estructural.' },
    { question: 'Romp el CSS?', answer: 'No. El CSS inline y los estilos se conservan.' }
  ],
  limitations: [
    'Solo limpieza estructural.',
    'SVG con imagenes raster incrustadas: poco beneficio.',
    'Prefijos de namespace no estandar no reconocidos.'
  ],
  verificationSteps: [
    'Optimice un SVG y verifique que se eliminaron los metadatos.',
    'Compare el renderizado antes y despues.'
  ]
};

es['svg-to-css-data-uri-converter'] = {
  name: 'Convertidor SVG a URI de Datos CSS',
  summary: 'Convierta SVG a URI de datos CSS. Opciones URL-codificado y Base64 con vista previa en vivo.',
  whatIs: 'Transforma SVG bruto en URI de datos para CSS y HTML. Metodos: codificacion URL y Base64.',
  quickAnswer: 'Obtenga URI de datos CSS desde SVG. URL-codificado o Base64. background-image, mask, img src.',
  howToUse: [
    'Pegue su SVG.',
    'Elija codificacion: URL (recomendada) o Base64.',
    'Seleccione el formato de salida.',
    'Copie el codigo en su CSS o HTML.'
  ],
  useCases: [
    'Integrar iconos SVG en CSS para reducir solicitudes HTTP.',
    'Usar URI en CSS mask-image.',
    'Integrar SVG en correos electronicos.'
  ],
  examples: [
    { title: 'Iconos sin sprites CSS', text: '10 iconos SVG convertidos a URI e integrados en la hoja de estilos.' },
    { title: 'Firma de correo autonoma', text: 'Logo SVG convertido a URI Base64 para firma de correo.' }
  ],
  mistakes: [
    'Base64 innecesario. La codificacion URL es mas compacta.',
    'Espacios sobrantes antes de codificar.',
    'URI para SVG grandes (mas de 2-4KB).'
  ],
  faq: [
    { question: 'Que codificacion elegir?', answer: 'URL-codificado, aproximadamente 10-20% mas pequeno.' },
    { question: 'Compatibilidad con navegadores?', answer: 'Todos los navegadores modernos.' },
    { question: 'En atributos style?', answer: 'Si, cuidado con las comillas.' },
    { question: 'Tamano maximo?', answer: 'Mantengalo bajo 2KB por rendimiento.' }
  ],
  limitations: [
    'URI mayores de 4KB no recomendadas.',
    'Sin validacion de SVG.',
    'Comportamiento variable segun navegador para mask-image.'
  ],
  verificationSteps: [
    'Convierta un circulo SVG con URL-codificado y verifique el renderizado.',
    'Compare con el renderizado Base64.'
  ]
};

// ─── JAPANESE ──────────────────────────────────────────

const ja = {};

ja['markdown-preview-editor'] = {
  name: 'Markdownプレビューエディタ',
  summary: '分割画面のMarkdownエディタで、GitHub Flavored Markdownをライブプレビューできます。見出し、太字/斜体、リンク、コードブロック、テーブル、タスクリストをサポートしています。',
  whatIs: 'Markdownプレビューエディタは、左ペインがテキストエディタ、右ペインがMarkdownをリアルタイムでHTMLにレンダリングする分割画面の作成環境です。GitHub Flavored Markdown（GFM）をサポートしています。',
  quickAnswer: '左ペインでMarkdownを記述すると、右ペインにレンダリングされたHTMLが即座に更新されます。GFMの見出し、太字、斜体、シンタックスハイライト付きコードブロック、テーブル、タスクリスト、ブロッククオート、リンクをサポートしています。',
  howToUse: [
    '左側のエディタペインにMarkdownを入力または貼り付けます。右側のプレビューペインは入力に応じて自動的に更新されます。',
    '標準のMarkdown構文を使用します。# は見出し、**太字**、*斜体*、`code` はインラインコード、三重バッククオートはコードブロックです。',
    'パイプとダッシュを使用してテーブル（| col1 | col2 |）を作成し、- [ ] と - [x] の構文でタスクリストを作成します。',
    'プレビューペインからレンダリングされたHTMLをコピーするか、Markdownソースをコピーして他のツールで使用します。'
  ],
  useCases: [
    'コミット前にGitHubのREADME.mdファイルを作成およびプレビューして、すべてのGFM機能が正しくレンダリングされることを確認します。',
    'Markdownでドキュメントを作成し、見出し、コードブロック、テーブルが公開時にどのように表示されるかを即座に確認します。',
    'Markdownで記述してレンダリングされたHTMLをコピーすることで、フォーマットされたメールコンテンツやCMSエントリを作成します。'
  ],
  examples: [
    { title: 'README.md作成ワークフロー', text: '開発者が新しいオープンソースプロジェクトのREADMEを作成しています。エディタペインにMarkdownを入力すると、見出しやコードブロックがプレビューペインにリアルタイムでレンダリングされます。' },
    { title: 'ドキュメンテーションチームのコラボレーション', text: 'テクニカルライターがMarkdownを使用してAPIドキュメントを作成しています。ライブプレビューで、ネストされたリストが正しくレンダリングされることを確認します。' }
  ],
  mistakes: [
    'Markdownブロック内でサポートされていないHTMLを使用する。GFMはインラインHTMLを許可していますが、コードブロックやリスト内でHTMLとMarkdown構文を混在させると、予期しないレンダリングが発生する可能性があります。',
    '見出しやリストの前に空行を入れ忘れる。Markdownでは多くの場合、ブロックレベルの要素の前に空行が必要です。',
    'コードブロックのインデントにスペースの代わりにタブを使用する。インデントされたコードブロックには4つのスペースが必要です。'
  ],
  faq: [
    { question: 'このエディタは配置機能付きテーブルをサポートしていますか？', answer: 'はい。GFMテーブルは、区切り行のコロンを使用して、左揃え（:---）、右揃え（---:）、中央揃え（:---:）の列をサポートしています。' },
    { question: 'レンダリングされたHTMLを直接コピーできますか？', answer: 'はい。プレビューペインには完全にレンダリングされたHTMLが表示されます。レンダリングされたコンテンツを選択してコピーできます。' },
    { question: 'コードブロックのシンタックスハイライトをサポートしていますか？', answer: 'はい。言語識別子付きのコードブロックは、プレビューペインでシンタックスハイライト付きでレンダリングされます。' }
  ],
  limitations: [
    'このツールはブラウザ内でMarkdownをレンダリングするため、すべてのMarkdownエンジンと完全に一致しない場合があります。',
    '非常に大きなドキュメント（10万字以上）は、キー入力ごとにリアルタイムで再レンダリングされるため、パフォーマンスが低下する可能性があります。',
    '埋め込み画像はプレビューにインライン表示されますが、公開アクセス可能なURLが必要です。'
  ],
  verificationSteps: [
    'エディタに「# 見出し1」、「**太字**」、「*斜体*」、「`code`」を入力します。各要素がプレビューペインに正しくレンダリングされることを確認します。',
    'ヘッダー配置付きの3列テーブルと言語識別子付きのコードブロックを作成します。'
  ]
};

ja['qr-code-generator'] = {
  name: 'QRコードジェネレータ',
  summary: 'URL、テキスト、メール、電話、WiFi用のQRコードをSVGとして生成します。色とサイズをカスタマイズ可能で、SVGコード出力付き。',
  whatIs: 'QRコードジェネレータは、ブラウザ内で完全に処理されるスケーラブルベクターグラフィックス（SVG）としてQRコードを作成します。クリーンでスケーラブルなSVGコードを生成します。',
  quickAnswer: 'URL、テキスト、メール、電話番号、WiFi認証情報用のQRコードをSVGとして生成します。色とサイズをカスタマイズできます。すべての処理はローカルで実行され、無料です。',
  howToUse: [
    'ドロップダウンメニューからコンテンツタイプ（URL、テキスト、メール、電話、またはWiFi）を選択します。',
    '選択したタイプのフィールドに入力します。WiFiの場合は、SSID、パスワード、暗号化タイプを指定します。',
    '必要に応じてQRコードの色（前景と背景）とサイズを調整します。',
    'レンダリングされたQRコードをSVGとしてコピーするか、生のSVGコードを取得します。'
  ],
  useCases: [
    '印刷物やメール署名に含めるビジネスURL用のQRコードを生成します。',
    'ゲストがパスワードを入力せずに接続できるWiFi QRコードを作成します。',
    '印刷されたチラシにメールQRコードを埋め込みます。'
  ],
  examples: [
    { title: 'レストランメニューQRコード', text: 'レストランがデジタルメニューにリンクするQRコードをテーブルに配置します。' },
    { title: '会議WiFiバッジ', text: 'イベント主催者が会議バッジにWiFi QRコードを印刷します。' }
  ],
  mistakes: [
    'QRコードを信頼性のあるスキャンに必要なサイズよりも小さくする。200x200ピクセル以上が推奨されます。',
    'コントラストの低い色の組み合わせを使用する。',
    '印刷前にQRコードのテストを忘れる。'
  ],
  faq: [
    { question: 'QRコード生成は本当に無料でサーバーレスですか？', answer: 'はい。すべてのQRコード生成はブラウザ内でJavaScriptを使用してローカルに実行されます。' },
    { question: 'QRコードの色をカスタマイズできますか？', answer: 'はい。カラーピッカーまたは16進数値を使用して設定できます。' },
    { question: 'なぜPNGではなくSVGなのですか？', answer: 'SVGはベクター形式であり、品質を損なうことなく無限に拡大縮小できます。' },
    { question: 'WiFi QRコードはすべての電話で動作しますか？', answer: 'iOS（11+）およびAndroid（10+）を搭載した最新のスマートフォンのほとんどは、ネイティブにスキャンできます。' }
  ],
  limitations: [
    'このツールはバージョン7（45x45モジュール）までのQRコードを生成します。',
    'SVG出力のみがサポートされています。',
    'データ密度の高いQRコードは小さなサイズではスキャンが難しい場合があります。'
  ],
  verificationSteps: [
    '短いURLのQRコードを生成し、スマートフォンのカメラでスキャンします。',
    'テスト用のSSIDとパスワードでWiFi QRコードを生成してテストします。'
  ]
};

ja['image-compressor-converter'] = {
  name: '画像圧縮・変換ツール',
  summary: 'Canvas APIを使用して画像をローカルで圧縮および変換します。JPEG/PNG/WebP出力。サーバーへのアップロードはありません。',
  whatIs: 'Canvas APIを使用して画像を圧縮、サイズ変更、変換するブラウザベースの画像処理ツールです。3つの出力形式（JPEG、PNG、WebP）をサポートしています。',
  quickAnswer: 'Canvas APIを使用して画像をローカルで圧縮、サイズ変更、変換します。JPEG、PNG、またはWebP出力を選択し、品質を調整できます。すべての処理はブラウザ内で行われます。',
  howToUse: [
    'ファイル選択ツールを使用してデバイスから画像ファイルを選択します。',
    '出力形式を選択します。JPEG、PNG、またはWebP。',
    '品質スライダー（1〜100）を調整し、オプションでターゲットの幅または高さを設定します。',
    '処理された画像をダウンロードします。サイズ比較が表示されます。'
  ],
  useCases: [
    'Web用に写真ファイルをWebPまたはJPEG（80%品質）に変換して削減します。',
    'PNGスクリーンショットをJPEGに変換します。',
    '商品画像を統一された幅にサイズ変更します。'
  ],
  examples: [
    { title: 'Webサイトパフォーマンス最適化', text: 'Web開発者が2MBのJPEG写真を80%品質のWebPに変換します。' },
    { title: 'メール添付ファイルサイズ削減', text: '15MBのPNGスクリーンショットを60%品質のJPEGに変換します。' }
  ],
  mistakes: [
    'テキストやシャープなエッジのある画像にJPEGを使用する。',
    '最初の試行で品質を低く設定しすぎる。80%から始めてください。',
    '画像を元のサイズよりも大きくリサイズする。'
  ],
  faq: [
    { question: '画像はサーバーにアップロードされますか？', answer: 'いいえ。すべての画像処理はブラウザ内で行われます。画像がコンピュータの外部に出ることはありません。' },
    { question: '処理できる最大ファイルサイズは？', answer: '明示的な制限はありませんが、5000ピクセルを超える画像はパフォーマンスの問題を引き起こす可能性があります。' },
    { question: 'Web使用にはどの形式を選ぶべきですか？', answer: 'WebPは一般的に最良の圧縮対品質比を提供します。' },
    { question: 'このツールはEXIFデータを保持しますか？', answer: 'いいえ。Canvas APIは処理中にEXIFメタデータを削除します。' }
  ],
  limitations: [
    'Canvas APIはアニメーション画像をサポートしていません。最初のフレームのみが処理されます。',
    'CMYKやその他の非RGBカラープロファイルはサポートされていません。',
    'ファイルサイズの見積もりは概算です。'
  ],
  verificationSteps: [
    'JPEG写真を80%品質のWebPに変換し、ファイルサイズを確認します。',
    '透明度のあるPNGを処理し、透明度が保持されていることを確認します。'
  ]
};

ja['svg-optimizer'] = {
  name: 'SVG最適化ツール',
  summary: 'コメント、メタデータ、エディタデータを削除し、空白を削減してSVGファイルを最適化します。前後のサイズ比較を表示。すべてローカル処理。',
  whatIs: '視覚的な出力に影響を与えない要素を削除することでSVGファイルサイズを削減するブラウザベースのツールです。',
  quickAnswer: 'SVGマークアップを貼り付けるかSVGファイルをアップロードして、コメント、メタデータ、エディタデータ、余分な空白を削除します。すべての処理はローカルで実行されます。',
  howToUse: [
    '入力エリアにSVGマークアップを貼り付けるか、SVGファイルをアップロードします。',
    'ツールは自動的にSVGを処理し、最適化された出力を表示します。',
    '前後のサイズ比較を確認します。',
    '最適化されたSVGコードをコピーするか、.svgファイルとしてダウンロードします。'
  ],
  useCases: [
    'Webページに埋め込む前にSVGファイルサイズを削減します。',
    'デザインツールからエクスポートされたSVGをコミット前にクリーンアップします。',
    'CSSデータURIで使用するためにSVGを準備します。'
  ],
  examples: [
    { title: 'Figmaエクスポートのクリーンアップ', text: 'FigmaからエクスポートされたSVGアイコンを平均4KBから1.2KBに削減します。' },
    { title: 'インラインSVGのパフォーマンス向上', text: '28KBのヒーローSVGを9KBに削減します。' }
  ],
  mistakes: [
    '小さなSVGが常に視覚的に同一であると想定する。デプロイ前にプレビューを確認してください。',
    'viewBox属性を削除する。',
    '再利用可能なシンボル定義を見落とす。'
  ],
  faq: [
    { question: '最適化ツールは何を削除しますか？', answer: 'XMLコメント、doctype宣言、エディタ固有のメタデータ、空のグループ、不要な空白を削除します。' },
    { question: 'パスデータを最小化しますか？', answer: 'このツールは構造的なクリーンアップに焦点を当てています。' },
    { question: 'SVGのインラインCSSは壊れますか？', answer: 'いいえ。インラインCSS、<style>ブロック、クラスベースのスタイリングは保持されます。' }
  ],
  limitations: [
    '構造的なクリーンアップのみを実行します。',
    '埋め込みラスター画像を含むSVGは大幅なサイズ削減が見られない場合があります。',
    '一部のSVGファイルは非標準の名前空間プレフィックスを使用しています。'
  ],
  verificationSteps: [
    'デザインツールからエクスポートされたSVGをアップロードし、メタデータが削除されたことを確認します。',
    '元のSVGと最適化されたSVGの両方をブラウザで開き、同一にレンダリングされることを確認します。'
  ]
};

ja['svg-to-css-data-uri-converter'] = {
  name: 'SVGからCSSデータURIへのコンバータ',
  summary: 'SVGマークアップをCSSデータURIに変換します。URLエンコードとBase64オプション、ライブプレビュー付き。',
  whatIs: '生のSVGマークアップをCSSプロパティやHTML属性で動作するデータURIに変換します。URLエンコードとBase64エンコードの2つの方法をサポートしています。',
  quickAnswer: 'SVGマークアップを貼り付けて、URLエンコードまたはBase64形式のCSS互換データURIを取得します。background-image、mask、img src、または生のデータURI。',
  howToUse: [
    '入力エリアにSVGマークアップを貼り付けます。',
    'エンコード方法を選択します。URLエンコード（推奨）またはBase64。',
    '出力形式を選択します。CSS background-image、CSS mask、img src、または生のデータURI。',
    '生成されたコードをコピーしてスタイルシートまたはHTMLに貼り付けます。'
  ],
  useCases: [
    'HTTPリクエストを削減するためにCSS background-imageにSVGアイコンを直接埋め込みます。',
    'CSS mask-imageでSVGデータURIを使用します。',
    '自己完結型のメールテンプレート用にHTML imgタグにSVGを埋め込みます。'
  ],
  examples: [
    { title: 'CSSスプライト不要のアイコン', text: '10個のSVGアイコンをCSSデータURIに変換し、スタイルシートに直接埋め込みます。' },
    { title: '自己完結型メール署名', text: 'ロゴSVGをBase64データURIに変換し、メール署名で使用します。' }
  ],
  mistakes: [
    '不必要にBase64を使用する。URLエンコードの方がコンパクトです。',
    'エンコード前に不要な空白を削除するのを忘れる。',
    '大きなSVG（2〜4KB以上）にデータURIを使用する。'
  ],
  faq: [
    { question: 'どのエンコード方法が適していますか？', answer: 'URLエンコードが適しています。Base64よりも約10〜20%小さくなります。' },
    { question: 'すべてのブラウザで動作しますか？', answer: 'Chrome、Firefox、Safari、Edgeを含むすべてのモダンブラウザでサポートされています。' },
    { question: 'インラインCSSスタイル属性で使用できますか？', answer: 'はい。ただし、引用符に注意してください。' },
    { question: '実用的な最大サイズは？', answer: 'パフォーマンスのため、2KB未満に抑えてください。' }
  ],
  limitations: [
    '約4KBを超えるデータURIは避けるべきです。',
    'このツールはSVG構文を検証しません。',
    '一部のCSSプロパティはブラウザ固有の動作を示す可能性があります。'
  ],
  verificationSteps: [
    '単純なSVGサークルをURLエンコードで変換し、レンダリングを確認します。',
    'Base64エンコードに切り替え、同一にレンダリングされることを確認します。'
  ]
};

console.log('JA ready');

// ─── DUTCH ─────────────────────────────────────────────

const nl = {};

nl['markdown-preview-editor'] = {
  name: 'Markdown Voorvertoning Editor',
  summary: 'Split-screen Markdown-editor met live GitHub-Flavored Markdown-voorvertoning. Ondersteunt koppen, vet/cursief, links, codeblokken, tabellen en takenlijsten.',
  whatIs: 'De Markdown Voorvertoning Editor is een split-schrijfomgeving waar het linkerpaneel een teksteditor is en het rechterpaneel de Markdown in realtime als HTML rendert. Het ondersteunt GitHub-Flavored Markdown (GFM).',
  quickAnswer: 'Schrijf Markdown in het linkerpaneel en zie de gerenderde HTML direct bijwerken in het rechterpaneel. Ondersteunt GFM-koppen, vet, cursief, codeblokken met syntaxishighlighting, tabellen, takenlijsten, citaten en links.',
  howToUse: [
    'Typ of plak Markdown in het editorpaneel aan de linkerkant. Het voorvertoningspaneel werkt automatisch bij.',
    'Gebruik standaard Markdown-syntax: # voor koppen, **vet**, *cursief*, `code` voor inline-code.',
    'Maak tabellen met pipes en streepjes (| kol1 | kol2 |) en takenlijsten met - [ ] en - [x].',
    'Kopieer de gerenderde HTML of de Markdown-bron voor gebruik in andere tools.'
  ],
  useCases: [
    'Een GitHub README.md-bestand schrijven en voorvertonen voordat u het commit.',
    'Documentatie in Markdown opstellen en direct zien hoe het eruitziet.',
    'Geforrmatteerde e-mailinhoud maken door in Markdown te schrijven.'
  ],
  examples: [
    { title: 'README.md-schrijfworkflow', text: 'Een ontwikkelaar schrijft een README en ziet de realtime weergave van koppen en codeblokken.' },
    { title: 'Samenwerking documentatieteam', text: 'Een technisch schrijver stelt API-documentatie op en verifieert de opmaak in realtime.' }
  ],
  mistakes: [
    'Niet-ondersteunde HTML gebruiken binnen Markdown-blokken.',
    'Vergeten om lege regels voor koppen en lijsten te plaatsen.',
    'Tabs gebruiken in plaats van spaties voor codeblok-inspringing.'
  ],
  faq: [
    { question: 'Ondersteunt deze editor tabellen met uitlijning?', answer: 'Ja. GFM-tabellen ondersteunen links-, rechts- en gecentreerde uitlijning.' },
    { question: 'Kan ik de gerenderde HTML direct kopiëren?', answer: 'Ja. Het voorvertoningspaneel toont de volledig gerenderde HTML.' },
    { question: 'Ondersteunt het syntaxishighlighting?', answer: 'Ja. Codeblokken met een taalidentificatie worden weergegeven met syntaxishighlighting.' }
  ],
  limitations: [
    'Deze tool komt mogelijk niet perfect overeen met elke Markdown-engine.',
    'Zeer grote documenten kunnen prestatieproblemen veroorzaken.',
    'Ingesloten afbeeldingen vereisen openbaar toegankelijke URLs.'
  ],
  verificationSteps: [
    'Typ een kop, vet, cursief en code. Controleer de weergave.',
    'Maak een tabel met uitlijning en een codeblok met syntaxishighlighting.'
  ]
};

nl['qr-code-generator'] = {
  name: 'QR-Code Generator',
  summary: 'Genereer QR-codes als SVG voor URL, tekst, e-mail, telefoon en WiFi. Aanpasbare kleuren en grootte.',
  whatIs: 'De QR-Code Generator maakt QR-codes als schaalbare vectorafbeeldingen (SVG) volledig in de browser. Produceert schone, schaalbare SVG-code.',
  quickAnswer: 'Genereer QR-codes als SVG voor URL, tekst, e-mail, telefoon en WiFi. Pas kleuren en grootte aan. Lokaal en gratis.',
  howToUse: [
    'Selecteer het inhoudstype (URL, tekst, e-mail, telefoon of WiFi).',
    'Vul de velden in. Voor WiFi, SSID, wachtwoord en encryptietype.',
    'Pas de kleuren en grootte aan.',
    'Kopieer de QR-code als SVG of de ruwe SVG-code.'
  ],
  useCases: [
    'Een QR-code genereren voor een bedrijfs-URL.',
    'Een WiFi-QR-code maken voor gasten.',
    'Een e-mail-QR-code in een gedrukte flyer insluiten.'
  ],
  examples: [
    { title: 'Restaurantmenu QR-code', text: 'Een restaurant plaatst QR-codes op tafels die naar een digitaal menu linken.' },
    { title: 'Conferentie WiFi-badge', text: 'Een organisator drukt WiFi-QR-codes op conferentiebadges.' }
  ],
  mistakes: [
    'QR-code te klein. Minimum 200x200 pixels aanbevolen.',
    'Kleurcombinaties met laag contrast.',
    'Vergeten te testen voor het drukken.'
  ],
  faq: [
    { question: 'Is het genereren van QR-codes echt gratis en serverloos?', answer: 'Ja. Alles gebeurt lokaal in uw browser met JavaScript.' },
    { question: 'Kan ik de kleuren aanpassen?', answer: 'Ja, met kleurkiezers of hexadecimale waarden.' },
    { question: 'Waarom SVG en niet PNG?', answer: 'SVG is een vectorformaat dat oneindig schaalt zonder kwaliteitsverlies.' },
    { question: 'Werkt de WiFi-QR-code met alle telefoons?', answer: 'De meeste moderne smartphones scannen WiFi-QR-codes native.' }
  ],
  limitations: [
    'Genereert QR-codes tot versie 7 (45x45 modules), ongeveer 150 tekens.',
    'Alleen SVG-uitvoer.',
    'Dichte QR-codes moeilijker te scannen op klein formaat.'
  ],
  verificationSteps: [
    'Genereer een QR-code voor een URL en scan hem.',
    'Genereer een WiFi-QR-code en test hem met een telefoon.'
  ]
};

nl['image-compressor-converter'] = {
  name: 'Beeldcompressor en -converter',
  summary: 'Comprimeer en converteer afbeeldingen lokaal met Canvas API. JPEG/PNG/WebP. Geen upload naar server.',
  whatIs: 'Browsergebaseerde beeldverwerkingstool die Canvas API gebruikt om afbeeldingen te comprimeren, te vergroten/verkleinen en te converteren.',
  quickAnswer: 'Comprimeer, wijzig de grootte en converteer afbeeldingen lokaal. JPEG, PNG, WebP. Kwaliteit instelbaar. Geen upload.',
  howToUse: [
    'Selecteer een afbeeldingsbestand.',
    'Kies het uitvoerformaat: JPEG, PNG of WebP.',
    'Pas de kwaliteit (1-100) en dimensies aan.',
    'Download de verwerkte afbeelding.'
  ],
  useCases: [
    'Verminder fotobestandsgroottes voor het web met WebP op 80%.',
    'Converteer PNG-screenshots naar JPEG.',
    'Wijzig de grootte van productafbeeldingen.'
  ],
  examples: [
    { title: 'Webprestatie-optimalisatie', text: 'JPEG-fotos van 2MB geconverteerd naar WebP met drastische reductie.' },
    { title: 'E-mailbijlage verkleinen', text: 'PNG van 15MB geconverteerd naar JPEG voor e-mailverzending.' }
  ],
  mistakes: [
    'JPEG gebruiken voor tekst en logos. Artefacten verschijnen.',
    'Kwaliteit te laag instellen. Begin op 80%.',
    'Afbeeldingen vergroten. Veroorzaakt pixelvorming.'
  ],
  faq: [
    { question: 'Worden mijn afbeeldingen naar een server geupload?', answer: 'Nee. Alles gebeurt in uw browser.' },
    { question: 'Maximale bestandsgrootte?', answer: 'Geen expliciete limiet. Boven 5000 pixels mogelijke prestatieproblemen.' },
    { question: 'Welk formaat voor web?', answer: 'WebP biedt de beste compressie-kwaliteit verhouding.' },
    { question: 'Behoudt het EXIF?', answer: 'Nee. Metadata wordt verwijderd.' }
  ],
  limitations: [
    'Geen ondersteuning voor geanimeerde afbeeldingen.',
    'CMYK-kleurprofielen niet ondersteund.',
    'Bestandsgrootte schattingen zijn bij benadering.'
  ],
  verificationSteps: [
    'Converteer een JPEG naar WebP op 80% en controleer de grootte.',
    'Controleer transparantiebehoud voor PNG.'
  ]
};

nl['svg-optimizer'] = {
  name: 'SVG Optimalisatie Tool',
  summary: 'Optimaliseer SVG-bestanden door commentaar, metadata en witruimte te verwijderen. Voor/na vergelijking. Lokale verwerking.',
  whatIs: 'Browsergebaseerde tool die SVG-bestandsgroottes vermindert door elementen te verwijderen die de visuele uitvoer niet beïnvloeden.',
  quickAnswer: 'Verwijder commentaar, metadata en overtollige witruimte uit SVG-bestanden. Voor/na groottevergelijking. Lokaal en gratis.',
  howToUse: [
    'Plak SVG-markup of upload een SVG-bestand.',
    'De tool verwerkt en toont het resultaat.',
    'Bekijk de groottevergelijking.',
    'Kopieer of download de geoptimaliseerde SVG.'
  ],
  useCases: [
    'SVG-bestandsgroottes verminderen voor webgebruik.',
    'SVG-s opschonen voor commit in repository.',
    'SVG-s voorbereiden voor CSS-data-URI.'
  ],
  examples: [
    { title: 'Figma-export opschoning', text: 'SVG-iconen van 4KB gereduceerd tot gemiddeld 1,2KB.' },
    { title: 'Inline SVG prestatieverbetering', text: 'Hero-SVG van 28KB gereduceerd tot 9KB.' }
  ],
  mistakes: [
    'Aannemen dat een kleinere SVG visueel identiek is.',
    'Het viewBox-attribuut verwijderen.',
    'Herbruikbare symbooldefinities over het hoofd zien.'
  ],
  faq: [
    { question: 'Wat verwijdert de tool?', answer: 'XML-commentaar, metadata, lege groepen, overtollige witruimte.' },
    { question: 'Minimaliseert het padgegevens?', answer: 'Nee, het richt zich op structurele opschoning.' },
    { question: 'Breekt het inline CSS?', answer: 'Nee. Inline CSS en styles blijven behouden.' }
  ],
  limitations: [
    'Alleen structurele opschoning.',
    'SVG met ingesloten rasterafbeeldingen: weinig winst.',
    'Niet-standaard namespace prefixes niet herkend.'
  ],
  verificationSteps: [
    'Optimaliseer een SVG en controleer of metadata is verwijderd.',
    'Vergelijk de weergave voor en na in een browser.'
  ]
};

nl['svg-to-css-data-uri-converter'] = {
  name: 'SVG naar CSS Data URI Converter',
  summary: 'Converteer SVG-markup naar CSS-data-URI. URL-gecodeerde en Base64-opties met live voorvertoning.',
  whatIs: 'Transformeert ruwe SVG-markup naar data-URI-s voor CSS en HTML. Ondersteunt URL-codering en Base64-codering.',
  quickAnswer: 'Krijg CSS-compatibele data-URI-s vanuit SVG. URL-gecodeerd of Base64. background-image, mask, img src.',
  howToUse: [
    'Plak uw SVG-markup.',
    'Kies codering: URL (aanbevolen) of Base64.',
    'Selecteer het uitvoerformaat.',
    'Kopieer de code naar uw CSS of HTML.'
  ],
  useCases: [
    'SVG-iconen direct in CSS background-image insluiten.',
    'SVG-data-URI-s gebruiken in CSS mask-image.',
    'Kleine SVG-s insluiten in e-mails.'
  ],
  examples: [
    { title: 'CSS-sprite-vrije iconen', text: '10 SVG-iconen geconverteerd naar data-URI-s en ingesloten in de stylesheet.' },
    { title: 'Zelfstandige e-mailhandtekening', text: 'Logo-SVG geconverteerd naar Base64 data-URI voor e-mailhandtekening.' }
  ],
  mistakes: [
    'Base64 onnodig gebruiken. URL-codering is compacter.',
    'Vergeten witruimte te verwijderen voor coderen.',
    'Data-URI-s voor grote SVG-s (meer dan 2-4KB).'
  ],
  faq: [
    { question: 'Welke codering is beter?', answer: 'URL-codering, ongeveer 10-20% kleiner dan Base64.' },
    { question: 'Werkt het in alle browsers?', answer: 'Ja, in alle moderne browsers (Chrome, Firefox, Safari, Edge).' },
    { question: 'In inline style-attributen?', answer: 'Ja, let op aanhalingstekens.' },
    { question: 'Maximale grootte?', answer: 'Houd het onder 2KB voor prestaties.' }
  ],
  limitations: [
    'Data-URI-s boven 4KB afgeraden.',
    'Geen SVG-syntaxvalidatie.',
    'Browserafhankelijk gedrag voor mask-image.'
  ],
  verificationSteps: [
    'Converteer een SVG-cirkel met URL-codering en controleer de weergave.',
    'Vergelijk met de Base64-weergave.'
  ]
};

console.log('NL ready');

// ─── MERGE INTO locales.json ───

const allLocaleData = { de, fr, es, ja, nl };
const toolIds = Object.keys(de);

Object.keys(allLocaleData).forEach(locale => {
  if (!locales[locale].tools) {
    locales[locale].tools = {};
  }
  Object.keys(allLocaleData[locale]).forEach(toolId => {
    locales[locale].tools[toolId] = allLocaleData[locale][toolId];
  });
  console.log(locale + ': ' + Object.keys(allLocaleData[locale]).length + ' tools merged');
});

fs.writeFileSync('data/locales.json', JSON.stringify(locales, null, 2), 'utf8');
console.log('\\nDONE! All translations written to locales.json');
