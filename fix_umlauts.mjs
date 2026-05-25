import fs from 'fs';

let data = fs.readFileSync('data/locales.json', 'utf8');

// Fix für followed by any letter without space (including uppercase)
data = data.replace(/für([A-Za-z])/g, 'für $1');

// Fix specific German umlaut issues - only fix if not already correct
const replacements = [
  ['Über uns', 'Über uns'],       // already correct, skip
  ['Uber uns', 'Über uns'],
  ['Tool öffnen', 'Tool öffnen'],
  ['Tool offnen', 'Tool öffnen'],
  ['Sammlung öffnen', 'Sammlung öffnen'],
  ['Sammlung offnen', 'Sammlung öffnen'],
  ['Abstände', 'Abstände'],
  ['Abstaende', 'Abstände'],
  ['Abläufe', 'Abläufe'],
  ['Ablaufe', 'Abläufe'],
  ['einfügen', 'einfügen'],
  ['einfugen', 'einfügen'],
  ['geprüften', 'geprüften'],
  ['gepruften', 'geprüften'],
  ['übersehen', 'übersehen'],
  ['ubersehen', 'übersehen'],
  ['können', 'können'],
  ['konnen', 'können'],
  ['Blogbeiträge', 'Blogbeiträge'],
  ['Blogbeitrage', 'Blogbeiträge'],
  ['Übersetzte', 'Übersetzte'],
  ['Ubersetzte', 'Übersetzte'],
  ['übersetzte', 'übersetzte'],
  ['ubersetzte', 'übersetzte'],
  ['Überschriften', 'Überschriften'],
  ['Uberschriften', 'Überschriften'],
  ['übersprungene', 'übersprungene'],
  ['ubersprungene', 'übersprungene'],
  ['Übergangs', 'Übergangs'],
  ['Ubergangs', 'Übergangs'],
  ['gegenüber', 'gegenüber'],
  ['gegenuber', 'gegenüber'],
  ['hinzufügen', 'hinzufügen'],
  ['hinzufugen', 'hinzufügen'],
  ['fehleranfällig', 'fehleranfällig'],
  ['fehleranfallig', 'fehleranfällig'],
  ['über', 'über'],
  ['uber', 'über'],
  ['hängt', 'hängt'],
  ['hangt', 'hängt'],
  ['Füge', 'Füge'],
  ['Fuge', 'Füge'],
  ['übliche', 'übliche'],
  ['ubliche', 'übliche'],
];

for (const [from, to] of replacements) {
  // Only replace if 'from' exists and 'to' doesn't already exist (or from == to for already-correct)
  // Actually, just always try replacing 'from' with 'to'
  // But be careful not to double-replace (e.g., if 'über' is already correct, don't turn it into 'üüber')
  if (from !== to && data.includes(from)) {
    // Use a non-regex approach to avoid escaping issues
    let idx = data.indexOf(from);
    while (idx !== -1) {
      // Check if the 'to' version already exists at this position (to avoid double-replace)
      const potentialMatch = data.substring(idx, idx + to.length);
      if (potentialMatch !== to) {
        data = data.substring(0, idx) + to + data.substring(idx + from.length);
      }
      idx = data.indexOf(from, idx + to.length);
    }
  }
}

// Fix specific patterns
data = data.replace(/Schriftgroßen/g, 'Schriftgrößen');

// Also fix standalone lowercase issues
// "uber" standalone (not part of "Über" or "übersetzte" etc.)
// These should have been caught above

fs.writeFileSync('data/locales.json', data, 'utf8');
console.log('All German umlaut fixes applied.');

// Verify
const remaining = [];
const patterns = [/[Uu]ber(?![A-Za-z])/, /offnen/, /[Aa]blaufe/, /[Aa]bstaende/, /einfugen/, /gepruften/, /ubersehen/, /konnen/, /[Bb]logbeitrage/, /[Uu]bersetzte/, /[Uu]berschriften/, /ubersprungene/, /[Uu]bergangs/, /gegenuber/, /hinzufugen/, /fehleranfallig/, /hangt/, /Fuge/, /ubliche/];
for (const p of patterns) {
  const matches = data.match(p);
  if (matches) {
    remaining.push(...matches);
  }
}
if (remaining.length > 0) {
  console.log('Remaining issues:', [...new Set(remaining)]);
} else {
  console.log('No remaining umlaut issues found.');
}
