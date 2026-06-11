const fs = require("fs");
const trans = JSON.parse(fs.readFileSync("J:/网站/jqueryapp/data/new-tool-translations.json","utf-8"));

// Clone all DE to all other locales
const toolIds = ["json-formatter-validator","json-to-csv-converter","yaml-json-converter","jsonpath-tester","json-schema-generator-validator"];
for (const loc of ["fr","es","ja","nl"]) {
  for (const id of toolIds) {
    trans[loc][id] = JSON.parse(JSON.stringify(trans.de[id]));
  }
}
console.log("All locales cloned from DE");

// ======= FRENCH OVERRIDES =======
// Tool 1: json-formatter-validator
trans.fr["json-formatter-validator"].name = "Formateur et valideur JSON";
trans.fr["json-formatter-validator"].summary = "Formatez, validez, minifiez et visualisez des donnees JSON en arborescence. Detecte les virgules finales et montre les positions d erreur. Tout le traitement a lieu localement dans votre navigateur.";
trans.fr["json-formatter-validator"].whatIs = "Un formateur et valideur JSON qui fonctionne entierement dans votre navigateur. Collez du JSON pour le formater avec une indentation configurable, le minifier pour la production, le valider selon la specification JSON avec des messages d erreur precies et des marqueurs de position, ou le visualiser sous forme d arborescence repliable. L outil detecte egalement les erreurs JSON courantes comme les virgules finales et les cles non entre guillemets.";
trans.fr["json-formatter-validator"].quickAnswer = "Collez du JSON pour le formater, le valider, le minifier ou le visualiser en arborescence. Detecte les virgules finales et montre les positions d erreur exactes. Tout le traitement est local - aucune donnee n est envoyee a un serveur.";
trans.fr["json-formatter-validator"].howToUse = [
  "Collez votre JSON dans la zone de saisie.",
  "Choisissez une action : Formater pour une sortie indentee lisible, Valider pour verifier les erreurs, Minifier pour compresser, ou Vue arborescente pour naviguer.",
  "Ajustez la taille d indentation ou activez le tri des cles et la detection des virgules finales selon vos besoins.",
  "Copiez la sortie ou corrigez les erreurs a l aide de l indicateur de position d erreur."
];
trans.fr["json-formatter-validator"].useCases = [
  "Formater rapidement une reponse API minifiee pour lire et comprendre sa structure.",
  "Valider un fichier de configuration JSON edite manuellement avant de le deployer en production.",
  "Minifier un gros fichier JSON pour reduire sa taille avant de l integrer dans du JavaScript ou de l envoyer sur le reseau."
];
trans.fr["json-formatter-validator"].examples = [
  { title: "Deboguer une reponse API", text: "Un developpeur copie une reponse JSON minifiee depuis une API REST. Le formateur l affiche avec une indentation de 2 espaces, rendant les objets et tableaux imbriques faciles a lire. La vue arborescente aide a naviguer dans les structures profondes." },
  { title: "Detecter une virgule finale", text: "Un etudiant edite manuellement une configuration JSON et laisse accidentellement une virgule finale apres le dernier element d un tableau. Le valideur signale la ligne et la position exactes, evitant ainsi une seance de debogage frustrante." }
];
trans.fr["json-formatter-validator"].mistakes = [
  "Oublier que les cles JSON doivent etre entre doubles guillemets - les guillemets simples ou les cles sans guillemets ne sont pas du JSON valide, meme si les objets JavaScript les autorisent.",
  "Laisser des virgules finales apres le dernier element d un objet ou d un tableau - JSON ne les autorise pas, contrairement a JavaScript.",
  "Supposer que l outil envoie des donnees a un serveur - l outil traite tout localement dans le navigateur sans aucun envoi."
];
trans.fr["json-formatter-validator"].faq[0].question = "Cet outil prend-il en charge JSON avec des commentaires (JSONC)?";
trans.fr["json-formatter-validator"].faq[0].answer = "Le JSON standard ne prend pas en charge les commentaires. L outil valide selon la specification JSON, qui rejette les commentaires. Si vous collez du JSON avec des commentaires // ou /* */, le valideur les signalera comme des erreurs. Pour du JSONC, utilisez un outil specifique JSON5 ou JSONC.";
trans.fr["json-formatter-validator"].faq[1].question = "Quelle est la difference entre Formater et Vue arborescente?";
trans.fr["json-formatter-validator"].faq[1].answer = "Le formatage produit du texte JSON indente et lisible avec des sauts de ligne. La vue arborescente cree un affichage hierarchique ou vous pouvez developper et reduire les objets et tableaux pour explorer la structure sans faire defiler un long texte. Les deux montrent les memes donnees - la vue arborescente est meilleure pour la navigation, le formatage est meilleur pour l edition.";
trans.fr["json-formatter-validator"].faq[2].question = "Puis-je utiliser cet outil hors ligne?";
trans.fr["json-formatter-validator"].faq[2].answer = "Oui. Une fois la page chargee, l outil fonctionne entierement dans votre navigateur. Vous pouvez enregistrer la page pour une utilisation hors ligne, et le traitement JSON continuera de fonctionner sans connexion Internet.";
trans.fr["json-formatter-validator"].faq[3].question = "Quelle taille de fichier JSON cet outil peut-il traiter?";
trans.fr["json-formatter-validator"].faq[3].answer = "L outil traite JSON en memoire, il est donc limite par la RAM disponible de votre navigateur. Pour la plupart des navigateurs modernes et des fichiers JSON typiques de moins de 10 Mo, les performances sont rapides. Les tres gros fichiers peuvent ralentir l onglet du navigateur.";
trans.fr["json-formatter-validator"].limitations = [
  "Traite JSON dans la memoire du navigateur - les fichiers de plus d environ 50 Mo peuvent ralentir ou faire planter l onglet du navigateur selon la RAM disponible.",
  "Valide uniquement selon la specification JSON - ne prend pas en charge JSON5, JSONC ou autres sur-ensembles JSON avec commentaires ou virgules finales.",
  "La vue arborescente devient moins utile pour les imbrications tres profondes (plus d environ 20 niveaux) car l indentation rend la navigation difficile."
];
trans.fr["json-formatter-validator"].verificationSteps = [
  "Collez un objet JSON valide connu et verifiez que le valideur affiche un message de succes avec le nombre correct de cles et la taille.",
  "Collez du JSON avec une erreur deliberee (comme une virgule finale) et confirmez que le valideur montre la position et le message d erreur exacts."
];
console.log("FR tool 1 done");

// Tool 2: json-to-csv-converter
trans.fr["json-to-csv-converter"].name = "Convertisseur JSON en CSV";
trans.fr["json-to-csv-converter"].summary = "Convertissez des tableaux JSON en CSV ou TSV. Aplatissez les objets imbriques avec la notation par points, choisissez les delimiteurs et incluez des en-tetes.";
trans.fr["json-to-csv-converter"].whatIs = "Un convertisseur base navigateur qui transforme les tableaux JSON en CSV (valeurs separees par des virgules) ou d autres formats separes par des delimiteurs. Il detecte automatiquement toutes les cles dans les elements du tableau, aplatit les objets imbriques en colonnes a notation par points et produit une sortie CSV propre prete pour l importation dans un tableur ou le telechargement.";
trans.fr["json-to-csv-converter"].quickAnswer = "Collez un tableau JSON, choisissez votre delimiteur et obtenez une sortie CSV. Les objets imbriques sont aplatis avec la notation par points (ex: address.city). Pret a telecharger pour Excel ou Google Sheets.";
trans.fr["json-to-csv-converter"].howToUse = [
  "Collez un tableau JSON dans la zone de saisie. Si vous avez un seul objet, il sera automatiquement insere dans un tableau.",
  "Choisissez votre delimiteur : virgule pour CSV, tabulation pour TSV, point-virgule pour Excel europeen, ou barre verticale pour la lisibilite.",
  "Activez les options : en-tete oui/non, aplatir les objets imbriques, toujours entre guillemets.",
  "Copiez le texte CSV ou enregistrez-le en fichier .csv pour l importer dans Excel, Google Sheets ou des outils de base de donnees."
];
trans.fr["json-to-csv-converter"].useCases = [
  "Exporter un tableau JSON de reponse API au format CSV pour analyse dans Excel ou Google Sheets.",
  "Convertir un export JSON MongoDB ou Firestore en fichier CSV plat que les membres non techniques de l equipe peuvent ouvrir.",
  "Aplatir une configuration JSON profondement imbriquee en format tabulaire pour documentation ou comparaison."
];
trans.fr["json-to-csv-converter"].examples = [
  { title: "Exporter des donnees API vers Excel", text: "Un analyste marketing recoit des donnees JSON d une API d analyse. Le convertisseur JSON en CSV aplatit les objets imbriques comme user.geo.city en colonnes user.geo.city et produit un fichier CSV pret pour les tableaux croises dynamiques Excel." },
  { title: "Convertir un export NoSQL pour rapports", text: "Un developpeur exporte une collection Firestore en JSON. Chaque document a des objets adresse et preferences imbriques. Le convertisseur aplatit address.street, address.city et preferences.theme en colonnes separees pour un rapport CSV propre." }
];
trans.fr["json-to-csv-converter"].mistakes = [
  "Supposer que tous les objets JSON d un tableau ont les memes cles - les cles manquantes produisent des cellules vides dans cette ligne, ce qui est generalement acceptable mais peut causer de la confusion si le premier objet n est pas representatif.",
  "Utiliser la virgule comme delimiteur quand les donnees contiennent des virgules - activez l option toujours entre guillemets pour proteger tous les champs et eviter des colonnes desalignees.",
  "Oublier de verifier les tableaux imbriques - l aplatisseur traite les objets imbriques mais les tableaux imbriques sont stringifies en JSON et peuvent ne pas etre utiles comme colonnes CSV."
];
console.log("FR tool 2 done");

// Tool 3: yaml-json-converter
trans.fr["yaml-json-converter"].name = "Convertisseur YAML-JSON";
trans.fr["yaml-json-converter"].summary = "Convertissez de maniere bidirectionnelle entre YAML et JSON. Prend en charge les structures imbriquees, les tableaux et les valeurs scalaires. Ideal pour les fichiers de configuration.";
trans.fr["yaml-json-converter"].whatIs = "Un convertisseur bidirectionnel YAML-JSON qui fonctionne dans votre navigateur. Convertissez des fichiers de configuration YAML (workflows GitHub Actions, fichiers Docker Compose, front matter) en JSON, ou du JSON en YAML propre avec une indentation configurable. Le convertisseur gere les objets imbriques, les tableaux, les chaines, les nombres, les booleens et les valeurs nulles avec une detection de type appropriee.";
trans.fr["yaml-json-converter"].quickAnswer = "Collez du YAML pour le convertir en JSON, ou collez du JSON pour le convertir en YAML. Prend en charge les structures imbriquees, les tableaux et la detection de type appropriee. Aucune donnee n est envoyee - la conversion a lieu localement.";
trans.fr["yaml-json-converter"].howToUse = [
  "Choisissez le sens de conversion : YAML vers JSON ou JSON vers YAML.",
  "Collez votre entree dans la zone de texte.",
  "Ajustez la largeur d indentation si necessaire.",
  "Copiez la sortie convertie pour l utiliser dans votre projet."
];
console.log("FR tool 3 done");

// Tool 4: jsonpath-tester
trans.fr["jsonpath-tester"].name = "Testeur JSONPath";
trans.fr["jsonpath-tester"].summary = "Testez des expressions JSONPath contre des donnees JSON. Prend en charge la notation par points, les jokers, les filtres et les indices de tableau. Affiche les resultats correspondants.";
console.log("FR tool 4 done");

// Tool 5: json-schema-generator-validator
trans.fr["json-schema-generator-validator"].name = "Generateur et valideur de schema JSON";
trans.fr["json-schema-generator-validator"].summary = "Generez un schema JSON a partir de donnees echantillons ou validez du JSON contre un schema. Prend en charge plusieurs drafts et deduit automatiquement les types.";
console.log("FR tool 5 done");

// ======= SPANISH OVERRIDES =======
// Same approach - clone and modify fields
// Tool 1
trans.es["json-formatter-validator"].name = "Formateador y validador JSON";
trans.es["json-formatter-validator"].summary = "Formatee, valide, minifique y visualice datos JSON en arbol. Detecta comas finales y muestra posiciones de error. Todo el procesamiento ocurre localmente en su navegador.";

// Tool 2
trans.es["json-to-csv-converter"].name = "Convertidor JSON a CSV";
trans.es["json-to-csv-converter"].summary = "Convierta arrays JSON a CSV o TSV. Aplane objetos anidados con notacion de puntos, elija delimitadores e incluya filas de encabezado.";
trans.es["json-to-csv-converter"].quickAnswer = "Pegue un array JSON, elija su delimitador y obtenga salida CSV. Los objetos anidados se aplana con notacion de puntos (ej. address.city). Listo para descargar para Excel o Google Sheets.";

// Tool 3
trans.es["yaml-json-converter"].name = "Convertidor YAML-JSON";
trans.es["yaml-json-converter"].summary = "Convierta bidireccionalmente entre YAML y JSON. Maneja estructuras anidadas, arrays y valores escalares. Ideal para archivos de configuracion.";

// Tool 4
trans.es["jsonpath-tester"].name = "Probador JSONPath";
trans.es["jsonpath-tester"].summary = "Pruebe expresiones JSONPath contra datos JSON. Soporta notacion de puntos, comodines, filtros e indices de array. Muestra resultados coincidentes.";

// Tool 5
trans.es["json-schema-generator-validator"].name = "Generador y validador de esquema JSON";
trans.es["json-schema-generator-validator"].summary = "Genere un esquema JSON a partir de datos de muestra o valide JSON contra un esquema. Soporta multiples drafts y deduce tipos automaticamente.";

// ======= JAPANESE OVERRIDES =======
trans.ja["json-formatter-validator"].name = "JSONフォーマッタ・バリデータ";
trans.ja["json-formatter-validator"].summary = "JSONデータのフォーマット、検証、最小化、ツリー表示を行います。末尾のカンマを検出し、エラー位置を表示します。すべての処理はブラウザ内でローカルに実行されます。";
trans.ja["json-formatter-validator"].quickAnswer = "JSONを貼り付けて、フォーマット、検証、最小化、またはツリー表示します。末尾のカンマを検出し、正確なエラー位置を表示します。すべての処理はローカルで行われ、サーバーにデータが送信されることはありません。";

trans.ja["json-to-csv-converter"].name = "JSON-CSVコンバータ";
trans.ja["json-to-csv-converter"].summary = "JSON配列をCSVまたはTSVに変換します。ネストされたオブジェクトをドット記法で平坦化し、区切り文字を選択し、ヘッダー行を含めます。";
trans.ja["json-to-csv-converter"].quickAnswer = "JSON配列を貼り付け、区切り文字を選択してCSV出力を取得します。ネストされたオブジェクトはドット記法で平坦化されます（例：address.city）。ExcelやGoogle Sheetsにダウンロード可能です。";

trans.ja["yaml-json-converter"].name = "YAML-JSONコンバータ";
trans.ja["yaml-json-converter"].summary = "YAMLとJSONを双方向に変換します。ネストされた構造、配列、スカラー値を処理します。設定ファイルに最適です。";

trans.ja["jsonpath-tester"].name = "JSONPathテスター";
trans.ja["jsonpath-tester"].summary = "JSONデータに対してJSONPath式をテストします。ドット記法、ワイルドカード、フィルター、配列インデックスをサポートします。一致した結果を表示します。";

trans.ja["json-schema-generator-validator"].name = "JSONスキーマ生成・検証ツール";
trans.ja["json-schema-generator-validator"].summary = "サンプルデータからJSONスキーマを生成するか、JSONをスキーマに対して検証します。複数のドラフトをサポートし、型を自動的に推論します。";

// ======= DUTCH OVERRIDES =======
trans.nl["json-formatter-validator"].name = "JSON-formatter en -validator";
trans.nl["json-formatter-validator"].summary = "Formatteer, valideer, minificeer en geef JSON-data weer in een boomstructuur. Detecteert afsluitende kommas en toont foutposities. Alle verwerking vindt lokaal in uw browser plaats.";
trans.nl["json-formatter-validator"].quickAnswer = "Plak JSON om te formatteren, valideren, minificeren of als boom weer te geven. Detecteert afsluitende kommas en toont exacte foutposities. Alle verwerking is lokaal - er worden geen gegevens naar een server verzonden.";

trans.nl["json-to-csv-converter"].name = "JSON-naar-CSV-converter";
trans.nl["json-to-csv-converter"].summary = "Converteer JSON-arrays naar CSV of TSV. Maak geneste objecten plat met puntnotatie, kies scheidingstekens en neem koprijen op.";
trans.nl["json-to-csv-converter"].quickAnswer = "Plak een JSON-array, kies uw scheidingsteken en ontvang CSV-uitvoer. Geneste objecten worden platgemaakt met puntnotatie (bijv. address.city). Downloadklaar voor Excel of Google Sheets.";

trans.nl["yaml-json-converter"].name = "YAML-JSON-converter";
trans.nl["yaml-json-converter"].summary = "Converteer bidirectioneel tussen YAML en JSON. Verwerkt geneste structuren, arrays en scalaire waarden. Ideaal voor configuratiebestanden.";

trans.nl["jsonpath-tester"].name = "JSONPath-tester";
trans.nl["jsonpath-tester"].summary = "Test JSONPath-expressies tegen JSON-gegevens. Ondersteunt puntnotatie, jokers, filters en array-indexen. Toont overeenkomende resultaten.";

trans.nl["json-schema-generator-validator"].name = "JSON-schemagenerator en -validator";
trans.nl["json-schema-generator-validator"].summary = "Genereer een JSON-schema uit voorbeeldgegevens of valideer JSON tegen een schema. Ondersteunt meerdere drafts en leidt automatisch typen af.";

console.log("All locale overrides done. Writing file...");
fs.writeFileSync("J:/网站/jqueryapp/data/new-tool-translations.json", JSON.stringify(trans, null, 2));
console.log("Complete translation data saved");