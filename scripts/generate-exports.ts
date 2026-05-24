// Run: pnpm run generate-exports
import fs from 'node:fs';
import path from 'node:path';

type ExportTarget = {
  import: { types: string; default: string };
  require: { types: string; default: string };
};

type PackageJson = {
  name?: string;
  type?: 'module' | 'commonjs';
  exports?: Record<string, ExportTarget | string>;
  [k: string]: unknown;
};

const ROOT = process.cwd();
const DIST_DIR = 'dist';
const SRC_HOOKS_PATH = path.join(ROOT, 'src', 'hooks');

function rootPaths(): ExportTarget {
  return {
    import: {
      types: `./${DIST_DIR}/esm/index.d.ts`,
      default: `./${DIST_DIR}/esm/index.js`,
    },
    require: {
      types: `./${DIST_DIR}/cjs/index.d.cts`,
      default: `./${DIST_DIR}/cjs/index.cjs`,
    },
  };
}

function hookPaths(hook: string): ExportTarget {
  return {
    import: {
      types: `./${DIST_DIR}/esm/hooks/${hook}/index.d.ts`,
      default: `./${DIST_DIR}/esm/hooks/${hook}/index.js`,
    },
    require: {
      types: `./${DIST_DIR}/cjs/hooks/${hook}/index.d.cts`,
      default: `./${DIST_DIR}/cjs/hooks/${hook}/index.cjs`,
    },
  };
}

async function readJson<T>(file: string): Promise<T> {
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
    if (it.isDirectory() && looksLikeHookName(it.name)) {
      hooks.add(it.name);
    }
  }

  return [...hooks].sort((a, b) => a.localeCompare(b));
}

function buildExportsMap(hooks: string[]): Record<string, ExportTarget> {
  const map: Record<string, ExportTarget> = {};

  map['.'] = rootPaths();

  for (const hook of hooks) {
    map[`./${hook}`] = hookPaths(hook);
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
    console.log(`✔ Found ${hooks.length} hooks`);
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

  const nextPkg: PackageJson = { ...pkg, exports: exportsMap };

  const backupPath = pkgPath.replace(/\.json$/, '.backup.json');
  await writeJson(backupPath, pkg);
  await writeJson(pkgPath, nextPkg);

  console.log(
    `\n✅ package.json updated. Backup saved to ${path.basename(backupPath)}\n`,
  );
  console.log(`  - Root: ${DIST_DIR}/{esm,cjs}/index.{js,cjs,d.ts,d.cts}`);
  console.log(
    `  - Hooks: ${DIST_DIR}/{esm,cjs}/hooks/<hook>/index.{js,cjs,d.ts,d.cts}`,
  );
}

main().catch((error) => {
  console.error('✖ generate-exports failed:', error);
  process.exit(1);
});
