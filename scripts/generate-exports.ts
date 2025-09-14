// Run: pnpm run generate-exports
import fs from 'fs';
import path from 'path';

type ExportTarget = {
  import: string; // ESM .js
  require: string; // CJS .cjs
  types: string; // .d.ts
};

type PackageJson = {
  name?: string;
  type?: 'module' | 'commonjs';
  exports?: Record<string, Partial<ExportTarget> | string>;
  [k: string]: any;
};

const ROOT = process.cwd();
const LIB_DIR = 'lib';
const SRC_HOOKS_PATH = path.join(ROOT, 'src', 'hooks');

function hookToLibPaths(hook: string) {
  return {
    types: `./${LIB_DIR}/types/hooks/${hook}/index.d.ts`,
    import: `./${LIB_DIR}/esm/hooks/${hook}/index.js`,
    require: `./${LIB_DIR}/cjs/hooks/${hook}/index.js`,
  };
}

function rootLibPaths() {
  return {
    types: `./${LIB_DIR}/types/index.d.ts`,
    import: `./${LIB_DIR}/esm/index.js`,
    require: `./${LIB_DIR}/cjs/index.js`,
  };
}

async function readJson<T = any>(file: string): Promise<T> {
  const raw = await fs.promises.readFile(file, 'utf8');
  return JSON.parse(raw) as T;
}

async function writeJson(file: string, data: unknown) {
  const content = JSON.stringify(data, null, 2) + '\n';
  await fs.promises.writeFile(file, content, 'utf8');
}

async function ensureExists(dir: string) {
  try {
    await fs.promises.access(dir);
  } catch {
    throw new Error(`Directory not found: ${dir}`);
  }
}

function looksLikeHookName(name: string) {
  return /^use[A-Z0-9_]/.test(name);
}

async function listHooks(srcHooksDir: string): Promise<string[]> {
  const items = await fs.promises.readdir(srcHooksDir, { withFileTypes: true });

  const hooks = new Set<string>();

  for (const it of items) {
    if (it.isDirectory()) {
      const dirName = it.name;

      if (looksLikeHookName(dirName)) {
        hooks.add(dirName);
      }
    }
  }

  return [...hooks].sort((a, b) => a.localeCompare(b));
}

function buildExportsMap(
  hooks: string[],
): Record<string, ExportTarget | string> {
  const map: Record<string, ExportTarget | string> = {};

  // root export "."
  map['.'] = rootLibPaths();

  // Subpaths for each hook: "./useXxx"
  for (const hook of hooks) {
    map[`./${hook}`] = hookToLibPaths(hook);
  }

  return map;
}

async function main() {
  console.log(`\n▶ generate-exports`);

  await ensureExists(SRC_HOOKS_PATH);

  const pkgPath = path.join(ROOT, 'package.json');
  const pkg = await readJson<PackageJson>(pkgPath);

  const hooks = await listHooks(SRC_HOOKS_PATH);
  if (hooks.length === 0) {
    console.warn('⚠️  Hooks not found in src/hooks. Nothing to export.');
  } else {
    console.log(`✔ Found hooks: ${hooks.join(', ')}`);
  }

  const exportsMap = buildExportsMap(hooks);

  const preservedKeys = new Set(Object.keys(pkg.exports ?? {}));
  const newKeys = new Set(Object.keys(exportsMap));
  const customKeys = [...preservedKeys].filter((k) => !newKeys.has(k));

  if (customKeys.length) {
    console.warn(
      `⚠️  Existing custom export keys will be removed: ${customKeys.join(', ')}`,
    );
  }

  // Update package.json
  const nextPkg: PackageJson = { ...pkg, exports: exportsMap };

  const backupPath = pkgPath.replace(/\.json$/, '.backup.json');

  await writeJson(backupPath, pkg);
  await writeJson(pkgPath, nextPkg);
  console.log(
    `\n✅ package.json updated. Backup saved to ${path.basename(backupPath)}\n`,
  );

  console.log(`  - Root: ${LIB_DIR}/index.{js,cjs,d.ts}`);
  console.log(`  - Hooks: ${LIB_DIR}/<hook>/index.{js,cjs,d.ts}`);
}

main().catch((error) => {
  console.error('✖ generate-exports failed:', error);
  process.exit(1);
});
