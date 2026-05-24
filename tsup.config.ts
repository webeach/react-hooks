import { defineConfig } from 'tsup';

import { readdirSync, statSync } from 'node:fs';

const hookNames = readdirSync('src/hooks').filter((name) => {
  if (name.startsWith('_')) {
    return false;
  }
  return statSync(`src/hooks/${name}`).isDirectory();
});

const hookEntries = Object.fromEntries(
  hookNames.map((name) => [
    `hooks/${name}/index`,
    `src/hooks/${name}/index.ts`,
  ]),
);

const entry = { index: 'src/index.ts', ...hookEntries };

export default defineConfig([
  {
    entry,
    format: 'esm',
    outDir: 'dist/esm',
    target: 'es2022',
    sourcemap: true,
    dts: true,
    clean: true,
    splitting: true,
  },
  {
    entry,
    format: 'cjs',
    outDir: 'dist/cjs',
    target: 'es2022',
    sourcemap: true,
    dts: true,
    clean: false,
  },
]);
