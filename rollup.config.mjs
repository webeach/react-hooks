import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import glob from 'fast-glob';
import nodeExternals from 'rollup-plugin-node-externals';
import typescript from 'rollup-plugin-typescript2';

const entries = glob.sync([
  'src/index.ts',
  'src/hooks/**/index.ts',
  '!src/hooks/_draft',
]);

const config = [
  {
    input: entries,
    preserveEntrySignatures: 'exports-only',
    output: [
      {
        dir: './lib/esm',
        format: 'es',
        preserveModules: true,
        preserveModulesRoot: 'src',
        sourcemap: true,
      },
      {
        dir: './lib/cjs',
        format: 'cjs',
        preserveModules: true,
        preserveModulesRoot: 'src',
        sourcemap: true,
      },
    ],
    plugins: [
      resolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.build.json',
        useTsconfigDeclarationDir: true,
      }),
      nodeExternals({
        exclude: [/^@webeach\//],
      }),
    ],
  },
];

export default config;
