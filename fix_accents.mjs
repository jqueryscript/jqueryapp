import fs from 'fs';

let data = fs.readFileSync('data/locales.json', 'utf8');

// Fix 1: English section - stray Spanish accent
data = data.replace('"Práctical examples"', '"Practical examples"');

// Fix 2: Dutch section - "públicatie" should be "publicatie" (no accent in Dutch)
// These are only in the nl section
const nlStart = data.indexOf('"nl"');
const nlEnd = data.length - 1; // nl is the last locale
const nlSection = data.substring(nlStart, nlEnd);
let nlFixed = nlSection.replace(/públicatie/g, 'publicatie');
nlFixed = nlFixed.replace(/Públicatie/g, 'Publicatie');
nlFixed = nlFixed.replace(/públicatiemap/g, 'publicatiemap');
data = data.substring(0, nlStart) + nlFixed;

// Fix 3: Some remaining "públic" words in other sections that might have been missed
// Also fix any remaining "versión" in non-Spanish contexts
// These should have been caught already but double-check

fs.writeFileSync('data/locales.json', data, 'utf8');
console.log('Final fixes applied.');
console.log('Checking for remaining "públic" instances...');
const remaining = data.match(/públic[^"]/g);
if (remaining) {
  console.log('Remaining públic issues:', [...new Set(remaining)]);
} else {
  console.log('No remaining públic issues.');
}
