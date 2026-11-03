// Erzeugt css/tokens.css aus docs/tokens.json (Kopie aus dem Design System „Brainbite“).
// Aufruf: node scripts/build-tokens.mjs
import { readFile, writeFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const tokens = JSON.parse(await readFile(new URL('docs/tokens.json', root), 'utf8'));

const dark = [];
const light = [];
const shared = [];

for (const t of tokens.color.tokens) {
  dark.push(`  --${t.name}: ${t.value.dark};`);
  light.push(`  --${t.name}: ${t.value.light};`);
}
for (const t of tokens.shadow.tokens) {
  if (typeof t.value === 'object') {
    dark.push(`  --${t.name}: ${t.value.dark};`);
    light.push(`  --${t.name}: ${t.value.light};`);
  } else {
    shared.push(`  --${t.name}: ${t.value};`);
  }
}
for (const group of ['spacing', 'radius', 'blur']) {
  for (const t of tokens[group].tokens) shared.push(`  --${t.name}: ${t.value};`);
}
shared.push(`  --font-sans: ${tokens.type.families.sans};`);
shared.push(`  --font-serif: ${tokens.type.families.serif};`);
for (const g of tokens.type.groups) {
  for (const s of g.styles) {
    shared.push(`  --${s.name}-size: ${s.fontSize};`);
    shared.push(`  --${s.name}-line: ${s.lineHeight};`);
    if (s.fontWeight) shared.push(`  --${s.name}-weight: ${s.fontWeight};`);
    if (s.letterSpacing) shared.push(`  --${s.name}-tracking: ${s.letterSpacing};`);
  }
}

const css = `/* Automatisch erzeugt aus docs/tokens.json (Design System „Brainbite“ v${tokens.version}).
   Nicht von Hand ändern: node scripts/build-tokens.mjs */

:root {
${shared.join('\n')}
}

/* Dunkel ist der Hauptmodus */
:root,
:root[data-theme='dark'] {
  color-scheme: dark;
${dark.join('\n')}
}

:root[data-theme='light'] {
  color-scheme: light;
${light.join('\n')}
}

@media (prefers-color-scheme: light) {
  :root:not([data-theme='dark']) {
    color-scheme: light;
${light.map((l) => '  ' + l).join('\n')}
  }
}
`;

await writeFile(new URL('css/tokens.css', root), css);
console.log('css/tokens.css geschrieben');
